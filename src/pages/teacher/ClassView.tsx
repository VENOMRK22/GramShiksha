import { useParams, useNavigate } from 'react-router-dom';
import { useDatabase } from '../../context/DatabaseContext';
import { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, Users, Plus, Folder, Trash2, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import Leaderboard from '../../components/game/Leaderboard';
import InputModal from '../../components/common/InputModal';

export default function ClassView() {
    const { classId } = useParams();
    const navigate = useNavigate();
    const { db } = useDatabase();

    const [className, setClassName] = useState('Loading...');
    const [classCode, setClassCode] = useState('');
    const [activeTab, setActiveTab] = useState<'subjects' | 'students' | 'leaderboard'>('subjects');
    const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);

    const [subjects, setSubjects] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);

    // Debug & Error States
    const [loadingError, setLoadingError] = useState('');
    const [isLoaded, setIsLoaded] = useState(false);

    // Single Unified Data Loader (Simplified & Robust)
    const loadData = async () => {
        if (!db || !classId) return;

        console.log("--- START DATA LOAD ---");
        console.log("Target Class ID:", classId);
        setLoadingError('');

        try {
            // 1. Debug: List all classes first to see what's in there
            const allClasses = await db.classes.find().exec();
            const allClassIds = allClasses.map((c: any) => c.get('id'));
            console.log("Available Class IDs in DB:", allClassIds);

            // 2. Fetch Target Class
            const cls = await db.classes.findOne(classId).exec();

            if (!cls) {
                console.error("CRITICAL: Class ID not found in DB!");
                const availableIds = allClassIds.join(', ');
                setLoadingError(`ID Mismatch. Requested: ${classId} | Available: ${availableIds}`);
                setClassName('Class Not Found');
                setIsLoaded(true);
                return;
            }

            console.log("Class Found:", cls.get('name'));
            setClassName(cls.get('name'));
            setClassCode(cls.get('code') || '');

            // 3. Load Subjects
            const standard = String(cls.get('standard') || '10').replace(/\D/g, ''); // "10"
            const medium = String(cls.get('medium') || 'english').toLowerCase(); // "english"

            console.log(`Filter Criteria -> Standard: ${standard}, Medium: ${medium}`);

            const allDocs = await db.content.find().exec();
            const allContent = allDocs.map((doc: any) => doc.toJSON());

            const rawSubjects = allContent.filter((c: any) => {
                if (c.type !== 'subject') return false;

                // Matches exact Class ID (Custom)
                if (c.classId === classId) return true;

                // Matches Standard + Medium (System)
                // We use relaxed string comparison just to be safe
                if (String(c.classId) === standard) {
                    const subMedium = String(c.medium || 'english').toLowerCase();
                    return subMedium === medium;
                }
                return false;
            });

            console.log(`Raw Subjects Found: ${rawSubjects.length}`);

            // 4. Deduplicate (Score -> Sort -> Pick First)
            const scored = rawSubjects.map((sub: any) => {
                let score = 0;
                if (sub.classId === standard) score += 100; // Prefer System
                if (sub.medium) score += 10; // Prefer Typed
                score += (sub.createdAt || 0) / 10000000000000;
                return { sub, score };
            });

            scored.sort((a: any, b: any) => b.score - a.score);

            const seenTitles = new Set();
            const finalSubjects: any[] = [];

            scored.forEach((item: any) => {
                const titleKey = item.sub.title.trim();
                if (!seenTitles.has(titleKey)) {
                    seenTitles.add(titleKey);
                    finalSubjects.push(item.sub);
                }
            });

            console.log(`Final Deduplicated Subjects: ${finalSubjects.length}`);
            setSubjects(finalSubjects.sort((a: any, b: any) => (a.createdAt || 0) - (b.createdAt || 0)));

            // 5. Load Students
            const allUsers = await db.users.find().exec();
            const classStudents = allUsers.filter((u: any) => u.teacherClassId === classId && u.role !== 'teacher');
            setStudents(classStudents);

            setIsLoaded(true);

        } catch (err: any) {
            console.error("Data Load Error:", err);
            setLoadingError(err.message || "Unknown DB Error");
            setIsLoaded(true);
        }
    };

    useEffect(() => {
        loadData();
    }, [db, classId]);

    const handleCreateSubject = async (title: string) => {
        if (!db || !classId) return;

        try {
            console.log("Attempting to create subject:", { title, classId });
            await db.content.insert({
                id: crypto.randomUUID(),
                type: 'subject',
                title,
                description: `Subject in ${className}`,
                classId: classId,
                data: {},
                createdAt: Date.now(),
                updatedAt: Date.now(),
                isHomework: false
            });
            console.log("Subject created successfully");
            loadData(); // Reload data instead of page reload
            setIsSubjectModalOpen(false);
        } catch (err: any) {
            console.error("Failed to create subject:", err);
            alert(`Error creating subject: ${err.message || JSON.stringify(err)}`);
        }
    };

    const handleDeleteSubject = async (id: string) => {
        if (!db || !confirm("Delete this Subject? Lessons inside might become orphaned.")) return;
        const doc = await db.content.findOne(id).exec();
        if (doc) await doc.remove();
        loadData(); // Reload data instead of page reload
    };

    return (
        <div className="min-h-screen p-6 pb-24 aurora-bg">
            <InputModal
                isOpen={isSubjectModalOpen}
                onClose={() => setIsSubjectModalOpen(false)}
                onSubmit={handleCreateSubject}
                title="Create New Subject"
                placeholder="Ex: Physics, History..."
            />

            <div className="flex justify-between items-start mb-8">
                <header className="flex items-center gap-4">
                    <button onClick={() => navigate('/teacher')} className="p-2 glass-panel rounded-xl text-slate-400 hover:text-white">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-white">
                            {loadingError ? <span className="text-red-400">{loadingError}</span> : className}
                        </h1>
                        <p className="text-xs text-slate-400 font-medium flex items-center gap-2">
                            Class Management
                            {classCode && (
                                <span className="px-2 py-0.5 bg-primary/20 text-primary rounded font-mono tracking-widest select-all border border-primary/20">
                                    {classCode}
                                </span>
                            )}
                            {isLoaded ? '' : ' (Loading...)'}
                        </p>
                    </div>
                </header>

                <button
                    onClick={loadData}
                    className="p-2 glass-panel rounded-xl text-slate-400 hover:text-white"
                    title="Reload Data"
                >
                    <RefreshCw className={`w-5 h-5 ${!isLoaded ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-white/10 pb-2">
                <button
                    onClick={() => setActiveTab('subjects')}
                    className={`flex items-center gap-2 px-4 py-2 font-bold transition-all ${activeTab === 'subjects' ? 'text-primary border-b-2 border-primary' : 'text-slate-400 hover:text-white'}`}
                >
                    <BookOpen className="w-4 h-4" /> Subjects
                </button>
                <button
                    onClick={() => setActiveTab('students')}
                    className={`flex items-center gap-2 px-4 py-2 font-bold transition-all ${activeTab === 'students' ? 'text-primary border-b-2 border-primary' : 'text-slate-400 hover:text-white'}`}
                >
                    <Users className="w-4 h-4" /> Students
                </button>
                <button
                    onClick={() => setActiveTab('leaderboard')}
                    className={`flex items-center gap-2 px-4 py-2 font-bold transition-all ${activeTab === 'leaderboard' ? 'text-primary border-b-2 border-primary' : 'text-slate-400 hover:text-white'}`}
                >
                    <BookOpen className="w-4 h-4" /> Leaderboard
                </button>
            </div>

            {/* Content Area */}
            {activeTab === 'subjects' && (
                <div className="space-y-4">
                    <div className="flex justify-end">
                        <button
                            onClick={() => setIsSubjectModalOpen(true)}
                            className="flex items-center gap-2 bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
                        >
                            <Plus className="w-4 h-4" /> New Subject
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {subjects.map((sub) => (
                            <motion.div
                                key={sub.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="glass-panel p-6 rounded-2xl flex items-center justify-between group hover:border-primary/50 transition-all cursor-pointer"
                                onClick={() => navigate(`/teacher/subject/${sub.id}?classId=${classId}`)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                                        <Folder className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-lg">{sub.title}</h3>
                                        <p className="text-xs text-slate-400">{new Date(sub.createdAt || Date.now()).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDeleteSubject(sub.id); }}
                                    className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </motion.div>
                        ))}
                        {subjects.length === 0 && isLoaded && (
                            <div className="col-span-full py-12 text-center text-slate-500 glass-panel rounded-2xl border-dashed border-white/10">
                                <Folder className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p className="font-medium">No subjects found.</p>
                                {loadingError && <p className="text-red-400 text-sm mt-2">{loadingError}</p>}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'students' && (
                <div className="space-y-4">
                    <div className="glass-panel rounded-2xl overflow-hidden">
                        <table className="w-full text-left text-sm text-slate-300">
                            <thead className="bg-white/5 text-xs uppercase font-bold text-slate-500">
                                <tr>
                                    <th className="p-4">Name</th>
                                    <th className="p-4">Rank/Level</th>
                                    <th className="p-4 text-right">XP</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((student) => (
                                    <tr key={student.id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="p-4 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden">
                                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.avatarId}`} alt="avatar" />
                                            </div>
                                            <span className="font-medium text-white">{student.name}</span>
                                        </td>
                                        <td className="p-4">Level {Math.floor((student.xp || 0) / 100) + 1}</td>
                                        <td className="p-4 text-right font-mono text-primary">{student.xp || 0} XP</td>
                                    </tr>
                                ))}
                                {students.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="p-8 text-center text-slate-500">
                                            No students have joined this class yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'leaderboard' && (
                <div className="glass-panel p-6 rounded-2xl">
                    <Leaderboard classId={classId} />
                </div>
            )}
        </div>
    );
}
