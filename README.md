# Guía Súper Simple - Sentron Pi Monitor

## 1. Preparación (Solo la primera vez)

1.  **Instala Node.js**: Descárgalo de [nodejs.org](https://nodejs.org).
2.  **Crea la Carpeta**: Crea `SentronApp` en tu escritorio.
3.  **Archivos**: Copia el código dentro.

## 2. Instalación

Abre la terminal **dentro de VS Code** (`Ctrl + ñ` o Menú `Terminal > Nueva Terminal`) y ejecuta:

```bash
npm install
cd backend
npm install
cd ..
```
*(Es importante volver a la carpeta raíz con `cd ..` después de instalar el backend)*

## 3. Configuración de la IA (Opcional)

Para que el "Asistente AI" funcione en tu PC, necesitas tu clave de Gemini:

1. Crea un archivo nuevo en la carpeta raíz llamado `.env` (solo `.env`, sin nombre delante).
2. Escribe dentro tu clave así:
   ```env
   API_KEY=tu_clave_super_secreta_aqui
   ```
3. Guarda el archivo. El programa la leerá automáticamente al arrancar.

## 4. ¡A Jugar! (Modo Local)

Gracias a la nueva actualización, ya no necesitas 3 ventanas.

1. Abre la terminal en VS Code.
2. Asegúrate de estar en la carpeta raíz (`SentronApp`).
3. Ejecuta el comando mágico:

```bash
npm start
```

**¿Qué pasará?**
El sistema encenderá automáticamente:
1.  🟨 El Simulador del Sentron
2.  🟦 El Servidor de la Raspberry
3.  🟩 La Web (y abrirá tu navegador solo)

---

## ☁️ Guía para subir a Internet (Render.com)

Si quieres que tus compañeros vean la web desde sus móviles:

1.  **Sube el código a GitHub**:
    *   Crea una cuenta en GitHub.com y crea un repositorio vacío.
    *   En VS Code, ve a la pestaña de "Source Control" (icono de rama a la izquierda).
    *   Dale a "Publish to GitHub".

2.  **Despliega en Render**:
    *   Ve a [dashboard.render.com](https://dashboard.render.com).
    *   Nuevo -> **Web Service**.
    *   Conecta tu repositorio de GitHub.
    *   **Build Command:** `npm run build`
    *   **Start Command:** `node backend/server.js`
    *   **Environment Variables:** Añade una llamada `API_KEY` con tu clave de Gemini.
    *   Dale a "Create Web Service".

---

## 🚑 Solución de Problemas (LEER AQUÍ SI FALLA)

### 1. Error: "Please tell me who you are"
Git necesita saber quién eres para guardar los cambios. Escribe estos dos comandos en la terminal (sustituye con tus datos reales):

```bash
git config --global user.email "tucorreo@ejemplo.com"
git config --global user.name "Tu Nombre"
```
*⚠️ IMPORTANTE: No escribas los símbolos `<` o `>`. Solo las comillas `""`.*

### 2. Error: "Invalid Key" o "Permission denied" al subir
Si te sale error de claves SSH, cambia la configuración a HTTPS con este comando:

```bash
git remote set-url origin https://github.com/TU_USUARIO/TU_REPO.git
```
*(Cambia TU_USUARIO y TU_REPO por los tuyos).*

### 3. Error PowerShell: "Ejecución de scripts deshabilitada"
Si salen letras rojas al ejecutar `npm start` en Windows:
```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```
