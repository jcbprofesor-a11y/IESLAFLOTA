import React, { useState } from 'react';
import { BackupData, Course, ScheduleSlot, ClassLog, CalendarEvent, SchoolInfo, TeacherInfo, Exam } from '../types';
import { Download, Upload, Database, CheckCircle, AlertTriangle, FileJson, RefreshCw, Trash2 } from 'lucide-react';

interface BackupManagerProps {
  courses: Course[];
  schedule: ScheduleSlot[];
  logs: ClassLog[];
  events: CalendarEvent[];
  exams: Exam[];
  schoolInfo: SchoolInfo;
  teacherInfo: TeacherInfo;
  onImportData: (data: BackupData) => void;
  onResetData: () => void;
}

const BackupManager: React.FC<BackupManagerProps> = ({ 
  courses, schedule, logs, events, exams, schoolInfo, teacherInfo, onImportData, onResetData 
}) => {
  
  // Selection State for Export
  const [selectedExport, setSelectedExport] = useState({
    courses: true,
    schedule: true,
    logs: true,
    calendar: true,
    settings: true
  });

  const handleToggleExport = (key: keyof typeof selectedExport) => {
    setSelectedExport(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleExport = () => {
    const backup: BackupData = {
      timestamp: new Date().toISOString(),
      schoolInfo: selectedExport.settings ? schoolInfo : undefined,
      teacherInfo: selectedExport.settings ? teacherInfo : undefined,
      courses: selectedExport.courses ? courses : undefined,
      schedule: selectedExport.schedule ? schedule : undefined,
      logs: selectedExport.logs ? logs : undefined,
      calendarEvents: selectedExport.calendar ? events : undefined,
      exams: selectedExport.logs ? exams : undefined, // Bind exams to logs export selection for now
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `backup_culiplan_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        // Basic validation
        if (json.timestamp) {
            if(confirm('¿Estás seguro de restaurar esta copia? Los datos actuales serán reemplazados por los de la copia.')) {
                onImportData(json as BackupData);
                alert('Restauración completada con éxito.');
            }
        } else {
            alert('El archivo no parece ser una copia de seguridad válida de CuliPlan.');
        }
      } catch (error) {
        alert('Error al leer el archivo JSON.');
      }
    };
    reader.readAsText(file);
  };

  const handleDangerReset = () => {
    if (confirm('¡ATENCIÓN! ¿Estás seguro de borrar TODOS los datos de la aplicación?\n\nEsta acción eliminará registros de clase, personalizaciones y configuraciones. La aplicación volverá a su estado original.\n\nEsta acción NO se puede deshacer.')) {
        onResetData();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-10">
      <header className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Database size={24} className="text-chef-600"/> Centro de Copias de Seguridad
        </h2>
        <p className="text-gray-500">Gestiona tus datos: exporta una copia o restaura una anterior.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* EXPORT SECTION */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
            <div className="mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
                    <Download size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Crear Copia de Seguridad</h3>
                <p className="text-sm text-gray-500 mt-2">Selecciona qué datos quieres incluir en el archivo descargable.</p>
            </div>

            <div className="space-y-3 mb-6 flex-1">
                <label className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input type="checkbox" checked={selectedExport.settings} onChange={() => handleToggleExport('settings')} className="w-5 h-5 text-chef-600 rounded focus:ring-chef-500" />
                    <div>
                        <span className="font-bold text-gray-700 block">Configuración e Identidad</span>
                        <span className="text-xs text-gray-400">Logos, nombres, año académico...</span>
                    </div>
                </label>
                <label className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input type="checkbox" checked={selectedExport.courses} onChange={() => handleToggleExport('courses')} className="w-5 h-5 text-chef-600 rounded focus:ring-chef-500" />
                    <div>
                        <span className="font-bold text-gray-700 block">Módulos y Unidades</span>
                        <span className="text-xs text-gray-400">Estructura de cursos y progreso.</span>
                    </div>
                </label>
                <label className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input type="checkbox" checked={selectedExport.logs} onChange={() => handleToggleExport('logs')} className="w-5 h-5 text-chef-600 rounded focus:ring-chef-500" />
                    <div>
                        <span className="font-bold text-gray-700 block">Diario y Exámenes</span>
                        <span className="text-xs text-gray-400">Registros de sesiones y pruebas.</span>
                    </div>
                </label>
                <label className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input type="checkbox" checked={selectedExport.schedule} onChange={() => handleToggleExport('schedule')} className="w-5 h-5 text-chef-600 rounded focus:ring-chef-500" />
                    <div>
                        <span className="font-bold text-gray-700 block">Horario Semanal</span>
                        <span className="text-xs text-gray-400">Configuración de rejilla.</span>
                    </div>
                </label>
                <label className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input type="checkbox" checked={selectedExport.calendar} onChange={() => handleToggleExport('calendar')} className="w-5 h-5 text-chef-600 rounded focus:ring-chef-500" />
                    <div>
                        <span className="font-bold text-gray-700 block">Eventos de Calendario</span>
                        <span className="text-xs text-gray-400">Festivos, exámenes, etc.</span>
                    </div>
                </label>
            </div>

            <button 
                onClick={handleExport}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-md"
            >
                <Download size={20} /> Descargar Copia (.json)
            </button>
        </div>

        {/* IMPORT SECTION */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
            <div className="mb-6">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 mb-4">
                    <Upload size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Restaurar Copia</h3>
                <p className="text-sm text-gray-500 mt-2">Sube un archivo .json previamente exportado para recuperar tus datos.</p>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-8 bg-gray-50 text-center hover:bg-gray-100 transition-colors relative group">
                <FileJson size={48} className="text-gray-300 mb-4 group-hover:text-chef-500 transition-colors" />
                <p className="font-bold text-gray-700">Arrastra tu archivo aquí</p>
                <p className="text-xs text-gray-400 mb-4">o haz clic para seleccionar</p>
                
                <input 
                    type="file" 
                    accept=".json"
                    onChange={handleFileImport}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
            </div>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-100 rounded-lg flex items-start gap-3">
                <AlertTriangle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-yellow-800">
                    <strong>Atención:</strong> Al restaurar una copia, los datos actuales serán sobrescritos por los datos del archivo. Asegúrate de guardar tu trabajo actual si es necesario.
                </p>
            </div>
        </div>
      </div>

      {/* DANGER ZONE - RESET */}
      <div className="mt-12 border-t-2 border-gray-200 pt-8">
         <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <AlertTriangle size={20} className="text-red-600" />
            Zona de Peligro
         </h3>
         <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
               <p className="font-bold text-red-800 text-lg">Borrar todos los datos de la aplicación</p>
               <p className="text-red-700 text-sm mt-1">
                  Esta acción no se puede deshacer. Borrará todo el diario de clase, configuraciones de módulos, horarios y restaurará la aplicación al estado original (fábrica). 
                  Asegúrate de exportar una copia antes si quieres conservar algo.
               </p>
            </div>
            <button 
                onClick={handleDangerReset}
                className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 transition flex items-center gap-2 whitespace-nowrap shadow-md"
            >
                <Trash2 size={20} /> Restaurar de Fábrica
            </button>
         </div>
      </div>
    </div>
  );
};

export default BackupManager;