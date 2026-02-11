import React from 'react';
import { ChefHat, ArrowRight, Calendar, BookOpen, BarChart3, GraduationCap } from 'lucide-react';

interface LandingPageProps {
  onEnter: () => void;
  creatorName: string;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnter, creatorName }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center justify-center text-white relative overflow-hidden">
      
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-chef-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-600 rounded-full blur-3xl"></div>
      </div>

      <div className="z-10 max-w-4xl mx-auto px-6 text-center space-y-8 animate-fade-in">
        
        {/* Logo / Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-gradient-to-tr from-chef-600 to-chef-400 rounded-3xl flex items-center justify-center shadow-2xl shadow-chef-900/50 transform rotate-3">
            <GraduationCap size={48} className="text-white" strokeWidth={2} />
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-tight">
            Gastro<span className="text-chef-400">Academia</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 font-medium max-w-2xl mx-auto leading-relaxed">
            Plataforma integral para la gestión, programación y seguimiento académico en Hostelería y Turismo.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8 text-left">
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/10 hover:bg-white/15 transition duration-300">
            <div className="bg-blue-500/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-blue-400">
              <Calendar size={24} />
            </div>
            <h3 className="font-bold text-lg mb-2">Programación Inteligente</h3>
            <p className="text-sm text-gray-400">Calendarios ajustados automáticamente al año académico y gestión de horarios.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/10 hover:bg-white/15 transition duration-300">
             <div className="bg-chef-500/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-chef-400">
              <BookOpen size={24} />
            </div>
            <h3 className="font-bold text-lg mb-2">Diario de Clase</h3>
            <p className="text-sm text-gray-400">Registro detallado de sesiones teóricas y prácticas con control de horas.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/10 hover:bg-white/15 transition duration-300">
             <div className="bg-green-500/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-green-400">
              <BarChart3 size={24} />
            </div>
            <h3 className="font-bold text-lg mb-2">Informes Oficiales</h3>
            <p className="text-sm text-gray-400">Generación automática de documentación, estadísticas y control de desviaciones.</p>
          </div>
        </div>

        {/* CTA Button */}
        <button 
          onClick={onEnter}
          className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-chef-600 font-lg rounded-xl hover:bg-chef-500 focus:outline-none ring-offset-2 focus:ring-2 ring-chef-400 shadow-lg shadow-chef-900/40"
        >
          <span>Acceder a la Aplicación</span>
          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Creator Credit */}
        <div className="pt-12 mt-8 border-t border-white/10 flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 text-gray-400 text-sm font-medium uppercase tracking-widest">
                <ChefHat size={16} />
                <span>Desarrollado por</span>
            </div>
            <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                {creatorName}
            </div>
            <div className="text-xs text-gray-600 mt-1">© {new Date().getFullYear()} Todos los derechos reservados</div>
        </div>

      </div>
    </div>
  );
};

export default LandingPage;