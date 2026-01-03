import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDatabase } from '../../context/DatabaseContext';
import { useAuth } from '../../context/AuthContext';
import { v4 as uuidv4 } from 'uuid';
import { ArrowLeft, Save, Plus, Trash2, FileText, Globe, Upload, File as FileIcon, X, Folder, HelpCircle, Layout } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

interface Question {
    id: string;
    text: string;
    options: string[];
    correctAnswer: number; // Index
}

interface Attachment {
    id: string;
    name: string;
    type: string;
    data: string; // Base64
}

const LANGUAGES = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'Hindi' },
    { code: 'mr', label: 'Marathi' }
];

export default function ContentEditor() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { db } = useDatabase();
    const { currentUser } = useAuth();

    // Context from URL
    const paramType = searchParams.get('type') || 'text';
    const contextType = paramType === 'lesson' ? 'text' : paramType; // Normalize lesson->text
    const contextSubjectId = searchParams.get('subjectId');
    const contextModuleId = searchParams.get('moduleId');

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isHomework, setIsHomework] = useState(false);

    // Content State
    const [activeLang, setActiveLang] = useState('en');
    const [translations, setTranslations] = useState<Record<string, string>>({
        en: '', hi: '', mr: ''
    });

    // Quiz State
    const [questions, setQuestions] = useState<Question[]>([]);

    // Attachments State
    const [attachments, setAttachments] = useState<Attachment[]>([]);

    const handleTextChange = (value: string) => {
        setTranslations(prev => ({ ...prev, [activeLang]: value }));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 5 * 1024 * 1024) {
                alert("File too large. Max 5MB.");
                return;
            }

            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result as string;
                setAttachments(prev => [...prev, {
                    id: uuidv4(),
                    name: file.name,
                    type: file.type,
                    data: base64
                }]);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeAttachment = (id: string) => {
        setAttachments(prev => prev.filter(a => a.id !== id));
    };

    // Quiz Functions
    const addQuestion = () => {
        setQuestions([...questions, {
            id: uuidv4(),
            text: '',
            options: ['', '', '', ''],
            correctAnswer: 0
        }]);
    };

    const updateQuestion = (index: number, field: keyof Question, value: any) => {
        const newQuestions = [...questions];
        newQuestions[index] = { ...newQuestions[index], [field]: value };
        setQuestions(newQuestions);
    };

    const updateOption = (qIndex: number, oIndex: number, value: string) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options[oIndex] = value;
        setQuestions(newQuestions);
    };

    const removeQuestion = (index: number) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        if (!title) return alert("Title is required");
        if (!db || !currentUser) return;

        try {
            const contentId = uuidv4();
            await db.content.insert({
                id: contentId,
                type: contextType, // 'text' | 'quiz' | 'module'
                title,
                description,
                classId: currentUser.classId || 'default',
                subjectId: contextSubjectId || undefined,
                moduleId: contextModuleId || undefined,
                teacherId: currentUser.id,
                isHomework,
                data: {
                    content: translations['en'], // Legacy Fallback
                    translations,
                    attachments,
                    questions: contextType === 'quiz' ? questions : undefined
                },
                createdAt: Date.now(),
                updatedAt: Date.now()
            });

            // Redirect back
            if (contextModuleId) {
                navigate(`/teacher/module/${contextModuleId}`);
            } else if (contextSubjectId) {
                navigate(`/teacher/subject/${contextSubjectId}`);
            } else {
                navigate('/teacher');
            }

        } catch (error) {
            console.error("Save failed", error);
            alert("Failed to save content");
        }
    };

    const handleBack = () => {
        if (contextModuleId) {
            navigate(`/teacher/module/${contextModuleId}`);
        } else if (contextSubjectId) {
            navigate(`/teacher/subject/${contextSubjectId}`);
        } else {
            navigate('/teacher');
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 p-6 pb-24 text-slate-100">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={handleBack} className="p-2 hover:bg-white/10 rounded-full">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-xl font-bold capitalize">
                        Create {contextType === 'module' ? 'Module' : contextType === 'quiz' ? 'Quiz' : 'Note'}
                    </h1>
                </div>
                <button
                    onClick={handleSave}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-bold"
                >
                    <Save className="w-4 h-4" /> Save
                </button>
            </div>

            <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Meta Information (Left Col) */}
                <div className="space-y-6 h-fit">
                    <div className="bg-slate-900/50 p-6 rounded-xl border border-white/10 space-y-4">
                        {/* Visual Icon */}
                        <div className="p-4 bg-white/5 rounded-xl flex items-center gap-3 border border-white/10 mb-4">
                            {contextType === 'module' && <Layout className="w-6 h-6 text-purple-400" />}
                            {contextType === 'text' && <FileText className="w-6 h-6 text-slate-300" />}
                            {contextType === 'quiz' && <HelpCircle className="w-6 h-6 text-green-400" />}
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-bold">Type</p>
                                <p className="font-bold capitalize">{contextType}</p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="w-full bg-slate-800 border border-white/10 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 outline-none"
                                placeholder="e.g. Introduction to Physics"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Description</label>
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                className="w-full bg-slate-800 border border-white/10 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 outline-none h-20"
                                placeholder="Brief summary..."
                            />
                        </div>

                        {contextType !== 'module' && (
                            <div className="flex items-center gap-3 pt-2">
                                <input
                                    type="checkbox"
                                    id="homework"
                                    checked={isHomework}
                                    onChange={e => setIsHomework(e.target.checked)}
                                    className="w-5 h-5 accent-primary rounded"
                                />
                                <label htmlFor="homework" className="text-sm font-medium">Assign as Homework</label>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content Area (Right Col - 2 spans) */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Module Placeholder */}
                    {contextType === 'module' && (
                        <div className="bg-slate-900/50 p-12 rounded-2xl border-dashed border-2 border-white/10 flex flex-col items-center justify-center text-center gap-4 text-slate-500">
                            <Folder className="w-16 h-16 opacity-20" />
                            <p>This is a container structure. You can add items to it after creating it.</p>
                        </div>
                    )}

                    {/* Rich Text Editor */}
                    {contextType === 'text' && (
                        <div className="bg-slate-900/50 p-6 rounded-xl border border-white/10 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold flex items-center gap-2">
                                    <Globe className="w-4 h-4 text-primary-400" /> Content Language
                                </h3>

                                {/* Language Tabs */}
                                <div className="flex bg-slate-800 rounded-lg p-1">
                                    {LANGUAGES.map(lang => (
                                        <button
                                            key={lang.code}
                                            onClick={() => setActiveLang(lang.code)}
                                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${activeLang === lang.code
                                                ? 'bg-primary text-primary-foreground shadow'
                                                : 'text-slate-400 hover:text-white'
                                                }`}
                                        >
                                            {lang.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="prose-editor text-slate-900 bg-white rounded-lg overflow-hidden">
                                <ReactQuill
                                    theme="snow"
                                    value={translations[activeLang]}
                                    onChange={handleTextChange}
                                    modules={{
                                        toolbar: [
                                            [{ 'header': [1, 2, false] }],
                                            ['bold', 'italic', 'underline', 'strike'],
                                            [{ 'color': [] }, { 'background': [] }],
                                            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                            ['clean']
                                        ]
                                    }}
                                    className="min-h-[300px]"
                                />
                            </div>
                            <p className="text-xs text-slate-500 flex items-center gap-2">
                                <Globe className="w-3 h-3" />
                                Editing in <span className="text-primary-400 font-bold">{LANGUAGES.find(l => l.code === activeLang)?.label}</span>.
                                Switch tabs to add translations.
                            </p>

                            {/* Attachments Section */}
                            <div className="pt-6 mt-6 border-t border-white/5">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                                        <FileIcon className="w-4 h-4" /> Attachments (PDF)
                                    </h4>
                                    <label className="cursor-pointer flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-white/10 transition-colors">
                                        <Upload className="w-3 h-3" /> Upload PDF
                                        <input
                                            type="file"
                                            accept="application/pdf"
                                            className="hidden"
                                            onChange={handleFileUpload}
                                        />
                                    </label>
                                </div>

                                <div className="space-y-2">
                                    {attachments.length === 0 && (
                                        <div className="p-4 border border-dashed border-white/10 rounded-lg text-center text-xs text-slate-600">
                                            No attachments uploaded
                                        </div>
                                    )}
                                    {attachments.map(file => (
                                        <div key={file.id} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-white/5 group hover:border-primary/30 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded bg-red-500/20 flex items-center justify-center text-red-500">
                                                    <FileIcon className="w-4 h-4" />
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-sm font-medium truncate max-w-[200px] text-white">{file.name}</p>
                                                    <p className="text-[10px] text-slate-500 uppercase">{file.type.split('/')[1]}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => removeAttachment(file.id)}
                                                className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-all"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Quiz Editor */}
                    {contextType === 'quiz' && (
                        <div className="space-y-4">
                            {questions.map((q, qIndex) => (
                                <div key={q.id} className="bg-slate-900/50 p-6 rounded-xl border border-white/10 relative group">
                                    <button
                                        onClick={() => removeQuestion(qIndex)}
                                        className="absolute top-4 right-4 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>

                                    <div className="mb-4">
                                        <label className="text-sm font-bold text-primary-400 mb-2 block">Question {qIndex + 1}</label>
                                        <input
                                            type="text"
                                            value={q.text}
                                            onChange={e => updateQuestion(qIndex, 'text', e.target.value)}
                                            className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none placeholder-slate-600"
                                            placeholder="Enter question text..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {q.options.map((opt, oIndex) => (
                                            <div key={oIndex} className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    name={`correct-${q.id}`}
                                                    checked={q.correctAnswer === oIndex}
                                                    onChange={() => updateQuestion(qIndex, 'correctAnswer', oIndex)}
                                                    className="w-4 h-4 accent-primary"
                                                />
                                                <input
                                                    type="text"
                                                    value={opt}
                                                    onChange={e => updateOption(qIndex, oIndex, e.target.value)}
                                                    className={`flex-1 bg-slate-800 rounded-lg px-3 py-2 border border-white/5 text-sm outline-none focus:ring-1 ${q.correctAnswer === oIndex ? 'ring-primary-500 border-primary-500/50' : 'focus:ring-white/20'}`}
                                                    placeholder={`Option ${oIndex + 1}`}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            <button
                                onClick={addQuestion}
                                className="w-full py-4 rounded-xl border-2 border-dashed border-white/10 text-slate-400 hover:text-white hover:border-white/20 hover:bg-white/5 transition-all flex items-center justify-center gap-2 font-bold"
                            >
                                <Plus className="w-5 h-5" /> Add Question
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
