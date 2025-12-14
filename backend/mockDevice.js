const net = require('net');
const Modbus = require('jsmodbus');

/*
 * ESTE SCRIPT SIMULA SER EL APARATO FÍSICO (SIEMENS SENTRON PAC 3200)
 * Ahora usa funciones SENO (Math.sin) para crear olas de datos que suben y bajan.
 */

const netServer = new net.Server();
const server = new Modbus.server.TCP(netServer, {
    responseDelay: 50 // Respuesta rápida
});

const PORT = 8502; 

// Buffer para almacenar los registros (Holding Registers)
const holdingRegisters = Buffer.alloc(500); 

server.on('connection', (client) => {
    console.log('🔌 Cliente conectado al Simulador Sentron');
});

// Asignar memoria
server.coils = Buffer.alloc(24);
server.discrete = Buffer.alloc(24);
server.holding = holdingRegisters;
server.input = Buffer.alloc(24);

// Función auxiliar para escribir Float32 (Big Endian)
function writeFloatBE(value, registerNumber) {
    const offset = registerNumber * 2;
    // Asegurar límites
    if (offset + 4 <= holdingRegisters.length) {
        holdingRegisters.writeFloatBE(value, offset);
    }
}

console.log(`⚡ Simulador Sentron PAC 3200 (Modo Olas) iniciado en puerto ${PORT}`);

let counter = 0;

setInterval(() => {
    // Usamos un contador que avanza para crear el efecto de "Ola"
    counter += 0.1;

    // --- GENERACIÓN DE DATOS DINÁMICOS ---
    
    // 1. VOLTAJE: Oscila entre 220V y 240V suavemente
    // Math.sin va de -1 a 1. Lo multiplicamos por 10 y sumamos 230.
    const voltageL1 = 230 + (Math.sin(counter) * 10); 
    const voltageL2 = 230 + (Math.sin(counter + 2) * 10); // Desfasado
    const voltageL3 = 230 + (Math.sin(counter + 4) * 10); // Desfasado

    // 2. CORRIENTE: Oscila drásticamente entre 10A y 60A para que se vea bien en la gráfica
    // Math.abs para que siempre sea positiva
    const currentL1 = 10 + Math.abs(Math.sin(counter * 0.5) * 50);
    const currentL2 = 10 + Math.abs(Math.sin(counter * 0.5 + 1) * 50);
    const currentL3 = 10 + Math.abs(Math.sin(counter * 0.5 + 2) * 50);

    // 3. FACTOR DE POTENCIA: Oscila entre 0.8 y 0.99
    const powerFactor = 0.9 + (Math.sin(counter * 0.2) * 0.09);

    // 4. POTENCIA ACTIVA (Cálculo real): P = V * I * PF / 1000
    // Sumamos las 3 fases para el total
    const powerL1 = (voltageL1 * currentL1 * powerFactor);
    const powerL2 = (voltageL2 * currentL2 * powerFactor);
    const powerL3 = (voltageL3 * currentL3 * powerFactor);
    const totalActivePowerKW = (powerL1 + powerL2 + powerL3) / 1000;

    // --- ESCRIBIR EN EL MAPA DE MEMORIA ---
    
    // Voltajes (Offsets 0, 4, 8 bytes -> Registros 0, 2, 4)
    writeFloatBE(voltageL1, 0);
    writeFloatBE(voltageL2, 2);
    writeFloatBE(voltageL3, 4);

    // Corrientes (Offsets 24, 28, 32 bytes -> Registros 12, 14, 16)
    writeFloatBE(currentL1, 12);
    writeFloatBE(currentL2, 14);
    writeFloatBE(currentL3, 16);

    // Factor de Potencia (Offset 100 bytes -> Registro 50)
    writeFloatBE(powerFactor, 50);

    // Frecuencia (Offset 110 bytes -> Registro 55)
    writeFloatBE(50.0 + (Math.random() * 0.2), 55); // Pequeña vibración en Hz

    // Potencia Activa Total (Offset 128 bytes -> Registro 64)
    writeFloatBE(totalActivePowerKW, 64);

    // Debug en consola para que veas que está vivo
    if (Math.floor(counter * 10) % 20 === 0) { // Log cada ~2 segundos
        console.log(`[SIMULADOR] V: ${voltageL1.toFixed(1)}V | I: ${currentL1.toFixed(1)}A | P: ${totalActivePowerKW.toFixed(1)}kW`);
    }

}, 200); // Actualiza 5 veces por segundo para suavidad

netServer.listen(PORT);