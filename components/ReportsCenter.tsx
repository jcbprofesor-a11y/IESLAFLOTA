import React, { useState } from 'react';
import { Course, ClassLog, Exam, SchoolInfo, TeacherInfo } from '../types';
import { FileText, Printer, BookOpen, School, Filter } from 'lucide-react';

interface ReportsCenterProps {
    courses: Course[];
    logs: ClassLog[];
    exams: Exam[];
    schoolInfo: SchoolInfo;
    teacherInfo: TeacherInfo;
}

const ReportsCenter: React.FC<ReportsCenterProps> = ({ courses, logs, exams, schoolInfo, teacherInfo }) => {
    const [selectedReportType, setSelectedReportType] = useState<'module' | 'global'>('module');
    const [selectedModuleId, setSelectedModuleId] = useState<string>(''); // Default empty to force selection

    const currentModule = courses.find(c => c.id === selectedModuleId);

    // --- Logic for Reports ---

    const generateGlobalStats = () => {
        const totalUnits = courses.reduce((acc, c) => acc + c.units.length, 0);
        const completedUnits = courses.reduce((acc, c) => acc + c.units.filter(u => u.status === 'Completado').length, 0);
        const delayedUnits = courses.reduce((acc, c) => acc + c.units.filter(u => u.status === 'Retrasado').length, 0);
        const totalHoursPlanned = courses.reduce((acc, c) => acc + c.annualHours, 0);

        const logsHours = logs.reduce((acc, log) => acc + log.hours, 0);
        const examsHours = exams.reduce((acc, ex) => acc + (ex.duration || 1), 0);
        const totalHoursLogged = logsHours + examsHours;

        return { totalUnits, completedUnits, delayedUnits, totalHoursPlanned, totalHoursLogged };
    };

    const generateModuleStats = (course: Course) => {
        const completedUnits = course.units.filter(u => u.status === 'Completado').length;
        const modLogsHours = logs.filter(l => l.courseId === course.id).reduce((acc, l) => acc + l.hours, 0);
        const modExamsHours = exams.filter(e => e.courseId === course.id).reduce((acc, e) => acc + (e.duration || 1), 0);
        const hoursLogged = modLogsHours + modExamsHours;
        const logsCount = logs.filter(l => l.courseId === course.id).length;

        return { completedUnits, hoursLogged, logsCount };
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="h-full flex flex-col animate-fade-in gap-6">
            <style>{`
        @media print {
          body * { visibility: hidden; }
          #report-container, #report-container * { visibility: visible; }
          #report-container {
            position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 20px;
            background: white; z-index: 9999; box-shadow: none; border: none;
          }
          header, aside, .no-print { display: none !important; }
        }
      `}</style>

            <header className="flex justify-between items-center no-print">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <FileText size={24} className="text-chef-600" /> Centro de Documentación
                    </h2>
                    <p className="text-gray-500">Genera informes detallados por módulo formativo.</p>
                </div>
                <button
                    onClick={handlePrint}
                    disabled={!selectedModuleId && selectedReportType === 'module'}
                    className="bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-900 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Printer size={18} /> Imprimir Informe
                </button>
            </header>

            {/* Control Panel */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm no-print">
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">

                    {/* Mode Selector */}
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setSelectedReportType('module')}
                            className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${selectedReportType === 'module' ? 'bg-white shadow text-chef-700' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Informe de Módulo
                        </button>
                        <button
                            onClick={() => setSelectedReportType('global')}
                            className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${selectedReportType === 'global' ? 'bg-white shadow text-chef-700' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Resumen Global
                        </button>
                    </div>

                    {/* Module Selector (Only visible in 'module' mode) */}
                    {selectedReportType === 'module' && (
                        <div className="flex-1 w-full md:w-auto">
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Selecciona Módulo para ver datos:</label>
                            <select
                                value={selectedModuleId}
                                onChange={(e) => setSelectedModuleId(e.target.value)}
                                className="w-full md:w-96 p-2.5 border-2 border-chef-100 rounded-lg text-sm bg-white font-bold text-gray-800 focus:border-chef-500 focus:outline-none"
                            >
                                <option value="">-- Elige un Módulo --</option>
                                {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Report Area */}
            <div id="report-container" className="bg-white p-10 rounded-xl shadow-sm border border-gray-200 min-h-[600px] max-w-5xl mx-auto w-full relative">

                {/* -- HEADER DEL DOCUMENTO -- */}
                <div className="flex justify-between items-center border-b-2 border-gray-800 pb-6 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 flex items-center justify-center overflow-hidden">
                            {schoolInfo.logoUrl ? <img src={schoolInfo.logoUrl} alt="Logo Centro" className="w-full h-full object-contain" /> : <School size={48} className="text-gray-300" />}
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 uppercase tracking-tight">{schoolInfo.name}</h1>
                            <p className="text-sm font-semibold text-gray-600">{schoolInfo.department}</p>
                            <p className="text-xs text-gray-500 mt-1">Curso Académico: <span className="font-bold text-gray-800">{schoolInfo.academicYear}</span></p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-lg font-bold text-gray-800">{teacherInfo.name}</p>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">{teacherInfo.role}</p>
                        <p className="text-[10px] text-gray-400 mt-1">Fecha: {new Date().toLocaleDateString()}</p>
                    </div>
                </div>

                {/* -- CONTENT -- */}

                {selectedReportType === 'global' && (
                    <div className="space-y-8 animate-fade-in">
                        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6 uppercase tracking-wider bg-gray-50 py-2 border-y border-gray-200">Resumen Ejecutivo de Programación</h2>
                        <div className="grid grid-cols-3 gap-6">
                            {(() => {
                                const stats = generateGlobalStats();
                                return (
                                    <>
                                        <div className="p-6 bg-white rounded-lg border-2 border-gray-100 text-center shadow-sm">
                                            <p className="text-xs text-gray-500 uppercase font-bold mb-2">Módulos Activos</p>
                                            <p className="text-4xl font-black text-gray-800">{courses.length}</p>
                                        </div>
                                        <div className="p-6 bg-white rounded-lg border-2 border-gray-100 text-center shadow-sm">
                                            <p className="text-xs text-gray-500 uppercase font-bold mb-2">Progreso Unidades</p>
                                            <p className="text-4xl font-black text-green-600">{stats.completedUnits} <span className="text-lg text-gray-400 font-normal">/ {stats.totalUnits}</span></p>
                                        </div>
                                        <div className="p-6 bg-white rounded-lg border-2 border-gray-100 text-center shadow-sm">
                                            <p className="text-xs text-gray-500 uppercase font-bold mb-2">Horas Impartidas</p>
                                            <p className="text-4xl font-black text-blue-600">{stats.totalHoursLogged} h</p>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                        <div className="mt-8">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                                    <tr>
                                        <th className="p-3 border-b border-gray-300">Módulo</th>
                                        <th className="p-3 border-b border-gray-300 text-center">Unidades</th>
                                        <th className="p-3 border-b border-gray-300 w-1/3">Progreso</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {courses.map(c => {
                                        const completed = c.units.filter(u => u.status === 'Completado').length;
                                        const total = c.units.length;
                                        const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
                                        return (
                                            <tr key={c.id} className="break-inside-avoid">
                                                <td className="p-3 font-bold text-gray-800">{c.name}</td>
                                                <td className="p-3 text-center font-mono">{completed}/{total} UD</td>
                                                <td className="p-3 align-middle">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-chef-600 h-2 rounded-full" style={{ width: `${percent}%` }}></div></div>
                                                        <span className="text-xs font-bold text-gray-600 w-10 text-right">{percent}%</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {selectedReportType === 'module' && (
                    !selectedModuleId ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                            <BookOpen size={64} className="mb-4 opacity-20" />
                            <p className="text-xl font-bold">Por favor, selecciona un módulo.</p>
                            <p className="text-sm">Elige una opción en el desplegable superior para ver el informe detallado.</p>
                        </div>
                    ) : (
                        currentModule ? (
                            <div className="space-y-8 animate-fade-in">
                                {/* MODULE HEADER */}
                                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 flex justify-between items-center mb-6">
                                    <div>
                                        <h2 className="text-2xl font-black text-gray-800">{currentModule.name}</h2>
                                        <p className="text-gray-600 font-medium mt-1">{currentModule.cycle} • {currentModule.grade}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500 uppercase font-bold">Estado General</p>
                                        <span className="text-xl font-bold text-chef-700">{generateModuleStats(currentModule).completedUnits} / {currentModule.units.length} UD Completadas</span>
                                        <p className="text-xs text-gray-400 mt-1">{generateModuleStats(currentModule).hoursLogged} horas registradas</p>
                                    </div>
                                </div>

                                {/* EXAMS SECTION */}
                                <div className="mb-8">
                                    <h3 className="font-bold text-gray-700 mb-4 border-l-4 border-purple-600 pl-3 uppercase tracking-wide">Registro de Pruebas y Exámenes</h3>
                                    {exams.filter(e => e.courseId === currentModule.id).length === 0 ? (
                                        <div className="p-4 bg-gray-50 rounded border border-gray-100 text-center text-gray-400 text-sm italic">
                                            No hay exámenes registrados para este módulo.
                                        </div>
                                    ) : (
                                        <table className="w-full text-sm border-collapse border border-gray-200 shadow-sm">
                                            <thead className="bg-purple-50 text-purple-900 text-xs uppercase font-bold">
                                                <tr>
                                                    <th className="p-3 border border-gray-200 text-left w-32">Fecha</th>
                                                    <th className="p-3 border border-gray-200 text-center w-24">Tipo</th>
                                                    <th className="p-3 border border-gray-200 text-left">Unidades Evaluadas</th>
                                                    <th className="p-3 border border-gray-200 text-left">Temario / Descripción</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {exams.filter(e => e.courseId === currentModule.id).map(ex => {
                                                    // Resolve Unit Titles
                                                    const unitTitles = ex.unitIds.map(uid => {
                                                        const u = currentModule.units.find(unit => unit.id === uid);
                                                        return u ? u.title.split(':')[0] : 'U?';
                                                    }).join(', ');

                                                    return (
                                                        <tr key={ex.id} className="hover:bg-purple-50/20 break-inside-avoid">
                                                            <td className="p-3 border border-gray-200 font-mono text-gray-600">{new Date(ex.date).toLocaleDateString()}</td>
                                                            <td className="p-3 border border-gray-200 text-center font-bold">
                                                                <div className="flex flex-col items-center">
                                                                    <span>{ex.type}</span>
                                                                    <span className="text-[10px] text-gray-400 font-normal">({ex.duration || 1}h)</span>
                                                                </div>
                                                            </td>
                                                            <td className="p-3 border border-gray-200">
                                                                {ex.unitIds.length > 0 ? (
                                                                    <div className="flex flex-wrap gap-1">
                                                                        {ex.unitIds.map(uid => {
                                                                            const u = currentModule.units.find(unit => unit.id === uid);
                                                                            return u ? (
                                                                                <span key={uid} className="inline-block bg-purple-100 text-purple-800 text-[10px] px-1.5 py-0.5 rounded border border-purple-200 font-bold">
                                                                                    {u.title.split(':')[0]}
                                                                                </span>
                                                                            ) : null;
                                                                        })}
                                                                    </div>
                                                                ) : <span className="text-gray-400 italic">Global</span>}
                                                            </td>
                                                            <td className="p-3 border border-gray-200 text-gray-700 text-xs italic">{ex.topics}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    )}
                                </div>

                                {/* INCIDENTS SECTION */}
                                <div className="mb-8 break-inside-avoid">
                                    <h3 className="font-bold text-gray-700 mb-4 border-l-4 border-red-500 pl-3 uppercase tracking-wide">Registro de Incidencias y Asistencia</h3>
                                    {logs.filter(l => l.courseId === currentModule.id && l.status !== 'Impartida').length === 0 ? (
                                        <div className="p-4 bg-gray-50 rounded border border-gray-100 text-center text-gray-400 text-sm italic">
                                            No se han registrado incidencias (Faltas de asistencia / Profesor) en este módulo.
                                        </div>
                                    ) : (
                                        <table className="w-full text-sm border-collapse border border-gray-200 shadow-sm">
                                            <thead className="bg-red-50 text-red-900 text-xs uppercase font-bold">
                                                <tr>
                                                    <th className="p-3 border border-gray-200 text-left w-32">Fecha</th>
                                                    <th className="p-3 border border-gray-200 text-center w-32">Tipo Incidencia</th>
                                                    <th className="p-3 border border-gray-200 text-left">Observaciones / Motivo</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {logs
                                                    .filter(l => l.courseId === currentModule.id && l.status !== 'Impartida')
                                                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                                    .map(inc => (
                                                        <tr key={inc.id} className="hover:bg-red-50/20">
                                                            <td className="p-3 border border-gray-200 font-mono text-gray-600">{new Date(inc.date).toLocaleDateString()}</td>
                                                            <td className="p-3 border border-gray-200 text-center">
                                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${inc.status === 'Falta Profesor' ? 'bg-red-100 text-red-800 border-red-200' :
                                                                    inc.status === 'Falta Alumnos' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                                                                        'bg-gray-100 text-gray-800 border-gray-200'
                                                                    }`}>
                                                                    {inc.status}
                                                                </span>
                                                            </td>
                                                            <td className="p-3 border border-gray-200 text-gray-700 text-xs">{inc.notes || '-'}</td>
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>

                                {/* UNITS SECTION */}
                                <div>
                                    <h3 className="font-bold text-gray-700 mb-4 border-l-4 border-chef-600 pl-3 uppercase tracking-wide">Desglose de Unidades de Trabajo</h3>
                                    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-100 text-gray-600 text-[10px] uppercase font-bold">
                                                <tr>
                                                    <th className="p-3 text-left border-b border-gray-200">Unidad Didáctica</th>
                                                    <th className="p-3 text-center border-b border-gray-200 w-32">Teoría (H)</th>
                                                    <th className="p-3 text-center border-b border-gray-200 w-32">Práctica (H)</th>
                                                    <th className="p-3 text-center border-b border-gray-200 w-32">Progreso Total</th>
                                                    <th className="p-3 text-center border-b border-gray-200 w-32">Estado</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {currentModule.units.map(u => {
                                                    // Logica de calculo duplicada para visualizacion, aunque idealmente viene del estado sincronizado
                                                    const unitLogs = logs.filter(l => l.courseId === currentModule.id && l.unitId === u.id); // Double check filter
                                                    const realT = unitLogs.filter(l => l.type === 'Teórica').reduce((acc, l) => acc + l.hours, 0);
                                                    const realP = unitLogs.filter(l => l.type === 'Práctica').reduce((acc, l) => acc + l.hours, 0);

                                                    const planT = u.hoursPlannedTheory;
                                                    const planP = u.hoursPlannedPractice;
                                                    const planTotal = planT + planP;
                                                    const realTotal = realT + realP;

                                                    const percTotal = planTotal > 0 ? Math.round((realTotal / planTotal) * 100) : 0;

                                                    return (
                                                        <tr key={u.id} className="break-inside-avoid hover:bg-gray-50/50">
                                                            <td className="p-3">
                                                                <p className="font-bold text-gray-800 text-xs">{u.title}</p>
                                                                <p className="text-[10px] text-gray-400 italic line-clamp-1">{u.description}</p>
                                                            </td>

                                                            {/* Teoría Visualización */}
                                                            <td className="p-3 align-middle">
                                                                <div className="text-center">
                                                                    <span className={`text-xs font-bold ${realT > planT ? 'text-red-500' : 'text-blue-700'}`}>{realT}</span>
                                                                    <span className="text-[10px] text-gray-400"> / {planT}</span>
                                                                </div>
                                                                <div className="h-1.5 w-full bg-blue-50 rounded-full overflow-hidden mt-1">
                                                                    <div className="h-full bg-blue-500" style={{ width: `${Math.min(100, (realT / Math.max(1, planT)) * 100)}%` }}></div>
                                                                </div>
                                                            </td>

                                                            {/* Práctica Visualización */}
                                                            <td className="p-3 align-middle">
                                                                <div className="text-center">
                                                                    <span className={`text-xs font-bold ${realP > planP ? 'text-red-500' : 'text-orange-700'}`}>{realP}</span>
                                                                    <span className="text-[10px] text-gray-400"> / {planP}</span>
                                                                </div>
                                                                <div className="h-1.5 w-full bg-orange-50 rounded-full overflow-hidden mt-1">
                                                                    <div className="h-full bg-orange-500" style={{ width: `${Math.min(100, (realP / Math.max(1, planP)) * 100)}%` }}></div>
                                                                </div>
                                                            </td>

                                                            <td className="p-3 text-center align-middle">
                                                                <span className="text-sm font-black text-gray-800">{percTotal}%</span>
                                                            </td>

                                                            <td className="p-3 text-center align-middle">
                                                                <span className={`px-2 py-1 rounded text-[9px] font-black uppercase border ${u.status === 'Completado' ? 'bg-green-50 text-green-700 border-green-200' :
                                                                    u.status === 'Retrasado' ? 'bg-red-50 text-red-700 border-red-200' :
                                                                        u.status === 'En Progreso' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                                            'bg-gray-50 text-gray-500 border-gray-200'
                                                                    }`}>
                                                                    {u.status}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* FOOTER FIRMA */}
                                <div className="mt-20 pt-8 border-t border-gray-300 flex justify-center break-inside-avoid">
                                    <div className="text-center w-64">
                                        <div className="h-24 border-b border-gray-400 mb-2"></div>
                                        <p className="text-xs font-bold uppercase text-gray-600">Fdo. El Profesor/a Responsable</p>
                                    </div>
                                </div>
                            </div>
                        ) : <div className="text-red-500">Error: Módulo no encontrado.</div>
                    )
                )}

                <div className="mt-auto pt-8 border-t border-gray-200">
                    <div className="flex justify-between text-[10px] text-gray-400 uppercase tracking-widest">
                        <p>GastroAcademia Intelligence - Gestión Curricular</p>
                        <p>Generado el {new Date().toLocaleDateString()}</p>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default ReportsCenter;
