import { useParams, useNavigate } from 'react-router-dom';
import { useDatabase } from '../../context/DatabaseContext';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Edit, FileText, HelpCircle, QrCode, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from "react-qr-code";

export default function ModuleView() {
    const { moduleId } = useParams();
    const navigate = useNavigate();
    const { db } = useDatabase();
    const { currentUser } = useAuth();

    const [moduleTitle, setModuleTitle] = useState('Loading...');
    const [subjectId, setSubjectId] = useState<string>('');
    const [contents, setContents] = useState<any[]>([]);

    const [activeQrItem, setActiveQrItem] = useState<any>(null); // For QR Modal

    // ... useEffect ...

    // Construct Share URL
    const getShareUrl = (contentId: string) => {
        const ip = currentUser?.ipAddress;
        const port = window.location.port ? `:${window.location.port}` : '';
        const protocol = window.location.protocol;

        // If IP is set, prefer it (Host Mode). Otherwise use current origin (Local Mode).
        const baseUrl = ip ? `${protocol}//${ip}${port}` : window.location.origin;
        return `${baseUrl}/play/${contentId}`;
    };

    // For deleting/renaming if needed (keeping simple for now)

    useEffect(() => {
        if (!db || !moduleId) return;

        const loadData = async () => {
            // 1. Get Module Info
            const mod = await db.content.findOne(moduleId).exec();
            if (mod) {
                setModuleTitle(mod.get('title'));
                setSubjectId(mod.get('subjectId'));
            }

            // 2. Get Content linked to this Module
            const allContent = await db.content.find().exec();
            const modContent = allContent.filter((c: any) => c.moduleId === moduleId);
            setContents(modContent.sort((a: any, b: any) => b.order - a.order));
        };
        loadData();
    }, [db, moduleId]);

    const handleBack = () => {
        if (subjectId) {
            navigate(`/teacher/subject/${subjectId}`);
        } else {
            navigate('/teacher');
        }
    };

    const handleDelete = async (id: string) => {
        if (!db || !confirm("Delete this content?")) return;
        const doc = await db.content.findOne(id).exec();
        if (doc) await doc.remove();
        window.location.reload();
    };

    return (
        <div className="min-h-screen p-6 pb-24 aurora-bg">
            <header className="flex items-center gap-4 mb-8">
                <button onClick={handleBack} className="p-2 glass-panel rounded-xl text-slate-400 hover:text-white">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-white">{moduleTitle}</h1>
                    <p className="text-xs text-slate-400">Lesson Module</p>
                </div>
            </header>

            {/* QR Modal */}
            <AnimatePresence>
                {activeQrItem && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white rounded-2xl p-8 max-w-sm w-full text-center relative"
                        >
                            <button
                                onClick={() => setActiveQrItem(null)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <h3 className="text-2xl font-bold text-slate-800 mb-2">Scan to Play</h3>
                            <p className="text-slate-500 mb-6 text-sm">{activeQrItem.title}</p>

                            <div className="bg-white p-4 rounded-xl border-2 border-slate-100 inline-block mb-4">
                                <QRCode
                                    value={getShareUrl(activeQrItem.id)}
                                    size={200}
                                    className="h-auto w-full max-w-full"
                                />
                            </div>

                            <p className="text-xs text-slate-400 font-mono">
                                ID: {activeQrItem.id.slice(0, 8)}...
                            </p>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div className="space-y-4">
                <div className="flex justify-end gap-2">
                    <button
                        onClick={() => navigate('/teacher/create?type=text&moduleId=' + moduleId + '&subjectId=' + subjectId)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg hover:scale-105 transition-transform"
                    >
                        <Plus className="w-4 h-4" /> New Text/Note
                    </button>
                    <button
                        onClick={() => navigate('/teacher/create?type=quiz&moduleId=' + moduleId + '&subjectId=' + subjectId)}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg hover:scale-105 transition-transform"
                    >
                        <Plus className="w-4 h-4" /> New Quiz
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {contents.map((item) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-panel p-4 rounded-xl flex items-center justify-between"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.type === 'quiz' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                    {item.type === 'quiz' ? <HelpCircle className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">{item.title}</h3>
                                    <p className="text-xs text-slate-400 capitalize">{item.type === 'text' ? 'Note/Page' : 'Quiz'}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {item.type === 'quiz' && (
                                    <button
                                        onClick={() => setActiveQrItem(item)}
                                        className="p-2 text-slate-500 hover:text-blue-400 transition-colors"
                                        title="Generate QR"
                                    >
                                        <QrCode className="w-4 h-4" />
                                    </button>
                                )}
                                <button
                                    onClick={() => navigate(`/teacher/create?type=${item.type}&editId=${item.id}&moduleId=${moduleId}&subjectId=${subjectId}`)}
                                    className="p-2 text-slate-500 hover:text-white transition-colors"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                    {contents.length === 0 && (
                        <div className="text-center text-slate-500 py-12 glass-panel rounded-2xl border-dashed border-white/10">
                            <p className="font-medium">No content in this module yet.</p>
                            <p className="text-xs opacity-70">Add a Text Page or Quiz.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
