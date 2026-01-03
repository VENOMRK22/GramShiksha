import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDatabase } from '../context/DatabaseContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronRight, GraduationCap, School } from 'lucide-react';
import PinPad from '../components/auth/PinPad';

// Shared Components
const Input = ({ label, value, onChange, type = "text", placeholder, required = true }: any) => (
    <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</label>
        <input
            type={type}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            required={required}
            className="w-full bg-[#333] border-none rounded text-white p-3 focus:ring-2 focus:ring-red-600 focus:outline-none placeholder:text-slate-500 transition-all font-medium"
        />
    </div>
);

export default function CreateProfile() {
    const navigate = useNavigate();
    const { signup } = useAuth();
    const { db } = useDatabase();

    // State Machine
    const [step, setStep] = useState<'role' | 'student-form' | 'student-join-class' | 'student-password' | 'teacher-form' | 'teacher-password'>('role');
    const [loading, setLoading] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        role: 'student' as 'student' | 'teacher',
        name: '',
        // Student Fields
        classId: '', // storing Class Name/ID here for now
        birthdate: '',
        rollNo: '',
        medium: 'english' as 'english' | 'marathi',
        // Teacher Fields
        schoolName: '',
        villageName: '',
        state: '',
        country: 'India',
        ipAddress: '',
        password: '' // mapped to pin
    });

    const updateField = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleRoleSelect = (role: 'student' | 'teacher') => {
        setFormData(prev => ({ ...prev, role }));
        setStep(role === 'student' ? 'student-form' : 'teacher-form');
    };

    const [joinCode, setJoinCode] = useState('');

    const handleStudentDetailsSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStep('student-join-class');
    };

    const handleJoinClass = async () => {
        if (!db || !joinCode || joinCode.length < 6) return;
        setLoading(true);

        try {
            const allClasses = await db.classes.find().exec();
            const targetClass = allClasses.find((c: any) => c.get('code') === joinCode);

            if (targetClass) {
                // Found! Link student to this class as "teacherClassId"
                // But also align the standard/medium to match the class.
                setFormData(prev => ({
                    ...prev,
                    teacherClassId: targetClass.get('id'), // UUID
                    classId: targetClass.get('standard').replace(/\D/g, ''), // "10" (System Standard)
                    medium: targetClass.get('medium')
                }));
                // Note: We use classId="10" for System Content, teacherClassId=UUID for Teacher Content.
                setStep('student-password');
            } else {
                alert("Invalid Class Code. Please try again.");
            }
        } catch (err) {
            console.error(err);
            alert("Error joining class");
        } finally {
            setLoading(false);
        }
    };

    const handleTeacherDetailsSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStep('teacher-password');
    };

    // removed unused handleTeacherFinalSubmit

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
            {/* Background Texture (Subtle) */}
            <div className="absolute inset-0 bg-[url('https://assets.nflxext.com/ffe/siteui/vlv3/ab180a27-b661-44cd-9579-9fb69939e338/f2e6e187-5f78-4389-9d7a-75a7b2123f95/IN-en-20231009-popsignuptwoweeks-perspective_alpha_website_medium.jpg')] opacity-10 bg-cover bg-center pointer-events-none" />
            <div className="absolute inset-0 bg-black/80 pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 w-full max-w-[450px] bg-black/75 backdrop-blur-md rounded-xl p-12 py-16 border border-white/10 shadow-2xl"
            >
                {step !== 'role' && (
                    <button onClick={() => setStep('role')} className="absolute top-6 left-6 text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                )}

                {(step !== 'teacher-password' && step !== 'student-password') && (
                    <h1 className="text-3xl font-bold text-white mb-8 text-center tracking-tight">
                        {step === 'role' && "Who's Learning?"}
                        {step === 'student-form' && "Student Profile"}
                        {step === 'teacher-form' && "Teacher Profile"}
                    </h1>
                )}

                <AnimatePresence mode="wait">
                    {step === 'role' && (
                        <motion.div
                            key="role"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="grid gap-4"
                        >
                            <button
                                onClick={() => handleRoleSelect('student')}
                                className="group flex items-center gap-6 p-6 bg-[#333] hover:bg-[#444] rounded-lg transition-all border border-transparent hover:border-white/20"
                            >
                                <div className="p-3 bg-blue-600/20 rounded-lg group-hover:scale-110 transition-transform">
                                    <GraduationCap className="w-8 h-8 text-blue-400" />
                                </div>
                                <div className="text-left">
                                    <h3 className="text-xl font-bold text-white">Student</h3>
                                    <p className="text-sm text-slate-400">Join your class to learn</p>
                                </div>
                                <ChevronRight className="w-6 h-6 text-slate-500 ml-auto group-hover:translate-x-1 transition-transform" />
                            </button>

                            <button
                                onClick={() => handleRoleSelect('teacher')}
                                className="group flex items-center gap-6 p-6 bg-[#333] hover:bg-[#444] rounded-lg transition-all border border-transparent hover:border-white/20"
                            >
                                <div className="p-3 bg-red-600/20 rounded-lg group-hover:scale-110 transition-transform">
                                    <School className="w-8 h-8 text-red-500" />
                                </div>
                                <div className="text-left">
                                    <h3 className="text-xl font-bold text-white">Teacher</h3>
                                    <p className="text-sm text-slate-400">Manage school & content</p>
                                </div>
                                <ChevronRight className="w-6 h-6 text-slate-500 ml-auto group-hover:translate-x-1 transition-transform" />
                            </button>
                        </motion.div>
                    )}

                    {step === 'student-form' && (
                        <motion.form
                            key="student-form"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            onSubmit={handleStudentDetailsSubmit}
                            className="space-y-5"
                        >
                            <Input label="Full Name" value={formData.name} onChange={(v: string) => updateField('name', v)} placeholder="e.g. Rahul Kumar" />

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Standard / Class</label>
                                <div className="grid grid-cols-5 gap-2">
                                    {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'].map((std) => {
                                        const label = std + (std === '1' ? 'st' : std === '2' ? 'nd' : std === '3' ? 'rd' : 'th');
                                        return (
                                            <button
                                                key={std}
                                                type="button"
                                                onClick={() => updateField('classId', std)}
                                                className={`p-2 rounded text-xs font-bold transition-all border ${formData.classId === std
                                                    ? 'bg-blue-600/20 text-blue-400 border-blue-600'
                                                    : 'bg-[#333] text-gray-400 border-transparent hover:bg-[#444]'}`}
                                            >
                                                {label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Medium of Education</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {['english', 'marathi'].map((lang) => (
                                        <button
                                            key={lang}
                                            type="button"
                                            onClick={() => updateField('medium', lang)}
                                            className={`p-3 rounded text-sm font-bold capitalize transition-all border ${formData.medium === lang
                                                ? 'bg-red-600/20 text-red-500 border-red-600'
                                                : 'bg-[#333] text-gray-400 border-transparent hover:bg-[#444]'}`}
                                        >
                                            {lang}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <Input label="Roll Number" value={formData.rollNo} onChange={(v: string) => updateField('rollNo', v)} placeholder="e.g. 24" />
                            <Input label="Date of Birth" type="date" value={formData.birthdate} onChange={(v: string) => updateField('birthdate', v)} />

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded mt-6 transition-colors shadow-lg shadow-black/40 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </motion.form>
                    )}

                    {step === 'student-join-class' && (
                        <motion.div
                            key="student-join-class"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="text-center space-y-2">
                                <h2 className="text-xl font-bold text-white">Join Your Class</h2>
                                <p className="text-sm text-slate-400">Enter the 6-character code given by your teacher.</p>
                            </div>

                            <div className="space-y-4">
                                <Input
                                    label="Class Code"
                                    value={joinCode}
                                    onChange={(v: string) => setJoinCode(v.toUpperCase())}
                                    placeholder="Ex: X7A9B2"
                                    required={false}
                                />

                                <button
                                    onClick={handleJoinClass}
                                    disabled={loading || joinCode.length < 6}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded transition-colors shadow-lg shadow-blue-900/40 disabled:opacity-50"
                                >
                                    {loading ? 'Verifying...' : 'Verify & Join Class'}
                                </button>

                                <div className="relative flex py-2 items-center">
                                    <div className="flex-grow border-t border-gray-600"></div>
                                    <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase">OR</span>
                                    <div className="flex-grow border-t border-gray-600"></div>
                                </div>

                                <button
                                    onClick={() => setStep('student-password')}
                                    className="w-full bg-white/5 hover:bg-white/10 text-slate-300 font-bold py-3 rounded transition-colors border border-white/10"
                                >
                                    Skip (Self Study)
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 'student-password' && (
                        <motion.div
                            key="student-password"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex justify-center"
                        >
                            <PinPad
                                title="Set PIN"
                                description="Create a 4-digit secret code"
                                onSubmit={async (pin) => {
                                    setLoading(true);
                                    try {
                                        await signup({
                                            ...formData,
                                            pin: pin,
                                            avatarId: '🎓'
                                        });
                                        navigate('/dashboard');
                                    } catch (error) {
                                        console.error(error);
                                        setLoading(false);
                                    }
                                }}
                            />
                        </motion.div>
                    )}

                    {step === 'teacher-form' && (
                        <motion.form
                            key="teacher-form"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            onSubmit={handleTeacherDetailsSubmit}
                            className="space-y-4"
                        >
                            <Input label="Full Name" value={formData.name} onChange={(v: string) => updateField('name', v)} placeholder="e.g. Priya Sharma" />
                            <Input label="School Name" value={formData.schoolName} onChange={(v: string) => updateField('schoolName', v)} placeholder="e.g. GramSiksha High" />
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Village/City" value={formData.villageName} onChange={(v: string) => updateField('villageName', v)} placeholder="Village" />
                                <Input label="State" value={formData.state} onChange={(v: string) => updateField('state', v)} placeholder="State" />
                            </div>
                            <Input label="Country" value={formData.country} onChange={(v: string) => updateField('country', v)} placeholder="Country" />
                            <Input label="Device IP (Auto/Manual)" value={formData.ipAddress} onChange={(v: string) => updateField('ipAddress', v)} placeholder="e.g. 192.168.1.5" required={false} />

                            <button
                                type="submit"
                                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded mt-6 transition-colors shadow-lg shadow-black/40"
                            >
                                Next
                            </button>
                        </motion.form>
                    )}

                    {step === 'teacher-password' && (
                        <motion.div
                            key="teacher-password"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex justify-center"
                        >
                            <PinPad
                                title="Set Access PIN"
                                description="Create a 4-digit security code"
                                onSubmit={async (pin) => {
                                    setLoading(true);
                                    try {
                                        await signup({
                                            ...formData,
                                            pin: pin,
                                            avatarId: '👨‍🏫'
                                        });
                                        navigate('/teacher');
                                    } catch (error) {
                                        console.error(error);
                                        setLoading(false);
                                    }
                                }}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
