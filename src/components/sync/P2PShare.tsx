import { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';
import { useAuth } from '../../context/AuthContext';
import { useDatabase } from '../../context/DatabaseContext';
import { generateSyncPayload, generateContentPayload } from '../../lib/sync';
import { Copy, Check, User, FileText, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function P2PShare() {
    const { currentUser } = useAuth();
    const { db } = useDatabase();

    const [shareType, setShareType] = useState<'profile' | 'content' | null>(null);
    const [contentList, setContentList] = useState<any[]>([]);
    const [selectedContentId, setSelectedContentId] = useState<string | null>(null);

    const [qrValue, setQrValue] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    // 1. Initial Profile Payload (Default or on demand)
    const generateProfileQR = async () => {
        if (!currentUser || !db) return;
        setLoading(true);
        try {
            const payload = await generateSyncPayload(db, currentUser.id);
            setQrValue(payload);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // 2. Fetch Content List
    useEffect(() => {
        if (!db || shareType !== 'content') return;

        const loadContent = async () => {
            // Find Quizzes and Custom Lessons created by teachers/users or all?
            // User requested "Educational data which is not sync".
            // Let's show everything but prioritize Quizzes/Modules.
            const docs = await db.content.find({
                selector: {
                    type: { $in: ['quiz', 'lesson'] }
                },
                limit: 50
            }).exec();

            setContentList(docs.map(d => d.toJSON()));
        };
        loadContent();
    }, [db, shareType]);

    // 3. Generate Content QR
    const generateContentQR = async (id: string) => {
        if (!db || !currentUser) return;
        setLoading(true);
        setSelectedContentId(id);
        try {
            const payload = await generateContentPayload(db, currentUser.id, [id]);
            setQrValue(payload);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        if (qrValue) {
            navigator.clipboard.writeText(qrValue);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    // --- RENDER: MODE SELECTION ---
    if (!shareType) {
        return (
            <div className="space-y-4">
                <h3 className="text-white font-bold mb-4">What do you want to share?</h3>
                <button
                    onClick={() => { setShareType('profile'); generateProfileQR(); }}
                    className="w-full text-left p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-cyan-500/20 hover:border-cyan-500/50 transition-all flex items-center gap-4 group"
                >
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:bg-cyan-500/30 group-hover:text-cyan-200">
                        <User className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-bold text-white">My Progress</h4>
                        <p className="text-xs text-slate-400">Sync scores and stars to another device.</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-500 ml-auto group-hover:text-cyan-400" />
                </button>

                <button
                    onClick={() => setShareType('content')}
                    className="w-full text-left p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-all flex items-center gap-4 group"
                >
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 group-hover:bg-emerald-500/30 group-hover:text-emerald-200">
                        <FileText className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-bold text-white">Educational Content</h4>
                        <p className="text-xs text-slate-400">Share a specific Quiz or Lesson.</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-500 ml-auto group-hover:text-emerald-400" />
                </button>
            </div>
        );
    }

    // --- RENDER: CONTENT SELECTION ---
    if (shareType === 'content' && !selectedContentId) {
        return (
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                <div className="flex items-center justify-between mb-2">
                    <button onClick={() => setShareType(null)} className="text-xs text-slate-400 hover:text-white">← Back</button>
                    <span className="text-xs font-bold text-emerald-400">Select Item</span>
                </div>
                {contentList.map(item => (
                    <button
                        key={item.id}
                        onClick={() => generateContentQR(item.id)}
                        className="w-full text-left p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-emerald-500/20 transition-all"
                    >
                        <p className="font-bold text-white text-sm line-clamp-1">{item.title}</p>
                        <p className="text-xs text-slate-500 uppercase">{item.type} • {item.medium}</p>
                    </button>
                ))}
            </div>
        )
    }

    // --- RENDER: QR DISPLAY ---
    return (
        <div className="flex flex-col items-center space-y-6 pt-2">
            <div className="w-full flex justify-between items-center px-2">
                <button onClick={() => { setShareType(null); setSelectedContentId(null); }} className="text-xs text-slate-400 hover:text-white">← Change</button>
                <span className="text-sm font-bold text-white">{shareType === 'profile' ? 'My Progress' : 'Shared Content'}</span>
                <div className="w-8"></div>
            </div>

            {loading ? (
                <div className="h-64 flex items-center justify-center text-slate-400 animate-pulse">Generating...</div>
            ) : (
                <div className="bg-white p-4 rounded-xl shadow-2xl relative group">
                    <QRCode
                        value={qrValue}
                        size={256}
                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                        viewBox={`0 0 256 256`}
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-white/90 transition-opacity">
                        <span className="text-black font-bold text-sm">Scan to Sync</span>
                    </div>
                </div>
            )}

            <p className="text-slate-400 text-xs text-center max-w-xs">
                {shareType === 'profile'
                    ? "Contains your user ID and level progress."
                    : "Contains the selected Quiz/Lesson data."}
            </p>

            <button
                onClick={handleCopy}
                className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-xs border border-white/10 px-3 py-1.5 rounded-full"
            >
                {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copied" : "Copy Payload String"}
            </button>
        </div>
    );
}
