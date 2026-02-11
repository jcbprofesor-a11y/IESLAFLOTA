import React, { useState, useMemo } from 'react';
import { Course, ScheduleSlot } from '../types';
import { Plus, Trash2, Clock, Calendar, Save, X, Edit2 } from 'lucide-react';

interface ScheduleConfiguratorProps {
  courses: Course[];
  schedule: ScheduleSlot[];
  onUpdateSchedule: (newSchedule: ScheduleSlot[]) => void;
}

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
const START_HOUR = 8; // 8:00 AM
const END_HOUR = 16;  // 16:00 PM (8 horas de rango visual)
const TOTAL_MINUTES = (END_HOUR - START_HOUR) * 60;

const ScheduleConfigurator: React.FC<ScheduleConfiguratorProps> = ({ courses, schedule, onUpdateSchedule }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeDay, setActiveDay] = useState<number>(1);
  const [editingSlotIndex, setEditingSlotIndex] = useState<number | null>(null); // Index in global schedule array
  
  // Form State
  const [formSlot, setFormSlot] = useState<Partial<ScheduleSlot>>({
    startTime: '08:00',
    endTime: '09:00',
    defaultHours: 1,
    courseId: '',
    label: ''
  });

  // --- Helpers ---

  const timeToMinutes = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };

  const getSlotStyle = (start: string, end: string) => {
    const startMin = timeToMinutes(start);
    const endMin = timeToMinutes(end);
    const startOfDayMin = START_HOUR * 60;

    // Calculate percentage from top
    const top = ((startMin - startOfDayMin) / TOTAL_MINUTES) * 100;
    // Calculate height percentage
    const height = ((endMin - startMin) / TOTAL_MINUTES) * 100;

    return {
      top: `${Math.max(0, top)}%`,
      height: `${Math.max(2, height)}%`, // Minimum visual height
    };
  };

  const getCourse = (id: string) => courses.find(c => c.id === id);

  // --- Actions ---

  const openAddModal = (dayIndex: number) => {
    setActiveDay(dayIndex);
    setEditingSlotIndex(null);
    setFormSlot({
        startTime: '08:00',
        endTime: '09:00',
        defaultHours: 1,
        courseId: '',
        label: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (slot: ScheduleSlot, globalIndex: number) => {
    setActiveDay(slot.dayOfWeek);
    setEditingSlotIndex(globalIndex);
    setFormSlot({ ...slot });
    setIsModalOpen(true);
  };

  const handleDeleteSlot = () => {
    if (editingSlotIndex === null) return;
    const newSchedule = schedule.filter((_, idx) => idx !== editingSlotIndex);
    onUpdateSchedule(newSchedule);
    setIsModalOpen(false);
  };

  const handleSaveSlot = () => {
    if (!formSlot.courseId) return;

    const newSlot: ScheduleSlot = {
        dayOfWeek: activeDay,
        startTime: formSlot.startTime || '08:00',
        endTime: formSlot.endTime || '09:00',
        courseId: formSlot.courseId,
        defaultHours: formSlot.defaultHours || 1,
        label: formSlot.label || ''
    };

    let newSchedule = [...schedule];

    if (editingSlotIndex !== null) {
        // Update existing
        newSchedule[editingSlotIndex] = newSlot;
    } else {
        // Add new
        newSchedule.push(newSlot);
    }
    
    onUpdateSchedule(newSchedule);
    setIsModalOpen(false);
  };

  // Generate background grid lines (every hour)
  const gridLines = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);

  return (
    <div className="h-full flex flex-col animate-fade-in pb-4">
      <header className="mb-6 flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
             <Calendar size={24} className="text-chef-600"/>
             Mi Horario Docente
           </h2>
           <p className="text-gray-500">Haz clic en un hueco para editar o en el botón "+" para añadir.</p>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 overflow-auto bg-gray-50 rounded-xl border border-gray-200 shadow-inner relative">
        <div className="flex min-w-[800px] h-[800px]"> {/* Fixed height for vertical scrolling */}
            
            {/* Time Labels Column */}
            <div className="w-16 flex-shrink-0 bg-white border-r border-gray-200 relative">
                 {gridLines.map((hour, i) => (
                    <div 
                        key={hour} 
                        className="absolute w-full text-right pr-2 text-xs text-gray-400 font-medium -mt-2"
                        style={{ top: `${(i / (gridLines.length - 1)) * 100}%` }}
                    >
                        {hour}:00
                    </div>
                 ))}
            </div>

            {/* Days Columns */}
            {DAYS.map((dayName, idx) => {
                const dayIndex = idx + 1;
                
                return (
                    <div key={dayIndex} className="flex-1 border-r border-gray-200 relative group bg-white">
                        {/* Column Header */}
                        <div className="sticky top-0 z-10 bg-chef-50 border-b border-gray-200 p-2 text-center font-bold text-chef-800 text-sm flex justify-between items-center">
                            <span className="flex-1">{dayName}</span>
                            <button 
                                onClick={() => openAddModal(dayIndex)}
                                className="p-1 rounded hover:bg-chef-200 text-chef-600"
                                title="Añadir clase a este día"
                            >
                                <Plus size={14} />
                            </button>
                        </div>

                        {/* Background Lines */}
                        {gridLines.map((_, i) => (
                             <div 
                                key={i} 
                                className="absolute w-full border-t border-gray-100"
                                style={{ top: `${(i / (gridLines.length - 1)) * 100}%` }}
                             />
                        ))}

                        {/* Slots */}
                        <div className="absolute inset-0 top-[37px]"> {/* Offset for header */}
                             {schedule.map((slot, globalIdx) => {
                                 if (slot.dayOfWeek !== dayIndex) return null;
                                 
                                 const style = getSlotStyle(slot.startTime, slot.endTime);
                                 const course = getCourse(slot.courseId);
                                 const bgColor = course?.color || '#a18072'; // Fallback to Chef-500

                                 return (
                                     <div
                                         key={globalIdx}
                                         onClick={() => openEditModal(slot, globalIdx)}
                                         className="absolute inset-x-1 p-2 rounded-lg border border-black/10 hover:brightness-110 hover:z-20 transition-all cursor-pointer shadow-sm overflow-hidden flex flex-col group/slot"
                                         style={{
                                             ...style,
                                             backgroundColor: bgColor
                                         }}
                                     >
                                         <div className="flex justify-between items-start">
                                            <span className="text-[10px] font-bold text-gray-800 bg-white/70 px-1 rounded shadow-sm">
                                                {slot.startTime} - {slot.endTime}
                                            </span>
                                         </div>
                                         <div className="font-bold text-xs text-white drop-shadow-md leading-tight mt-1 truncate">
                                             {course?.name || 'Módulo desconocido'}
                                         </div>
                                         <div className="text-[10px] text-white/90 truncate mt-auto font-medium">
                                             {slot.label || `${slot.defaultHours}h`}
                                         </div>

                                         <div className="absolute top-1 right-1 opacity-0 group-hover/slot:opacity-100 transition-opacity">
                                             <Edit2 size={12} className="text-white drop-shadow-sm"/>
                                         </div>
                                     </div>
                                 );
                             })}
                        </div>
                    </div>
                );
            })}
        </div>
      </div>

      {/* Modal Add/Edit Slot */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-slide-down">
                <div className="bg-chef-600 p-4 flex justify-between items-center text-white">
                    <h3 className="font-bold">
                        {editingSlotIndex !== null ? 'Editar Clase' : `Añadir Clase al ${DAYS[activeDay - 1]}`}
                    </h3>
                    <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/20 p-1 rounded">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Hora Inicio</label>
                            <input 
                                type="time" 
                                value={formSlot.startTime}
                                onChange={e => setFormSlot({...formSlot, startTime: e.target.value})}
                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-chef-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Hora Fin</label>
                            <input 
                                type="time" 
                                value={formSlot.endTime}
                                onChange={e => setFormSlot({...formSlot, endTime: e.target.value})}
                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-chef-500 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Módulo</label>
                        <select 
                            value={formSlot.courseId}
                            onChange={e => setFormSlot({...formSlot, courseId: e.target.value})}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-chef-500 outline-none bg-white"
                        >
                            <option value="">Selecciona Módulo...</option>
                            {courses.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Duración (Horas)</label>
                            <input 
                                type="number" 
                                min="1"
                                max="6"
                                value={formSlot.defaultHours}
                                onChange={e => setFormSlot({...formSlot, defaultHours: Number(e.target.value)})}
                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-chef-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Etiqueta (Opcional)</label>
                            <input 
                                type="text" 
                                placeholder="Ej: Grupo A, Taller..."
                                value={formSlot.label}
                                onChange={e => setFormSlot({...formSlot, label: e.target.value})}
                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-chef-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-between gap-2">
                        {editingSlotIndex !== null ? (
                            <button 
                                onClick={handleDeleteSlot}
                                className="px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg transition flex items-center gap-1"
                            >
                                <Trash2 size={16} /> Eliminar
                            </button>
                        ) : <div></div>}
                        
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg transition"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleSaveSlot}
                                disabled={!formSlot.courseId}
                                className="bg-chef-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-chef-700 transition disabled:opacity-50"
                            >
                                Guardar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleConfigurator;