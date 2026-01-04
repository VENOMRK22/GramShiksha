import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDatabase } from '../context/DatabaseContext';
import { useAuth } from '../context/AuthContext';
import QuizRunner from '../components/game/QuizRunner';
import LessonView from '../components/game/LessonView';
import type { QuizResult } from '../lib/gameLogic';
import { Star, Repeat, Home, BookOpen } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export default function LevelPlayer() {
    const { levelId } = useParams();
    const navigate = useNavigate();
    const { db } = useDatabase();
    const { currentUser } = useAuth();

    const [loading, setLoading] = useState(true);
    const [content, setContent] = useState<any>(null);
    const [moduleChildren, setModuleChildren] = useState<any[]>([]); // For Module View
    const [gameResult, setGameResult] = useState<QuizResult | null>(null);
    const [showLegacy, setShowLegacy] = useState(false);

    useEffect(() => {
        if (!db || !levelId) return;

        db.content.findOne(levelId).exec().then(async doc => {
            if (doc) {
                let docData = doc.toJSON();

                // --- AUTO-SEEDER: Fix missing textbook automatically ---
                const type = docData.type;
                if ((type === 'lesson' || type === 'module' || type === 'text')) {
                    const currentData = docData.data || {};
                    const currentAttachments = currentData.attachments || [];

                    if (!currentAttachments.some((a: any) => a.name === 'TextBook.pdf')) {
                        console.log("Auto-Seeding Missing Textbook...");
                        const MOCK_PDF = "data:application/pdf;base64,JVBERi0xLjcKCjEgMCBvYmoKPDwvVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCgoyIDAgb2JqCjw8L1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPj4KZW5kb2JqCgozIDAgb2JqCjw8L1R5cGUgL1BhZ2wJL01lZGlhQm94IFswIDAgNTk1LjI4IDg0MS44OV0KL1Jlc291cmNlcyA8PC9Qcm9jU2V0IFsvUERGXS4+PgovQ29udGVudHMgNCAwIFIKPj4KZW5kb2JqCgo0IDAgb2JqCjw8L0xlbmd0aCA0ND4+CnN0cmVhbQpxCjEwMCAxMDAgTDc1IDIwMCByZQpTClFZW5kc3RyZWFtCmVuZG9iagoKeHJlZgowIDUKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDEwIDAwMDAwIG4gCjAwMDAwMDAwNjAgMDAwMDAgbiAKMDAwMDAwMDExNyAwMDAwMCBuIAowMDAwMDAwMjI0IDAwMDAwIG4gCnRyYWlsZXIKPDwvU2l6ZSA1Ci9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZgoyNzUKJSVFT0YK";

                        const newAttachments = [...currentAttachments, {
                            id: uuidv4(),
                            name: 'TextBook.pdf',
                            type: 'application/pdf',
                            data: MOCK_PDF
                        }];

                        // Patch DB
                        await doc.patch({
                            data: { ...currentData, attachments: newAttachments }
                        });

                        // Update Memory
                        docData = {
                            ...docData,
                            data: { ...currentData, attachments: newAttachments }
                        };
                    }
                }
                // -------------------------------------------------------

                setContent(docData);

                // If it's a MODULE or LESSON, we need to load its children
                if (docData.type === 'module' || docData.type === 'lesson') {
                    db.content.find().exec().then((allDocs: any[]) => {
                        const children = allDocs
                            .map((d: any) => d.toJSON())
                            .filter((d: any) => d.moduleId === levelId)
                            .sort((a: any, b: any) => (a.createdAt || 0) - (b.createdAt || 0));
                        setModuleChildren(children);
                    });
                }
            } else {
                console.error("Level not found");
                navigate('/dashboard');
            }
            setLoading(false);
        });
    }, [db, levelId, navigate]);

    const handleComplete = async (result: QuizResult) => {
        if (!db || !currentUser || !levelId) return;

        setGameResult(result);

        const existingProgress = await db.progress.find({
            selector: {
                userId: currentUser.id,
                levelId: levelId
            }
        }).exec();

        const progressDoc = existingProgress[0];

        if (progressDoc) {
            if (result.score > progressDoc.get('score')) {
                await progressDoc.patch({
                    score: result.score,
                    stars: Math.max(result.stars, progressDoc.get('stars')),
                    timestamp: Date.now()
                });
            }
        } else {
            await db.progress.insert({
                id: uuidv4(),
                userId: currentUser.id,
                levelId: levelId,
                score: result.score,
                stars: result.stars,
                timestamp: Date.now()
            });
        }
    };

    if (loading) return <div className="text-white p-6">Loading Level...</div>;
    if (!content) return null;

    if (gameResult) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 space-y-8 text-center">
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold text-white">
                        {gameResult.passed ? "Level Complete!" : "Try Again"}
                    </h1>
                    <p className="text-slate-400">
                        You scored {gameResult.score}%
                    </p>
                </div>

                <div className="flex gap-4">
                    {[1, 2, 3].map(i => (
                        <Star
                            key={i}
                            className={`w-12 h-12 ${i <= gameResult.stars ? 'text-yellow-400 fill-yellow-400' : 'text-slate-700'}`}
                        />
                    ))}
                </div>

                {gameResult.passed && (
                    <div className="bg-slate-800 p-4 rounded-xl border border-white/10">
                        <span className="text-yellow-400 font-bold text-xl">+{gameResult.coinsEarned} Coins</span>
                    </div>
                )}

                <div className="flex gap-4 w-full max-w-xs">
                    <button
                        onClick={() => window.location.reload()}
                        className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-4 rounded-xl flex items-center justify-center gap-2"
                    >
                        <Repeat className="w-5 h-5" /> Retry
                    </button>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex-1 bg-primary-600 hover:bg-primary-500 text-white py-4 rounded-xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-primary-500/20"
                    >
                        <Home className="w-5 h-5" /> Done
                    </button>
                </div>
            </div>
        );
    }

    if (content.type === 'quiz') {
        return (
            <div className="h-full bg-transparent">
                <QuizRunner
                    questions={(content.data as any).questions}
                    onComplete={handleComplete}
                    onExit={() => navigate('/dashboard')}
                />
            </div>
        );
    }

    if (content.type === 'text') {
        return (
            <div className="h-full bg-transparent">
                <LessonView
                    data={(content.data || content)}
                    onComplete={handleComplete}
                    onExit={() => navigate('/dashboard')}
                />
            </div>
        );
    }



    if (showLegacy) {
        return (
            <div className="h-full bg-transparent">
                <LessonView
                    data={(content.data || content)}
                    onComplete={handleComplete}
                    onExit={() => setShowLegacy(false)}
                />
            </div>
        );
    }

    // Treat 'lesson' OR 'module' as a container
    if (content.type === 'module' || content.type === 'lesson') {
        const hasLegacyContent = content.type === 'lesson' && (
            content.data?.content ||
            content.data?.translations ||
            content.data?.attachments?.some((a: any) => a.name === 'TextBook.pdf') // Check for PDF too!
        );

        return (
            <div className="min-h-screen p-6 bg-slate-950 text-white font-sans animate-fade-in relative">
                {/* Background */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950 -z-10" />

                <header className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate('/learn')}
                        className="p-3 glass-panel rounded-xl text-slate-400 hover:text-white transition-colors"
                    >
                        <Home className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                            {content.title}
                        </h1>
                        <p className="text-sm text-slate-400">{moduleChildren.length + (hasLegacyContent ? 1 : 0)} items</p>
                    </div>
                </header>

                <div className="max-w-2xl mx-auto space-y-4">
                    {/* Legacy Content Card */}
                    {hasLegacyContent && (
                        <button
                            onClick={() => setShowLegacy(true)}
                            className="w-full glass-panel p-6 rounded-2xl flex items-center gap-4 group hover:bg-white/5 transition-all text-left border border-white/5 hover:border-indigo-500/30 mb-4 bg-indigo-500/10"
                        >
                            <div className="w-12 h-12 rounded-xl bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                                <BookOpen className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-lg text-white group-hover:text-indigo-300 transition-colors">
                                    Start Reading
                                </h3>
                                <p className="text-sm text-slate-400">Main Lesson Content / Textbook</p>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="px-3 py-1 bg-indigo-500 rounded-lg text-xs font-bold">OPEN</span>
                            </div>
                        </button>
                    )}

                    {moduleChildren.map((child) => (
                        <button
                            key={child.id}
                            onClick={() => navigate(`/play/${child.id}`)}
                            className="w-full glass-panel p-6 rounded-2xl flex items-center gap-4 group hover:bg-white/5 transition-all text-left border border-white/5 hover:border-indigo-500/30"
                        >
                            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform shadow-lg shadow-indigo-500/10">
                                {child.type === 'quiz' ? '?' : '📄'}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-lg text-white group-hover:text-indigo-300 transition-colors">
                                    {child.title}
                                </h3>
                                <p className="text-sm text-slate-500">{child.type === 'quiz' ? 'Quiz Assessment' : 'Study Material'}</p>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0">
                                <span className="text-indigo-400 font-bold text-sm">Start ›</span>
                            </div>
                        </button>
                    ))}

                    {moduleChildren.length === 0 && (
                        <div className="text-center py-20 text-slate-500">
                            <p>This module is empty.</p>
                            <button onClick={() => navigate('/learn')} className="text-indigo-400 text-sm mt-4 hover:underline">Go Back</button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return <div className="text-white p-6">Unknown Content Type: {content.type}</div>;
}
