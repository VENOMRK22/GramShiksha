import { UserPlus, X, BookOpen, User as UserIcon } from 'lucide-react'
import { Logo } from '../components/common/Logo';
import { useAuth } from '../context/AuthContext'
import type { User } from '../context/AuthContext'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PinPad from '../components/auth/PinPad'
import { motion, AnimatePresence } from 'framer-motion'
import { useDatabase } from '../context/DatabaseContext'

export default function Landing() {
    const { login, currentUser } = useAuth();
    const { db } = useDatabase();
    const navigate = useNavigate();

    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [lessonCount, setLessonCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (currentUser) {
            if (currentUser.role === 'teacher') {
                navigate('/teacher');
            } else {
                navigate('/dashboard');
            }
        }
    }, [currentUser, navigate]);

    // Subscribe to Users & DB status
    useEffect(() => {
        if (!db) return;

        // 1. Reactive User List
        const sub = db.users.find().sort({ createdAt: 'desc' }).$.subscribe(docs => {
            setUsers(docs.map(d => d.toJSON() as User));
        });

        // 2. Content Count
        db.content.count().exec().then(count => {
            setLessonCount(count);
            setLoading(false);
        });

        return () => sub.unsubscribe();
    }, [db]);

    const handleLogin = async (pin: string) => {
        if (!selectedUser) return;
        const success = await login(selectedUser.id, pin);
        if (success) {
            if (selectedUser.role === 'teacher') {
                navigate('/teacher');
            } else {
                navigate('/dashboard');
            }
        } else {
            alert("Incorrect PIN! Try again.");
        }
    };

    const handleSeed = async () => {
        if (!db) return;
        setLoading(true);
        try {
            const { seedContent } = await import('../db/seed');
            await seedContent(db.content);
            const count = await db.content.count().exec();
            setLessonCount(count);
            alert("Content Loaded: " + count);
        } catch (e) {
            alert("Seeding failed: " + e);
        }
        setLoading(false);
    };

    return (
        <div className="flex flex-col items-center justify-start min-h-full w-full p-6 pt-10 pb-32 relative text-center">

            {/* Ambient Background Elements */}
            <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0 bg-[#030712]">
                <div className="absolute inset-0 bg-[radial-gradient(at_0%_0%,rgba(14,165,233,0.15)_0px,transparent_50%),radial-gradient(at_100%_0%,rgba(99,102,241,0.15)_0px,transparent_50%),radial-gradient(at_100%_100%,rgba(217,70,239,0.15)_0px,transparent_50%),radial-gradient(at_0%_100%,rgba(14,165,233,0.1)_0px,transparent_50%)]" />

                {/* Floating Symbols - Constrained to Top 40% */}
                <div className="absolute top-0 left-0 w-full h-[40%] overflow-hidden pointer-events-none z-0">
                    {[...Array(50)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{
                                opacity: 0,
                                y: 0,
                                scale: 0.5
                            }}
                            animate={{
                                opacity: [0, 0.4, 0],
                                y: -100, // Float up 100px
                                rotate: Math.random() * 360,
                                x: (Math.random() * 40 - 20) + "px"
                            }}
                            transition={{
                                duration: Math.random() * 5 + 5,
                                repeat: Infinity,
                                delay: Math.random() * 5,
                                ease: "linear"
                            }}
                            className="absolute text-primary-400/10 font-mono font-bold text-2xl select-none"
                            style={{
                                left: `${Math.random() * 100}%`, // Full width
                                top: `${Math.random() * 100}%`   // Random height within the top 55% container
                            }}
                        >
                            {['A', 'B', 'C', '1', '2', '3', '+', '×', '÷', '?', 'α', 'π'][Math.floor(Math.random() * 12)]}
                        </motion.div>
                    ))}
                </div>

                <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[100px] animate-pulse-slow" />
                <div className="absolute bottom-[-10%] right-[20%] w-[500px] h-[500px] bg-accent-500/10 rounded-full blur-[100px] animate-pulse-slow delay-1000" />
            </div>

            <div className=" relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center gap-12">

                {/* Hero Section */}
                <div className="relative w-full max-w-lg mx-auto flex flex-col items-center">

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="space-y-0 relative z-10"
                    >
                        <div className="flex justify-center relative">
                            {/* Golden Light Beam (God Ray) - Shortened */}
                            <div className="absolute top-[60%] left-1/2 -translate-x-1/2 w-48 h-28 bg-[conic-gradient(from_180deg_at_50%_0%,rgba(251,191,36,0.2)_0deg,transparent_45deg,transparent_315deg,rgba(251,191,36,0.2)_360deg)] blur-xl pointer-events-none -z-10 mix-blend-screen [mask-image:linear-gradient(to_bottom,black_50%,transparent)]" />

                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                transition={{ type: "spring", stiffness: 300 }}
                                className=""
                            >
                                <Logo className="w-32 h-32" />
                            </motion.div>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-white to-cyan-200 drop-shadow-[0_4px_15px_rgba(251,191,36,0.3)] -mt-4 pb-4">
                            GramSiksha
                        </h1>

                        {/* Hidden Seed Check */}
                        {lessonCount === 0 && !loading && (
                            <button onClick={handleSeed} className="opacity-0 hover:opacity-100 text-xs text-slate-700 bg-slate-900 px-2 py-1 rounded">Initialize</button>
                        )}
                    </motion.div>
                </div>

                {/* Profile List (Vertical Stack) */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="w-full max-w-md mx-auto space-y-3"
                >
                    {/* Create New Profile Card */}
                    <button
                        onClick={() => navigate('/create-profile')}
                        className="w-full group relative overflow-hidden rounded-2xl bg-slate-900/50 p-[1px] transition-all hover:scale-[1.02]"
                    >
                        <span className="absolute inset-[-100%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#0ea5e9_0%,#030712_50%,#0ea5e9_100%)] opacity-50" />
                        <span className="relative flex w-full cursor-pointer items-center justify-center gap-3 rounded-2xl bg-slate-950/90 px-6 py-4 text-sm font-bold text-white backdrop-blur-3xl transition-colors hover:bg-slate-900/80">
                            <UserPlus className="h-5 w-5 text-cyan-400" />
                            Create New Profile
                        </span>
                    </button>

                    {users.length > 0 && (
                        <div className="relative py-4">
                            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/5" /></div>
                            <div className="relative flex justify-center text-xs uppercase tracking-widest"><span className="bg-[#030712] px-2 text-slate-500">Or continue as</span></div>
                        </div>
                    )}

                    <div className="space-y-4 w-full pb-4">
                        {users.map((user) => {
                            const isTeacher = user.role === 'teacher';
                            // Use Box-Shadow arbitrary values for guaranteed glow
                            const glowClass = isTeacher
                                ? 'hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:border-purple-500/50'
                                : 'hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] hover:border-cyan-500/50';

                            const textColor = isTeacher ? 'group-hover:text-purple-300' : 'group-hover:text-cyan-300';
                            const badgeBg = isTeacher ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';

                            return (
                                <div
                                    key={user.id}
                                    onClick={() => setSelectedUser(user)}
                                    className={`group relative flex items-center gap-4 p-4 rounded-xl bg-slate-900/90 border border-white/10 transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:scale-[1.02] shadow-lg ${glowClass}`}
                                >
                                    {/* Animated Background Gradient on Hover */}
                                    <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-gradient-to-r ${isTeacher ? 'from-purple-600 via-transparent to-transparent' : 'from-cyan-600 via-transparent to-transparent'}`} />

                                    {/* Icon Box */}
                                    <div className={`relative z-10 w-14 h-14 rounded-lg flex items-center justify-center text-2xl shadow-inner border border-white/5 bg-slate-950 transition-colors duration-300 ${isTeacher ? 'group-hover:border-purple-500/30' : 'group-hover:border-cyan-500/30'}`}>
                                        <div className={`${isTeacher ? 'text-purple-400' : 'text-cyan-400'}`}>
                                            {isTeacher ? <BookOpen className="w-7 h-7" /> : <UserIcon className="w-7 h-7" />}
                                        </div>
                                    </div>

                                    {/* Content (Name) */}
                                    <div className="relative z-10 flex-1 text-left">
                                        <div className={`font-bold text-slate-100 text-lg transition-colors duration-300 ${textColor}`}>
                                            {user.name}
                                        </div>
                                    </div>

                                    {/* Role Badge (Right Side) */}
                                    <div className="relative z-10 flex items-center">
                                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${badgeBg}`}>
                                            {user.role}
                                        </span>
                                    </div>


                                    {/* End Arrow */}
                                    <div className={`relative z-10 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ${isTeacher ? 'text-purple-400' : 'text-cyan-400'}`}>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </motion.div>
            </div>

            {/* Login Modal */}
            <AnimatePresence>
                {selectedUser && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="w-full max-w-sm bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 relative shadow-2xl ring-1 ring-white/10"
                        >
                            <button onClick={() => setSelectedUser(null)} className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white rounded-full hover:bg-white/5 transition-colors">
                                <X className="w-5 h-5" />
                            </button>

                            <div className="mb-8 flex flex-col items-center">
                                <div className="w-24 h-24 rounded-full bg-slate-900 border-2 border-white/10 flex items-center justify-center text-5xl mb-4 shadow-xl shadow-primary-500/10">
                                    {selectedUser.avatarId}
                                </div>
                                <h2 className="text-2xl font-bold text-white">Welcome back!</h2>
                                <p className="text-slate-400 text-sm">Enter PIN for {selectedUser.name}</p>
                            </div>

                            <PinPad onSubmit={handleLogin} title="" description="" />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
