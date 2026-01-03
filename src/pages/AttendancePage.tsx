import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar } from 'lucide-react';

export default function AttendancePage() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ present: 0, percentage: 0 });
    const [calendarDays, setCalendarDays] = useState<any[]>([]);
    const [currentMonth] = useState(new Date().toLocaleString('default', { month: 'long', year: 'numeric' }));

    useEffect(() => {
        // Load Real Attendance Data
        const logs = JSON.parse(localStorage.getItem('attendance_log') || '[]');

        // Generate Calendar for Current Month
        const date = new Date();
        const year = date.getFullYear();
        const month = date.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const generatedDays = [];
        let presentCount = 0;
        let workingDaysPassed = 0;

        for (let i = 1; i <= daysInMonth; i++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const dayOfWeek = new Date(year, month, i).getDay();
            const isWeekend = dayOfWeek === 0; // Sunday
            const isFuture = i > date.getDate();
            const isPresent = logs.includes(dateStr);

            if (isPresent) presentCount++;
            if (!isWeekend && !isFuture) workingDaysPassed++;

            generatedDays.push({
                day: i,
                date: dateStr,
                status: isFuture ? 'future' : isWeekend ? 'holiday' : isPresent ? 'present' : 'absent'
            });
        }

        const percentage = workingDaysPassed > 0 ? Math.round((presentCount / workingDaysPassed) * 100) : 0;

        setCalendarDays(generatedDays);
        setStats({
            present: presentCount,
            percentage: Math.min(percentage, 100) // Cap at 100 just in case
        });

    }, []);

    return (
        <div className="min-h-screen p-4 pb-24 animate-fade-in aurora-bg">
            <div className="w-full max-w-md mx-auto space-y-6">
                <div className="flex items-center gap-4 pt-2">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-md"
                    >
                        <ArrowLeft className="w-5 h-5 text-white" />
                    </button>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                        Attendance
                    </h1>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="glass-panel p-4 flex flex-col items-center justify-center min-h-[120px]">
                        <span className="text-4xl font-black text-green-400 drop-shadow-lg">{stats.percentage}%</span>
                        <span className="text-xs text-slate-400 uppercase tracking-widest mt-2 font-bold">Rate</span>
                    </div>
                    <div className="glass-panel p-4 flex flex-col items-center justify-center min-h-[120px]">
                        <span className="text-4xl font-black text-white drop-shadow-lg">{stats.present}</span>
                        <span className="text-xs text-slate-400 uppercase tracking-widest mt-2 font-bold">Days</span>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="glass-panel p-4">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-cyan-400" />
                            {currentMonth}
                        </h3>
                        <div className="flex gap-2 text-[10px] uppercase font-bold text-slate-500">
                            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div> Present</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-3">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                            <div key={d} className="text-center text-xs text-slate-500 font-bold mb-1">{d}</div>
                        ))}
                        {calendarDays.map((d) => (
                            <div
                                key={d.day}
                                className={`aspect-square rounded-xl flex items-center justify-center text-sm font-bold transition-all relative overflow-hidden
                                    ${d.status === 'present' ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 text-emerald-300 border border-green-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]' :
                                        d.status === 'absent' ? 'bg-red-500/5 text-red-500/30' :
                                            d.status === 'holiday' ? 'bg-white/5 text-slate-600 border border-dashed border-white/5' :
                                                'opacity-20 text-slate-600'}
                                `}
                            >
                                {d.status === 'present' && <div className="absolute inset-0 bg-green-400/10 blur-xl"></div>}
                                {d.day}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center">
                    <p className="text-purple-300 text-xs">
                        Sync your device daily to mark attendance automatically.
                    </p>
                </div>
            </div>
        </div>
    );
}
