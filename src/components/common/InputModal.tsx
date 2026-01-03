import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface InputModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (value: string) => void;
    title: string;
    placeholder?: string;
    initialValue?: string;
}

export default function InputModal({ isOpen, onClose, onSubmit, title, placeholder, initialValue = '' }: InputModalProps) {
    const [value, setValue] = useState(initialValue);

    useEffect(() => {
        if (isOpen) setValue(initialValue);
    }, [isOpen, initialValue]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!value.trim()) return;
        onSubmit(value);
        setValue('');
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full max-w-md glass-panel p-6 rounded-2xl shadow-2xl relative"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h2 className="text-xl font-bold text-white mb-6">{title}</h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <input
                                autoFocus
                                type="text"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                placeholder={placeholder}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                            />

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!value.trim()}
                                    className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/20"
                                >
                                    Confirm
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
