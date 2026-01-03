import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, FileText, Download } from 'lucide-react';
import 'react-quill-new/dist/quill.snow.css';

interface LessonViewProps {
    data: {
        // New Schema Fields
        content?: string; // Legacy fallback or single-lang content
        translations?: Record<string, string>;
        attachments?: Array<{ id: string, name: string, type: string, data: string }>;

        // Legacy 'Lesson' Fields (Optional support)
        summary?: string;
        sections?: Array<{ title: string; content: string; image?: string }>;
    };
    onComplete: (score: any) => void;
    onExit: () => void;
}

const LANGUAGES = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'Hindi' },
    { code: 'mr', label: 'Marathi' }
];

export default function LessonView({ data, onComplete, onExit }: LessonViewProps) {
    const [viewMode, setViewMode] = useState<'list' | 'viewer'>('list');
    const [activeResource, setActiveResource] = useState<any>(null); // { type, content, name }
    const [activeLang, setActiveLang] = useState('en');

    // Guard Clause
    if (!data) {
        return <div className="p-10 text-center text-slate-400">Loading lesson content...</div>;
    }

    // Helper to get displayable HTML content
    const getHtmlContent = () => {
        if (data.translations && data.translations[activeLang]) return data.translations[activeLang];
        if (data.translations && data.translations['en']) return data.translations['en'];
        if (data.content) return data.content;
        if (data.sections && data.sections.length > 0) {
            return data.sections.map(s => `<h3>${s.title}</h3><p>${s.content}</p>`).join('<hr/>');
        }
        return null;
    };

    const htmlContent = getHtmlContent();
    const pdfAttachment = data.attachments?.find(a => a.name === 'TextBook.pdf');
    const otherAttachments = data.attachments?.filter(a => a.name !== 'TextBook.pdf') || [];

    // Auto-construct resource list
    // 1. TextBook
    // 2. Notes (HTML Content)
    // 3. Other Attachments

    const openResource = (type: string, content: any, name: string) => {
        setActiveResource({ type, content, name });
        setViewMode('viewer');
    };

    if (viewMode === 'list') {
        return (
            <div className="flex flex-col h-full bg-slate-950 text-slate-100 aurora-bg">
                <header className="h-16 px-4 flex items-center justify-between border-b border-white/10 bg-slate-950/60 backdrop-blur-xl z-10 shrink-0 sticky top-0">
                    <button onClick={onExit} className="text-sm font-bold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors">
                        ← Back
                    </button>
                    <h2 className="font-bold text-white">Lesson Resources</h2>
                    <div className="w-10"></div>
                </header>

                <div className="flex-1 overflow-y-auto p-6 md:p-8 pb-32 scrollbar-hide">
                    <div className="max-w-2xl mx-auto space-y-4">

                        {/* 1. TextBook (Priority) */}
                        {pdfAttachment ? (
                            <motion.button
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                onClick={() => openResource('pdf', pdfAttachment.data, pdfAttachment.name)}
                                className="w-full text-left p-6 rounded-3xl bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 hover:border-red-500/50 hover:bg-red-500/20 transition-all group flex items-start gap-4"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-red-500/20 flex items-center justify-center shrink-0 border border-red-500/30 group-hover:scale-110 transition-transform">
                                    <div className="text-xl font-bold text-red-400">PDF</div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-red-400 transition-colors">TextBook</h3>
                                    <p className="text-sm text-slate-400 font-medium">Official Digital Textbook PDF</p>
                                </div>
                            </motion.button>
                        ) : (
                            // Fallback if no textbook found (debugging/legacy)
                            <div className="p-4 border border-dashed border-white/10 rounded-2xl text-center text-slate-500 text-sm">No Textbook Linked</div>
                        )}

                        {/* 2. Lesson Notes / Summary */}
                        {htmlContent && (
                            <motion.button
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                onClick={() => openResource('html', htmlContent, 'Lesson Notes')}
                                className="w-full text-left p-6 rounded-3xl glass-panel border-white/5 hover:border-cyan-500/50 hover:bg-white/5 transition-all group flex items-start gap-4"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 flex items-center justify-center shrink-0 border border-cyan-500/30 group-hover:scale-110 transition-transform">
                                    <FileText className="w-8 h-8 text-cyan-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">Lesson Notes</h3>
                                    <p className="text-sm text-slate-400 font-medium">Key concepts and summary</p>
                                </div>
                            </motion.button>
                        )}

                        {/* 3. Other Attachments */}
                        {otherAttachments.map((file, i) => (
                            <motion.button
                                key={file.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + (i * 0.05) }}
                                onClick={() => openResource(
                                    (file.type.includes('pdf') || file.name.endsWith('.pdf')) ? 'pdf' : 'unknown',
                                    file.data,
                                    file.name
                                )}
                                className="w-full text-left p-6 rounded-3xl glass-panel border-white/5 hover:border-purple-500/50 hover:bg-white/5 transition-all group flex items-start gap-4"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center shrink-0 border border-purple-500/30 group-hover:scale-110 transition-transform">
                                    <Download className="w-8 h-8 text-purple-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-purple-400 transition-colors">{file.name}</h3>
                                    <p className="text-sm text-slate-400 font-medium uppercase">{file.type.split('/')[1] || 'FILE'}</p>
                                </div>
                            </motion.button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // --- VIEWER MODE ---
    return (
        <div className="flex flex-col h-full bg-slate-950 text-slate-100 aurora-bg">
            <header className="h-16 px-4 flex items-center justify-between border-b border-white/10 bg-slate-950/60 backdrop-blur-xl z-20 shrink-0 sticky top-0">
                <button onClick={() => setViewMode('list')} className="text-sm font-bold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2">
                    Start Back
                </button>
                <h2 className="font-bold text-white line-clamp-1 max-w-[50%]">{activeResource?.name}</h2>
                <div className="flex gap-1 bg-black/20 rounded-xl p-1 border border-white/5">
                    {/* Only show language switcher if active resource is HTML (Notes) */}
                    {activeResource?.type === 'html' && LANGUAGES.map(lang => (
                        <button
                            key={lang.code}
                            onClick={() => setActiveLang(lang.code)}
                            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${activeLang === lang.code
                                ? 'bg-cyan-500/20 text-cyan-400 shadow-sm border border-cyan-500/30'
                                : 'text-slate-500 hover:text-slate-300'
                                }`}
                        >
                            {lang.label}
                        </button>
                    ))}
                </div>
            </header>

            <div className="flex-1 overflow-y-auto w-full h-full relative">
                {activeResource?.type === 'pdf' ? (
                    <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center p-4">
                        {/* Use object tag for PDF */}
                        <object
                            data={activeResource.content}
                            type="application/pdf"
                            className="w-full h-full rounded-xl shadow-2xl border border-white/10"
                        >
                            <div className="text-center text-slate-500 space-y-4">
                                <p>Preview not available.</p>
                                <a
                                    href={activeResource.content}
                                    download={activeResource.name}
                                    className="px-6 py-3 bg-blue-600 rounded-xl text-white font-bold inline-block"
                                >
                                    Download PDF
                                </a>
                            </div>
                        </object>
                    </div>
                ) : activeResource?.type === 'html' ? (
                    <div className="p-4 md:p-8 max-w-3xl mx-auto pb-32">
                        <div
                            className="prose prose-invert prose-lg max-w-none 
                            prose-headings:text-transparent prose-headings:bg-clip-text prose-headings:bg-gradient-to-r prose-headings:from-cyan-400 prose-headings:to-blue-400
                            prose-p:text-slate-300 prose-strong:text-white prose-li:text-slate-300
                            glass-panel p-6 md:p-10 rounded-3xl"
                            dangerouslySetInnerHTML={{ __html: getHtmlContent() || "" }}
                        />
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-4">
                        <p>File type not supported for preview.</p>
                        <a href={activeResource.content} download={activeResource.name} className="px-6 py-3 bg-white/10 rounded-xl hover:bg-white/20 text-white transition-colors">
                            Download File
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
