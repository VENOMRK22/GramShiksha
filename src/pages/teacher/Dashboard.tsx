import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDatabase } from '../../context/DatabaseContext';
import { useAuth } from '../../context/AuthContext';
import { Plus, BookOpen, Users, ArrowLeft, School, ArrowRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';

export default function TeacherDashboard() {
    const navigate = useNavigate();
    const { db } = useDatabase();
    const { logout, currentUser } = useAuth();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [stats, setStats] = useState({
        students: 0,
        quizzes: 0,
        lessons: 0
    });
    const [classes, setClasses] = useState<any[]>([]);

    // IP Address State
    const [ipAddress, setIpAddress] = useState('');
    const [savingIp, setSavingIp] = useState(false);

    // New Class Form State
    const [newClass, setNewClass] = useState({
        name: '',
        standard: '10th',
        medium: 'english' as 'english' | 'marathi'
    });
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        if (!db || !currentUser) return;

        const loadData = async () => {
            const allUsers = await db.users.find().exec();
            const students = allUsers.filter((u: any) => u.get('role') !== 'teacher');
            const content = await db.content.find().exec();

            const allClasses = await db.classes.find().exec();
            const myClasses = allClasses.filter((c: any) => c.teacherId === currentUser.id);
            setClasses(myClasses);

            setStats({
                students: students.length,
                quizzes: content.filter((c: any) => c.type === 'quiz').length,
                lessons: content.filter((c: any) => c.type === 'lesson').length
            });

            if (currentUser.ipAddress) {
                setIpAddress(currentUser.ipAddress);
            }
        };

        loadData();
    }, [db, currentUser]);

    const handleCreateClass = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!db || !currentUser || !newClass.name) return;

        setCreating(true);
        try {
            const classId = uuidv4();

            // 1. Create Class
            await db.classes.insert({
                id: classId,
                name: newClass.name,
                standard: newClass.standard,
                medium: newClass.medium,
                teacherId: currentUser.id,
                code: Array.from({ length: 6 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'.charAt(Math.floor(Math.random() * 32))).join(''),
                createdAt: Date.now()
            });

            // 2. Seed Subjects (SKIPPED: Relying on System Content now)
            /*
            const subjects = getSubjects(newClass.standard, newClass.medium);
            const timestamp = Date.now();
            const subjectDocs = subjects.map(subject => ({
                id: uuidv4(),
                type: 'subject',
                title: subject,
                classId: classId,
                createdAt: timestamp,
                updatedAt: timestamp,
                description: `Standard ${newClass.standard} (${newClass.medium})`,
                thumbnail: '📚',
                teacherId: currentUser.id
            }));
            await db.content.bulkInsert(subjectDocs);
            */

            // Reload & Close
            const allClasses = await db.classes.find().exec();
            const myClasses = allClasses.filter((c: any) => c.teacherId === currentUser.id);
            setClasses(myClasses);
            setIsModalOpen(false);
            setNewClass({ name: '', standard: '10', medium: 'english' }); // Reset

        } catch (err) {
            console.error("Failed to create class:", err);
            alert("Error creating class.");
        } finally {
            setCreating(false);
        }
    };

    const handleExit = async () => {
        await logout();
        navigate('/');
    };

    const handleSaveIp = async () => {
        if (!db || !currentUser) return;
        setSavingIp(true);
        try {
            const userDoc = await db.users.findOne(currentUser.id).exec();
            if (userDoc) {
                await userDoc.patch({ ipAddress: ipAddress });
                alert("IP Address Updated!");
            }
        } catch (err) {
            console.error("Failed to save IP:", err);
            alert("Failed to save IP");
        } finally {
            setSavingIp(false);
        }
    };

    return (
        <div className="min-h-screen p-6 pb-24 aurora-bg font-sans">
            {/* Create Class Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-white">Create New Class</h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateClass} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs uppercase font-bold text-slate-500">Class Name</label>
                                    <input
                                        type="text"
                                        value={newClass.name}
                                        onChange={e => setNewClass({ ...newClass, name: e.target.value })}
                                        placeholder="Ex: Topper Batch 2026"
                                        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-primary focus:outline-none transition-colors"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs uppercase font-bold text-slate-500">Standard</label>
                                    <div className="grid grid-cols-5 gap-2">
                                        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'].map(std => {
                                            const label = std + (std === '1' ? 'st' : std === '2' ? 'nd' : std === '3' ? 'rd' : 'th');
                                            return (
                                                <button
                                                    key={std}
                                                    type="button"
                                                    onClick={() => setNewClass({ ...newClass, standard: std })}
                                                    className={`p-2 rounded text-xs font-bold transition-all border ${newClass.standard === std
                                                        ? 'bg-blue-600/20 text-blue-400 border-blue-600'
                                                        : 'bg-white/5 text-slate-400 border-transparent hover:bg-white/10'}`}
                                                >
                                                    {label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs uppercase font-bold text-slate-500">Medium</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {['english', 'marathi'].map(med => (
                                            <button
                                                key={med}
                                                type="button"
                                                onClick={() => setNewClass({ ...newClass, medium: med as any })}
                                                className={`p-3 rounded-xl text-sm font-bold capitalize transition-all border ${newClass.medium === med
                                                    ? 'bg-purple-600/20 text-purple-400 border-purple-600'
                                                    : 'bg-white/5 text-slate-400 border-transparent hover:bg-white/10'}`}
                                            >
                                                {med}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="w-full bg-primary hover:bg-primary/80 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                                >
                                    {creating ? 'Creating...' : 'Create Class & Seed Subjects'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <header className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={handleExit} className="p-2 glass-panel rounded-xl text-slate-400 hover:text-white" title="Logout">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-2xl font-bold text-white">Teacher Dashboard</h1>
                </div>
            </header>

            {/* Global Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="glass-panel p-4 rounded-xl flex flex-col items-center justify-center gap-2">
                    <Users className="w-6 h-6 text-blue-400" />
                    <span className="text-2xl font-bold text-white">{stats.students}</span>
                    <span className="text-xs text-slate-400">Total Students</span>
                </div>
                <div className="glass-panel p-4 rounded-xl flex flex-col items-center justify-center gap-2">
                    <School className="w-6 h-6 text-yellow-400" />
                    <span className="text-2xl font-bold text-white">{classes.length}</span>
                    <span className="text-xs text-slate-400">Active Classes</span>
                </div>
                <div className="glass-panel p-4 rounded-xl flex flex-col items-center justify-center gap-2">
                    <BookOpen className="w-6 h-6 text-purple-400" />
                    <span className="text-2xl font-bold text-white">{stats.lessons + stats.quizzes}</span>
                    <span className="text-xs text-slate-400">Total Content</span>
                </div>
            </div>

            {/* Actions / Class Management Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-white">Your Classes</h2>
                    <p className="text-xs text-slate-400">Manage students and content groups</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/80 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/20"
                >
                    <Plus className="w-5 h-5" /> Create Class
                </button>
            </div>

            {/* IP Address Settings */}
            <div className="mb-8 glass-panel p-6 rounded-2xl border border-white/5">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span> Device Configuration
                </h3>
                <div className="flex items-end gap-4 max-w-md">
                    <div className="flex-1 space-y-2">
                        <label className="text-xs uppercase font-bold text-slate-500">Device IP Address</label>
                        <input
                            type="text"
                            value={ipAddress}
                            onChange={(e) => setIpAddress(e.target.value)}
                            placeholder="192.168.x.x"
                            className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white font-mono focus:border-primary focus:outline-none"
                        />
                    </div>
                    <button
                        onClick={handleSaveIp}
                        disabled={savingIp}
                        className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50"
                    >
                        {savingIp ? 'Saving...' : 'Update IP'}
                    </button>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                    This IP is used to identify this teacher device for local syncing.
                </p>
            </div>

            <section className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {classes.map((cls) => (
                        <motion.button
                            key={cls.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={() => navigate(`/teacher/class/${cls.id}`)}
                            className="glass-panel p-6 rounded-2xl flex items-center justify-between group hover:border-primary/50 transition-all text-left"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                                    <School className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-lg">{cls.name}</h3>
                                    <p className="text-xs text-slate-400">{cls.standard} • {cls.medium}</p>
                                    <div className="mt-1 inline-block px-2 py-1 bg-white/10 rounded text-[10px] text-primary font-mono tracking-wider">
                                        Code: {cls.code || '---'}
                                    </div>
                                </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
                        </motion.button>
                    ))}

                    {classes.length === 0 && (
                        <div className="col-span-full py-12 text-center text-slate-500 glass-panel rounded-2xl border-dashed border-white/10">
                            <School className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p className="font-medium">No classes yet.</p>
                            <p className="text-sm opacity-70">Create a class to start adding subjects and students.</p>
                        </div>
                    )}
                </div>
            </section>


        </div>
    );
}
