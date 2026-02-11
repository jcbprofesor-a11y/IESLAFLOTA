import React, { useState } from 'react';
import { Course, Unit, UnitStatus, ResultadoAprendizaje } from '../types';
import { Clock, AlertCircle, Layers, GraduationCap, ChevronRight, CheckCircle2, Link as LinkIcon, ArrowLeft, LayoutGrid } from 'lucide-react';

interface UnitsTrackerProps {
    courses: Course[];
}

const StatusBadge: React.FC<{ status: UnitStatus }> = ({ status }) => {
    const colors = {
        [UnitStatus.COMPLETED]: 'bg-green-100 text-green-700 border-green-200',
        [UnitStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-700 border-blue-200',
        [UnitStatus.PENDING]: 'bg-gray-100 text-gray-600 border-gray-200',
        [UnitStatus.DELAYED]: 'bg-red-100 text-red-700 border-red-200',
    };

    return (
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${colors[status]}`}>
            {status}
        </span>
    );
};

const UnitsTracker: React.FC<UnitsTrackerProps> = ({ courses }) => {
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'units' | 'ras'>('units');

    const selectedCourse = courses.find(c => c.id === selectedCourseId);

    // --- HELPER: Calculate RA Progress based on Weighted Criteria ---
    const getRaStats = (ra: ResultadoAprendizaje, units: Unit[]) => {
        let totalRaPercent = 0;

        // Calculate progress for each criterion independently
        const criteriaDetails = ra.criterios.map(crit => {
            // 1. Find linked units for this specific criterion
            const linkedUnitIds = crit.asociaciones.map(a => a.utId).filter(Boolean);
            const linkedUnits = units.filter(u => linkedUnitIds.includes(u.id));

            // 2. Calculate progress for this criterion
            let critProgress = 0;
            if (linkedUnits.length > 0) {
                const totalPlanned = linkedUnits.reduce((acc, u) => acc + u.hoursPlannedTheory + u.hoursPlannedPractice, 0);
                const totalRealized = linkedUnits.reduce((acc, u) => acc + u.hoursRealized, 0);
                // Cap at 1 (100%) to prevent over-contribution
                critProgress = totalPlanned > 0 ? Math.min(1, totalRealized / totalPlanned) : 0;
            }

            // 3. Weight contribution
            const contribution = critProgress * crit.ponderacion;
            totalRaPercent += contribution;

            return {
                id: crit.id,
                codigo: crit.codigo,
                descripcion: crit.descripcion,
                ponderacion: crit.ponderacion,
                realProgressPercent: critProgress * 100,
                contribution: contribution,
                linkedUnits: linkedUnits
            };
        });

        return { percent: totalRaPercent, criteriaDetails };
    };

    // --- VIEW 1: MODULE SELECTION GALLERY ---
    if (!selectedCourseId) {
        return (
            <div className="animate-fade-in pb-10">
                <div className="mb-8">
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <Layers className="text-chef-600" size={32} /> Seguimiento Académico
                    </h2>
                    <p className="text-gray-500 font-bold mt-2 ml-11">Selecciona un módulo para ver el desglose detallado.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {courses.map(course => {
                        const totalRealized = course.units.reduce((acc, u) => acc + (u.hoursRealized || 0), 0);
                        const totalPlanned = course.units.reduce((acc, u) => acc + ((u.hoursPlannedTheory || 0) + (u.hoursPlannedPractice || 0)), 0);
                        const percent = Math.round((totalRealized / Math.max(1, totalPlanned)) * 100);

                        return (
                            <div
                                key={course.id}
                                onClick={() => setSelectedCourseId(course.id)}
                                className="bg-white p-6 rounded-2xl border-2 border-gray-100 shadow-sm hover:shadow-xl hover:border-chef-200 transition-all cursor-pointer group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <LayoutGrid size={100} />
                                </div>

                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-xl font-black text-gray-800 group-hover:text-chef-700 transition-colors">{course.name}</h3>
                                        <ChevronRight className="text-gray-300 group-hover:text-chef-500 transition-colors" />
                                    </div>

                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6">{course.cycle}</p>

                                    <div className="flex items-end justify-between">
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase">Progreso Global</p>
                                            <p className="text-3xl font-black text-chef-600">{percent}%</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-gray-400 uppercase">Horas</p>
                                            <p className="text-sm font-bold text-gray-600">{totalRealized} / {totalPlanned} h</p>
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-3 overflow-hidden">
                                        <div className="bg-chef-500 h-full rounded-full transition-all" style={{ width: `${percent}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    // --- VIEW 2: DETAILED MODULE VIEW ---
    const totalRealized = selectedCourse!.units.reduce((acc, u) => acc + (u.hoursRealized || 0), 0);
    const totalPlanned = selectedCourse!.units.reduce((acc, u) => acc + ((u.hoursPlannedTheory || 0) + (u.hoursPlannedPractice || 0)), 0);
    const moduleDeviation = totalRealized - totalPlanned;
    const deviationText = isNaN(moduleDeviation) ? '0' : moduleDeviation > 0 ? `+${moduleDeviation}` : `${moduleDeviation}`;

    return (
        <div className="space-y-6 animate-fade-in pb-10">

            {/* Navigation & Header */}
            <button
                onClick={() => setSelectedCourseId(null)}
                className="flex items-center gap-2 text-gray-500 hover:text-chef-600 font-bold text-sm transition-colors mb-2"
            >
                <ArrowLeft size={16} /> Volver a Módulos
            </button>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col lg:flex-row justify-between lg:items-center gap-6">
                <div>
                    <h2 className="text-2xl font-black text-gray-900">{selectedCourse!.name}</h2>
                    <p className="text-gray-500 font-medium">{selectedCourse!.cycle} • {selectedCourse!.grade}</p>
                </div>

                <div className="flex flex-col md:flex-row gap-4 md:items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <div className="text-right px-4 border-r border-gray-200 last:border-0">
                        <p className="text-xs font-bold text-gray-400 uppercase">Horas Totales</p>
                        <p className="text-xl font-black text-gray-800">{totalRealized} <span className="text-sm text-gray-400 font-normal">/ {totalPlanned > 0 ? totalPlanned : '-'} h</span></p>
                    </div>
                    <div className="text-right px-4 border-r border-gray-200 last:border-0">
                        <p className="text-xs font-bold text-gray-400 uppercase">Desviación</p>
                        <p className={`text-xl font-black ${moduleDeviation > 0 ? 'text-red-500' : moduleDeviation < 0 ? 'text-green-500' : 'text-gray-500'}`}>
                            {totalPlanned > 0 ? `${deviationText} h` : '-'}
                        </p>
                    </div>
                    <div className="flex bg-white p-1 rounded-lg shadow-sm">
                        <button
                            onClick={() => setActiveTab('units')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-black uppercase transition-all ${activeTab === 'units' ? 'bg-chef-500 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <Layers size={14} /> Unidades
                        </button>
                        <button
                            onClick={() => setActiveTab('ras')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-black uppercase transition-all ${activeTab === 'ras' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <GraduationCap size={14} /> Resultados (RA)
                        </button>
                    </div>
                </div>
            </div>

            {/* --- TAB: UNITS VIEW --- */}
            {activeTab === 'units' && (
                <div className="space-y-4">
                    {selectedCourse!.units.length === 0 ? (
                        <div className="p-12 text-center bg-white rounded-xl border border-dashed border-gray-300">
                            <Layers className="mx-auto text-gray-300 mb-4" size={48} />
                            <p className="text-gray-400 font-medium">No hay unidades didácticas configuradas.</p>
                        </div>
                    ) : (
                        selectedCourse!.units.map((unit) => {
                            const uPlanned = (unit.hoursPlannedTheory || 0) + (unit.hoursPlannedPractice || 0);
                            const uDeviation = (unit.hoursRealized || 0) - uPlanned;
                            const percent = uPlanned > 0 ? Math.min(100, ((unit.hoursRealized || 0) / uPlanned) * 100) : 0;

                            // Parse Title gracefully
                            const parts = unit.title.includes(':') ? unit.title.split(':') : [unit.title, ''];
                            const prefix = parts[1] ? parts[0] : '';
                            const mainTitle = parts[1] ? parts[1] : parts[0];

                            return (
                                <div key={unit.id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1 flex-wrap">
                                                {prefix && <span className="font-black text-gray-800 text-lg whitespace-nowrap mr-2">{prefix}</span>}
                                                <StatusBadge status={unit.status} />
                                            </div>
                                            <p className="text-gray-700 font-bold text-sm">{mainTitle}</p>
                                            <p className="text-xs text-gray-400 mt-1 line-clamp-1">{unit.description}</p>
                                        </div>

                                        <div className="flex items-center gap-6 min-w-[300px]">
                                            <div className="flex-1">
                                                <div className="flex justify-between text-xs mb-2 font-bold text-gray-500 uppercase">
                                                    <span>Progreso</span>
                                                    <div className="flex gap-2">
                                                        <span>{unit.hoursRealized || 0} / {uPlanned > 0 ? uPlanned : '-'} h</span>
                                                        {unit.status === UnitStatus.COMPLETED && uPlanned > 0 && (
                                                            <span className={`${uDeviation > 0 ? 'text-red-500' : uDeviation < 0 ? 'text-green-500' : 'text-gray-300'}`}>
                                                                ({uDeviation > 0 ? '+' : ''}{uDeviation}h)
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-1000 ease-out ${unit.hoursRealized >= uPlanned ? 'bg-green-500' :
                                                            unit.status === UnitStatus.DELAYED ? 'bg-red-500' : 'bg-chef-500'
                                                            }`}
                                                        style={{ width: `${percent}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {(unit.status === UnitStatus.DELAYED || uDeviation > 0) && (
                                        <div className="mt-4 flex flex-wrap gap-2 pt-3 border-t border-gray-50">
                                            {unit.status === UnitStatus.DELAYED && (
                                                <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 font-bold">
                                                    <AlertCircle size={14} />
                                                    <span>RETRASO: {Math.max(0, uPlanned - unit.hoursRealized)}h pendientes</span>
                                                </div>
                                            )}
                                            {uDeviation > 0 && unit.status === UnitStatus.COMPLETED && (
                                                <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-100 font-bold">
                                                    <Clock size={14} />
                                                    <span>EXCESO: {uDeviation}h extra</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )
                        })
                    )}
                </div>
            )}

            {/* --- TAB: LEARNING RESULTS (RA) VIEW --- */}
            {activeTab === 'ras' && (
                <div className="space-y-6">
                    {(!selectedCourse!.learningResults || selectedCourse!.learningResults.length === 0) ? (
                        <div className="p-12 text-center bg-white rounded-xl border border-dashed border-gray-300">
                            <GraduationCap className="mx-auto text-gray-300 mb-4" size={48} />
                            <p className="text-gray-400 font-medium">No hay RAs definidos para este módulo.</p>
                        </div>
                    ) : (
                        selectedCourse!.learningResults.map(ra => {
                            const stats = getRaStats(ra, selectedCourse!.units);
                            const isComplete = stats.percent >= 99.9; // Tolerance

                            return (
                                <div key={ra.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                    <div className="flex flex-col md:flex-row gap-8">

                                        {/* RA Info */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className={`text-sm font-black px-2.5 py-1 rounded-lg ${isComplete ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                                    {ra.codigo}
                                                </span>
                                                <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                    Peso Total: {ra.ponderacion}%
                                                </span>
                                            </div>
                                            <p className="font-bold text-gray-800 text-lg mb-4 leading-tight">{ra.descripcion}</p>

                                            {/* Enhanced Criteria Breakdown */}
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Desglose por Criterios de Evaluación</p>
                                                <div className="grid grid-cols-1 gap-2">
                                                    {stats.criteriaDetails.map(crit => (
                                                        <div key={crit.id} className="flex flex-col gap-2 text-xs bg-gray-50 p-2 rounded border border-gray-200">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-mono font-bold text-gray-600 bg-white px-1.5 rounded">{crit.codigo}</span>
                                                                    <span className="text-gray-500 line-clamp-1 w-48" title={crit.descripcion}>{crit.descripcion}</span>
                                                                </div>
                                                                <div className="flex items-center gap-4">
                                                                    <div className="text-right">
                                                                        <span className="block font-bold text-gray-700">{Math.round(crit.realProgressPercent)}% completado</span>
                                                                        <span className="block text-[10px] text-gray-400">Pond: {crit.ponderacion}%</span>
                                                                    </div>
                                                                    <div className="w-16 text-right font-black text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                                                        +{crit.contribution.toFixed(1)}%
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Unit Breakdown */}
                                                            <div className="flex flex-wrap gap-2 pl-8 border-t border-gray-200 pt-2 border-dashed">
                                                                {(crit.linkedUnits as Unit[] || []).length > 0 ? (
                                                                    (crit.linkedUnits as Unit[]).map((u) => (
                                                                        <span key={u.id} className="text-[10px] bg-white border border-gray-200 px-2 py-0.5 rounded text-gray-500 flex items-center gap-1 shadow-sm">
                                                                            <Layers size={10} className="text-gray-300" />
                                                                            <span className="font-bold">{u.title.split(':')[0]}</span>:
                                                                            <span className={u.hoursRealized > 0 ? 'text-green-600 font-black' : 'text-gray-400'}>{u.hoursRealized}h</span>
                                                                        </span>
                                                                    ))
                                                                ) : (
                                                                    <span className="text-[10px] text-gray-300 italic flex items-center gap-1"><AlertCircle size={10} /> Sin vinculación a UTs</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Total Progress */}
                                        <div className="w-full md:w-1/3 flex flex-col justify-start bg-gray-50 p-6 rounded-xl border border-gray-200">
                                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Progreso Ponderado RA</p>

                                            <div className="relative flex items-center justify-center py-6">
                                                <div className={`text-5xl font-black ${isComplete ? 'text-green-500' : 'text-blue-600'}`}>
                                                    {stats.percent.toFixed(1)}%
                                                </div>
                                            </div>

                                            <div className="w-full bg-gray-200 rounded-full h-4 mb-2 overflow-hidden border border-gray-300">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-1000 ${isComplete ? 'bg-green-500' : 'bg-blue-600'}`}
                                                    style={{ width: `${Math.min(100, stats.percent)}%` }}
                                                ></div>
                                            </div>
                                            <p className="text-[10px] text-center text-gray-400 mt-2">
                                                Suma de contribuciones de criterios ponderados.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}

        </div>
    );
};

export default UnitsTracker;