import { useState, useEffect } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { Trophy, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { getLeaderboard } from '../../lib/gamification';

interface Props {
    classId?: string;
}

export default function Leaderboard({ classId }: Props) {
    const { db } = useDatabase();
    const [leaders, setLeaders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // ... 

    useEffect(() => {
        if (!db) return;

        const loadLeaderboard = async () => {
            const data = await getLeaderboard(db, classId);
            setLeaders(data.slice(0, 10)); // Top 10
            setLoading(false);
        };

        loadLeaderboard();
    }, [db, classId]);

    if (loading) return <div className="p-4 text-center text-slate-400">Loading Rankings...</div>;

    const top3 = leaders.slice(0, 3);
    const rest = leaders.slice(3);

    if (loading) return <div className="p-10 text-center text-slate-400 animate-pulse">Scanning frequencies for top signals...</div>;

    return (
        <div className="space-y-8 font-sans">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-yellow-500/20 text-yellow-400">
                    <Trophy className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">Class Leaderboard</h2>
                    <p className="text-xs text-slate-400">Top performers this week</p>
                </div>
            </div>

            {/* PODIUM (Top 3) */}
            {top3.length > 0 && (
                <div className="flex justify-center items-end gap-2 sm:gap-4 mb-8 pt-4">
                    {/* 2nd Place */}
                    {top3[1] && (
                        <motion.div
                            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                            className="flex flex-col items-center w-1/3 max-w-[100px]"
                        >
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-slate-400 shadow-[0_0_20px_rgba(148,163,184,0.3)] bg-slate-800 overflow-hidden mb-2 relative z-10">
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${top3[1].avatarId}`} alt="2nd" className="w-full h-full object-cover" />
                                <div className="absolute bottom-0 w-full bg-slate-500 text-black font-bold text-[10px] text-center">#2</div>
                            </div>
                            <div className="text-center mb-1">
                                <span className="text-sm font-bold text-slate-300 block truncate w-full">{top3[1].name}</span>
                                <span className="text-xs text-slate-500 flex items-center justify-center gap-1"><Star className="w-3 h-3 text-yellow-500/70" />{top3[1].totalStars}</span>
                            </div>
                            <div className="w-full h-24 bg-gradient-to-t from-slate-400/20 to-slate-400/5 rounded-t-xl border-t border-x border-slate-400/30"></div>
                        </motion.div>
                    )}

                    {/* 1st Place (Winner) */}
                    {top3[0] && (
                        <motion.div
                            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 200 }}
                            className="flex flex-col items-center w-1/3 max-w-[120px] -mx-2 z-20"
                        >
                            <div className="relative">
                                <Trophy className="w-8 h-8 text-yellow-400 absolute -top-8 left-1/2 -translate-x-1/2 animate-bounce" />
                                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.5)] bg-yellow-900/50 overflow-hidden mb-2 relative">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${top3[0].avatarId}`} alt="1st" className="w-full h-full object-cover" />
                                    <div className="absolute bottom-0 w-full bg-yellow-400 text-black font-bold text-xs text-center py-0.5">#1</div>
                                </div>
                            </div>
                            <div className="text-center mb-2">
                                <span className="text-base font-black text-yellow-100 block truncate w-full">{top3[0].name}</span>
                                <span className="text-xs text-yellow-400/80 flex items-center justify-center gap-1"><Star className="w-3 h-3 fill-current" />{top3[0].totalStars}</span>
                            </div>
                            <div className="w-full h-32 bg-gradient-to-t from-yellow-500/30 to-yellow-500/10 rounded-t-xl border-t border-x border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.1)] relative overflow-hidden">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                            </div>
                        </motion.div>
                    )}

                    {/* 3rd Place */}
                    {top3[2] && (
                        <motion.div
                            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                            className="flex flex-col items-center w-1/3 max-w-[100px]"
                        >
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.3)] bg-orange-900/30 overflow-hidden mb-2 relative z-10">
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${top3[2].avatarId}`} alt="3rd" className="w-full h-full object-cover" />
                                <div className="absolute bottom-0 w-full bg-orange-500 text-black font-bold text-[10px] text-center">#3</div>
                            </div>
                            <div className="text-center mb-1">
                                <span className="text-sm font-bold text-orange-200 block truncate w-full">{top3[2].name}</span>
                                <span className="text-xs text-orange-400/80 flex items-center justify-center gap-1"><Star className="w-3 h-3 fill-current" />{top3[2].totalStars}</span>
                            </div>
                            <div className="w-full h-20 bg-gradient-to-t from-orange-500/20 to-orange-500/5 rounded-t-xl border-t border-x border-orange-500/30"></div>
                        </motion.div>
                    )}
                </div>
            )}

            {/* List for Rank 4+ */}
            {rest.length > 0 && (
                <div className="bg-black/20 rounded-2xl p-2 border border-white/5 space-y-2 backdrop-blur-sm">
                    {rest.map((leader, index) => (
                        <motion.div
                            key={leader.id}
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.05 }}
                            className="p-3 rounded-xl flex items-center gap-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all"
                        >
                            {/* Rank */}
                            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-slate-500 text-sm font-mono">
                                #{index + 4}
                            </div>

                            {/* Avatar */}
                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden border border-white/10">
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${leader.avatarId}`} alt="avatar" />
                            </div>

                            {/* Name */}
                            <div className="flex-1">
                                <h3 className="font-bold text-slate-300 text-sm">{leader.name}</h3>
                            </div>

                            {/* Stars */}
                            <div className="flex items-center gap-1 bg-black/40 px-3 py-1.5 rounded-full border border-white/5">
                                <Star className="w-3 h-3 text-yellow-500" />
                                <span className="text-xs font-bold text-slate-300">{leader.totalStars}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {leaders.length === 0 && (
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <Trophy className="w-8 h-8 text-slate-600" />
                    </div>
                    <p className="text-slate-500 italic">No champions yet.</p>
                    <p className="text-xs text-slate-600 mt-1">Be the first to score!</p>
                </div>
            )}
        </div>
    );
}
