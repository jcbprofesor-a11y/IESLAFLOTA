import React, { useState } from 'react';
import { Course, Unit, UnitStatus, ResultadoAprendizaje, CriterioEvaluacion, AsociacionCriterio } from '../types';
import { Plus, Trash2, Settings, BookOpen, Clock, AlertCircle, RefreshCw, ChefHat, GraduationCap, ChevronDown, ChevronRight, Link as LinkIcon, Layers, PieChart } from 'lucide-react';

interface CourseConfiguratorProps {
  courses: Course[];
  onUpdateCourses: (courses: Course[]) => void;
}

const CourseConfigurator: React.FC<CourseConfiguratorProps> = ({ courses, onUpdateCourses }) => {
  const [activeCourseId, setActiveCourseId] = useState<string>(courses[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'units' | 'ras'>('units');
  const [expandedRaIds, setExpandedRaIds] = useState<string[]>([]);
  const [expandedCriterionIds, setExpandedCriterionIds] = useState<string[]>([]);

  // Derived state: Always get the truth from the props
  const activeCourse = courses.find(c => c.id === activeCourseId);

  // --- IMMEDIATE UPDATE HELPERS ---

  const updateGlobalCourse = (updatedCourse: Course) => {
    const newCourses = courses.map(c => c.id === updatedCourse.id ? updatedCourse : c);
    onUpdateCourses(newCourses);
  };

  const handleSelectCourse = (id: string) => {
    setActiveCourseId(id);
    setExpandedRaIds([]); // Reset expansions
  };

  // --- GENERAL COURSE MANAGEMENT ---

  const handleAddNewCourse = () => {
    const newCourse: Course = {
      id: `new-${Date.now()}`,
      name: 'Nuevo Módulo',
      cycle: 'Ciclo Formativo',
      grade: '1º',
      weeklyHours: 0,
      annualHours: 0,
      color: '#a18072',
      units: [],
      learningResults: []
    };
    onUpdateCourses([...courses, newCourse]);
    setActiveCourseId(newCourse.id);
  };

  const handleDeleteCourse = (id: string) => {
    if (confirm('¿Estás seguro de borrar este módulo y todos sus datos?')) {
      const updated = courses.filter(c => c.id !== id);
      onUpdateCourses(updated);
      if (updated.length > 0) {
        setActiveCourseId(updated[0].id);
      } else {
        setActiveCourseId('');
      }
    }
  };

  // --- UNITS MANAGEMENT (Existing Logic) ---

  const handleAddUnit = () => {
    if (!activeCourse) return;
    const newUnit: Unit = {
      id: `u-${Date.now()}`,
      title: `UD${activeCourse.units.length + 1}: Título`,
      description: 'Descripción breve...',
      hoursPlannedTheory: 5,
      hoursPlannedPractice: 10,
      hoursRealized: 0,
      status: UnitStatus.PENDING,
      trimestres: [1]
    };
    const updatedCourse = {
      ...activeCourse,
      units: [...activeCourse.units, newUnit]
    };
    updateGlobalCourse(updatedCourse);
  };

  const handleUpdateUnit = (unitId: string, field: keyof Unit, value: any) => {
    if (!activeCourse) return;
    const updatedUnits = activeCourse.units.map(u =>
      u.id === unitId ? { ...u, [field]: value } : u
    );
    updateGlobalCourse({ ...activeCourse, units: updatedUnits });
  };

  const toggleTrimestre = (unitId: string, trim: number) => {
    if (!activeCourse) return;
    const unit = activeCourse.units.find(u => u.id === unitId);
    if (!unit) return;

    let newTrims = [...unit.trimestres];
    if (newTrims.includes(trim)) {
      if (newTrims.length > 1) {
        newTrims = newTrims.filter(t => t !== trim);
      }
    } else {
      newTrims.push(trim);
    }
    newTrims.sort();

    handleUpdateUnit(unitId, 'trimestres', newTrims);
  };

  const handleDeleteUnit = (unitId: string) => {
    if (!activeCourse) return;
    const updatedCourse = {
      ...activeCourse,
      units: activeCourse.units.filter(u => u.id !== unitId)
    };
    updateGlobalCourse(updatedCourse);
  };

  // --- LEARNING RESULTS (RA) MANAGEMENT (New Logic) ---

  const toggleRaExpansion = (raId: string) => {
    setExpandedRaIds(prev => prev.includes(raId) ? prev.filter(id => id !== raId) : [...prev, raId]);
  };

  const toggleCriterionExpansion = (critId: string) => {
    setExpandedCriterionIds(prev => prev.includes(critId) ? prev.filter(id => id !== critId) : [...prev, critId]);
  };

  const handleAddRa = () => {
    if (!activeCourse) return;
    const newRa: ResultadoAprendizaje = {
      id: `ra-${Date.now()}`,
      codigo: `RA${(activeCourse.learningResults?.length || 0) + 1}`,
      descripcion: 'Nuevo Resultado de Aprendizaje...',
      ponderacion: 0,
      criterios: []
    };
    updateGlobalCourse({
      ...activeCourse,
      learningResults: [...(activeCourse.learningResults || []), newRa]
    });
    setExpandedRaIds(prev => [...prev, newRa.id]);
  };

  const handleUpdateRa = (raId: string, field: keyof ResultadoAprendizaje, value: any) => {
    if (!activeCourse) return;
    const updatedRas = activeCourse.learningResults.map(ra =>
      ra.id === raId ? { ...ra, [field]: value } : ra
    );
    updateGlobalCourse({ ...activeCourse, learningResults: updatedRas });
  };

  const handleDeleteRa = (raId: string) => {
    if (!activeCourse) return;
    updateGlobalCourse({
      ...activeCourse,
      learningResults: activeCourse.learningResults.filter(ra => ra.id !== raId)
    });
  };

  // --- CRITERIA MANAGEMENT ---

  const handleAddCriterion = (raId: string) => {
    if (!activeCourse) return;
    const ra = activeCourse.learningResults.find(r => r.id === raId);
    if (!ra) return;

    const newCriterion: CriterioEvaluacion = {
      id: `ce-${Date.now()}`,
      codigo: `${ra.codigo.replace('RA', '').trim()}.${String.fromCharCode(97 + ra.criterios.length)}`, // 1.a, 1.b auto-naming
      descripcion: 'Descripción del criterio...',
      ponderacion: 0,
      raId: raId,
      asociaciones: []
    };

    const updatedRas = activeCourse.learningResults.map(r =>
      r.id === raId ? { ...r, criterios: [...r.criterios, newCriterion] } : r
    );
    updateGlobalCourse({ ...activeCourse, learningResults: updatedRas });
    setExpandedCriterionIds(prev => [...prev, newCriterion.id]);
  };

  const handleUpdateCriterion = (raId: string, critId: string, field: keyof CriterioEvaluacion, value: any) => {
    if (!activeCourse) return;
    const updatedRas = activeCourse.learningResults.map(ra => {
      if (ra.id !== raId) return ra;
      return {
        ...ra,
        criterios: ra.criterios.map(c => c.id === critId ? { ...c, [field]: value } : c)
      };
    });
    updateGlobalCourse({ ...activeCourse, learningResults: updatedRas });
  };

  const handleDeleteCriterion = (raId: string, critId: string) => {
    if (!activeCourse) return;
    const updatedRas = activeCourse.learningResults.map(ra => {
      if (ra.id !== raId) return ra;
      return { ...ra, criterios: ra.criterios.filter(c => c.id !== critId) };
    });
    updateGlobalCourse({ ...activeCourse, learningResults: updatedRas });
  };

  // --- ASSOCIATION (The Bridge) MANAGEMENT ---

  const handleAddAssociation = (raId: string, critId: string) => {
    if (!activeCourse) return;
    const newAssoc: AsociacionCriterio = {
      id: `assoc-${Date.now()}`,
      utId: activeCourse.units[0]?.id || '', // Default to first unit
      instruments: []
    };

    const updatedRas = activeCourse.learningResults.map(ra => {
      if (ra.id !== raId) return ra;
      return {
        ...ra,
        criterios: ra.criterios.map(c => {
          if (c.id !== critId) return c;
          return { ...c, asociaciones: [...c.asociaciones, newAssoc] };
        })
      };
    });
    updateGlobalCourse({ ...activeCourse, learningResults: updatedRas });
  };

  const handleUpdateAssociation = (raId: string, critId: string, assocId: string, field: keyof AsociacionCriterio, value: any) => {
    if (!activeCourse) return;
    const updatedRas = activeCourse.learningResults.map(ra => {
      if (ra.id !== raId) return ra;
      return {
        ...ra,
        criterios: ra.criterios.map(c => {
          if (c.id !== critId) return c;
          return {
            ...c,
            asociaciones: c.asociaciones.map(a => a.id === assocId ? { ...a, [field]: value } : a)
          };
        })
      };
    });
    updateGlobalCourse({ ...activeCourse, learningResults: updatedRas });
  };

  const handleDeleteAssociation = (raId: string, critId: string, assocId: string) => {
    if (!activeCourse) return;
    const updatedRas = activeCourse.learningResults.map(ra => {
      if (ra.id !== raId) return ra;
      return {
        ...ra,
        criterios: ra.criterios.map(c => {
          if (c.id !== critId) return c;
          return { ...c, asociaciones: c.asociaciones.filter(a => a.id !== assocId) };
        })
      };
    });
    updateGlobalCourse({ ...activeCourse, learningResults: updatedRas });
  };


  // --- Calculations ---
  const sumTheory = activeCourse?.units.reduce((acc, u) => acc + (u.hoursPlannedTheory || 0), 0) || 0;
  const sumPractice = activeCourse?.units.reduce((acc, u) => acc + (u.hoursPlannedPractice || 0), 0) || 0;
  const totalPlannedHours = sumTheory + sumPractice;
  const annualHours = activeCourse?.annualHours || 0;
  const hoursDiff = annualHours - totalPlannedHours;

  // Status Logic
  let statusColor = 'text-gray-600';
  let statusText = 'Cuadre Pendiente';
  if (totalPlannedHours > annualHours) {
    statusColor = 'text-red-500';
    statusText = `Exceso (${Math.abs(hoursDiff)}h)`;
  } else if (totalPlannedHours === annualHours && annualHours > 0) {
    statusColor = 'text-green-600';
    statusText = 'Cuadre Perfecto';
  } else {
    statusText = `Faltan asignar ${hoursDiff}h`;
  }

  return (
    <div className="flex flex-col lg:flex-row h-full gap-6 animate-fade-in pb-10">

      {/* Sidebar List of Modules */}
      <div className="w-full lg:w-1/4 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col min-h-[600px]">
        <div className="p-4 bg-chef-50 border-b border-gray-100 flex justify-between items-center flex-shrink-0">
          <h3 className="font-bold text-gray-800">Módulos</h3>
          <button onClick={handleAddNewCourse} className="p-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition">
            <Plus size={18} />
          </button>
        </div>
        <div className="flex-1 p-2 space-y-2">
          {courses.map(course => (
            <div
              key={course.id}
              onClick={() => handleSelectCourse(course.id)}
              className={`p-3 rounded-lg cursor-pointer transition-all border ${activeCourseId === course.id
                ? 'bg-chef-600 text-white border-chef-600 shadow-md'
                : 'bg-white hover:bg-gray-50 border-gray-100'
                }`}
            >
              <div className="font-bold text-sm truncate">{course.name}</div>
              <div className={`text-xs ${activeCourseId === course.id ? 'text-chef-100' : 'text-gray-500'}`}>
                {course.cycle} • {course.grade}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Edit Panel */}
      <div className="w-full lg:w-3/4 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col min-h-[600px]">
        {activeCourse ? (
          <>
            <div className="p-6 border-b border-gray-100 bg-white flex-shrink-0">
              {/* Header & Meta Data */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Settings size={20} className="text-gray-400" />
                    <input
                      type="text"
                      value={activeCourse.name}
                      onChange={(e) => updateGlobalCourse({ ...activeCourse, name: e.target.value })}
                      className="text-xl font-black text-gray-800 bg-transparent border-b-2 border-transparent hover:border-gray-200 focus:border-chef-500 focus:outline-none transition-colors w-full px-1"
                      placeholder="Nombre del Módulo"
                    />
                  </div>
                  <div className="flex gap-2 ml-7">
                    <input
                      type="text"
                      value={activeCourse.cycle}
                      onChange={(e) => updateGlobalCourse({ ...activeCourse, cycle: e.target.value })}
                      className="text-xs font-bold text-gray-500 bg-gray-50 border border-gray-200 rounded px-2 py-1 w-32 focus:border-chef-500 focus:outline-none"
                      placeholder="Ciclo/Curso"
                    />
                    <input
                      type="text"
                      value={activeCourse.grade}
                      onChange={(e) => updateGlobalCourse({ ...activeCourse, grade: e.target.value })}
                      className="text-xs font-bold text-gray-500 bg-gray-50 border border-gray-200 rounded px-2 py-1 w-20 focus:border-chef-500 focus:outline-none"
                      placeholder="Grado"
                    />
                  </div>
                  <p className="text-[10px] text-green-600 font-bold flex items-center gap-1 mt-2 ml-7">
                    <RefreshCw size={10} className="animate-spin-slow" />
                    Auto-guardado activo
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteCourse(activeCourse.id)}
                  className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition"
                  title="Borrar Módulo"
                >
                  <Trash2 size={20} />
                </button>
              </div>

              {/* TABS NAVIGATION */}
              <div className="flex border-b border-gray-200 mt-4">
                <button
                  onClick={() => setActiveTab('units')}
                  className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'units' ? 'border-chef-600 text-chef-800' : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                  <Layers size={16} /> Unidades de Trabajo (UT)
                </button>
                <button
                  onClick={() => setActiveTab('ras')}
                  className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'ras' ? 'border-chef-600 text-chef-800' : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                  <GraduationCap size={16} /> Evaluación (RA / Criterios)
                </button>
              </div>
            </div>

            {/* CONTENT AREA */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">

              {/* --- TAB 1: UNITS --- */}
              {activeTab === 'units' && (
                <div className="space-y-4">

                  {/* --- NEW SUMMARY BOX (THE RED BOX REPLACEMENT) --- */}
                  <div className="bg-white p-5 rounded-xl border-2 border-gray-100 shadow-sm mb-6 flex flex-col md:flex-row gap-6 items-center justify-between">

                    {/* 1. Input Total Hours */}
                    <div className="flex-1 w-full md:w-auto">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
                        <Clock size={12} /> Horas Totales Módulo (BOE)
                      </label>
                      <input
                        type="number"
                        value={activeCourse.annualHours}
                        onChange={(e) => updateGlobalCourse({ ...activeCourse, annualHours: Number(e.target.value) })}
                        className="w-full p-2.5 text-lg border-2 border-gray-200 rounded-lg font-black text-gray-800 focus:border-chef-500 focus:ring-4 focus:ring-chef-100 outline-none transition-all"
                        placeholder="0"
                      />
                    </div>

                    {/* 2. Visual Breakdown */}
                    <div className="flex gap-4 items-center flex-1 justify-center w-full">
                      <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-100 text-center min-w-[100px]">
                        <span className="block text-[10px] font-bold text-blue-500 uppercase mb-0.5"><BookOpen size={10} className="inline mr-1" />Teoría</span>
                        <span className="text-2xl font-black text-blue-700 leading-none">{sumTheory}<span className="text-sm font-medium text-blue-400">h</span></span>
                      </div>
                      <div className="text-gray-300 font-light text-2xl">+</div>
                      <div className="bg-orange-50 px-4 py-2 rounded-lg border border-orange-100 text-center min-w-[100px]">
                        <span className="block text-[10px] font-bold text-orange-500 uppercase mb-0.5"><ChefHat size={10} className="inline mr-1" />Práctica</span>
                        <span className="text-2xl font-black text-orange-700 leading-none">{sumPractice}<span className="text-sm font-medium text-orange-400">h</span></span>
                      </div>
                    </div>

                    {/* 3. Balance Status */}
                    <div className="flex-1 w-full text-right border-l-2 border-gray-100 pl-6">
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Total Asignado</p>
                      <div className="flex items-baseline justify-end gap-1">
                        <span className={`text-3xl font-black ${totalPlannedHours > annualHours ? 'text-red-500' : 'text-gray-800'}`}>
                          {totalPlannedHours}
                        </span>
                        <span className="text-sm text-gray-400 font-medium">/ {annualHours} h</span>
                      </div>
                      <p className={`text-xs font-bold mt-1 ${statusColor}`}>{statusText}</p>
                    </div>
                  </div>
                  {/* --- END SUMMARY BOX --- */}

                  <div className="flex justify-between items-center mb-2">
                    <p className="text-xs text-gray-500 font-medium italic">Distribuye las horas entre las unidades abajo.</p>
                    <button onClick={handleAddUnit} className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition flex items-center gap-1 shadow-sm font-bold">
                      <Plus size={16} /> Nueva UT
                    </button>
                  </div>

                  {activeCourse.units.map((unit) => (
                    <div key={unit.id} className="flex flex-col md:flex-row gap-3 p-4 border border-gray-200 rounded-lg hover:border-chef-300 transition-colors bg-white shadow-sm">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
                        {/* Title */}
                        <div className="md:col-span-4">
                          <label className="block text-[10px] uppercase text-gray-400 font-bold mb-1">Título UD</label>
                          <input
                            type="text"
                            value={unit.title}
                            onChange={(e) => handleUpdateUnit(unit.id, 'title', e.target.value)}
                            className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-chef-500 font-bold text-gray-700"
                          />
                        </div>
                        {/* Description */}
                        <div className="md:col-span-4">
                          <label className="block text-[10px] uppercase text-gray-400 font-bold mb-1">Contenido</label>
                          <input
                            type="text"
                            value={unit.description}
                            onChange={(e) => handleUpdateUnit(unit.id, 'description', e.target.value)}
                            className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-chef-500"
                          />
                        </div>
                        {/* Hours Theory */}
                        <div className="md:col-span-1">
                          <label className="block text-[10px] uppercase text-blue-600 font-bold mb-1 flex items-center gap-1"><BookOpen size={10} /> Teor</label>
                          <input
                            type="number"
                            value={unit.hoursPlannedTheory}
                            onChange={(e) => handleUpdateUnit(unit.id, 'hoursPlannedTheory', Number(e.target.value))}
                            className="w-full p-2 text-sm border border-blue-200 bg-blue-50 rounded text-center font-bold text-blue-700 focus:ring-2 focus:ring-blue-200 outline-none"
                          />
                        </div>
                        {/* Hours Practice */}
                        <div className="md:col-span-1">
                          <label className="block text-[10px] uppercase text-orange-600 font-bold mb-1 flex items-center gap-1"><ChefHat size={10} /> Prác</label>
                          <input
                            type="number"
                            value={unit.hoursPlannedPractice}
                            onChange={(e) => handleUpdateUnit(unit.id, 'hoursPlannedPractice', Number(e.target.value))}
                            className="w-full p-2 text-sm border border-orange-200 bg-orange-50 rounded text-center font-bold text-orange-700 focus:ring-2 focus:ring-orange-200 outline-none"
                          />
                        </div>
                        {/* Trimestres */}
                        <div className="md:col-span-2">
                          <label className="block text-[10px] uppercase text-gray-400 font-bold mb-1">Trim</label>
                          <div className="flex gap-1">
                            {[1, 2, 3].map(t => (
                              <button
                                key={t}
                                onClick={() => toggleTrimestre(unit.id, t)}
                                className={`flex-1 flex items-center justify-center p-1.5 rounded text-[10px] border font-bold transition-all ${unit.trimestres.includes(t) ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'}`}
                              >
                                {t}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteUnit(unit.id)} className="text-gray-300 hover:text-red-500 self-center p-2"><Trash2 size={18} /></button>
                    </div>
                  ))}
                  {activeCourse.units.length === 0 && <div className="text-center py-8 text-gray-400 italic">No hay unidades definidas.</div>}
                </div>
              )}

              {/* --- TAB 2: LEARNING RESULTS (RA) --- */}
              {activeTab === 'ras' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-xs text-gray-500 font-medium">Define los RA, Criterios y vincúlalos a las UTs.</p>
                    <button onClick={handleAddRa} className="text-sm bg-chef-600 text-white px-3 py-1.5 rounded hover:bg-chef-700 transition flex items-center gap-1 shadow-sm">
                      <Plus size={16} /> Nuevo RA
                    </button>
                  </div>

                  {(!activeCourse.learningResults || activeCourse.learningResults.length === 0) && (
                    <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-lg">
                      <GraduationCap className="mx-auto text-gray-300 mb-2" size={32} />
                      <p className="text-gray-400 text-sm">No hay Resultados de Aprendizaje definidos.</p>
                    </div>
                  )}

                  {activeCourse.learningResults?.map(ra => (
                    <div key={ra.id} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                      {/* RA Header */}
                      <div className="bg-gray-50 p-3 flex items-center gap-3 border-b border-gray-200">
                        <button onClick={() => toggleRaExpansion(ra.id)} className="text-gray-500 hover:text-chef-600">
                          {expandedRaIds.includes(ra.id) ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                        </button>
                        <input
                          type="text"
                          value={ra.codigo}
                          onChange={(e) => handleUpdateRa(ra.id, 'codigo', e.target.value)}
                          className="w-16 font-black text-chef-800 bg-transparent border-b border-transparent focus:border-chef-500 outline-none"
                        />
                        <input
                          type="text"
                          value={ra.descripcion}
                          onChange={(e) => handleUpdateRa(ra.id, 'descripcion', e.target.value)}
                          className="flex-1 font-medium text-gray-800 bg-transparent border-b border-transparent focus:border-chef-500 outline-none"
                        />
                        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded px-2 py-1">
                          <span className="text-xs font-bold text-gray-500">% RA:</span>
                          <input
                            type="number"
                            value={ra.ponderacion}
                            onChange={(e) => handleUpdateRa(ra.id, 'ponderacion', Number(e.target.value))}
                            className="w-10 text-xs font-bold text-center outline-none"
                          />
                        </div>
                        <button onClick={() => handleDeleteRa(ra.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                      </div>

                      {/* RA Content (Criteria) */}
                      {expandedRaIds.includes(ra.id) && (
                        <div className="p-4 bg-gray-50/30 space-y-4">
                          <div className="flex justify-between items-center">
                            <h4 className="text-xs font-bold uppercase text-gray-400">Criterios de Evaluación</h4>
                            <button onClick={() => handleAddCriterion(ra.id)} className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-bold">
                              <Plus size={14} /> Añadir Criterio
                            </button>
                          </div>

                          {ra.criterios.map(crit => (
                            <div key={crit.id} className="ml-4 pl-4 border-l-2 border-gray-200 space-y-2">
                              {/* Criterion Row */}
                              <div className="flex gap-3 items-start">
                                <button onClick={() => toggleCriterionExpansion(crit.id)} className="mt-1 text-gray-400 hover:text-blue-600">
                                  {expandedCriterionIds.includes(crit.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                </button>
                                <input
                                  type="text"
                                  value={crit.codigo}
                                  onChange={(e) => handleUpdateCriterion(ra.id, crit.id, 'codigo', e.target.value)}
                                  className="w-12 text-sm font-bold text-gray-600 bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none"
                                />
                                <input
                                  type="text"
                                  value={crit.descripcion}
                                  onChange={(e) => handleUpdateCriterion(ra.id, crit.id, 'descripcion', e.target.value)}
                                  className="flex-1 text-sm text-gray-700 bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none"
                                />
                                <input
                                  type="number"
                                  value={crit.ponderacion}
                                  onChange={(e) => handleUpdateCriterion(ra.id, crit.id, 'ponderacion', Number(e.target.value))}
                                  className="w-12 text-sm text-center border-b border-gray-300 focus:border-blue-500 outline-none"
                                  placeholder="%"
                                />
                                <button onClick={() => handleDeleteCriterion(ra.id, crit.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={14} /></button>
                              </div>

                              {/* Associations (The Bridge) */}
                              {expandedCriterionIds.includes(crit.id) && (
                                <div className="mt-2 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-bold text-blue-600 uppercase flex items-center gap-1">
                                      <LinkIcon size={10} /> Vinculación con Unidades (UT)
                                    </span>
                                    <button onClick={() => handleAddAssociation(ra.id, crit.id)} className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded hover:bg-blue-200 font-bold">
                                      + Vincular
                                    </button>
                                  </div>

                                  {crit.asociaciones.length === 0 && <p className="text-xs text-gray-400 italic">Este criterio aún no se evalúa en ninguna UT.</p>}

                                  {crit.asociaciones.map(assoc => (
                                    <div key={assoc.id} className="flex gap-2 mb-2 items-center">
                                      <select
                                        value={assoc.utId}
                                        onChange={(e) => handleUpdateAssociation(ra.id, crit.id, assoc.id, 'utId', e.target.value)}
                                        className="flex-1 text-xs p-1.5 border border-gray-300 rounded bg-white"
                                      >
                                        <option value="">Seleccionar UT...</option>
                                        {activeCourse.units.map(u => (
                                          <option key={u.id} value={u.id}>{u.title}</option>
                                        ))}
                                      </select>
                                      <div className="flex-1">
                                        {/* Simple Multi-select simulation using native select multiple or just text for now to keep it simple as requested */}
                                        <input
                                          type="text"
                                          placeholder="Instrumentos (sep. por comas)"
                                          value={assoc.instruments.join(', ')}
                                          onChange={(e) => handleUpdateAssociation(ra.id, crit.id, assoc.id, 'instruments', e.target.value.split(',').map(s => s.trim()))}
                                          className="w-full text-xs p-1.5 border border-gray-300 rounded"
                                        />
                                      </div>
                                      <button onClick={() => handleDeleteAssociation(ra.id, crit.id, assoc.id)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <Settings size={48} className="mb-4 opacity-20" />
            <p>Selecciona un módulo para editar su configuración</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseConfigurator;