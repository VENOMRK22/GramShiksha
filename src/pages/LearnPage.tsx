import { useState, useEffect } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Play, Lock, Star, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

// Import Subject Backgrounds
import bgMath from '../assets/subjects/math.png';
import bgScience from '../assets/subjects/science.png';
import bgEnglish from '../assets/subjects/english.png';
import bgMarathi from '../assets/subjects/marathi.png';
import bgHindi from '../assets/subjects/hindi.png';
import bgHistory from '../assets/subjects/history.png';
import bgGeography from '../assets/subjects/geography.png';
import bgDefense from '../assets/subjects/defense.png';
// Fallbacks
import bgLanguage from '../assets/subjects/language.png';
import bgSocial from '../assets/subjects/social.png';

// Helper for subject backgrounds
const getSubjectBg = (title: string) => {
    const t = title.toLowerCase();

    // Exact Matches for New Curriculum
    if (t.includes('english') || t.includes('इंग्रजी')) return bgEnglish;
    if (t.includes('marathi') || t.includes('मराठी')) return bgMarathi;
    if (t.includes('hindi') || t.includes('हिंदी')) return bgHindi;

    // Match "Mathematics", "Maths", "Mathematics Part-I", "Mathematics Part-II"
    if (t.includes('math') || t.includes('गणित')) return bgMath;

    // Match "Science", "General Science", "Science & Technology"
    if (t.includes('sci') || t.includes('विज्ञान') || t.includes('evs') || t.includes('परिसर')) return bgScience;

    // Match "History", "History & Civics", "History & Political Science"
    if (t.includes('history') || t.includes('hist') || t.includes('इतिहास')) return bgHistory;

    // Match "Geography"
    if (t.includes('geo') || t.includes('भूगोल')) return bgGeography;

    // Match "Defense Studies"
    if (t.includes('defense') || t.includes('defenc') || t.includes('संरक्षण')) return bgDefense;

    // Fallback
    if (t.includes('civic') || t.includes('polit') || t.includes('state') || t.includes('social')) return bgHistory; // Use History BG for Civics/PolSci if isolated
    return bgLanguage;
};

export default function LearnPage() {
    const { db } = useDatabase();
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const { subjectId } = useParams();

    const [subject, setSubject] = useState<any>(null);
    const [subjects, setSubjects] = useState<any[]>([]); // List of all subjects
    const [lessons, setLessons] = useState<any[]>([]);
    const [progress, setProgress] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!db || !currentUser) return;

        const loadContent = async () => {
            if (!subjectId) {
                // LOAD ALL SUBJECTS (Grid View)
                const allContent = await db.content.find().exec();
                const rawSubjects = allContent.filter((c: any) =>
                    c.type === 'subject' &&
                    (c.classId === currentUser.classId || c.classId === currentUser.teacherClassId) &&
                    // Filter by Medium (default to english if undefined)
                    ((c.medium || 'english') === (currentUser.medium || 'english'))
                );

                // Deduplicate by Title (Prefer New Data with explicit medium)
                const uniqueMap = new Map();
                rawSubjects.forEach((sub: any) => {
                    const existing = uniqueMap.get(sub.title);
                    if (!existing) {
                        uniqueMap.set(sub.title, sub);
                    } else {
                        // If we have a duplicate, prefer the one with explicit medium set
                        if (sub.medium && !existing.medium) {
                            uniqueMap.set(sub.title, sub);
                        }
                    }
                });
                const mySubjects = Array.from(uniqueMap.values());

                // Sort
                const order = ['English', 'Marathi', 'Hindi', 'Mathematics', 'Science', 'History', 'Geography', 'Defense'];
                const getRank = (title: string) => {
                    const index = order.findIndex(k => title.includes(k));
                    return index === -1 ? 99 : index;
                };
                mySubjects.sort((a: any, b: any) => getRank(a.title) - getRank(b.title));
                setSubjects(mySubjects.map(s => s.toJSON()));

            } else {
                // LOAD SPECIFIC SUBJECT (Lesson View)
                const subDoc = await db.content.findOne(subjectId).exec();
                if (subDoc) setSubject(subDoc.toJSON());

                const lessonDocs = await db.content.find({
                    selector: { subjectId: subjectId },
                    sort: [{ createdAt: 'asc' }]
                }).exec();
                setLessons(lessonDocs.map((d: any) => d.toJSON()));

                // Progress
                const userProgress = await db.progress.find({
                    selector: { userId: currentUser.id }
                }).exec();
                const progressMap: Record<string, any> = {};
                userProgress.forEach(doc => {
                    progressMap[doc.get('levelId')] = doc.toJSON();
                });
                setProgress(progressMap);
            }
            setLoading(false);
        };
        loadContent();
    }, [db, subjectId, currentUser]);

    if (loading) return <div className="min-h-screen grid place-items-center text-cyan-400 animate-pulse">Syncing Knowledge...</div>;

    // --- VIEW 1: SUBJECT GRID (Class) ---
    if (!subjectId) {
        return (
            <div className="min-h-screen p-6 pb-24 font-sans aurora-bg animate-fade-in">
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-slate-300 hover:text-white"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">My Class</h1>
                        <p className="text-sm text-slate-400">Class {currentUser?.classId || 'N/A'} • {subjects.length} Subjects</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                    {subjects.map((sub, i) => (
                        <motion.div
                            key={sub.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            onClick={() => navigate(`/learn/${sub.id}`)}
                            className="group relative h-48 rounded-3xl overflow-hidden cursor-pointer border border-white/5 shadow-2xl hover:scale-[1.02] transition-transform"
                        >
                            <div
                                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                style={{ backgroundImage: `url(${getSubjectBg(sub.title)})` }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent/30" />

                            <div className="absolute bottom-0 left-0 p-6 w-full">
                                <h3 className="text-2xl font-black text-white mb-1 group-hover:text-cyan-400 transition-colors drop-shadow-md">{sub.title}</h3>
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/20 text-white backdrop-blur-md uppercase tracking-wider">
                                        Standard {sub.classId}
                                    </span>
                                </div>
                            </div>

                            <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-4 group-hover:translate-x-0">
                                <Play className="w-5 h-5 text-white fill-white" />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        );
    }

    // --- VIEW 2: LESSON LIST (Specific Subject) ---
    if (!subject) return (
        <div className="p-10 text-center text-slate-400">
            Subject not found. <button onClick={() => navigate('/dashboard')} className="text-cyan-400 underline">Go Home</button>
        </div>
    );

    return (
        <div className="min-h-screen p-6 pb-24 font-sans aurora-bg">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate('/learn')} // Go back to subject list
                    className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-slate-300 hover:text-white"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-white leading-tight">{subject.title}</h1>
                    <p className="text-sm text-slate-400">{lessons.length} Modules • Class {currentUser?.classId || 'N/A'}</p>
                </div>
            </div>

            {/* Lesson List */}
            <div className="space-y-4 max-w-3xl mx-auto">
                {lessons.length === 0 && (
                    <div className="text-center py-16 glass-panel rounded-3xl border-dashed border-white/10">
                        <p className="text-slate-500 font-medium">No lessons added yet.</p>
                        <p className="text-xs text-slate-600 mt-2">Wait for your teacher to publish content.</p>
                    </div>
                )}

                {lessons.map((lesson, index) => {
                    const status = progress[lesson.id];
                    const isCompleted = !!status?.completed;
                    const isLocked = false; // logic removed explicitly

                    return (
                        <motion.button
                            key={lesson.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            disabled={isLocked}
                            onClick={() => !isLocked && navigate(`/play/${lesson.id}`)}
                            className={`w-full group relative overflow-hidden rounded-3xl border transition-all duration-300 text-left p-6 flex items-center gap-6
                                ${isCompleted
                                    ? 'bg-slate-900/40 border-green-500/30 hover:border-green-500/60'
                                    : 'glass-panel border-white/5 hover:border-cyan-500/50 hover:bg-white/5 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] hover:-translate-y-1'
                                }
                            `}
                        >
                            {/* Status Icon / Index */}
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold shadow-inner transition-colors duration-300
                                ${isCompleted
                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                    : 'bg-white/5 text-cyan-400 border border-white/10 group-hover:bg-cyan-500/20 group-hover:border-cyan-500/30'
                                }
                            `}>
                                {isCompleted ? <CheckCircle className="w-6 h-6" /> : <span className="text-xl font-black opacity-50 group-hover:opacity-100">{index + 1}</span>}
                            </div>

                            <div className="flex-1">
                                <h3 className={`text-xl font-bold mb-1 transition-colors ${isCompleted ? 'text-slate-300' : 'text-white group-hover:text-cyan-400'}`}>
                                    {lesson.title}
                                </h3>
                                <p className="text-sm text-slate-400 font-medium line-clamp-1 group-hover:text-slate-300 transition-colors">
                                    {lesson.description || 'Tap to start this lesson'}
                                </p>
                            </div>

                            {/* Start / Action Button */}
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all duration-300
                                ${isCompleted
                                    ? 'bg-white/5 border-white/5 text-slate-600'
                                    : 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)] group-hover:scale-110 group-hover:shadow-[0_0_25px_rgba(6,182,212,0.6)]'
                                }
                            `}>
                                {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current ml-1" />}
                            </div>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}
