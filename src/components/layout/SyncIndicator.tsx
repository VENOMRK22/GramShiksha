import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useDatabase } from '../../context/DatabaseContext';

export default function SyncIndicator() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [syncState, setSyncState] = useState<'idle' | 'syncing' | 'error'>('idle');
    const { db } = useDatabase();
    const { currentUser } = useAuth();

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // ... (rest of useEffect)

    const handleSync = async () => {
        if (!isOnline || !db) return;
        setSyncState('syncing');

        try {
            const targetUrl = localStorage.getItem('teacherIP') || 'http://localhost:5984/db';
            const { syncDatabase } = await import('../../db/database');

            // Pass classId if user has one
            await syncDatabase(db, targetUrl, currentUser?.classId);
            setSyncState('idle');
        } catch (err) {
            console.error("Sync Failed", err);
            setSyncState('error');
            setTimeout(() => setSyncState('idle'), 3000);
        }
    };

    if (!isOnline) {
        return (
            <div className="fixed bottom-4 right-4 bg-slate-800 border border-slate-700 text-slate-400 p-3 rounded-full flex items-center justify-center shadow-lg" title="Offline">
                <WifiOff className="w-4 h-4" />
            </div>
        );
    }

    return (
        <button
            onClick={handleSync}
            className={`fixed bottom-4 right-4 border p-3 rounded-full flex items-center justify-center shadow-lg transition-all ${syncState === 'syncing'
                ? 'bg-blue-900/50 border-blue-500/50 text-blue-200'
                : 'bg-slate-800 border-green-900/50 text-green-400 hover:bg-slate-700'
                }`}
            title={syncState === 'syncing' ? 'Syncing...' : 'Online'}
        >
            {syncState === 'syncing' ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
                <Wifi className="w-4 h-4" />
            )}
        </button>
    );
}
