import React, { createContext, useContext, useEffect, useState } from 'react';
import { createDB } from '../db/database';
import type { EduDatabase } from '../db/database';

interface DatabaseContextType {
    db: EduDatabase | null;
    isReady: boolean;
}

const DatabaseContext = createContext<DatabaseContextType>({
    db: null,
    isReady: false
});

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [db, setDb] = useState<EduDatabase | null>(null);

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const init = async () => {
            try {
                const _db = await createDB();
                setDb(_db);
            } catch (err: any) {
                console.error("Failed to initialize database:", err);
                setError(err.message || "Unknown Database Error");
            }
        };
        init();
    }, []);

    if (error) {
        const handleReset = async () => {
            if (confirm("This will Delete ALL Data and Reset the App. Continue?")) {
                const dbs = await window.indexedDB.databases();
                dbs.forEach(db => window.indexedDB.deleteDatabase(db.name!));
                window.location.reload();
            }
        };

        return (
            <div className="min-h-screen flex items-center justify-center bg-red-950 text-white p-6 text-center">
                <div className="space-y-4 max-w-md bg-black/40 p-8 rounded-xl border border-red-500/30">
                    <h2 className="text-xl font-bold text-red-400">Database Error (Migration)</h2>
                    <p className="text-red-200 text-sm">{error}</p>
                    <div className="flex gap-4 justify-center">
                        <button onClick={() => window.location.reload()} className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded text-sm">
                            Try Reload
                        </button>
                        <button
                            onClick={handleReset}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-bold text-sm shadow-lg shadow-red-900/50"
                        >
                            Reset Data (Fix)
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    if (!db) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin"></div>
                    <span className="text-sm text-slate-400">Loading Offline Database...</span>
                </div>
            </div>
        );
    }

    return (
        <DatabaseContext.Provider value={{ db, isReady: true }}>
            {children}
        </DatabaseContext.Provider>
    );
};

export const useDatabase = () => useContext(DatabaseContext);
