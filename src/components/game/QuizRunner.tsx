import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, ArrowRight, SkipForward, Send } from 'lucide-react';
import { calculateResult } from '../../lib/gameLogic';
import type { QuizResult } from '../../lib/gameLogic';

export interface Question {
    id: string;
    text: string;
    options: string[];
    correctAnswer: number; // Changed from string to number (index)
}

interface QuizRunnerProps {
    questions: Question[];
    onComplete: (result: QuizResult) => void;
    onExit: () => void;
}

export default function QuizRunner({ questions, onComplete, onExit }: QuizRunnerProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
    const [isAnswerChecked, setIsAnswerChecked] = useState(false);
    const [correctCount, setCorrectCount] = useState(0);

    const currentQuestion = questions[currentIndex];

    // Ensure correctAnswer is treated as a number appropriately
    // Legacy data check: if correctAnswer is a string, we might need to handle it, 
    // but typically the editor saves it as a number. 
    // If it WAS saving strings previously, this change assumes new data or data consistent with editor.
    // The previous editor code showed it saving indices.

    const handleOptionSelect = (index: number) => {
        if (isAnswerChecked) return;
        setSelectedOptionIndex(index);
    };

    const submitAnswer = () => {
        if (selectedOptionIndex === null) return;

        // Loose comparison (==) handles if one is string '0' and other is number 0, 
        // preventing issues if DB saved as string representation of number.
        const isCorrect = Number(selectedOptionIndex) === Number(currentQuestion.correctAnswer);

        if (isCorrect) setCorrectCount(prev => prev + 1);

        setIsAnswerChecked(true);
    };

    const skipQuestion = () => {
        // Skipping counts as incorrect (or just 0 points)
        // We just verify it to show the right answer, or simply move next?
        // User asked for "Skip", usually implies moving to next immediately or just showing answer then next.
        // Let's mark as skipped (checked but wrong) so they see the answer, then they can click Next.
        // OR: Just jump to next. Let's Jump to Next to be faster. 
        // ACTUALLY: Let's show the answer quickly then move? 
        // Let's implement "Skip" as: Mark incorrect, show answer, let user click next.
        // This prevents accidental skips.

        setIsAnswerChecked(true); // No option selected = wrong
    };

    const nextQuestion = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setSelectedOptionIndex(null);
            setIsAnswerChecked(false);
        } else {
            finishQuiz();
        }
    };

    const finishQuiz = () => {
        const result = calculateResult(
            correctCount,
            questions.length
        );
        onComplete(result);
    };

    return (
        <div className="flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden">

            {/* 1. Fixed Header */}
            <header className="h-16 px-4 flex items-center justify-between border-b border-white/10 bg-slate-950/80 backdrop-blur-md z-10 shrink-0">
                <button onClick={onExit} className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                    Exit
                </button>
                <div className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-primary-400 border border-white/5">
                    Question {currentIndex + 1} / {questions.length}
                </div>
            </header>

            {/* 2. Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto p-6 pb-32 scrollbar-hide">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -20, opacity: 0 }}
                        className="max-w-2xl mx-auto space-y-8"
                    >
                        <h2 className="text-2xl md:text-3xl font-bold text-white leading-relaxed">
                            {currentQuestion.text}
                        </h2>

                        <div className="space-y-3">
                            {currentQuestion.options.map((option, index) => {
                                let optionStyle = "border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-800"; // Default

                                if (selectedOptionIndex === index) {
                                    optionStyle = "border-primary-500 bg-primary-500/20 text-white ring-2 ring-primary-500/50"; // Selected
                                }

                                if (isAnswerChecked) {
                                    // Use loose comparison for correctAnswer in case of type mismatch
                                    const isThisCorrect = Number(currentQuestion.correctAnswer) === index;
                                    const isThisSelected = selectedOptionIndex === index;

                                    if (isThisCorrect) {
                                        optionStyle = "border-green-500 bg-green-500/20 text-white"; // Correct
                                    } else if (isThisSelected && !isThisCorrect) {
                                        optionStyle = "border-red-500 bg-red-500/20 text-white opacity-50"; // Wrong
                                    } else {
                                        optionStyle = "border-slate-800 bg-slate-900/50 text-slate-600 opacity-50"; // Unselected
                                    }
                                }

                                return (
                                    <button
                                        key={index}
                                        onClick={() => handleOptionSelect(index)}
                                        disabled={isAnswerChecked}
                                        className={`w-full p-4 rounded-xl border-2 text-left font-medium transition-all transform active:scale-[0.98] relative z-20 ${optionStyle}`}
                                    >
                                        <div className="flex items-center justify-between pointer-events-none">
                                            <span>{option}</span>
                                            {isAnswerChecked && Number(currentQuestion.correctAnswer) === index && <CheckCircle className="text-green-500 w-5 h-5" />}
                                            {isAnswerChecked && selectedOptionIndex === index && Number(currentQuestion.correctAnswer) !== index && <XCircle className="text-red-500 w-5 h-5" />}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* 3. Fixed Footer Controls */}
            <div className="h-24 px-4 border-t border-white/10 bg-slate-950/80 backdrop-blur-md z-30 shrink-0 flex items-center justify-center pb-4">
                <div className="w-full max-w-2xl flex gap-3">
                    {!isAnswerChecked ? (
                        <>
                            <button
                                onClick={skipQuestion}
                                className="px-6 py-4 rounded-xl font-bold text-slate-400 hover:bg-white/5 hover:text-white transition-colors z-30"
                            >
                                <SkipForward className="w-6 h-6" />
                            </button>
                            <button
                                onClick={submitAnswer}
                                disabled={selectedOptionIndex === null}
                                className={`flex-1 font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 z-30 ${selectedOptionIndex !== null ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
                            >
                                Submit Answer <Send className="w-4 h-4" />
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={nextQuestion}
                            className={`w-full font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 z-30 ${Number(currentQuestion.correctAnswer) === selectedOptionIndex
                                ? 'bg-green-600 hover:bg-green-500 shadow-green-500/20 text-white'
                                : 'bg-white/10 hover:bg-white/20 text-white'
                                }`}
                        >
                            {currentIndex === questions.length - 1 ? "Finish Quiz" : "Next Question"} <ArrowRight className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
