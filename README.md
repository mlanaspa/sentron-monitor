# Sentron Pi Monitor ⚡

Monitorización de energía industrial para Siemens PAC 3200.

## 🚀 Cómo ponerlo en Internet (Render.com)

Ya tienes el código en GitHub. Sigue estos pasos para generar el enlace web:

1.  **Sube los últimos cambios**:
    *   En VS Code, ve al icono de Git (izquierda).
    *   Escribe un mensaje (ej: "Listos para despegar") y dale a **Commit**.
    *   Dale al botón **Sync Changes** (o Push).

2.  **Configura Render**:
    *   Entra en [dashboard.render.com](https://dashboard.render.com) y crea una cuenta (puedes usar la de GitHub).
    *   Pulsa el botón **New +** y elige **Web Service**.
    *   Busca tu repositorio `sentron-pi-monitor` (o el nombre que le hayas puesto) y dale a **Connect**.

3.  **Rellena el formulario**:
    *   **Name**: `sentron-monitor` (o lo que quieras).
    *   **Region**: Frankfurt (o la más cercana).
    *   **Branch**: `main` o `master`.
    *   **Root Directory**: (Déjalo en blanco).
    *   **Runtime**: `Node` (Lo detectará solo).
    *   **Build Command**: `npm run build`
    *   **Start Command**: `npm run start:prod`
    *   **Instance Type**: Free (Gratis).

4.  **Configura la IA (Importante)**:
    *   Baja un poco hasta ver "Environment Variables".
    *   Pulsa **Add Environment Variable**.
    *   Key: `API_KEY`
    *   Value: *(Pega aquí tu clave de Google Gemini)*.

5.  **Finalizar**:
    *   Dale a **Create Web Service**.
    *   Espera unos 2-3 minutos. Render instalará todo, construirá la web y encenderá el simulador.
    *   Cuando termine, verás un enlace tipo `https://sentron-monitor.onrender.com`. ¡Esa es tu web!

---

## 💻 Uso Local (En tu PC)

1.  `npm install`
2.  `npm start`
3.  Abre `http://localhost:5173`

El sistema iniciará automáticamente:
*   Simulador Modbus TCP (Puerto 8502)
*   Backend API (Puerto 3001)
*   Frontend React (Puerto 5173)
