import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useDatabase } from '../../context/DatabaseContext';
import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Layout } from 'lucide-react';
import { motion } from 'framer-motion';
import InputModal from '../../components/common/InputModal';

export default function SubjectView() {
    const { subjectId } = useParams();
    const navigate = useNavigate();
    const { db } = useDatabase();

    const [subjectTitle, setSubjectTitle] = useState('Loading...');
    const [classId, setClassId] = useState<string>('');
    const [modules, setModules] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (!db || !subjectId) return;

        const loadData = async () => {
            // 1. Get Subject Info
            const sub = await db.content.findOne(subjectId).exec();
            if (sub) {
                setSubjectTitle(sub.get('title'));
                setClassId(sub.get('classId'));
            }

            // 2. Get "Modules" (Lessons) linked to this Subject
            const allContent = await db.content.find().exec();
            const subModules = allContent.filter((c: any) => c.subjectId === subjectId && (c.type === 'module' || c.type === 'lesson')); // Support 'lesson' as container for now
            setModules(subModules.sort((a: any, b: any) => (a.createdAt || 0) - (b.createdAt || 0)));
        };
        loadData();
    }, [db, subjectId]);

    const [searchParams] = useSearchParams();
    const originClassId = searchParams.get('classId');

    const handleBack = () => {
        if (originClassId) {
            navigate(`/teacher/class/${originClassId}`);
        } else if (classId) {
            // Fallback to internal link (legacy)
            navigate(`/teacher/class/${classId}`);
        } else {
            navigate('/teacher');
        }
    };

    const handleCreateModule = async (title: string) => {
        if (!db || !subjectId) return;

        await db.content.insert({
            id: crypto.randomUUID(),
            type: 'module', // This is the generic "Lesson" container
            title,
            description: `Module in ${subjectTitle}`,
            subjectId: subjectId,
            data: {},
            createdAt: Date.now(),
            updatedAt: Date.now(),
            isHomework: false
        });
        window.location.reload();
    };

    const handleDelete = async (id: string) => {
        if (!db || !confirm("Delete this Module? Content inside will be hidden.")) return;
        const doc = await db.content.findOne(id).exec();
        if (doc) await doc.remove();
        window.location.reload();
    };

    return (
        <div className="min-h-screen p-6 pb-24 aurora-bg">
            <InputModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreateModule}
                title="Create New Lesson (Module)"
                placeholder="Ex: Chapter 1 - Introduction"
            />

            <header className="flex items-center gap-4 mb-8">
                <button onClick={handleBack} className="p-2 glass-panel rounded-xl text-slate-400 hover:text-white">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-white">{subjectTitle}</h1>
                    <p className="text-xs text-slate-400">Subject Overview</p>
                </div>
            </header>

            <div className="space-y-4">
                <div className="flex justify-end gap-2">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg hover:scale-105 transition-transform"
                    >
                        <Plus className="w-4 h-4" /> New Lesson Module
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {modules.map((item) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-panel p-6 rounded-xl flex items-center justify-between cursor-pointer hover:border-primary/50 transition-all"
                            onClick={() => navigate(`/teacher/module/${item.id}`)}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                                    <Layout className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-lg">{item.title}</h3>
                                    <p className="text-xs text-slate-400 capitalize">Lesson Module</p>
                                </div>
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                                className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </motion.div>
                    ))}
                    {modules.length === 0 && (
                        <div className="text-center text-slate-500 py-12 glass-panel rounded-2xl border-dashed border-white/10">
                            <Layout className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p className="font-medium">No lessons yet.</p>
                            <p className="text-xs opacity-70">Create a Lesson Module to add text and quizzes.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
