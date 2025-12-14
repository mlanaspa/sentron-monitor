import { MeterData, DeviceConfig } from '../types';

let accumulatedEnergy = 12450.5;
let counter = 0; 

// Fallback interno: Genera ondas
const generateMockDataInternal = (): MeterData => {
  counter += 0.2; 
  const v1 = 230 + Math.sin(counter) * 10;
  const v2 = 230 + Math.sin(counter + 2) * 10;
  const v3 = 230 + Math.sin(counter + 4) * 10;
  const c1 = 35 + Math.sin(counter * 0.5) * 25;
  const c2 = 35 + Math.sin(counter * 0.5 + 1) * 25;
  const c3 = 35 + Math.sin(counter * 0.5 + 2) * 25;
  const pf = 0.9;
  const activePowerKw = ((v1*c1 + v2*c2 + v3*c3) * pf) / 1000;
  accumulatedEnergy += (activePowerKw / 3600) * 0.1; 

  return {
    timestamp: Date.now(),
    isSimulation: true,
    voltage: { l1: v1, l2: v2, l3: v3 },
    current: { l1: c1, l2: c2, l3: c3 },
    power: { active: activePowerKw, reactive: activePowerKw * 0.3, apparent: activePowerKw / pf },
    powerFactor: pf,
    frequency: 50 + Math.random() * 0.1,
    totalEnergy: accumulatedEnergy,
  };
};

export const generateMockData = async (device: DeviceConfig): Promise<MeterData> => {
  try {
    // CAMBIO IMPORTANTE: Quitamos "http://localhost:3001" y dejamos solo "/api"
    // El navegador usará automáticamente el dominio actual.
    const params = new URLSearchParams({
        ip: device.ip,
        port: device.port.toString(),
        sim: device.isSimulated.toString()
    });

    const response = await fetch(`/api/meter-data?${params}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(1500) 
    });
    
    if (!response.ok) throw new Error("Backend unavailable");
    
    const data = await response.json();
    if(data.error) throw new Error(data.error);

    return data as MeterData;
  } catch (err) {
    return generateMockDataInternal();
  }
};

export const generateHistory = (start: Date, end: Date): string => {
    const records: string[] = [];
    records.push('Fecha,Hora,Voltaje_L1_V,Corriente_L1_A,Potencia_Activa_kW,Energia_Total_kWh');
    
    let current = new Date(start.getTime());
    let fakeEnergy = 12000;
  
    while (current <= end) {
      const v = 230 + (Math.random() - 0.5) * 4;
      const c = 40 + (Math.random() - 0.5) * 15;
      const p = (v * c * 0.9 * 3) / 1000;
      fakeEnergy += p * 0.25; 
      const dateStr = current.toISOString().split('T')[0];
      const timeStr = current.toTimeString().split(' ')[0];
      records.push(`${dateStr},${timeStr},${v.toFixed(1)},${c.toFixed(2)},${p.toFixed(2)},${fakeEnergy.toFixed(1)}`);
      current = new Date(current.getTime() + 15 * 60000);
    }
  
    return records.join('\n');
};