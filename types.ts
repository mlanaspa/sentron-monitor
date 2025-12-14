
export interface MeterData {
  timestamp: number;
  voltage: {
    l1: number;
    l2: number;
    l3: number;
  };
  current: {
    l1: number;
    l2: number;
    l3: number;
  };
  power: {
    active: number; // kW
    reactive: number; // kvar
    apparent: number; // kVA
  };
  powerFactor: number;
  frequency: number; // Hz
  totalEnergy: number; // kWh
  isSimulation?: boolean; // Flag to indicate if data is coming from a simulator
}

export interface HistoricalRecord {
  timestamp: string;
  activePower: number;
  voltageL1: number;
  currentL1: number;
  energyTotal: number;
}

export interface DeviceConfig {
  id: string;
  name: string;
  ip: string;
  port: number;
  slaveId: number;
  isSimulated: boolean; // Si es true, ignora la IP y usa localhost:8502
}

export type UserRole = 'admin' | 'operator';

export interface User {
  id: string;
  username: string;
  password: string; // En producción, esto debería ser un hash
  role: UserRole;
  name: string;
}

export enum AppView {
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  HISTORY = 'HISTORY',
  AI_ANALYST = 'AI_ANALYST',
  SETTINGS = 'SETTINGS',
  ADMIN_USERS = 'ADMIN_USERS'
}

export const DEFAULT_DEVICES: DeviceConfig[] = [
  {
    id: '1',
    name: 'Línea Producción 1',
    ip: '192.168.1.50',
    port: 502,
    slaveId: 1,
    isSimulated: true
  },
  {
    id: '2',
    name: 'Compresor Principal',
    ip: '192.168.1.51',
    port: 502,
    slaveId: 1,
    isSimulated: true
  }
];
