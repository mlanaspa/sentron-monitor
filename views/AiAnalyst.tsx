import React, { useState, useEffect } from 'react';
import { Bot, Sparkles, RefreshCw, AlertTriangle, ChevronDown } from 'lucide-react';
import { generateMockData } from '../services/mockModbusService';
import { analyzeEnergyData } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import { DEFAULT_DEVICES, DeviceConfig } from '../types';

export const AiAnalyst: React.FC = () => {
  const [analysis, setAnalysis] = useState<string>("");
  const [loading, setLoading] = useState(false);
  
  // Load devices
  const [devices, setDevices] = useState<DeviceConfig[]>(() => {
    const saved = localStorage.getItem('sentron_devices');
    return saved ? JSON.parse(saved) : DEFAULT_DEVICES;
  });
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>(devices[0]?.id || "");

  useEffect(() => {
     const saved = localStorage.getItem('sentron_devices');
     if (saved) {
         const parsed = JSON.parse(saved);
         setDevices(parsed);
         if (!parsed.find((d: DeviceConfig) => d.id === selectedDeviceId)) {
             setSelectedDeviceId(parsed[0]?.id || "");
         }
     }
  }, []);

  const handleAnalysis = async () => {
    setLoading(true);
    setAnalysis(""); // Clear previous
    try {
        const targetDevice = devices.find(d => d.id === selectedDeviceId) || devices[0];

        // 1. Get a snapshot of current data (Async now)
        const snapshot = await generateMockData(targetDevice);
        
        // 2. Call Gemini Service
        const result = await analyzeEnergyData(snapshot);
        setAnalysis(result);
    } catch (e) {
        console.error(e);
        setAnalysis("Error al obtener datos o conectar con la IA.");
    }
    setLoading(false);
  };

  const selectedDevice = devices.find(d => d.id === selectedDeviceId);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-10">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-indigo-100 rounded-xl">
                <Bot className="text-indigo-600 w-8 h-8" />
            </div>
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Asistente Energético AI</h2>
                <p className="text-slate-500 text-sm">Diagnóstico inteligente con Gemini 2.5 Flash</p>
            </div>
          </div>

          <div className="relative min-w-[250px]">
             <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1 uppercase">Dispositivo a Analizar</label>
             <div className="relative">
                <select 
                    value={selectedDeviceId}
                    onChange={(e) => setSelectedDeviceId(e.target.value)}
                    className="w-full appearance-none bg-white border border-slate-300 text-slate-700 py-3 px-4 pr-8 rounded-xl leading-tight focus:outline-none focus:bg-white focus:border-indigo-500 font-medium shadow-sm cursor-pointer"
                >
                    {devices.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
                    <ChevronDown size={16} />
                </div>
             </div>
          </div>
       </div>

       <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 min-h-[400px]">
          {!analysis && !loading && (
             <div className="flex flex-col items-center justify-center h-full text-center py-12 space-y-6">
                <Sparkles className="text-yellow-500 w-16 h-16 animate-pulse" />
                <div className="max-w-md">
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">Listo para Analizar: {selectedDevice?.name}</h3>
                    <p className="text-slate-500 mb-6">
                        El asistente tomará una lectura instantánea del medidor <strong>{selectedDevice?.name}</strong> ({selectedDevice?.isSimulated ? 'Simulado' : selectedDevice?.ip}) y buscará anomalías.
                    </p>
                    <button 
                        onClick={handleAnalysis}
                        className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center mx-auto space-x-2 shadow-lg shadow-indigo-200"
                    >
                        <Bot size={20} />
                        <span>Generar Diagnóstico</span>
                    </button>
                </div>
             </div>
          )}

          {loading && (
             <div className="flex flex-col items-center justify-center h-full py-12">
                 <RefreshCw className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
                 <p className="text-lg font-medium text-slate-700">Analizando telemetría de {selectedDevice?.name}...</p>
                 <p className="text-sm text-slate-400">Consultando modelo Gemini 2.5 Flash</p>
             </div>
          )}

          {analysis && !loading && (
             <div className="space-y-6">
                 <div className="flex justify-between items-center border-b pb-4">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">Informe de Eficiencia</h3>
                        <p className="text-sm text-slate-500">Objetivo: {selectedDevice?.name}</p>
                    </div>
                    <button 
                        onClick={handleAnalysis}
                        className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 bg-indigo-50 px-3 py-2 rounded-lg"
                    >
                        <RefreshCw size={14} /> Re-analizar
                    </button>
                 </div>
                 <div className="prose prose-slate max-w-none">
                     <ReactMarkdown>{analysis}</ReactMarkdown>
                 </div>
                 <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-lg flex gap-3 items-start mt-6">
                    <AlertTriangle className="text-yellow-600 shrink-0 mt-0.5" size={18} />
                    <p className="text-xs text-yellow-700">
                        Nota: Este análisis es generado por Inteligencia Artificial y se basa en una lectura instantánea. Para decisiones críticas de mantenimiento, consulte siempre a un técnico certificado de Siemens.
                    </p>
                 </div>
             </div>
          )}
       </div>
    </div>
  );
};