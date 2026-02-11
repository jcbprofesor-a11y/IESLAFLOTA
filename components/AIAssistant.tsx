import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import { ChatMessage } from '../types';
import { generateAcademicResponse } from '../services/geminiService';

const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: '¡Hola! Soy tu asistente de programación culinaria. ¿En qué puedo ayudarte hoy? Puedes preguntarme sobre fechas de exámenes, contenido de unidades o sugerencias para recuperar clases.',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const responseText = await generateAcademicResponse(userMsg.text, history);

      const aiMsg: ChatMessage = {
        role: 'model',
        text: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'model',
        text: 'Lo siento, hubo un error al procesar tu solicitud.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
      <div className="bg-chef-600 p-4 text-white flex items-center gap-3">
        <div className="bg-white/20 p-2 rounded-full">
          <Sparkles size={20} />
        </div>
        <div>
          <h2 className="font-bold">Asistente Virtual CuliPlan</h2>
          <p className="text-xs text-chef-100">Impulsado por Gemini 2.5 Flash</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`flex max-w-[80%] gap-3 ${
                msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user' ? 'bg-chef-600 text-white' : 'bg-green-600 text-white'
                }`}
              >
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div
                className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-chef-500 text-white rounded-tr-none'
                    : 'bg-white text-gray-800 rounded-tl-none border border-gray-200 prose prose-sm max-w-none'
                }`}
              >
                {msg.role === 'model' ? (
                  // Simple markdown rendering substitution for safety/simplicity without external lib
                  <div dangerouslySetInnerHTML={{ 
                    __html: msg.text
                      .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
                      .replace(/\n/g, '<br />')
                      .replace(/- (.*?)(<br \/>|$)/g, '• $1$2')
                   }} />
                ) : (
                  msg.text
                )}
                <span className={`text-[10px] block mt-2 opacity-70 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start w-full">
            <div className="flex max-w-[80%] gap-3">
               <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center">
                <Bot size={16} />
              </div>
              <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-gray-200">
                <Loader2 size={20} className="animate-spin text-gray-400" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex gap-2 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Pregunta sobre el calendario, unidades o evaluaciones..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-chef-500 focus:border-transparent text-sm"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-chef-600 text-white p-3 rounded-lg hover:bg-chef-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </div>
        <p className="text-center text-xs text-gray-400 mt-2">
          El asistente puede cometer errores. Verifica la información importante.
        </p>
      </div>
    </div>
  );
};

export default AIAssistant;
