import { useState, useEffect } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Clock, FileText, HelpCircle, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function HomeworkPage() {
    const { db } = useDatabase();
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [homework, setHomework] = useState<any[]>([]);
    const [progress, setProgress] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!db || !currentUser) return;

        const load = async () => {
            // Fetch content where isHomework = true
            const allContent = await (db as any).content.find({
                selector: {
                    isHomework: { $eq: true }
                }
            }).exec();

            // Filter relevant to my class/teacher
            const relevant = allContent.filter((c: any) => {
                const isClassMatch = c.classId === currentUser.classId;
                const isTeacherMatch = c.classId === currentUser.teacherClassId;
                return isClassMatch || isTeacherMatch;
            });

            setHomework(relevant.map((d: any) => d.toJSON()));

            const userProgress = await db.progress.find({
                selector: { userId: currentUser.id }
            }).exec();
            const progressMap: Record<string, any> = {};
            userProgress.forEach(doc => {
                progressMap[doc.get('levelId')] = doc.toJSON();
            });
            setProgress(progressMap);
            setLoading(false);
        };
        load();
    }, [db, currentUser]);

    return (
        <div className="min-h-screen p-6 pb-24 aurora-bg font-sans">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors text-slate-300 hover:text-white"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="text-3xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
                        {t('nav.homework')}
                    </h1>
                    <p className="text-sm text-slate-400 font-medium">
                        {homework.length} {t('homework.pending_count')}
                    </p>
                </div>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                {loading ? (
                    <div className="col-span-full py-20 text-center animate-pulse text-purple-400 font-bold">
                        {t('homework.checking')}
                    </div>
                ) : homework.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-24 text-slate-500 gap-6 glass-panel rounded-3xl border-dashed border-white/10">
                        <div className="p-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                            <BookOpen className="w-12 h-12 text-purple-400" />
                        </div>
                        <div className="text-center space-y-2">
                            <h3 className="text-white font-bold text-xl">{t('homework.all_caught_up')}</h3>
                            <p className="text-sm opacity-60 max-w-xs mx-auto">{t('homework.no_homework_desc')}</p>
                        </div>
                    </div>
                ) : (
                    <AnimatePresence>
                        {homework.map((item, index) => {
                            const isDone = !!progress[item.id]?.score;
                            const score = progress[item.id]?.score;

                            return (
                                <motion.button
                                    key={item.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => navigate(`/play/${item.id}`)}
                                    className={`group relative text-left w-full h-full p-6 rounded-3xl border transition-all duration-300
                                        ${isDone
                                            ? 'bg-slate-900/40 border-green-500/30 hover:border-green-500/60'
                                            : 'glass-panel border-purple-500/30 hover:border-purple-500/80 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] hover:-translate-y-1'
                                        }
                                    `}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner
                                            ${item.type === 'quiz'
                                                ? 'bg-green-500/20 text-green-400'
                                                : 'bg-blue-500/20 text-blue-400'
                                            }
                                        `}>
                                            {item.type === 'quiz' ? <HelpCircle className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                                        </div>

                                        {isDone ? (
                                            <div className="flex flex-col items-end">
                                                <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-bold border border-green-500/30 flex items-center gap-1">
                                                    <CheckCircle className="w-3 h-3" /> {t('homework.done')}
                                                </span>
                                                {score !== undefined && (
                                                    <span className="text-xs font-bold text-slate-400 mt-1">{t('homework.score_percent', { score })}</span>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30 flex items-center gap-1 animate-pulse">
                                                <Clock className="w-3 h-3" /> {t('homework.pending')}
                                            </span>
                                        )}
                                    </div>

                                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 transition-colors">
                                        {item.title}
                                    </h3>

                                    <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed mb-4">
                                        {item.description || t('homework.default_desc')}
                                    </p>

                                    <div className="border-t border-white/5 pt-4 flex items-center justify-between text-xs font-medium text-slate-500 group-hover:text-purple-300 transition-colors">
                                        <span>
                                            {new Date(item.createdAt || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            {t('homework.open')} →
                                        </span>
                                    </div>
                                </motion.button>
                            );
                        })}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
}
