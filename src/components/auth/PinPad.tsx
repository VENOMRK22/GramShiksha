import { Delete } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface PinPadProps {
    length?: number;
    onSubmit: (pin: string) => void;
    onCancel?: () => void;
    title?: string;
    description?: string;
}

export default function PinPad({ length = 4, onSubmit, onCancel, title = "Enter PIN", description = "Secure your profile" }: PinPadProps) {
    const [pin, setPin] = useState("");

    const handleNum = (num: number) => {
        if (pin.length < length) {
            const newPin = pin + num;
            setPin(newPin);
            if (newPin.length === length) {
                setTimeout(() => onSubmit(newPin), 300);
            }
        }
    };

    const handleDelete = () => {
        setPin(prev => prev.slice(0, -1));
    };

    // Keyboard support
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (/\d/.test(e.key)) {
                handleNum(parseInt(e.key));
            } else if (e.key === 'Backspace') {
                handleDelete();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [pin]);

    return (
        <div className="flex flex-col items-center space-y-8 w-full max-w-sm mx-auto p-6 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-fuchsia-400 text-transparent bg-clip-text drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                    {title}
                </h2>
                <p className="text-slate-400 text-sm font-medium">{description}</p>
            </div>

            {/* Dots Display */}
            <div className="flex gap-4 mb-4">
                {[...Array(length)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={false}
                        animate={{
                            scale: i < pin.length ? 1.3 : 1,
                            backgroundColor: i < pin.length ? '#22d3ee' : 'rgba(255,255,255,0.1)',
                            boxShadow: i < pin.length ? '0 0 15px #22d3ee' : 'none',
                        }}
                        className="w-4 h-4 rounded-full transition-colors duration-200"
                    />
                ))}
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-4 w-full">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button
                        key={num}
                        onClick={() => handleNum(num)}
                        className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 text-2xl font-bold text-white shadow-lg active:scale-95 transition-all outline-none 
                                   hover:bg-cyan-500/20 hover:border-cyan-500/50 hover:text-cyan-400 hover:shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                    >
                        {num}
                    </button>
                ))}

                {/* Bottom Row */}
                <div />
                <button
                    onClick={() => handleNum(0)}
                    className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 text-2xl font-bold text-white shadow-lg active:scale-95 transition-all outline-none 
                               hover:bg-cyan-500/20 hover:border-cyan-500/50 hover:text-cyan-400 hover:shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                >
                    0
                </button>
                <button
                    onClick={handleDelete}
                    className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-red-400 shadow-lg active:scale-95 transition-all outline-none 
                               hover:bg-red-500/20 hover:border-red-500/50 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                >
                    <Delete className="w-6 h-6" />
                </button>
            </div>

            {onCancel && (
                <button onClick={onCancel} className="text-slate-500 text-sm hover:text-white transition-colors uppercase tracking-wider font-semibold">
                    Cancel
                </button>
            )}
        </div>
    );
}
