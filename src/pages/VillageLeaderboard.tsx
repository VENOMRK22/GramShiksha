import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function VillageLeaderboard() {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <div className="min-h-screen p-6 pb-24 space-y-6 animate-fade-in text-center">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-white" />
                </button>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                    {t('nav.village')}
                </h1>
            </div>

            <div className="py-12 space-y-6">
                <div className="w-32 h-32 mx-auto rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center animate-pulse">
                    <MapPin className="w-12 h-12 text-orange-500" />
                </div>

                <h2 className="text-xl font-bold text-white">Village Stats Coming Soon</h2>
                <p className="text-muted-foreground max-w-xs mx-auto text-sm">
                    Compete with other villages! This feature will aggregate scores from all students in your local area.
                </p>

                <div className="glass-panel p-4 rounded-xl max-w-sm mx-auto opacity-50">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-2">
                        <span className="text-sm font-bold">1. Punawale</span>
                        <span className="text-sm text-yellow-400 font-mono">12,450 XP</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-2">
                        <span className="text-sm font-bold">2. Marunji</span>
                        <span className="text-sm text-yellow-400 font-mono">11,200 XP</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-bold">3. Hinjewadi</span>
                        <span className="text-sm text-yellow-400 font-mono">9,800 XP</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
