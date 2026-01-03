import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Database, Laptop, Globe } from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function Settings() {
    const navigate = useNavigate();
    const { db } = useDatabase();
    const { logout } = useAuth();
    const { t, i18n } = useTranslation();

    const [teacherIP, setTeacherIP] = useState('');

    useEffect(() => {
        const stored = localStorage.getItem('teacherIP');
        if (stored) setTeacherIP(stored);
    }, []);

    const handleSaveIP = () => {
        localStorage.setItem('teacherIP', teacherIP);
        alert("Teacher IP Saved!");
    };

    const handleReset = async () => {
        if (!db) return;
        if (confirm("Are you sure? This will delete ALL progress!")) {
            await db.remove();
            window.location.reload();
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
        localStorage.setItem('appLanguage', lng);
    };

    return (
        <div className="min-h-screen p-6 pb-24 space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/')}
                    className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-white" />
                </button>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                    {t('settings.title')}
                </h1>
            </div>

            {/* Language Selection */}
            <div className="glass-panel p-4 rounded-xl space-y-4">
                <h2 className="text-lg font-bold flex items-center gap-2 text-foreground">
                    <Globe className="w-5 h-5 text-primary" /> {t('settings.language')}
                </h2>
                <div className="grid grid-cols-3 gap-2">
                    {['en', 'hi', 'mr'].map((lang) => (
                        <button
                            key={lang}
                            onClick={() => changeLanguage(lang)}
                            className={`p-2 rounded-lg text-sm font-medium transition-colors border ${i18n.language === lang
                                    ? 'bg-primary/20 border-primary text-primary'
                                    : 'bg-black/20 border-white/10 text-muted-foreground hover:bg-white/5'
                                }`}
                        >
                            {lang === 'en' ? 'English' : lang === 'hi' ? 'हिंदी' : 'मराठी'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Data Management */}
            <div className="glass-panel p-4 rounded-xl space-y-4">
                <h2 className="text-lg font-bold flex items-center gap-2 text-foreground">
                    <Database className="w-5 h-5 text-primary" /> Data Management
                </h2>

                <div className="space-y-2">
                    <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider ml-1">
                        {t('settings.teacher_ip')}
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={teacherIP}
                            onChange={(e) => setTeacherIP(e.target.value)}
                            placeholder="http://192.168.1.50:5984/db"
                            className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm flex-1 focus:outline-none focus:border-primary/50 text-foreground"
                        />
                        <button
                            onClick={handleSaveIP}
                            className="bg-primary hover:bg-primary/80 text-primary-foreground px-4 rounded-lg text-sm font-medium transition-colors"
                        >
                            {t('settings.save')}
                        </button>
                    </div>
                </div>

                <hr className="border-white/5" />

                <button
                    onClick={handleReset}
                    className="w-full p-3 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                    <RefreshCw className="w-4 h-4" /> {t('settings.reset_data')}
                </button>
            </div>

            {/* Logout Button */}
            <button
                onClick={handleLogout}
                className="w-full p-3 rounded-xl bg-white/5 text-muted-foreground border border-white/5 hover:bg-white/10 transition-colors font-medium"
            >
                {t('dashboard.logout_btn')}
            </button>

            {/* Version Info */}
            <div className="text-center space-y-2">
                <p className="text-xs text-muted-foreground">AlgoSensei v1.2 (Offline)</p>
                <button
                    onClick={() => navigate('/teacher')}
                    className="text-xs text-primary/50 hover:text-primary transition-colors flex items-center justify-center gap-1 mx-auto"
                >
                    <Laptop className="w-3 h-3" /> {t('teacher.portal')}
                </button>
            </div>
        </div>
    );
}
