import { useState, useEffect } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Award, Zap, Target } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

export default function AchievementsPage() {
    const { db } = useDatabase();
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [stats, setStats] = useState({
        totalStars: 0,
        totalScore: 0,
        lessonsCompleted: 0
    });

    useEffect(() => {
        if (!db || !currentUser) return;

        const load = async () => {
            const userProgress = await db.progress.find({
                selector: { userId: currentUser.id }
            }).exec();

            let stars = 0;
            let score = 0;
            let count = 0;

            userProgress.forEach(doc => {
                stars += doc.get('stars');
                score += doc.get('score');
                count++;
            });

            setStats({
                totalStars: stars,
                totalScore: score,
                lessonsCompleted: count
            });
        };
        load();
    }, [db, currentUser]);

    return (
        <div className="min-h-screen p-6 pb-24 space-y-8 animate-fade-in">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-white" />
                </button>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    {t('nav.achievements')}
                </h1>
            </div>

            {/* Badges Grid */}
            <div className="grid grid-cols-2 gap-4">
                <div className="glass-panel p-6 flex flex-col items-center justify-center gap-2 text-center">
                    <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500 mb-2">
                        <Award className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">{stats.totalStars}</h3>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest">Total Stars</p>
                </div>
                <div className="glass-panel p-6 flex flex-col items-center justify-center gap-2 text-center">
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 mb-2">
                        <Zap className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">{stats.totalScore}</h3>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest">Total XP</p>
                </div>
                <div className="glass-panel p-6 col-span-2 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-500">
                            <Target className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                            <h3 className="text-lg font-bold text-white">Learner</h3>
                            <p className="text-xs text-muted-foreground">{stats.lessonsCompleted} Lessons Completed</p>
                        </div>
                    </div>
                    {/* Placeholder for a Badge Image */}
                </div>
            </div>

            <div className="text-center text-xs text-muted-foreground pt-8">
                More achievements coming soon!
            </div>
        </div>
    );
}
