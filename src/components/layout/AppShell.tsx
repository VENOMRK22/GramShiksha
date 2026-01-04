import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Home, RefreshCw, Settings } from 'lucide-react'
import { clsx } from 'clsx'
import SyncIndicator from './SyncIndicator'
import { useTranslation } from 'react-i18next'; // Added

export default function AppShell() {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation(); // Added

    const navItems = [
        { icon: Home, label: t('nav.home'), path: '/dashboard' },
        { icon: RefreshCw, label: t('nav.sync'), path: '/sync' },
        { icon: Settings, label: t('nav.settings'), path: '/settings' },
    ];

    const isLanding = location.pathname === '/';
    const isPlayMode = location.pathname.includes('/play/');

    return (
        <div className="min-h-screen bg-transparent text-foreground font-sans selection:bg-primary/30 flex justify-center aurora-bg">
            {/* Mobile Container Emulator */}
            <div className={`w-full max-w-md h-screen relative shadow-2xl bg-black/50 glass-panel flex flex-col border-x border-white/5 overflow-hidden ${isPlayMode ? 'border-none bg-black/80' : ''}`}>

                {/* Header Removed as per user request */}

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto no-scrollbar">
                    <Outlet />
                </main>

                <SyncIndicator />

                {/* Bottom Navigation (Hidden on Landing and Play) */}
                {!isLanding && !location.pathname.includes('/play/') && (
                    <nav className="h-16 bg-slate-900/90 backdrop-blur-lg border-t border-white/5 grid grid-cols-3 shrink-0 z-40">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path; // Simple check
                            const Icon = item.icon;

                            return (
                                <button
                                    key={item.label}
                                    onClick={() => navigate(item.path)}
                                    className={clsx(
                                        "flex flex-col items-center justify-center gap-1 transition-all active:scale-95",
                                        isActive ? "text-primary-400" : "text-slate-500 hover:text-slate-300"
                                    )}
                                >
                                    <Icon className={clsx("w-6 h-6", isActive && "fill-current/20")} />
                                    <span className="text-[10px] font-medium">{item.label}</span>
                                </button>
                            )
                        })}
                    </nav>
                )}
            </div>
        </div>
    )
}
