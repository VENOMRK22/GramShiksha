import { useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import { motion } from 'framer-motion';

interface BentoCardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    glowColor?: string;
    span?: number;
    title?: string;
    subtitle?: string;
    icon?: React.ReactNode;
}

export default function BentoCard({
    children,
    className = "",
    onClick,
    glowColor = "rgba(14, 165, 233, 0.15)", // Default cyan glow
    span = 1,
    title,
    subtitle,
    icon
}: BentoCardProps) {
    const divRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [opacity, setOpacity] = useState(0);

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        if (!divRef.current) return;

        const rect = divRef.current.getBoundingClientRect();
        setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    const handleMouseEnter = () => setOpacity(1);
    const handleMouseLeave = () => setOpacity(0);

    return (
        <motion.div
            ref={divRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 0.995 }}
            transition={{ duration: 0.3 }}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
            className={`
                relative overflow-hidden rounded-3xl bg-white/[0.03] border border-white/10 
                backdrop-blur-xl p-6 ${className} ${onClick ? 'cursor-pointer' : ''}
            `}
            style={{
                gridColumn: span > 1 ? `span ${span} / span ${span}` : undefined
            }}
        >
            {/* Spotlight Gradient Effect */}
            <div
                className="pointer-events-none absolute -inset-px opacity-0 transition duration-300"
                style={{
                    opacity,
                    background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${glowColor}, transparent 40%)`
                }}
            />

            {/* Content Container */}
            <div className="relative z-10 h-full flex flex-col">
                {(title || icon) && (
                    <div className="flex items-start justify-between mb-4">
                        <div className="space-y-1">
                            {icon && <div className="mb-3 text-primary-400">{icon}</div>}
                            {title && <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>}
                            {subtitle && <p className="text-sm text-slate-400 font-medium">{subtitle}</p>}
                        </div>
                    </div>
                )}
                <div className="flex-1">
                    {children}
                </div>
            </div>

            {/* Border Gradient Overlay */}
            <div
                className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/10 group-hover:ring-white/20 transition-all"
            />
        </motion.div>
    );
}
