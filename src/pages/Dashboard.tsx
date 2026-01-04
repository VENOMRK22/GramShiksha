import { useState, useEffect } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { useNavigate } from 'react-router-dom';
import { Zap, Trophy, Star, Activity, Calendar, MapPin, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next'; // Added
import { getLeaderboard } from '../lib/gamification';

export default function Dashboard() {
    const { currentUser } = useAuth();
    const { db } = useDatabase();
    const navigate = useNavigate();
    const { t } = useTranslation(); // Added

    const [stats, setStats] = useState({ stars: 0, xp: 0, completed: 0, rank: 0 });
    const [loading, setLoading] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);

    // Spotlight State
    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

    const navItems = [
        { title: t('nav.my_class'), icon: Activity, path: '/learn', color: 'from-cyan-400 to-blue-400', desc: t('nav.subjects_lessons'), shadow: 'shadow-cyan-500/50' },
        { title: t('nav.homework'), icon: Star, path: '/homework', color: 'from-purple-400 to-pink-400', desc: t('nav.pending_assignments'), shadow: 'shadow-purple-500/50' },
        { title: t('nav.leaderboard'), icon: Trophy, path: '/leaderboard', color: 'from-yellow-400 to-orange-400', desc: t('nav.class_rankings'), shadow: 'shadow-yellow-500/50' },
        { title: t('nav.village_rank'), icon: MapPin, path: '/village', color: 'from-blue-400 to-indigo-400', desc: t('nav.community_standing'), shadow: 'shadow-blue-500/50' },
        { title: t('nav.recently_sync'), icon: Download, path: '/sync', color: 'from-emerald-400 to-green-400', desc: t('nav.sync_history'), shadow: 'shadow-emerald-500/50' },
        { title: t('nav.attendance'), icon: Calendar, path: '/attendance', color: 'from-rose-400 to-red-400', desc: t('nav.track_presence'), shadow: 'shadow-rose-500/50' },
    ];



    // ...

    useEffect(() => {
        if (!db || !currentUser) return;

        const loadData = async () => {
            // 1. Stats calculation (Internal Progress)
            const myProgressDocs = await db.progress.find({
                selector: { userId: currentUser.id }
            }).exec();

            let myStars = 0;
            let myXp = 0;
            let myCompleted = 0;

            myProgressDocs.forEach(d => {
                myStars += d.get('stars') || 0;
                myXp += d.get('xp') || 0;
                myCompleted += 1;
            });

            // 2. Rank calculation (Global Leaderboard Context)
            const leaderboard = await getLeaderboard(db, currentUser.teacherClassId); // Use Class ID if available
            const myEntry = leaderboard.find(e => e.id === currentUser.id);
            const myRank = myEntry ? myEntry.rank : 0;

            setStats({ stars: myStars, xp: myXp, completed: myCompleted, rank: myRank });
            setLoading(false);
        };

        loadData();
    }, [db, currentUser]);

    // Auto-slide effect
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % 3);
        }, 3000);
        return () => clearInterval(timer);
    }, []);

    if (loading) return <div className="min-h-screen grid place-items-center text-cyan-400 animate-pulse">Initializing Interface...</div>;

    return (
        <div className="min-h-screen p-4 pb-24 font-sans relative animate-fade-in">
            <div className="cosmic-bg" />
            {/* Header */}
            <header className="flex justify-between items-center mb-8 pt-2">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight drop-shadow-lg">
                        {t('dashboard.hello', { name: '' })} <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">{currentUser?.name}</span>
                    </h1>
                    <p className="text-sm text-slate-400 font-medium tracking-wide">{t('dashboard.ready')}</p>
                </div>
                <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.avatarId}`} alt="avatar" />
                    </div>
                </div>
            </header>

            {/* Sci-Fi Stats Banners (Live Motion) - No Box, Just Holograms */}
            <div className="mb-8 relative h-48 flex items-center justify-center">
                <AnimatePresence mode='wait'>
                    {/* Slide 0: XP (System Core) */}
                    {currentSlide === 0 && (
                        <motion.div
                            key="xp"
                            initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
                            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                            exit={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
                            transition={{ duration: 0.5 }}
                            className="absolute inset-0 flex items-center justify-center"
                        >
                            {/* HUD Container - No Background */}
                            <div className="relative z-10 flex flex-col items-center justify-center">
                                <div className="relative w-40 h-40 flex items-center justify-center mb-2">
                                    {/* Outer Rotating Ring */}
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-0 rounded-full border border-cyan-500/30 border-dashed"
                                    />
                                    {/* Inner Counter-Rotating Segments */}
                                    <motion.div
                                        animate={{ rotate: -360 }}
                                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-2 rounded-full border-2 border-transparent border-t-cyan-500/80 border-b-cyan-500/20"
                                    />

                                    {/* Central Black Hole (Optional, keep for contrast) */}
                                    <div className="absolute inset-6 rounded-full bg-black/80 backdrop-blur-md border border-cyan-500/50 flex flex-col items-center justify-center shadow-[0_0_50px_rgba(6,182,212,0.6)]">
                                        <Zap className="w-10 h-10 text-cyan-400 fill-cyan-400 mb-1 drop-shadow-md" />
                                        <span className="text-2xl font-black text-white leading-none tracking-tighter">{stats.xp}</span>
                                        <span className="text-[8px] text-cyan-500 font-bold uppercase tracking-widest mt-1">{t('dashboard.xp')}</span>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <p className="text-cyan-400 font-bold tracking-[0.3em] uppercase text-xs drop-shadow-lg">{t('dashboard.system_energy')}</p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Slide 1: RANK (Elite Shield - Now Circular) */}
                    {currentSlide === 1 && (
                        <motion.div
                            key="rank"
                            initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
                            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                            exit={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
                            transition={{ duration: 0.5 }}
                            className="absolute inset-0 flex items-center justify-center"
                        >
                            <div className="relative z-10 flex flex-col items-center justify-center">
                                <div className="relative w-40 h-40 flex items-center justify-center mb-2">
                                    {/* Outer Rotating Ring */}
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-0 rounded-full border border-yellow-500/30 border-dashed"
                                    />
                                    {/* Inner Counter-Rotating Segments */}
                                    <motion.div
                                        animate={{ rotate: -360 }}
                                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-2 rounded-full border-2 border-transparent border-t-yellow-500/80 border-b-yellow-500/20"
                                    />

                                    {/* Central Badge */}
                                    <div className="absolute inset-6 rounded-full bg-black/80 backdrop-blur-md border border-yellow-500/50 flex flex-col items-center justify-center shadow-[0_0_50px_rgba(234,179,8,0.5)]">
                                        <Trophy className="w-8 h-8 text-yellow-400 mb-1 drop-shadow-md" />
                                        <span className="text-3xl font-black text-white leading-none tracking-tighter">
                                            #{stats.rank > 0 ? stats.rank : '-'}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <p className="text-yellow-500 font-bold tracking-[0.3em] uppercase text-xs drop-shadow-lg">{t('dashboard.elite_status')}</p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Slide 2: STARS (Stellar Core) */}
                    {currentSlide === 2 && (
                        <motion.div
                            key="stars"
                            initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
                            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                            exit={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
                            transition={{ duration: 0.5 }}
                            className="absolute inset-0 flex items-center justify-center"
                        >
                            <div className="relative z-10 flex flex-col items-center justify-center">
                                <div className="relative w-40 h-40 flex items-center justify-center mb-2">
                                    {/* Orbital Rings */}
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-0 border border-fuchsia-500/30 rounded-full skew-x-12"
                                    />
                                    <motion.div
                                        animate={{ rotate: -360 }}
                                        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-2 border border-fuchsia-500/20 rounded-full skew-y-12"
                                    />

                                    {/* Central Star */}
                                    <div className="absolute inset-8 rounded-full bg-black/80 backdrop-blur-md border border-fuchsia-500/50 flex flex-col items-center justify-center shadow-[0_0_60px_rgba(232,121,249,0.5)]">
                                        <Star className="w-8 h-8 text-fuchsia-400 fill-fuchsia-400 mb-1" />
                                        <span className="text-2xl font-black text-white leading-none tracking-tighter">{stats.stars}</span>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <p className="text-fuchsia-500 font-bold tracking-[0.3em] uppercase text-xs drop-shadow-lg">{t('dashboard.star_currency')}</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Navigation Grid (Command Center) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 relative z-10 max-w-4xl mx-auto perspective-1000">
                {navItems.map((item, i) => {
                    const isHovered = hoveredIdx === i;

                    return (
                        <motion.button
                            key={item.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{
                                opacity: 1,
                                y: 0,
                                scale: isHovered ? 1.02 : 1,
                            }}
                            transition={{ delay: i * 0.1, duration: 0.3 }}
                            onMouseEnter={() => setHoveredIdx(i)}
                            onMouseLeave={() => setHoveredIdx(null)}
                            onClick={() => navigate(item.path)}
                            className={`group relative h-40 lg:h-48 rounded-3xl overflow-hidden glass-panel border transition-all duration-300 text-left p-6 flex flex-col justify-between
                                ${isHovered
                                    ? `border-white/40 shadow-2xl ${item.shadow} z-20`
                                    : 'border-white/5 shadow-lg z-10'
                                }
                            `}
                        >
                            <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity`}>
                                <item.icon className="w-24 h-24 text-white" />
                            </div>

                            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} p-0.5 shadow-lg group-hover:scale-110 transition-transform`}>
                                <div className="w-full h-full bg-black/50 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                                    <item.icon className="w-6 h-6 text-white" />
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors mb-1">{item.title}</h3>
                                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{item.desc}</p>
                            </div>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}
