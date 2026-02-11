import React, { useState, useMemo } from 'react';
import { CalendarEvent, LegendItem, ClassLog, ScheduleSlot, Course, SchoolInfo, Exam } from '../types';
import { Download, Plus, Trash2, X, Settings, CheckSquare, Square, Lock, Unlock, Eye, AlertCircle, NotebookPen, Calendar, GraduationCap } from 'lucide-react';
import { INITIAL_LEGEND_ITEMS, CALENDAR_EVENTS } from '../constants';

interface CalendarViewProps {
  events: CalendarEvent[];
  logs: ClassLog[];
  exams: Exam[];
  schedule: ScheduleSlot[];
  courses: Course[];
  schoolInfo: SchoolInfo;
  onNavigateToJournal: (date: string) => void;
  // New props for persisted lock state
  isLocked: boolean;
  onToggleLock: (locked: boolean) => void;
}

const PRESET_COLORS = [
  '#DC2626', // Red
  '#EA580C', // Orange
  '#FBBF24', // Amber
  '#FBCFE8', // Pink Light
  '#F472B6', // Pink
  '#A3E635', // Lime
  '#16A34A', // Green
  '#22D3EE', // Cyan
  '#2563EB', // Blue
  '#9333EA', // Purple
  '#F3E5AB', // Custom Beige
  '#94A3B8', // Slate
  '#1E293B', // Dark Slate
];

const CalendarView: React.FC<CalendarViewProps> = ({ 
  events: initialEvents, 
  logs, 
  exams,
  schedule, 
  courses, 
  schoolInfo, 
  onNavigateToJournal,
  isLocked,
  onToggleLock
}) => {
  // State
  const [legendItems, setLegendItems] = useState<LegendItem[]>(INITIAL_LEGEND_ITEMS);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(initialEvents || CALENDAR_EVENTS);
  
  // UI State
  const [showLegendEditor, setShowLegendEditor] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  // New Legend Item Form
  const [newLabel, setNewLabel] = useState('');
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);

  // --- Logic Helpers ---

  // 1. Calculate Academic Year Start based on schoolInfo string (e.g., "2025-2026")
  const startYear = useMemo(() => {
    // Try to find the first 4-digit number
    const match = schoolInfo.academicYear.match(/\d{4}/);
    return match ? parseInt(match[0]) : new Date().getFullYear();
  }, [schoolInfo.academicYear]);

  // 2. Generate Months dynamically based on startYear
  const monthsOrder = useMemo(() => {
    return [
      { name: 'Septiembre', year: startYear, monthIdx: 8 },
      { name: 'Octubre', year: startYear, monthIdx: 9 },
      { name: 'Noviembre', year: startYear, monthIdx: 10 },
      { name: 'Diciembre', year: startYear, monthIdx: 11 },
      { name: 'Enero', year: startYear + 1, monthIdx: 0 },
      { name: 'Febrero', year: startYear + 1, monthIdx: 1 },
      { name: 'Marzo', year: startYear + 1, monthIdx: 2 },
      { name: 'Abril', year: startYear + 1, monthIdx: 3 },
      { name: 'Mayo', year: startYear + 1, monthIdx: 4 },
      { name: 'Junio', year: startYear + 1, monthIdx: 5 },
    ];
  }, [startYear]);

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => {
    // JS Date.getDay(): 0=Sun, 1=Mon... 6=Sat
    // We want Mon=0, Tue=1... Sun=6
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const getEventsForDate = (dateStr: string) => {
    return calendarEvents.filter(e => e.date === dateStr);
  };
  
  const getExamsForDate = (dateStr: string) => {
      return exams.filter(e => e.date === dateStr);
  };

  const getLegendItem = (id: string) => legendItems.find(i => i.id === id);

  // --- Tracking Logic (For Locked Mode) ---

  const getDayStatus = (dateStr: string) => {
    const date = new Date(dateStr);
    let dayOfWeek = date.getDay(); 
    if (dayOfWeek === 0) dayOfWeek = 7; // Convert Sun=0 to Sun=7 to match schedule logic

    // 1. Check if it's a "Free" day (Holiday or Weekend)
    const dayEvents = getEventsForDate(dateStr);
    // Assume if it has an event with red color (often holidays), it's not a class day. 
    const isHoliday = dayEvents.some(e => {
        const item = getLegendItem(e.legendItemId);
        return item?.color === '#DC2626' || item?.label.toLowerCase().includes('festivo') || item?.label.toLowerCase().includes('inicio');
    });

    // Weekends (Saturday=6, Sunday=7 in our converted logic)
    if (dayOfWeek > 5 || isHoliday) return { status: 'FREE', planned: 0, logged: 0 };

    // 2. Calculate Planned Hours
    const dailySlots = schedule.filter(s => s.dayOfWeek === dayOfWeek);
    const plannedHours = dailySlots.reduce((acc, slot) => acc + slot.defaultHours, 0);

    if (plannedHours === 0) return { status: 'FREE', planned: 0, logged: 0 };

    // 3. Calculate Logged Hours (Classes + Exams)
    const dailyLogs = logs.filter(l => l.date === dateStr);
    const dailyExams = exams.filter(e => e.date === dateStr);
    
    // Sum hours from logs
    const classHours = dailyLogs.reduce((acc, l) => acc + l.hours, 0);
    // Sum hours from exams (default to 1 if undefined for legacy compatibility)
    const examHours = dailyExams.reduce((acc, e) => acc + (e.duration || 1), 0);
    
    const loggedHours = classHours + examHours;

    // 4. Determine Status
    let status: 'COMPLETED' | 'PARTIAL' | 'MISSING' = 'MISSING';
    if (loggedHours >= plannedHours) status = 'COMPLETED';
    else if (loggedHours > 0) status = 'PARTIAL';

    return { status, planned: plannedHours, logged: loggedHours, logs: dailyLogs };
  };

  // --- Actions ---

  const handleAddLegendItem = () => {
    if (!newLabel.trim()) return;
    const newItem: LegendItem = {
      id: `leg-${Date.now()}`,
      label: newLabel,
      color: newColor
    };
    setLegendItems([...legendItems, newItem]);
    setNewLabel('');
  };

  const handleDeleteLegendItem = (id: string) => {
    setLegendItems(legendItems.filter(i => i.id !== id));
    // Also remove events associated with this legend item
    setCalendarEvents(calendarEvents.filter(e => e.legendItemId !== id));
  };

  const toggleEventOnDate = (dateStr: string, legendItemId: string) => {
    if (isLocked) return; // Prevention
    const existing = calendarEvents.find(e => e.date === dateStr && e.legendItemId === legendItemId);
    if (existing) {
      setCalendarEvents(calendarEvents.filter(e => e.id !== existing.id));
    } else {
      setCalendarEvents([...calendarEvents, {
        id: `evt-${Date.now()}-${Math.random()}`,
        date: dateStr,
        legendItemId
      }]);
    }
  };

  const downloadICS = () => {
    let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//CuliPlan//NONSGML v1.0//EN\n";
    // Events
    calendarEvents.forEach(event => {
      const legend = getLegendItem(event.legendItemId);
      if (!legend) return;
      const dateStr = event.date.replace(/-/g, '');
      icsContent += "BEGIN:VEVENT\n";
      icsContent += `DTSTART;VALUE=DATE:${dateStr}\n`;
      icsContent += `SUMMARY:${legend.label}\n`;
      icsContent += "END:VEVENT\n";
    });
    // Exams
    exams.forEach(exam => {
        const course = courses.find(c => c.id === exam.courseId);
        const dateStr = exam.date.replace(/-/g, '');
        icsContent += "BEGIN:VEVENT\n";
        icsContent += `DTSTART;VALUE=DATE:${dateStr}\n`;
        icsContent += `SUMMARY:EXAMEN ${exam.type} - ${course?.name || ''}\n`;
        icsContent += `DESCRIPTION:${exam.topics}\n`;
        icsContent += "END:VEVENT\n";
    });

    icsContent += "END:VCALENDAR";
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `calendario_escolar_${startYear}_${startYear+1}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10 relative">
      <header className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 uppercase tracking-wide flex items-center gap-2">
            Calendario Escolar {startYear}-{startYear+1}
            {isLocked ? <Lock size={20} className="text-chef-600"/> : <Unlock size={20} className="text-gray-400"/>}
          </h2>
          <p className="text-sm text-gray-500">
            {isLocked 
              ? "Modo Seguimiento: Visualiza el cumplimiento de tu programación." 
              : "Modo Edición: Configura los festivos y fechas clave."}
          </p>
        </div>
        <div className="flex gap-2 items-center">
           {/* Lock Toggle */}
           <div className="flex items-center bg-gray-100 rounded-lg p-1 mr-4">
              <button 
                onClick={() => onToggleLock(false)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${!isLocked ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Editar
              </button>
              <button 
                onClick={() => onToggleLock(true)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${isLocked ? 'bg-chef-600 shadow text-white' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Bloquear / Seguimiento
              </button>
           </div>

           {!isLocked && (
            <button 
                onClick={() => setShowLegendEditor(!showLegendEditor)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium border ${showLegendEditor ? 'bg-gray-200 text-gray-800 border-gray-300' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
            >
                <Settings size={16} /> {showLegendEditor ? 'Ocultar' : 'Leyenda'}
            </button>
           )}
          <button 
            onClick={downloadICS}
            className="flex items-center gap-2 bg-gray-800 text-white px-3 py-2 rounded-lg hover:bg-gray-900 transition-colors text-sm font-medium shadow-sm"
          >
            <Download size={16} /> ICS
          </button>
        </div>
      </header>

      {/* Editor de Leyenda (Solo en modo Edición) */}
      {showLegendEditor && !isLocked && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-md animate-slide-down mb-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Settings size={18} /> Configurar Epígrafes (Leyenda)
          </h3>
          
          <div className="flex flex-wrap gap-4 mb-6 items-end p-4 bg-gray-50 rounded-lg border border-gray-100">
             <div className="flex-1 min-w-[200px]">
               <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Nombre del Epígrafe</label>
               <input 
                  type="text" 
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="Ej: Festivo Local, Examen sorpresa..." 
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-chef-500 outline-none text-sm"
               />
             </div>
             <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Color</label>
                <div className="flex gap-1">
                   {PRESET_COLORS.map(c => (
                     <button
                       key={c}
                       onClick={() => setNewColor(c)}
                       className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${newColor === c ? 'border-gray-800 scale-110' : 'border-transparent'}`}
                       style={{ backgroundColor: c }}
                     />
                   ))}
                </div>
             </div>
             <button 
                onClick={handleAddLegendItem}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm font-medium flex items-center gap-1"
             >
               <Plus size={16} /> Añadir
             </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
             {legendItems.map(item => (
               <div key={item.id} className="flex items-center justify-between p-2 rounded border border-gray-100 bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded shadow-sm" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm font-medium text-gray-700">{item.label}</span>
                  </div>
                  <button onClick={() => handleDeleteLegendItem(item.id)} className="text-gray-400 hover:text-red-500">
                    <Trash2 size={16} />
                  </button>
               </div>
             ))}
          </div>
        </div>
      )}

      {/* Grid de Meses */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 select-none">
        {monthsOrder.map(({ name, year, monthIdx }) => {
          const daysInMonth = getDaysInMonth(year, monthIdx);
          const firstDayOffset = getFirstDayOfMonth(year, monthIdx);
          const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
          const blanks = Array.from({ length: firstDayOffset }, (_, i) => i);

          return (
            <div key={`${name}-${year}`} className="bg-white border border-gray-300 shadow-sm">
              <div className="bg-[#0070C0] text-white text-center py-1 font-bold uppercase tracking-wider text-sm flex justify-between px-3">
                <span>{name}</span>
                <span className="opacity-70 text-xs mt-0.5">{year}</span>
              </div>
              <div className="grid grid-cols-7 border-b border-gray-300 bg-gray-100 text-xs font-bold text-center py-1">
                <span>L</span><span>M</span><span>X</span><span>J</span><span>V</span><span>S</span><span>D</span>
              </div>
              <div className="grid grid-cols-7 text-sm">
                {blanks.map((_, i) => (
                  <div key={`blank-${i}`} className="h-8 border-b border-r border-gray-100 bg-gray-50"></div>
                ))}
                {days.map(day => {
                  const dateStr = `${year}-${String(monthIdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const dayEvents = getEventsForDate(dateStr);
                  const dayExams = getExamsForDate(dateStr);
                  const isWeekend = (firstDayOffset + day - 1) % 7 >= 5;
                  
                  // Visual Logic
                  const primaryEvent = dayEvents.length > 0 ? getLegendItem(dayEvents[0].legendItemId) : null;
                  const hasExams = dayExams.length > 0;
                  const hasMultiple = dayEvents.length > 1;

                  // --- LOCKED MODE LOGIC ---
                  let trackingBgClass = '';
                  
                  if (isLocked) {
                      const { status } = getDayStatus(dateStr);
                      if (status === 'COMPLETED') trackingBgClass = 'bg-green-100'; // Green light
                      else if (status === 'PARTIAL') trackingBgClass = 'bg-orange-100'; // Orange light
                      else if (status === 'MISSING') trackingBgClass = 'bg-red-50'; // Red light (alert)
                      else if (status === 'FREE') trackingBgClass = isWeekend ? 'bg-gray-100' : 'bg-white';
                  }

                  const cellStyle = {
                    backgroundColor: !hasMultiple && primaryEvent 
                        ? primaryEvent.color 
                        : (isLocked && trackingBgClass ? undefined : undefined), // Allow class to set bg if no event
                    color: !hasMultiple && primaryEvent ? '#000' : undefined 
                  };

                  return (
                    <div 
                      key={day} 
                      onClick={() => setSelectedDate(dateStr)}
                      className={`h-10 flex flex-col items-center justify-start pt-1 border-b border-r border-gray-200 relative group cursor-pointer transition-colors
                        ${!primaryEvent && isWeekend && !trackingBgClass ? 'bg-gray-100 text-gray-400' : ''}
                        ${!primaryEvent && isLocked ? trackingBgClass : ''}
                        ${!primaryEvent && !isLocked && !isWeekend ? 'hover:bg-blue-50' : ''}
                      `}
                      style={cellStyle}
                    >
                      <span className={`font-medium leading-none z-10 ${primaryEvent && !hasMultiple ? 'text-black drop-shadow-sm' : ''}`}>{day}</span>
                      
                      {/* EXAM INDICATOR */}
                      {hasExams && (
                          <div className="absolute top-0.5 right-0.5 z-20">
                              <GraduationCap size={12} className="text-purple-700 drop-shadow-sm fill-purple-100" />
                          </div>
                      )}

                      {/* Multiple Events Indicator */}
                      {hasMultiple && (
                        <div className="flex gap-0.5 mt-1 w-full px-1 justify-center flex-wrap h-4 overflow-hidden">
                           {dayEvents.map(e => {
                             const l = getLegendItem(e.legendItemId);
                             if(!l) return null;
                             return (
                               <div key={e.id} className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: l.color }} title={l.label}></div>
                             );
                           })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Leyenda Visual (Visible siempre, incluso en Bloqueo) */}
      {!showLegendEditor && (
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                {isLocked ? "Leyenda de Eventos y Estados" : "Leyenda Activa"}
            </h4>
            <div className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                    {legendItems.map((item) => (
                        <div key={item.id} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                            <span className="text-xs text-gray-600">{item.label}</span>
                        </div>
                    ))}
                    {/* EXAM LEGEND */}
                    <div className="flex items-center gap-2">
                         <GraduationCap size={16} className="text-purple-700"/>
                         <span className="text-xs text-gray-600 font-bold">Examen / Prueba</span>
                    </div>
                </div>
                
                {/* Leyenda Visual (Modo Seguimiento - Adicional) */}
                {isLocked && (
                    <div className="flex flex-wrap gap-4 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-green-100 border border-green-200"></div>
                            <span className="text-xs text-gray-600 font-medium">Clases Completadas</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-orange-100 border border-orange-200"></div>
                            <span className="text-xs text-gray-600 font-medium">Parcial</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-red-50 border border-red-100"></div>
                            <span className="text-xs text-gray-600 font-medium">Sin Rellenar (Pendiente)</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
      )}

      {/* Modal Genérico */}
      {selectedDate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
              <div className={`${isLocked ? 'bg-gray-800' : 'bg-chef-600'} p-4 flex justify-between items-center text-white`}>
                 <h3 className="font-bold text-lg flex items-center gap-2">
                    {isLocked && <Eye size={20}/>}
                    {new Date(selectedDate).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                 </h3>
                 <button onClick={() => setSelectedDate(null)} className="hover:bg-white/20 p-1 rounded">
                   <X size={20} />
                 </button>
              </div>
              
              <div className="p-4 max-h-[60vh] overflow-y-auto">
                 {isLocked ? (
                     // --- CONTENIDO MODAL EN MODO SEGUIMIENTO ---
                     (() => {
                        const { status, planned, logged, logs: dayLogs } = getDayStatus(selectedDate);
                        
                        // Check for Legend Events on this day
                        const dayEvents = getEventsForDate(selectedDate);
                        const eventItems = dayEvents.map(e => getLegendItem(e.legendItemId)).filter(Boolean);
                        
                        // Check for Exams
                        const dayExams = getExamsForDate(selectedDate);

                        return (
                            <div className="space-y-4">
                                {/* Display Events if any */}
                                {eventItems.length > 0 && (
                                    <div className="mb-4 space-y-2">
                                        {eventItems.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-2 bg-gray-50 p-2 rounded border border-gray-100">
                                                <Calendar size={16} style={{ color: item?.color }} />
                                                <span className="font-bold text-gray-700">{item?.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Display Exams if any */}
                                {dayExams.length > 0 && (
                                    <div className="mb-4">
                                        <h4 className="font-bold text-xs text-purple-700 uppercase mb-2">Pruebas Evaluables</h4>
                                        {dayExams.map(ex => {
                                            const exCourse = courses.find(c => c.id === ex.courseId);
                                            return (
                                                <div key={ex.id} className="p-3 bg-purple-50 border border-purple-100 rounded-lg mb-2">
                                                    <div className="font-bold text-purple-900 text-sm">{exCourse?.name}</div>
                                                    <div className="text-xs text-purple-700 mt-1 flex justify-between">
                                                        <span><span className="font-bold bg-white px-1 rounded">{ex.type}</span> • {ex.unitIds.length} UDs</span>
                                                        <span className="font-bold text-gray-800">{ex.duration || 1} h</span>
                                                    </div>
                                                    <p className="text-xs text-gray-600 mt-1 italic">{ex.topics}</p>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}

                                {/* Status Stats */}
                                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <div className="text-center flex-1 border-r border-gray-200">
                                        <p className="text-xs text-gray-500 uppercase">Planificado</p>
                                        <p className="text-xl font-bold text-gray-800">{planned}h</p>
                                    </div>
                                    <div className="text-center flex-1">
                                        <p className="text-xs text-gray-500 uppercase">Registrado</p>
                                        <p className={`text-xl font-bold ${logged < planned ? 'text-red-500' : 'text-green-600'}`}>{logged}h</p>
                                    </div>
                                </div>

                                {/* Logs List */}
                                {dayLogs && dayLogs.length > 0 ? (
                                    <div>
                                        <h4 className="font-bold text-sm text-gray-700 mb-2">Clases Impartidas:</h4>
                                        <div className="space-y-2">
                                            {dayLogs.map((log, idx) => (
                                                <div key={idx} className="text-sm p-3 bg-white border border-gray-200 rounded shadow-sm">
                                                    <div className="font-bold text-chef-800">
                                                        {courses.find(c => c.id === log.courseId)?.name}
                                                    </div>
                                                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                                                        <span>{log.hours}h ({log.type})</span>
                                                        <span className="italic">{log.status}</span>
                                                    </div>
                                                    {log.notes && <p className="mt-2 text-xs bg-gray-50 p-2 rounded italic text-gray-600">"{log.notes}"</p>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-6 text-gray-400 bg-gray-50 rounded-lg border border-gray-100 border-dashed">
                                        <AlertCircle size={32} className="mb-2 opacity-50"/>
                                        <p className="font-bold">Sin registros de clase</p>
                                        {status !== 'FREE' && (
                                            <p className="text-xs text-center px-4 mt-1 text-red-400">Faltan {planned} horas por registrar.</p>
                                        )}
                                    </div>
                                )}

                                {/* ACTION BUTTON: Navigate to Journal (Always available now) */}
                                <button 
                                    onClick={() => onNavigateToJournal(selectedDate)}
                                    className="w-full bg-chef-600 text-white py-3 rounded-lg font-bold shadow-md hover:bg-chef-700 transition-transform hover:scale-[1.02] flex items-center justify-center gap-2"
                                >
                                    <NotebookPen size={20} />
                                    {logged < planned ? "Rellenar Registro Diario" : "Editar/Añadir Registros"}
                                </button>
                            </div>
                        );
                     })()
                 ) : (
                     // --- CONTENIDO MODAL EN MODO EDICIÓN ---
                     <>
                        <p className="text-sm text-gray-500 mb-4">Selecciona los epígrafes que aplican a este día:</p>
                        <div className="space-y-2">
                            {legendItems.map(item => {
                            const isSelected = calendarEvents.some(e => e.date === selectedDate && e.legendItemId === item.id);
                            return (
                                <button 
                                    key={item.id}
                                    onClick={() => toggleEventOnDate(selectedDate, item.id)}
                                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                                    isSelected 
                                        ? 'border-chef-500 bg-chef-50' 
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded border border-gray-200 shadow-sm" style={{ backgroundColor: item.color }}></div>
                                        <span className={`text-sm font-medium ${isSelected ? 'text-chef-900' : 'text-gray-700'}`}>{item.label}</span>
                                    </div>
                                    {isSelected ? <CheckSquare className="text-chef-600" size={20} /> : <Square className="text-gray-300" size={20} />}
                                </button>
                            )
                            })}
                        </div>
                     </>
                 )}
              </div>
              
              <div className="p-4 bg-gray-50 text-right border-t border-gray-100">
                 <button 
                   onClick={() => setSelectedDate(null)}
                   className={`${isLocked ? 'bg-gray-800 hover:bg-gray-900' : 'bg-chef-600 hover:bg-chef-700'} text-white px-6 py-2 rounded-lg font-medium transition-colors`}
                 >
                   Cerrar
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;