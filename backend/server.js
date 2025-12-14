const express = require('express');
const cors = require('cors');
const net = require('net');
const Modbus = require('jsmodbus');
const path = require('path');

// Auto-iniciar el simulador para que funcione en la nube sin abrir otra terminal
try {
    require('./mockDevice.js');
    console.log("🌊 Simulador interno iniciado automáticamente");
} catch (e) {
    console.log("Nota: No se pudo iniciar el simulador interno", e.message);
}

const app = express();
const PORT = process.env.PORT || 3001; // Render nos dará un puerto dinámico

app.use(cors());
app.use(express.json());

// 1. API ROUTES (Primero definimos la API)
const activeClients = {};

const getModbusClient = (ip, port) => {
    const key = `${ip}:${port}`;
    
    return new Promise((resolve, reject) => {
        if (activeClients[key] && activeClients[key].socket.writable) {
            return resolve(activeClients[key].client);
        }

        if (activeClients[key]) {
            try { activeClients[key].socket.destroy(); } catch(e){}
            delete activeClients[key];
        }

        console.log(`🔌 Conectando a nuevo dispositivo: ${key}`);
        const socket = new net.Socket();
        const client = new Modbus.client.TCP(socket);

        const timeout = setTimeout(() => {
            socket.destroy();
            reject(new Error('Timeout de conexión'));
        }, 2000);

        socket.connect({ host: ip, port: parseInt(port) });

        socket.on('connect', () => {
            clearTimeout(timeout);
            activeClients[key] = { socket, client, lastActivity: Date.now() };
            console.log(`✅ Conectado a ${key}`);
            resolve(client);
        });

        socket.on('error', (err) => {
            clearTimeout(timeout);
            console.error(`❌ Error en ${key}:`, err.message);
            delete activeClients[key];
            reject(err);
        });

        socket.on('close', () => {
            console.log(`🔒 Conexión cerrada con ${key}`);
            delete activeClients[key];
        });
    });
};

function parseSentronFloat(buffer, offset) {
    if (!buffer || offset + 4 > buffer.length) return 0;
    return buffer.readFloatBE(offset); 
}

app.get('/api/meter-data', async (req, res) => {
    const targetIp = req.query.ip || '127.0.0.1';
    const targetPort = req.query.port || 502;
    const isSimulated = req.query.sim === 'true';

    const finalIp = isSimulated ? '127.0.0.1' : targetIp;
    const finalPort = isSimulated ? 8502 : targetPort;

    try {
        const client = await getModbusClient(finalIp, finalPort);
        const reading = await client.readHoldingRegisters(0, 100);
        const buffer = reading.response.body.valuesAsBuffer;

        const data = {
            timestamp: Date.now(),
            isSimulation: isSimulated,
            voltage: {
                l1: parseSentronFloat(buffer, 0),
                l2: parseSentronFloat(buffer, 4),
                l3: parseSentronFloat(buffer, 8)
            },
            current: {
                l1: parseSentronFloat(buffer, 24),
                l2: parseSentronFloat(buffer, 28),
                l3: parseSentronFloat(buffer, 32)
            },
            power: {
                active: parseSentronFloat(buffer, 128),
                reactive: 0, 
                apparent: 0
            },
            powerFactor: parseSentronFloat(buffer, 100),
            frequency: parseSentronFloat(buffer, 110),
            totalEnergy: 12500.0
        };
        res.json(data);
    } catch (err) {
        res.status(503).json({ error: 'No se pudo leer del dispositivo ' + finalIp });
    }
});

// 2. SERVIR FRONTEND (Archivos Estáticos)
// En producción, servimos los archivos que genera Vite (carpeta dist)
app.use(express.static(path.join(__dirname, '../dist')));

// Cualquier petición que no sea API, devuelve index.html (para React Router)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

// Limpieza de conexiones
setInterval(() => {
    const now = Date.now();
    Object.keys(activeClients).forEach(key => {
        if (now - activeClients[key].lastActivity > 60000) {
            activeClients[key].socket.destroy();
            delete activeClients[key];
        }
    });
}, 60000);

app.listen(PORT, () => {
    console.log(`🚀 Servidor Unificado corriendo en puerto ${PORT}`);
});