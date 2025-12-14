import React, { useState, useEffect } from 'react';
import { DeviceConfig, DEFAULT_DEVICES } from '../types';
import { Plus, Trash2, Save, Server, MonitorSmartphone, AlertTriangle } from 'lucide-react';

export const Settings: React.FC = () => {
  const [devices, setDevices] = useState<DeviceConfig[]>([]);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('sentron_devices');
    if (saved) {
      setDevices(JSON.parse(saved));
    } else {
      setDevices(DEFAULT_DEVICES);
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('sentron_devices', JSON.stringify(devices));
    setIsDirty(false);
    // Force reload to apply changes everywhere (simple way)
    window.location.reload();
  };

  const updateDevice = (id: string, field: keyof DeviceConfig, value: any) => {
    setDevices(prev => prev.map(d => d.id === id ? { ...d, [field]: value } : d));
    setIsDirty(true);
  };

  const addDevice = () => {
    const newDevice: DeviceConfig = {
      id: Date.now().toString(),
      name: `Nuevo Sentron ${devices.length + 1}`,
      ip: '192.168.1.100',
      port: 502,
      slaveId: 1,
      isSimulated: true
    };
    setDevices([...devices, newDevice]);
    setIsDirty(true);
  };

  const removeDevice = (id: string) => {
    if (confirm('¿Seguro que quieres eliminar este dispositivo?')) {
      setDevices(prev => prev.filter(d => d.id !== id));
      setIsDirty(true);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Configuración de Dispositivos</h2>
          <p className="text-slate-500">Administra las conexiones a tus medidores Siemens Sentron PAC 3200.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={!isDirty}
          className={`
            flex items-center space-x-2 px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-all
            ${isDirty 
                ? 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-200' 
                : 'bg-slate-300 cursor-not-allowed'}
          `}
        >
          <Save size={20} />
          <span>Guardar Cambios</span>
        </button>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl flex gap-3">
         <AlertTriangle className="text-yellow-600 shrink-0" />
         <p className="text-sm text-yellow-800">
           <strong>Nota Importante:</strong> Si desactivas el "Modo Simulación", la aplicación intentará conectar vía Modbus TCP a la IP especificada. Asegúrate de que la Raspberry Pi tiene acceso a esa red.
         </p>
      </div>

      <div className="grid gap-6">
        {devices.map((device, index) => (
          <div key={device.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 transition-all hover:shadow-md">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
              
              {/* Header / Name */}
              <div className="lg:col-span-3 space-y-2">
                 <label className="text-xs font-semibold text-slate-500 uppercase">Nombre del Equipo</label>
                 <div className="flex items-center space-x-2">
                    <span className="bg-slate-100 text-slate-500 px-2 py-2 rounded text-xs font-mono">#{index + 1}</span>
                    <input 
                      type="text" 
                      value={device.name}
                      onChange={(e) => updateDevice(device.id, 'name', e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                 </div>
              </div>

              {/* IP Address */}
              <div className="lg:col-span-3 space-y-2">
                 <label className="text-xs font-semibold text-slate-500 uppercase">Dirección IP</label>
                 <div className="relative">
                    <Server size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                    <input 
                      type="text" 
                      value={device.ip}
                      onChange={(e) => updateDevice(device.id, 'ip', e.target.value)}
                      className={`w-full pl-9 p-2 border rounded focus:ring-2 outline-none font-mono text-sm ${device.isSimulated ? 'bg-slate-50 text-slate-400' : 'border-slate-300'}`}
                      disabled={device.isSimulated}
                    />
                 </div>
              </div>

              {/* Port */}
              <div className="lg:col-span-1 space-y-2">
                 <label className="text-xs font-semibold text-slate-500 uppercase">Puerto</label>
                 <input 
                    type="number" 
                    value={device.port}
                    onChange={(e) => updateDevice(device.id, 'port', parseInt(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                    disabled={device.isSimulated}
                 />
              </div>

               {/* Mode Toggle */}
               <div className="lg:col-span-3 flex items-center h-full pb-2">
                  <label className="flex items-center cursor-pointer relative">
                    <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={device.isSimulated}
                        onChange={(e) => updateDevice(device.id, 'isSimulated', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                    <span className="ml-3 text-sm font-medium text-gray-900 flex items-center gap-2">
                        {device.isSimulated ? <><MonitorSmartphone size={16}/> Simulado</> : <><Server size={16}/> Real (Trabajo)</>}
                    </span>
                  </label>
               </div>

              {/* Actions */}
              <div className="lg:col-span-2 flex justify-end">
                 <button 
                    onClick={() => removeDevice(device.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded transition-colors"
                    title="Eliminar dispositivo"
                 >
                    <Trash2 size={20} />
                 </button>
              </div>

            </div>
          </div>
        ))}

        <button 
            onClick={addDevice}
            className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center space-x-2 font-medium"
        >
            <Plus size={24} />
            <span>Añadir Otro Dispositivo Sentron PAC</span>
        </button>
      </div>
    </div>
  );
};
