import React, { createContext, useContext, useState, useEffect } from 'react';
import { useDatabase } from './DatabaseContext';
import { v4 as uuidv4 } from 'uuid';

export interface User {
    id: string;
    name: string;
    avatarId: string;
    role: 'student' | 'teacher';
    classId?: string;
    birthdate?: string;
    rollNo?: string;
    schoolName?: string;
    villageName?: string;
    state?: string;
    country?: string;
    ipAddress?: string;
    password?: string;
    medium?: 'english' | 'marathi';
    teacherClassId?: string; // Linked Teacher Class UUID
    createdAt: number;
}

interface AuthContextType {
    currentUser: User | null;
    login: (userId: string, pin: string) => Promise<boolean>;
    signup: (profileData: Partial<User> & { pin: string }) => Promise<void>;
    logout: () => void;
    getAllUsers: () => Promise<User[]>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Web Crypto API for hashing
async function hashPin(pin: string): Promise<string> {
    const msgBuffer = new TextEncoder().encode(pin);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { db } = useDatabase();
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    // Persist login state
    useEffect(() => {
        const savedId = localStorage.getItem('activeUserId');
        if (savedId && db) {
            db.users.findOne(savedId).exec().then(doc => {
                if (doc) setCurrentUser(doc.toJSON() as User);
            });
        }
    }, [db]);

    const login = async (userId: string, pin: string): Promise<boolean> => {
        if (!db) return false;
        const userDoc = await db.users.findOne(userId).exec();
        if (!userDoc) return false;

        const hashed = await hashPin(pin);
        // Fallback for simple password check if needed, but keeping pinHash logic primary
        if (userDoc.get('pinHash') === hashed) {
            setCurrentUser(userDoc.toJSON() as User);
            localStorage.setItem('activeUserId', userId);
            return true;
        }
        return false;
    };

    const signup = async (profileData: Partial<User> & { pin: string }) => {
        if (!db) return;
        const id = uuidv4();
        const { pin, ...rest } = profileData; // Extract pin so it's not saved to DB
        const pinHash = await hashPin(pin);

        try {
            await db.users.insert({
                id,
                name: profileData.name || 'Anonymous',
                role: profileData.role || 'student',
                avatarId: profileData.avatarId || '🚀',
                pinHash,
                createdAt: Date.now(),
                ...rest // Spread only legitimate fields
            });

            // Auto-Seed Subjects for Students
            if (profileData.role === 'student' && profileData.classId && profileData.medium) {
                console.log("Seeding subjects for student...");
                try {
                    const { getSubjects } = await import('../data/syllabus');
                    const subjects = getSubjects(profileData.classId, profileData.medium);

                    const timestamp = Date.now();
                    const subjectDocs = subjects.map(subject => ({
                        id: uuidv4(),
                        type: 'subject',
                        title: subject,
                        classId: profileData.classId, // Subjects belong to this class context
                        createdAt: timestamp,
                        updatedAt: timestamp,
                        thumbnail: '📚', // Default icon
                        description: `Standard ${profileData.classId} Subject`
                    }));

                    // Bulk insert is more efficient
                    await db.content.bulkInsert(subjectDocs);
                    console.log(`Seeded ${subjects.length} subjects for Class ${profileData.classId}`);
                } catch (seedErr) {
                    console.error("Failed to seed subjects:", seedErr);
                    // Don't block signup, just log
                }
            }

        } catch (err) {
            console.error("User Insert Failed:", err);
            alert("Failed to create profile: " + (err as any).message);
            return;
        }

        // Auto login after signup
        await login(id, profileData.pin);
    };

    const logout = () => {
        setCurrentUser(null);
        localStorage.removeItem('activeUserId');
    };

    const getAllUsers = async (): Promise<User[]> => {
        if (!db) return [];
        const docs = await db.users.find().sort({ createdAt: 'desc' }).exec();
        return docs.map(d => d.toJSON() as User);
    };

    return (
        <AuthContext.Provider value={{ currentUser, login, signup, logout, getAllUsers }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
}
