import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDatabase } from '../context/DatabaseContext';
import { useAuth } from '../context/AuthContext';
import QuizRunner from '../components/game/QuizRunner';
import LessonView from '../components/game/LessonView';
import type { QuizResult } from '../lib/gameLogic';
import { Star, Repeat, Home } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export default function LevelPlayer() {
    const { levelId } = useParams();
    const navigate = useNavigate();
    const { db } = useDatabase();
    const { currentUser } = useAuth();

    const [loading, setLoading] = useState(true);
    const [content, setContent] = useState<any>(null);
    const [gameResult, setGameResult] = useState<QuizResult | null>(null);

    useEffect(() => {
        if (!db || !levelId) return;

        db.content.findOne(levelId).exec().then(doc => {
            if (doc) {
                setContent(doc.toJSON());
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

    if (content.type === 'lesson' || content.type === 'text') {
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

    return <div className="text-white p-6">Unknown Content Type: {content.type}</div>;
}
