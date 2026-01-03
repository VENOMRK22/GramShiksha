import LZString from 'lz-string';
import type { EduDatabase } from '../db/database';
import { v4 as uuidv4 } from 'uuid';

// ... imports

// Profile/Progress Payload
export interface SyncProfilePayload {
    type: 'profile';
    u: string; // userId
    n: string; // name
    tn?: string; // teacher name
    tp?: string; // teacher phone
    p: Array<{
        l: string; // levelId
        s: number; // score
        t: number; // stars
    }>;
}

// Content Payload
export interface SyncContentPayload {
    type: 'content';
    u: string; // sharerId
    n: string; // sharerName
    c: Array<any>; // List of content items (full docs)
}

export type SyncPayload = SyncProfilePayload | SyncContentPayload;

// Generate PROFILE Payload
export const generateSyncPayload = async (db: EduDatabase, userId: string): Promise<string> => {
    // 1. Get User Data
    const user = await db.users.findOne(userId).exec();
    if (!user) throw new Error("User not found");
    const uData = user.toJSON();

    // 2. Get Progress
    const progressDocs = await db.progress.find({
        selector: { userId: userId }
    }).exec();

    // 3. Minify Data Structure (Critical for QR limit)
    const payload: SyncProfilePayload = {
        type: 'profile',
        u: uData.id,
        n: uData.name,
        tn: uData.role === 'teacher' ? uData.name : undefined,
        tp: uData.phone || undefined,
        p: progressDocs.map(doc => ({
            l: doc.get('levelId'),
            s: doc.get('score'),
            t: doc.get('stars')
        }))
    };

    // 4. Compress
    const jsonString = JSON.stringify(payload);
    const compressed = LZString.compressToEncodedURIComponent(jsonString);

    return compressed;
};

// Generate CONTENT Payload
export const generateContentPayload = async (db: EduDatabase, userId: string, contentIds: string[]): Promise<string> => {
    const user = await db.users.findOne(userId).exec();
    if (!user) throw new Error("User not found");

    const contentDocs = await db.content.find({
        selector: {
            id: { $in: contentIds }
        }
    }).exec();

    const payload: SyncContentPayload = {
        type: 'content',
        u: user.get('id'),
        n: user.get('name'),
        c: contentDocs.map(doc => doc.toJSON())
    };

    // Size Check (Simulated)
    const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(payload));
    if (compressed.length > 2500) {
        console.warn("Payload size warning:", compressed.length);
        // We might want to warn user, but for now we proceed.
    }
    return compressed;
};

export interface MergeResult {
    success: boolean;
    type: 'profile' | 'content';
    message: string;
    details?: {
        levelsUpdated?: number;
        newStars?: number;
        itemsImported?: number;
        importerName: string;
    }
}

// Import and Merge Data
export const importSyncPayload = async (db: EduDatabase, currentUserId: string, compressedString: string): Promise<MergeResult> => {
    // 1. Decompress
    const jsonString = LZString.decompressFromEncodedURIComponent(compressedString);
    if (!jsonString) throw new Error("Invalid QR Code (Decompression failed)");

    let payload: any;
    try {
        payload = JSON.parse(jsonString);
    } catch (e) {
        throw new Error("Invalid Data Format");
    }

    // --- HANDLE PROFILE SYNC ---
    if (payload.type === 'profile' || (!payload.type && payload.p)) { // Fallback for legacy
        // Add minimal 'profile' type if missing in legacy test
        const pPayload = payload as SyncProfilePayload;

        // 2. Validate (Basic)
        if (!pPayload.u || !Array.isArray(pPayload.p)) {
            throw new Error("Invalid Profile Data");
        }

        let levelsUpdated = 0;
        let newStars = 0;

        // 3. Merge Logic (Optimization: Only merge if score is higher)
        for (const remoteLevel of pPayload.p) {
            // Find existing progress for CURRENT user for this level
            // NOTE: We are importing SOMEONE ELSE'S progress into CURRENT USER'S profile?
            // WAIT. P2P Sync usually means "I played on device B, I want my progress on Device A"
            // OR "I want to share my high score with you"?
            //
            // Requirement Interpretation: "Student-to-Student P2P Sync"
            // If it's "Syncing my own profile across devices": We should merge into the SAME userId if it exists, or create new user?
            // If it's "Comparing scores": That's different.
            // 
            // Let's assume the use case: "Multiple students share devices. Student A played on Tablet 1. Now moves to Tablet 2."
            // So we should upsert the USER profile if it doesn't exist, OR merge if "I am Student A".

            // Let's go with: Merge into Currently Logged In User? NO, that would overwrite my progress with yours.
            // Correct Logic: 
            // Check if payload.userId exists on this device. 
            // If YES -> Merge progress into valid User.
            // If NO -> Create User (Provisionally? Or maybe just Error? Strict Auth says we need PIN...)
            //
            // SIMPLIFIED APPROACH for Rural Context:
            // We are merging into the *Currently Logged In User*? No, that's dangerous.
            // We should PROBABLY just "Unlock" levels based on peer success? (Co-op mode?)
            //
            // Re-reading User Objective: "Student-to-student P2P sync via compressed QR codes... Math.max merge strategy"
            // This strongly implies keeping progress in sync across devices for the SAME user.
            // OR... maybe it is just "I beat level 1, now you can too"?
            //
            // Let's implement safe "Same User Sync".
            // Payload has 'u' (UserId).
            // If we are logged in as User X, and scan User Y's code... we should probably REJECT or Ask Confirmation?
            // 
            // However, UUIDs will match if it's the same "account" created on one device and moved? 
            // Actually, without a cloud, UUIDs are random.
            // So "My Profile" on Tablet A has ID 123. "My Profile" on Tablet B has ID 456. They are disconnected.

            // DECISION: For this MVP, we will merge the scanned progress into the CURRENTLY LOGGED IN user.
            // Why? Because "I want to take the progress *I* made on your tablet, and save it to *MY* profile on my tablet".
            // This acts like a "Copy Progress" feature.
            // "Hey, I beat level 5 on your phone." -> Scan -> "Now level 5 is beaten on my phone."

            const existingDoc = await db.progress.findOne({
                selector: {
                    userId: currentUserId,
                    levelId: remoteLevel.l
                }
            }).exec();

            if (existingDoc) {
                // MERGE: Keep MAX score
                if (remoteLevel.s > existingDoc.get('score')) {
                    await existingDoc.patch({
                        score: remoteLevel.s,
                        stars: Math.max(remoteLevel.t, existingDoc.get('stars')),
                        timestamp: Date.now()
                    });
                    levelsUpdated++;
                }
            } else {
                // INSERT: New level unlocked
                await db.progress.insert({
                    id: uuidv4(),
                    userId: currentUserId,
                    levelId: remoteLevel.l,
                    score: remoteLevel.s,
                    stars: remoteLevel.t,
                    timestamp: Date.now()
                });
                levelsUpdated++;
                newStars += remoteLevel.t;
            }
        }

        // 4. LOG PIPELINE (Save to LocalStorage for "Recently Sync" Display)
        saveSyncLog({
            title: levelsUpdated > 0 ? `Synced Progress` : 'Check-in Sync',
            type: 'Progress',
            teacher: pPayload.tn || pPayload.n, // Use Teacher Name if available, else Sharer Name
            phone: pPayload.tp
        });

        // 5. ATTENDANCE PIPELINE (Mark "Present" for today if sync occurs)
        markAttendance();

        return {
            success: true,
            type: 'profile',
            message: `Synced ${levelsUpdated} levels from ${pPayload.n}`,
            details: { levelsUpdated, newStars, importerName: pPayload.n }
        };
    }

    // --- HANDLE CONTENT SYNC ---
    if (payload.type === 'content') {
        const cPayload = payload as SyncContentPayload;
        if (!Array.isArray(cPayload.c)) throw new Error("Invalid Content Data");

        let itemsImported = 0;
        for (const item of cPayload.c) {
            // Upsert Content
            const existing = await db.content.findOne(item.id).exec();
            if (existing) {
                // Determine if newer? For now, always overwrite or skip? 
                // Let's overwrite to ensure update.
                await existing.patch(item);
            } else {
                await db.content.insert(item);
            }
            itemsImported++;
        }

        saveSyncLog({
            title: `Received ${itemsImported} Resources`,
            type: 'Content',
            teacher: cPayload.n
        });

        return {
            success: true,
            type: 'content',
            message: `Imported ${itemsImported} items from ${cPayload.n}`,
            details: { itemsImported, importerName: cPayload.n }
        };
    }

    throw new Error("Unknown Payload Type");
};

// --- HELPERS ---
const saveSyncLog = (data: { title: string, type: string, teacher: string, phone?: string }) => {
    try {
        const logEntry = {
            id: Date.now(),
            title: data.title,
            type: data.type,
            date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            teacher: data.teacher,
            phone: data.phone || 'N/A'
        };
        const currentLogs = JSON.parse(localStorage.getItem('sync_history') || '[]');
        localStorage.setItem('sync_history', JSON.stringify([logEntry, ...currentLogs].slice(0, 20)));
    } catch (e) {
        console.warn("Failed to save sync log", e);
    }
};

const markAttendance = () => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const log = JSON.parse(localStorage.getItem('attendance_log') || '[]');
        if (!log.includes(today)) {
            localStorage.setItem('attendance_log', JSON.stringify([...log, today]));
            console.log("Marked Attendance for", today);
        }
    } catch (e) {
        console.warn("Failed to mark attendance", e);
    }
};
