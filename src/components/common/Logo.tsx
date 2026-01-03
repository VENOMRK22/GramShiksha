// Unused imports removed
import logoUrl from '../../assets/logo.png';

export function Logo({ className = "w-24 h-24" }: { className?: string }) {
    return (
        <div className={`relative flex items-center justify-center ${className}`}>
            <img
                src={logoUrl}
                alt="GramSiksha Logo"
                className="w-full h-full object-contain mix-blend-screen filter grayscale brightness-200 sepia hue-rotate-[160deg] saturate-[500%] contrast-125 drop-shadow-[0_0_15px_rgba(6,182,212,0.6)]"
            />
        </div>
    );
}
