import React, { useEffect, useState } from 'react';
import { MeterData, DeviceConfig, DEFAULT_DEVICES } from '../types';
import { generateMockData } from '../services/mockModbusService';
import { InfoCard } from '../components/InfoCard';
import { Zap, Activity, Gauge, TrendingUp, Cpu, CheckCircle2, Beaker, AlertCircle, Plus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const MAX_HISTORY_POINTS = 30;

export const Dashboard: React.FC = () => {
  // Estado para dispositivos (leemos de localStorage o usamos default)
  const [devices, setDevices] = useState<DeviceConfig[]>(() => {
      const saved = localStorage.getItem('sentron_devices');
      return saved ? JSON.parse(saved) : DEFAULT_DEVICES;
  });

  // Dispositivo seleccionado actualmente
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>(devices[0]?.id || "");
  
  const [data, setData] = useState<MeterData | null>(null);
  const [history, setHistory] = useState<MeterData[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Efecto para recargar configuración si cambia en otra pestaña (opcional, pero útil)
  useEffect(() => {
     const saved = localStorage.getItem('sentron_devices');
     if (saved) {
         const parsed = JSON.parse(saved);
         setDevices(parsed);
         // Si el seleccionado ya no existe, seleccionar el primero
         if (!parsed.find((d: DeviceConfig) => d.id === selectedDeviceId)) {
             setSelectedDeviceId(parsed[0]?.id || "");
         }
     }
  }, []); // Solo al montar

  useEffect(() => {
    // Resetear historial al cambiar de dispositivo
    setHistory([]);
    setData(null);
  }, [selectedDeviceId]);

  useEffect(() => {
    const activeDevice = devices.find(d => d.id === selectedDeviceId);
    if (!activeDevice) return;

    const fetchData = async () => {
        try {
            const newData = await generateMockData(activeDevice);
            setError(null);
            setData(newData);
            
            setHistory(prev => {
                const newHistory = [...prev, newData];
                if (newHistory.length > MAX_HISTORY_POINTS) {
                return newHistory.slice(newHistory.length - MAX_HISTORY_POINTS);
                }
                return newHistory;
            });
        } catch (err) {
            setError("Error conectando al dispositivo");
        }
    };

    fetchData(); // Initial fetch
    const interval = setInterval(fetchData, 2000);

    return () => clearInterval(interval);
  }, [selectedDeviceId, devices]);

  if (devices.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
              <AlertCircle className="w-12 h-12 mb-2"/>
              <p>No hay dispositivos configurados.</p>
              <p className="text-sm">Ve a Configuración para añadir uno.</p>
          </div>
      );
  }

  const activeDevice = devices.find(d => d.id === selectedDeviceId);

  if (!data) return <div className="flex h-full items-center justify-center"><Activity className="animate-spin text-blue-600 w-10 h-10" /></div>;

  // Format data for Recharts
  const chartData = history.map(h => ({
    time: new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    L1: h.current.l1,
    L2: h.current.l2,
    L3: h.current.l3,
    Power: h.power.active
  }));

  // Determine badge status
  let statusBadge;
  if (data.isSimulation) {
      statusBadge = (
        <div className="flex items-center space-x-2 text-sm text-amber-700 bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
          <Beaker size={16} />
          <span className="font-semibold hidden sm:inline">Modo Simulación</span>
        </div>
      );
  } else {
      statusBadge = (
        <div className="flex items-center space-x-2 text-sm text-green-600 bg-green-100 px-3 py-1 rounded-full border border-green-200">
          <CheckCircle2 size={16} />
          <span className="font-semibold hidden sm:inline">Conectado: {activeDevice?.ip}</span>
        </div>
      );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* Device Tabs */}
      <div className="flex overflow-x-auto pb-2 space-x-2 border-b border-slate-200">
          {devices.map(dev => (
              <button
                key={dev.id}
                onClick={() => setSelectedDeviceId(dev.id)}
                className={`
                    px-4 py-2 rounded-t-lg font-medium text-sm whitespace-nowrap transition-colors border-b-2 
                    ${selectedDeviceId === dev.id 
                        ? 'border-blue-600 text-blue-600 bg-blue-50' 
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100'}
                `}
              >
                  {dev.name}
              </button>
          ))}
      </div>

      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{activeDevice?.name}</h2>
          <p className="text-slate-500 text-sm">Monitorización en tiempo real • ID: {activeDevice?.id}</p>
        </div>
        {statusBadge}
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <InfoCard 
          title="Potencia Activa" 
          value={data.power.active.toFixed(2)} 
          unit="kW" 
          icon={<Zap size={20} />} 
          color="blue"
        />
        <InfoCard 
          title="Energía Total" 
          value={data.totalEnergy.toFixed(1)} 
          unit="kWh" 
          icon={<TrendingUp size={20} />} 
          color="green"
        />
        <InfoCard 
          title="Factor Potencia" 
          value={data.powerFactor.toFixed(2)} 
          unit="PF" 
          icon={<Gauge size={20} />} 
          color={data.powerFactor < 0.9 ? "red" : "purple"}
        />
        <InfoCard 
          title="Frecuencia" 
          value={data.frequency.toFixed(1)} 
          unit="Hz" 
          icon={<Activity size={20} />} 
          color="orange"
        />
      </div>

      {/* Detailed Phase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Phase L1 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-2 mb-4 border-b pb-2">
             <div className="w-3 h-3 rounded-full bg-red-500"></div>
             <h3 className="font-bold text-slate-700">Fase L1</h3>
          </div>
          <div className="space-y-3">
             <div className="flex justify-between">
                <span className="text-slate-500">Voltaje (L1-N)</span>
                <span className="font-mono font-medium">{data.voltage.l1.toFixed(1)} V</span>
             </div>
             <div className="flex justify-between">
                <span className="text-slate-500">Corriente</span>
                <span className="font-mono font-medium">{data.current.l1.toFixed(2)} A</span>
             </div>
          </div>
        </div>

        {/* Phase L2 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-2 mb-4 border-b pb-2">
             <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
             <h3 className="font-bold text-slate-700">Fase L2</h3>
          </div>
          <div className="space-y-3">
             <div className="flex justify-between">
                <span className="text-slate-500">Voltaje (L2-N)</span>
                <span className="font-mono font-medium">{data.voltage.l2.toFixed(1)} V</span>
             </div>
             <div className="flex justify-between">
                <span className="text-slate-500">Corriente</span>
                <span className="font-mono font-medium">{data.current.l2.toFixed(2)} A</span>
             </div>
          </div>
        </div>

        {/* Phase L3 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-2 mb-4 border-b pb-2">
             <div className="w-3 h-3 rounded-full bg-blue-500"></div>
             <h3 className="font-bold text-slate-700">Fase L3</h3>
          </div>
          <div className="space-y-3">
             <div className="flex justify-between">
                <span className="text-slate-500">Voltaje (L3-N)</span>
                <span className="font-mono font-medium">{data.voltage.l3.toFixed(1)} V</span>
             </div>
             <div className="flex justify-between">
                <span className="text-slate-500">Corriente</span>
                <span className="font-mono font-medium">{data.current.l3.toFixed(2)} A</span>
             </div>
          </div>
        </div>
      </div>

      {/* Live Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Activity className="text-blue-500" size={18}/> Tendencia de Corriente (Amperios)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="time" tick={{fontSize: 12}} stroke="#94a3b8" />
                <YAxis tick={{fontSize: 12}} stroke="#94a3b8"/>
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Legend />
                <Line type="monotone" dataKey="L1" stroke="#ef4444" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="L2" stroke="#eab308" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="L3" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Cpu className="text-purple-500" size={18}/> Potencia Activa Total (kW)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="time" tick={{fontSize: 12}} stroke="#94a3b8" />
                <YAxis tick={{fontSize: 12}} stroke="#94a3b8" domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Line type="monotone" dataKey="Power" stroke="#8b5cf6" strokeWidth={3} dot={false} fill="url(#colorPower)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
