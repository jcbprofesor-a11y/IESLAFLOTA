
import React, { useMemo } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area,
  ComposedChart, Line
} from 'recharts';
import { Course, UnitStatus, Evaluation, ClassLog, Exam } from '../types';
import {
  Calendar, AlertTriangle, CheckCircle, BookOpen, Clock,
  ClipboardCheck, TrendingUp, ChefHat, GraduationCap,
  Zap, ArrowRight, Layers
} from 'lucide-react';

interface DashboardProps {
  courses: Course[];
  evaluations: Evaluation[];
  logs: ClassLog[];

  exams: Exam[];
  onNavigate: (view: any) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ courses, evaluations, logs, exams, onNavigate }) => {
  // --- DATA CALCULATIONS ---

  const allUnits = useMemo(() => courses.flatMap(c => c.units), [courses]);
  const stats = useMemo(() => {
    return {
      totalUnits: allUnits.length,
      completed: allUnits.filter(u => u.status === UnitStatus.COMPLETED).length,
      inProgress: allUnits.filter(u => u.status === UnitStatus.IN_PROGRESS).length,
      delayed: allUnits.filter(u => u.status === UnitStatus.DELAYED).length,
      pending: allUnits.filter(u => u.status === UnitStatus.PENDING).length,
      totalHoursPlanned: courses.reduce((acc, c) => acc + c.annualHours, 0),
      totalHoursLogged: logs.reduce((acc, l) => acc + l.hours, 0) + exams.reduce((acc, ex) => acc + (ex.duration || 0), 0),
      examsCount: exams.length,
    };
  }, [allUnits, courses, logs, exams]);

  // Activity by Day (Last 7 Days)
  const last7DaysActivity = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const hours = logs.filter(l => l.date === dateStr).reduce((acc, l) => acc + l.hours, 0) +
        exams.filter(e => e.date === dateStr).reduce((acc, ex) => acc + (ex.duration || 0), 0);
      data.push({
        date: d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' }),
        horas: hours,
      });
    }
    return data;
  }, [logs, exams]);

  // Data for Global Progress Pie
  const dataPieStatus = [
    { name: 'Completado', value: stats.completed, color: '#22c55e' },
    { name: 'En Progreso', value: stats.inProgress, color: '#3b82f6' },
    { name: 'Pendiente', value: stats.pending, color: '#94a3b8' },
    { name: 'Retrasado', value: stats.delayed, color: '#ef4444' },
  ];

  // Data for Radar-like Bar Chart (Distribution of effort)
  const dataModuleEffort = courses.map(c => {
    const modLogs = logs.filter(l => l.courseId === c.id);
    const modExams = exams.filter(e => e.courseId === c.id);
    return {
      name: c.name.split(' ')[0],
      teoria: modLogs.filter(l => l.type === 'Teórica').reduce((acc, l) => acc + l.hours, 0),
      practica: modLogs.filter(l => l.type === 'Práctica').reduce((acc, l) => acc + l.hours, 0),
      examenes: modExams.reduce((acc, e) => acc + (e.duration || 0), 0),
      total: modLogs.reduce((acc, l) => acc + l.hours, 0) + modExams.reduce((acc, e) => acc + (e.duration || 0), 0),
      color: c.color || '#8a6a5c'
    };
  });

  const nextEvaluation = evaluations
    .filter(e => !e.completed)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* HEADER SECTION */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <Zap className="text-yellow-500 fill-yellow-500" /> Dashboard 2026
          </h2>
          <p className="text-gray-500 font-bold text-lg mt-1 ml-10 uppercase tracking-widest flex items-center gap-2">
            Análisis de Rendimiento Académico <span className="w-12 h-1 bg-chef-300 rounded-full"></span>
          </p>
        </div>

        {nextEvaluation && (
          <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-4 rounded-2xl shadow-lg flex items-center gap-4 animate-pulse-slow">
            <div className="bg-white/20 p-2 rounded-xl">
              <Calendar size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Próximo Hito</p>
              <p className="font-bold text-sm leading-tight">{nextEvaluation.title}</p>
              <p className="text-xs font-black mt-1 bg-white/20 inline-block px-2 py-0.5 rounded uppercase">
                {new Date(nextEvaluation.date).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}
      </header>

      {/* PRIMARY KPI GRID */}
      <div className="grid grid-cols-1 md:flex-row lg:grid-cols-4 gap-6 text-center md:text-left">
        <KpiCard
          icon={<Layers className="text-blue-600" />}
          title="Unidades de Trabajo"
          value={stats.totalUnits}
          subtitle={`${stats.completed} completadas`}
          color="blue"
        />
        <KpiCard
          icon={<Clock className="text-chef-600" />}
          title="Horas Totales"
          value={`${stats.totalHoursLogged}h`}
          subtitle={`${Math.round((stats.totalHoursLogged / Math.max(1, stats.totalHoursPlanned)) * 100)}% de la programación`}
          color="chef"
        />
        <KpiCard
          icon={<ClipboardCheck className="text-purple-600" />}
          title="Pruebas Realizadas"
          value={stats.examsCount}
          subtitle="Exámenes teóricos/prácticos"
          color="purple"
        />
        <KpiCard
          icon={<AlertTriangle className="text-red-600" />}
          title="Alertas de Retraso"
          value={stats.delayed}
          subtitle="Unidades fuera de plazo"
          color="red"
          isAlert={stats.delayed > 0}
        />
      </div>

      {/* TOP ANALYTICS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Progress Trend - Activity over time */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl shadow-sm border-2 border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black text-gray-800 flex items-center gap-2">
              <TrendingUp size={22} className="text-green-500" /> Actividad Reciente (Horas/Día)
            </h3>
            <div className="text-xs font-black text-gray-400 uppercase tracking-widest">Última Semana Lectiva</div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={last7DaysActivity}>
                <defs>
                  <linearGradient id="colorHoras" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a18072" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#a18072" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 700, fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 600, fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="horas" stroke="#8a6a5c" strokeWidth={4} fillOpacity={1} fill="url(#colorHoras)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Global Distribution Pie */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl shadow-sm border-2 border-gray-100 flex flex-col">
          <h3 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2">
            <CheckCircle size={22} className="text-blue-500" /> Estado Global
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataPieStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {dataPieStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {dataPieStatus.map(item => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-[10px] font-black text-gray-500 uppercase">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODULE-SPECIFIC DEEP DIVE SECTION */}
      <section>
        <div className="flex items-center gap-4 mb-6">
          <h3 className="text-2xl font-black text-gray-800 uppercase tracking-tighter flex items-center gap-2">
            <ChefHat size={28} className="text-chef-600" /> Análisis por Módulo
          </h3>
          <div className="h-px bg-gray-200 flex-1"></div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {courses.map(course => (
            <ModuleIntelligenceCard key={course.id} course={course} logs={logs} exams={exams} onNavigate={onNavigate} />
          ))}
        </div>
      </section>

      {/* EFFORT DISTRIBUTION (Radar Replacement with Composed Chart) */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border-2 border-gray-100">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-black text-gray-800 flex items-center gap-2">
            <Layers size={22} className="text-purple-500" /> Distribución de Horas por Contenido
          </h3>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dataModuleEffort} barGap={12}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontWeight: 800 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontWeight: 600 }} />
              <Tooltip
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '10px', paddingTop: '20px' }} />
              <Bar dataKey="teoria" name="H. Teóricas" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="practica" name="H. Prácticas" fill="#f97316" radius={[4, 4, 0, 0]} />
              <Bar dataKey="examenes" name="H. Evaluación" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const KpiCard = ({ icon, title, value, subtitle, color, isAlert }: any) => {
  const colorMap: any = {
    blue: "bg-blue-50 border-blue-100",
    chef: "bg-chef-50 border-chef-100",
    purple: "bg-purple-50 border-purple-100",
    red: "bg-red-50 border-red-100",
  };

  return (
    <div className={`p-6 rounded-3xl border-2 shadow-sm transition-transform hover:scale-[1.02] ${colorMap[color] || 'bg-white border-gray-100'} ${isAlert ? 'ring-2 ring-red-500 ring-offset-2 animate-shake' : ''}`}>
      <div className="flex items-center gap-4 mb-3">
        <div className="p-3 bg-white rounded-2xl shadow-sm">{icon}</div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">{title}</p>
      </div>
      <div className="flex flex-col">
        <span className="text-3xl font-black text-gray-900 tracking-tighter">{value}</span>
        <span className="text-[10px] font-bold text-gray-500 mt-1 flex items-center gap-1">
          {subtitle}
        </span>
      </div>
    </div>
  );
};

// Fixed Error: "Property 'key' does not exist on type '{ course: Course; logs: ClassLog[]; exams: Exam[]; }'"
// Explicitly using React.FC ensures the component signature allows React-reserved props like 'key' from .map calls.
const ModuleIntelligenceCard: React.FC<{ course: Course; logs: ClassLog[]; exams: Exam[]; onNavigate: (view: any) => void }> = ({ course, logs, exams, onNavigate }) => {
  const modLogs = logs.filter(l => l.courseId === course.id);
  const modExams = exams.filter(e => e.courseId === course.id);

  const theoryHours = modLogs.filter(l => l.type === 'Teórica').reduce((acc, l) => acc + l.hours, 0);
  const practiceHours = modLogs.filter(l => l.type === 'Práctica').reduce((acc, l) => acc + l.hours, 0);
  const examHours = modExams.reduce((acc, e) => acc + (e.duration || 0), 0);

  const totalRealHours = theoryHours + practiceHours + examHours;
  const progressPercent = Math.min(100, Math.round((totalRealHours / Math.max(1, course.annualHours)) * 100));

  const dataUnits = [
    { name: 'Completado', value: course.units.filter(u => u.status === UnitStatus.COMPLETED).length },
    { name: 'Resto', value: course.units.filter(u => u.status !== UnitStatus.COMPLETED).length }
  ];

  return (
    <div className="bg-white p-6 rounded-3xl border-2 border-gray-100 shadow-md flex flex-col md:flex-row gap-6 hover:shadow-xl transition-shadow group">
      {/* Left: Progress Circle */}
      <div className="flex flex-col items-center justify-center w-full md:w-32">
        <div className="relative w-32 h-32">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={[
                  { name: 'Progreso', value: progressPercent },
                  { name: 'Pendiente', value: 100 - progressPercent }
                ]}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={45}
                startAngle={90}
                endAngle={450}
                dataKey="value"
                stroke="none"
              >
                <Cell fill={course.color || '#8a6a5c'} />
                <Cell fill="#f1f5f9" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-black text-gray-800 leading-none">{progressPercent}%</span>
            <span className="text-[8px] font-bold text-gray-400 uppercase">Impartido</span>
          </div>
        </div>
      </div>

      {/* Right: Info & Stats */}
      <div className="flex-1 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-black text-gray-800 text-lg group-hover:text-chef-600 transition-colors">{course.name}</h4>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{course.cycle} • {course.grade}</p>
          </div>
          <div className="bg-gray-50 px-3 py-1 rounded-full border border-gray-100 text-[10px] font-black text-gray-500 uppercase">
            {course.weeklyHours}h/sem
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="p-2 bg-blue-50 rounded-xl text-center border border-blue-100">
            <span className="block text-[8px] font-black text-blue-500 uppercase mb-0.5">Teoría</span>
            <span className="text-sm font-black text-blue-800">{theoryHours}h</span>
          </div>
          <div className="p-2 bg-orange-50 rounded-xl text-center border border-orange-100">
            <span className="block text-[8px] font-black text-orange-500 uppercase mb-0.5">Práctica</span>
            <span className="text-sm font-black text-orange-800">{practiceHours}h</span>
          </div>
          <div className="p-2 bg-purple-50 rounded-xl text-center border border-purple-100">
            <span className="block text-[8px] font-black text-purple-500 uppercase mb-0.5">Eval.</span>
            <span className="text-sm font-black text-purple-800">{examHours}h</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <GraduationCap size={16} className="text-chef-500" />
            <span className="text-xs font-bold text-gray-600">
              {course.units.filter(u => u.status === UnitStatus.COMPLETED).length} / {course.units.length} UD Finalizadas
            </span>
          </div>
          <button
            onClick={() => onNavigate('units')}
            className="text-[10px] font-black text-chef-600 hover:text-chef-800 uppercase flex items-center gap-1 group/btn"
          >
            Ver Detalles <ArrowRight size={12} className="group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
