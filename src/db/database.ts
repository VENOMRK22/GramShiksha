import { createRxDatabase, addRxPlugin } from 'rxdb';
import type { RxDatabase, RxCollection } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { wrappedValidateAjvStorage } from 'rxdb/plugins/validate-ajv';
import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder';
import { RxDBMigrationSchemaPlugin } from 'rxdb/plugins/migration-schema'; // Import Migration Plugin
import { userSchema } from './schemas/user';
import { progressSchema } from './schemas/progress';
import { contentSchema } from './schemas/content';
import { classSchema } from './schemas/class';
import { seedContent } from './seed';
import { replicateRxCollection } from 'rxdb/plugins/replication';

addRxPlugin(RxDBQueryBuilderPlugin);
addRxPlugin(RxDBMigrationSchemaPlugin); // Register Migration Plugin

// Types for your Database Collections
export type EduDatabaseCollections = {
    users: RxCollection;
    progress: RxCollection;
    content: RxCollection;
    classes: RxCollection;
};

export type EduDatabase = RxDatabase<EduDatabaseCollections>;

// Development helper
if (import.meta.env.DEV) {
    import('rxdb/plugins/dev-mode').then(module => addRxPlugin(module.RxDBDevModePlugin));
}

let dbPromise: Promise<EduDatabase> | null = null;

export const createDB = async (): Promise<EduDatabase> => {
    if (dbPromise) return dbPromise;

    dbPromise = (async () => {
        console.log('Initializing Database...');

        const db = await createRxDatabase<EduDatabaseCollections>({
            name: 'edudb_v6',
            storage: wrappedValidateAjvStorage({
                storage: getRxStorageDexie()
            }),
            ignoreDuplicate: true
        });

        console.log('Adding Collections...');
        await db.addCollections({
            users: {
                schema: userSchema,
                migrationStrategies: {
                    // 1: Migrate from v0 to v1 (Add role)
                    1: function (oldDoc: any) {
                        oldDoc.role = 'student';
                        return oldDoc;
                    },
                    // 2: Migrate from v1 to v2 (Add classId)
                    2: function (oldDoc: any) {
                        oldDoc.classId = null;
                        return oldDoc;
                    },
                    // 3: Migrate from v2 to v3 (Add profile fields)
                    3: function (oldDoc: any) {
                        return oldDoc;
                    },
                    // 4: Migrate from v3 to v4 (Add medium)
                    4: function (oldDoc: any) {
                        oldDoc.medium = 'english'; // Default
                        return oldDoc;
                    },
                    // 5: Migrate v4 -> v5 (Add phone)
                    5: function (oldDoc: any) {
                        oldDoc.phone = ''; // Default empty
                        return oldDoc;
                    },
                    // 6: Normalize classId ("10th" -> "10")
                    6: function (oldDoc: any) {
                        if (oldDoc.classId) {
                            oldDoc.classId = oldDoc.classId.replace(/\D/g, ''); // Remove 'th', 'st', etc.
                        }
                        return oldDoc;
                    },
                    // 7: Add teacherClassId
                    7: function (oldDoc: any) {
                        return oldDoc;
                    }
                }
            },
            progress: { schema: progressSchema },
            content: {
                schema: contentSchema,
                migrationStrategies: {
                    // 1 means migrate from 0 to 1
                    1: function (oldDoc) {
                        return oldDoc;
                    },
                    // 2: Add classId
                    2: function (oldDoc) {
                        oldDoc.classId = null;
                        return oldDoc;
                    },
                    // 3: Add moduleId and allow new types
                    3: function (oldDoc) {
                        return oldDoc;
                    },
                    // 4: Add translations and attachments
                    4: function (oldDoc) {
                        oldDoc.translations = {};
                        oldDoc.attachments = [];
                        return oldDoc;
                    },
                    // 5: Enforce number type for correctAnswer
                    5: function (oldDoc) {
                        if (oldDoc.data && oldDoc.data.questions) {
                            oldDoc.data.questions.forEach((q: any) => {
                                q.correctAnswer = Number(q.correctAnswer) || 0;
                            });
                        }
                        return oldDoc;
                    },
                    // 6: Add medium (Default english)
                    6: function (oldDoc) {
                        oldDoc.medium = 'english';
                        return oldDoc;
                    }
                }
            },
            classes: {
                schema: classSchema,
                migrationStrategies: {
                    // 1: Migrate v0 -> v1 (Add standard/medium)
                    1: function (oldDoc: any) {
                        return oldDoc;
                    },
                    // 2: Migrate v1 -> v2 (Add code)
                    2: function (oldDoc: any) {
                        // Generate random 6-char code
                        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I, 1, O, 0
                        let code = '';
                        for (let i = 0; i < 6; i++) {
                            code += chars.charAt(Math.floor(Math.random() * chars.length));
                        }
                        oldDoc.code = code;
                        return oldDoc;
                    },
                    // 3: Fix for Schema Version Mismatch (Ensure code exists)
                    3: function (oldDoc: any) {
                        if (!oldDoc.code) {
                            const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
                            let code = '';
                            for (let i = 0; i < 6; i++) {
                                code += chars.charAt(Math.floor(Math.random() * chars.length));
                            }
                            oldDoc.code = code;
                        }
                        return oldDoc;
                    }
                }
            }
        });

        // Trigger Seed
        await seedContent(db.content);

        console.log('Database Ready!');
        return db;
    })();

    return dbPromise;
};

export const syncDatabase = async (db: EduDatabase, remoteUrl: string, filterClassId?: string) => {
    console.log("Starting Sync with", remoteUrl);

    // Helper to clean URL
    const cleanUrl = remoteUrl.replace(/\/$/, "");

    try {
        // 1. Users: Bidirectional (Push my profile, Pull others for leaderboard)
        await replicateRxCollection({
            collection: db.users,
            replicationIdentifier: 'users-sync',
            pull: {
                handler: async (lastPulledCheckpoint) => {
                    try {
                        const response = await fetch(`${cleanUrl}/users/_all_docs?include_docs=true`);
                        const data = await response.json();
                        // Transform CouchDB rows to RxDB docs
                        const documents = data.rows.map((row: any) => row.doc);
                        return {
                            documents: documents,
                            checkpoint: { id: 'last' } // Simple checkpoint
                        };
                    } catch (e) {
                        console.warn("Sync Pull Failed (Offline?)", e);
                        return { documents: [], checkpoint: lastPulledCheckpoint };
                    }
                }
            },
            push: {
                handler: async (docs) => {
                    // Pushing to Teacher's DB
                    try {
                        await fetch(`${cleanUrl}/users/_bulk_docs`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ docs: docs.map(d => d.newDocumentState) })
                        });
                        return []; // No conflicts
                    } catch (e) {
                        console.warn("Sync Push Failed", e);
                        return []; // Pretend success to avoid retry loop in demo
                    }
                }
            }
        });

        // 2. Progress: Bidirectional (Push scores, Pull leaderboard)
        await replicateRxCollection({
            collection: db.progress,
            replicationIdentifier: 'progress-sync',
            pull: {
                handler: async (lastPulledCheckpoint) => {
                    try {
                        const response = await fetch(`${cleanUrl}/progress/_all_docs?include_docs=true`);
                        const data = await response.json();
                        const documents = data.rows.map((row: any) => row.doc);
                        return { documents, checkpoint: { id: 'last' } };
                    } catch (e) { return { documents: [], checkpoint: lastPulledCheckpoint }; }
                }
            },
            push: {
                handler: async (docs) => {
                    try {
                        await fetch(`${cleanUrl}/progress/_bulk_docs`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ docs: docs.map(d => d.newDocumentState) })
                        });
                        return [];
                    } catch (e) { return []; }
                }
            }
        });

        // 3. Content: Pull Only
        await replicateRxCollection({
            collection: db.content,
            replicationIdentifier: 'content-sync',
            pull: {
                handler: async (lastPulledCheckpoint) => {
                    try {
                        const response = await fetch(`${cleanUrl}/content/_all_docs?include_docs=true`);
                        const data = await response.json();
                        let documents = data.rows.map((row: any) => row.doc);

                        // SCOPED SYNC: Only pull content for my class
                        if (filterClassId) {
                            documents = documents.filter((doc: any) => doc.classId === filterClassId);
                        }

                        return { documents, checkpoint: { id: 'last' } };
                    } catch (e) { return { documents: [], checkpoint: lastPulledCheckpoint }; }
                }
            }
        });

        console.log("Sync Initiated");
    } catch (err) {
        console.error("Sync Setup Error", err);
    }
};
