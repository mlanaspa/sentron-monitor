import { GoogleGenAI } from "@google/genai";
import { MeterData } from "../types";

const getGeminiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key not found via process.env.API_KEY");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeEnergyData = async (data: MeterData): Promise<string> => {
  const ai = getGeminiClient();
  if (!ai) {
    return "Error: API Key no configurada. Por favor verifica tus variables de entorno.";
  }

  const prompt = `
    Actúa como un experto ingeniero en eficiencia energética industrial.
    Analiza los siguientes datos instantáneos tomados de un medidor Siemens SENTRON PAC 3200 en una línea de producción:

    - Voltaje (L1/L2/L3): ${data.voltage.l1}V / ${data.voltage.l2}V / ${data.voltage.l3}V
    - Corriente (L1/L2/L3): ${data.current.l1}A / ${data.current.l2}A / ${data.current.l3}A
    - Potencia Activa Total: ${data.power.active} kW
    - Factor de Potencia: ${data.powerFactor}
    - Frecuencia: ${data.frequency} Hz

    Por favor proporciona:
    1. Un diagnóstico breve del estado actual (¿Es equilibrado el consumo? ¿Hay sobrecarga?).
    2. Comentarios sobre el Factor de Potencia. Si es bajo (< 0.95), sugiere acciones (ej. bancos de capacitores).
    3. Una recomendación de eficiencia energética general basada en estos valores instantáneos.
    
    Responde en formato Markdown, sé conciso y profesional.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "No se pudo generar el análisis.";
  } catch (error) {
    console.error("Error calling Gemini:", error);
    return "Error al conectar con el servicio de IA. Inténtalo más tarde.";
  }
};
