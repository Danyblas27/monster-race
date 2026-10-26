# 🏁 Carrera de Monstruos — Sistema de Conteo de Votos en Tiempo Real

Una aplicación web moderna, rápida e interactiva diseñada para contar y registrar votos recolectados a mano en una **"Carrera de Monstruos"**. Sincroniza al instante todos los dispositivos conectados (teléfonos, tablets, laptops) mediante WebSockets y guarda de forma persistente cada cambio en un archivo JSON en disco.

---

## 🌟 Características Principales

- **10 Monstruos Enumerados (1 al 10):**
  1. 🧛 Draculón
  2. 🧟 Franky
  3. 🧻 Momia Milenaria
  4. 🐺 Hombre Lobo
  5. 👁️ Cíclope Feroz
  6. 🦖 Godzilla Kaiju
  7. 👻 Fantasmín
  8. 🦶 Pie Grande
  9. 🧟‍♂️ Zombie Veloz
  10. 🦇 Gárgola Nocturna
  *(Los nombres se pueden personalizar desde el panel de ajustes).*

- **Captura Rápida de Papelitos:**
  - Diseñado para máxima velocidad: selecciona el monstruo (clic o atajo de teclado <kbd>Alt + 1..0</kbd>), teclea la membresía (3 o 4 dígitos) y presiona <kbd>Enter</kbd>.
  - Validación instantánea: comprueba en tiempo real que la membresía sea de entre 3 y 4 dígitos numéricos (`^\d{3,4}$`).
  - **Detección de duplicados:** No permite repetir la misma membresía en el mismo monstruo. Si la membresía ya votó por otro monstruo, alerta al operador y ofrece transferir el voto con un solo clic si hubo un error al leer el papel.
  - Barra de últimos votos ingresados con botón de **Deshacer** inmediato.

- **Sincronización Multidispositivo en Tiempo Real:**
  - Desarrollado con **Socket.io**.
  - Si un operador registra en su teléfono que la membresía **5555** votó por el **Monstruo 6**, todas las pantallas conectadas en la red se actualizan en milisegundos con notificación en vivo.
  - Indicador en vivo de dispositivos conectados en línea.

- **Persistencia en JSON:**
  - Cada voto, corrección o reinicio se escribe atómicamente en `data/monsters.json`.
  - La estructura del JSON cumple exactamente con los datos solicitados:
    - `number`: Número del monstruo (1 al 10).
    - `name`: Nombre del monstruo.
    - `votes`: Número de votos acumulados.
    - `memberships`: Arreglo de strings con los números de membresía únicos que votaron por él.
    - `emoji` y `color`: Atributos visuales para la interfaz.

- **Pista de Carrera Interactiva ("Race Track"):**
  - Los 10 monstruos avanzan visualmente por sus carriles según sus votos.
  - El monstruo puntero lleva una corona dorada 👑.
  - Efectos de sonido (Web Audio API) y confeti 🎉 de celebración.

- **Buscador de Membresías:**
  - Herramienta para consultar al instante si un socio ya votó y por cuál monstruo lo hizo.

- **Contenedor Docker y GitHub Actions:**
  - `Dockerfile` multi-etapa ligero y optimizado.
  - `docker-compose.yml` con volumen persistente en `./data` para no perder votos al reiniciar el contenedor.
  - Flujo de GitHub Actions en `.github/workflows/deploy.yml` para compilar, probar y desplegar automáticamente en GitHub Container Registry (GHCR).

---

## 🗂️ Estructura del Proyecto

```
monster_race/
├── client/                     # Frontend React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/         # Header, VoteForm, RaceTrack, MonsterCards, etc.
│   │   ├── utils/              # Generador de sonidos con Web Audio API
│   │   ├── App.jsx             # Componente raíz
│   │   └── socket.js           # Conexión Socket.io cliente
│   ├── vite.config.js
│   └── package.json
├── server/                     # Backend Node.js + Express + Socket.io
│   ├── index.js                # Servidor HTTP, WebSocket y API REST
│   ├── storage.js              # Manejo atómico del archivo JSON
│   └── defaultData.json        # Datos iniciales de los 10 monstruos
├── data/                       # Carpeta persistente montada en Docker
│   └── monsters.json           # Archivo JSON con los votos actuales
├── test/                       # Pruebas automatizadas unitarias y de integración
│   ├── api.test.js
│   └── server.test.js
├── .github/workflows/
│   └── deploy.yml              # CI/CD de GitHub Actions
├── Dockerfile                  # Imagen Docker de producción
├── docker-compose.yml          # Orquestación con persistencia de volumen
├── package.json                # Scripts principales del proyecto
└── README.md
```

---

## 🚀 Inicio Rápido en Desarrollo Local

### 1. Requisitos Previos
- Node.js (v18 o superior)
- npm

### 2. Instalación
En la raíz del proyecto, ejecuta:
```bash
npm install
npm --prefix client install
```

### 3. Ejecutar en Modo Desarrollo (Frontend + Backend)
```bash
npm run dev
```
- Servidor Backend + WebSockets: `http://localhost:3001`
- Frontend Vite con recarga rápida: `http://localhost:5173`

### 4. Ejecutar Modo Producción
```bash
npm run build
npm start
```
Abre en tu navegador `http://localhost:3001`.

### 5. Ejecutar Pruebas Automatizadas
```bash
npm test
```
Verifica que las validaciones de membresía de 3-4 dígitos, prevención de duplicados, persistencia en JSON y la API pasen al 100%.

---

## 📱 Acceso desde Múltiples Dispositivos en la Misma Red

Para que varios operadores cuenten votos simultáneamente desde sus teléfonos o tabletas:

1. Inicia la aplicación en tu computadora con `npm start` (o mediante Docker).
2. Averigua la dirección IP local de tu computadora:
   - En Windows: abre CMD o PowerShell y escribe `ipconfig` (busca la dirección IPv4, por ejemplo `192.168.1.45`).
   - En Mac/Linux: escribe `ifconfig` o `ip a`.
3. Desde el navegador de cualquier teléfono o tablet conectado a la misma red WiFi, ingresa a:
   ```
   http://192.168.1.45:3001
   ```
4. ¡Listo! Verás el contador de dispositivos conectados en verde y todos los votos se sincronizarán al instante entre todos los dispositivos.

---

## 🐳 Despliegue con Docker

### Opción 1: Con Docker Compose (Recomendado)
Asegúrate de que Docker Desktop esté corriendo y ejecuta:
```bash
docker compose up -d --build
```
La aplicación estará disponible en `http://localhost:3001`. Los votos se guardan en la carpeta `./data/monsters.json` en tu máquina anfitriona.

Para detener el contenedor:
```bash
docker compose down
```

### Opción 2: Con Docker CLI directo
```bash
# Construir la imagen
docker build -t monster-race .

# Ejecutar con volumen persistente para data/
docker run -d -p 3001:3001 -v "${PWD}/data:/app/data" --name monster_race_app monster-race
```

---

## 🔄 Despliegue Automático con GitHub Actions

El repositorio incluye el flujo de trabajo configurado en `.github/workflows/deploy.yml`:

1. Al hacer `git push` a la rama `main` o `master`:
   - Descarga el código y configura Node.js 22.
   - Ejecuta la suite de pruebas automatizadas (`npm test`).
   - Compila el frontend (`npm run build`).
   - Construye la imagen de Docker multi-etapa.
   - Publica la imagen automáticamente en **GitHub Container Registry (GHCR)** con la etiqueta `:latest`.

2. Para desplegar la imagen publicada en cualquier servidor o VPS:
   ```bash
   docker run -d -p 3001:3001 \
     -v /ruta/en/tu/servidor/data:/app/data \
     --restart unless-stopped \
     ghcr.io/TU_USUARIO/TU_REPOSITORIO:latest
   ```

---

## 📄 Formato del Archivo `data/monsters.json`

```json
[
  {
    "number": 1,
    "name": "Draculón",
    "votes": 2,
    "memberships": [
      "1234",
      "5555"
    ],
    "emoji": "🧛",
    "color": "#ef4444"
  },
  {
    "number": 6,
    "name": "Godzilla Kaiju",
    "votes": 1,
    "memberships": [
      "987"
    ],
    "emoji": "🦖",
    "color": "#10b981"
  }
]
```
*(Y así sucesivamente hasta el monstruo 10).*
