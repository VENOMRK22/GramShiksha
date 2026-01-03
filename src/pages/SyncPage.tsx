import { useState, useEffect } from 'react';
import { ArrowLeft, QrCode, Scan, Smartphone, CheckCircle, Clock, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import P2PShare from '../components/sync/P2PShare';
import P2PScan from '../components/sync/P2PScan';
import { motion, AnimatePresence } from 'framer-motion';

export default function SyncPage() {
    const navigate = useNavigate();
    const [isSyncing, setIsSyncing] = useState(false); // Toggle for real sync UI
    const [syncHistory, setSyncHistory] = useState<any[]>([]);

    useEffect(() => {
        const loadHistory = () => {
            try {
                const logs = JSON.parse(localStorage.getItem('sync_history') || '[]');
                setSyncHistory(logs);
            } catch (e) {
                console.error("Failed to load sync history");
            }
        };
        loadHistory();

        // Listen for storage events (if multiple tabs, though unlikely in Cordova)
        window.addEventListener('storage', loadHistory);
        return () => window.removeEventListener('storage', loadHistory);
    }, [isSyncing]); // Reload when closing sync modal


    const [syncMode, setSyncMode] = useState<'select' | 'share' | 'receive'>('select');

    if (isSyncing) {
        return (
            <div className="min-h-screen p-6 pb-24 aurora-bg">
                {/* Header with Dynamic Back Action */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => {
                            if (syncMode === 'select') setIsSyncing(false);
                            else setSyncMode('select');
                        }}
                        className="p-2 glass-panel rounded-xl text-slate-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-2xl font-bold text-white">
                        {syncMode === 'select' ? 'P2P Sync' : syncMode === 'share' ? 'Share Content' : 'Receive Content'}
                    </h1>
                </div>

                <div className="max-w-md mx-auto">
                    <AnimatePresence mode="wait">
                        {syncMode === 'select' && (
                            <motion.div
                                key="select"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="grid gap-6"
                            >
                                <button
                                    onClick={() => setSyncMode('share')}
                                    className="p-8 rounded-3xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 hover:border-cyan-500/50 hover:bg-cyan-500/20 transition-all group text-left"
                                >
                                    <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                        <QrCode className="w-8 h-8 text-cyan-400" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-2">Share Content</h3>
                                    <p className="text-slate-400 font-medium leading-relaxed">
                                        Generate a QR code to share your progress and content with a peer.
                                    </p>
                                </button>

                                <button
                                    onClick={() => setSyncMode('receive')}
                                    className="p-8 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/20 hover:border-emerald-500/50 hover:bg-emerald-500/20 transition-all group text-left"
                                >
                                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                        <Scan className="w-8 h-8 text-emerald-400" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-2">Receive Content</h3>
                                    <p className="text-slate-400 font-medium leading-relaxed">
                                        Scan a peer's QR code to merge their progress and content into your device.
                                    </p>
                                </button>
                            </motion.div>
                        )}

                        {syncMode === 'share' && (
                            <motion.div
                                key="share"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="glass-panel p-6 rounded-3xl border border-white/10"
                            >
                                <P2PShare />
                            </motion.div>
                        )}

                        {syncMode === 'receive' && (
                            <motion.div
                                key="receive"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="glass-panel p-6 rounded-3xl border border-white/10"
                            >
                                <P2PScan />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen p-6 pb-24 aurora-bg animate-fade-in font-sans">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => navigate('/dashboard')} className="p-2 glass-panel rounded-xl text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-green-500">
                    Recently Synced
                </h1>
            </div>

            {/* Sync History List */}
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <h2 className="text-slate-400 text-sm font-bold uppercase tracking-widest">Activity Log</h2>
                        {syncHistory.length > 0 && (
                            <button
                                onClick={() => {
                                    localStorage.removeItem('sync_history');
                                    setSyncHistory([]);
                                }}
                                className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                            >
                                <Trash2 className="w-3 h-3" /> Clear
                            </button>
                        )}
                    </div>
                    <button
                        onClick={() => setIsSyncing(true)}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
                    >
                        <Scan className="w-4 h-4" /> Sync New
                    </button>
                </div>

                <div className="space-y-4">
                    <AnimatePresence>
                        {syncHistory.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-center py-12 text-slate-500 glass-panel rounded-2xl border border-white/5"
                            >
                                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>No recent sync activity.</p>
                                <p className="text-xs mt-2">Scan a Teacher's QR code to receive content.</p>
                            </motion.div>
                        ) : (
                            syncHistory.map((item, i) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col md:flex-row gap-4 md:items-center hover:bg-white/5 transition-colors group"
                                >
                                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
                                        <CheckCircle className="w-6 h-6 text-emerald-400" />
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-white mb-1 group-hover:text-emerald-300 transition-colors">{item.title}</h3>
                                        <div className="flex flex-wrap gap-4 text-xs text-slate-400">
                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {item.date}</span>
                                            <span className="px-2 py-0.5 rounded bg-white/10 text-slate-300">{item.type}</span>
                                        </div>
                                    </div>

                                    <div className="md:text-right border-t md:border-t-0 border-white/10 pt-3 md:pt-0 mt-2 md:mt-0">
                                        <p className="text-xs text-slate-500 font-bold uppercase mb-1">Synced From</p>
                                        <div className="flex items-center gap-2 text-sm text-emerald-300 font-medium md:justify-end">
                                            <Smartphone className="w-4 h-4" />
                                            <span>{item.teacher}</span>
                                        </div>
                                        <p className="text-xs text-slate-400">{item.phone}</p>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>

                <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-center">
                    <p className="text-blue-300 text-sm">
                        All content is up to date with the local village server.
                    </p>
                </div>
            </div>
        </div>
    );
}
