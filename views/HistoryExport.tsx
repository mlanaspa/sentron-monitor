import React, { useState, useEffect } from 'react';
import { Download, Calendar, FileSpreadsheet, ChevronDown } from 'lucide-react';
import { generateHistory } from '../services/mockModbusService';
import { DEFAULT_DEVICES, DeviceConfig } from '../types';

export const HistoryExport: React.FC = () => {
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [isExporting, setIsExporting] = useState(false);

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

  const selectedDevice = devices.find(d => d.id === selectedDeviceId);

  const handleDownload = () => {
    setIsExporting(true);
    setTimeout(() => {
      const start = new Date(startDate);
      const end = new Date(endDate);
      // Set end to end of day
      end.setHours(23, 59, 59);

      const csvContent = generateHistory(start, end);
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      // Clean name for filename
      const safeName = selectedDevice?.name.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'device';
      
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sentron_${safeName}_${startDate}_to_${endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setIsExporting(false);
    }, 1000); // Simulate processing delay
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-10">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-slate-800">Histórico de Datos</h2>
        <p className="text-slate-500">
            Selecciona un rango de fechas y el dispositivo para exportar los datos de consumo a formato CSV.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        
        {/* Device Selection */}
        <div className="mb-8">
            <label className="block text-sm font-medium text-slate-700 mb-2">Dispositivo de Origen</label>
            <div className="relative">
                <select 
                    value={selectedDeviceId}
                    onChange={(e) => setSelectedDeviceId(e.target.value)}
                    className="w-full appearance-none bg-slate-50 border border-slate-300 text-slate-800 py-3 px-4 pr-8 rounded-xl leading-tight focus:outline-none focus:bg-white focus:border-blue-500 font-medium"
                >
                    {devices.map(d => (
                        <option key={d.id} value={d.id}>{d.name} ({d.ip})</option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                    <ChevronDown size={20} />
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">Fecha de Inicio</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20}/>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="pl-10 w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">Fecha de Fin</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20}/>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="pl-10 w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-100 pt-8 flex flex-col items-center justify-center space-y-4">
            <div className="bg-blue-50 p-4 rounded-full">
                <FileSpreadsheet className="text-blue-600 w-12 h-12" />
            </div>
            
            <button
              onClick={handleDownload}
              disabled={isExporting}
              className={`
                flex items-center space-x-2 px-8 py-4 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-95
                ${isExporting 
                    ? 'bg-slate-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-blue-200'}
              `}
            >
              {isExporting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Generando CSV para {selectedDevice?.name}...</span>
                </>
              ) : (
                <>
                  <Download size={24} />
                  <span>Descargar CSV (.csv)</span>
                </>
              )}
            </button>
            <p className="text-xs text-slate-400">
                El archivo incluirá: Timestamp, Voltajes, Corrientes y Potencia del dispositivo seleccionado.
            </p>
        </div>
      </div>
    </div>
  );
};