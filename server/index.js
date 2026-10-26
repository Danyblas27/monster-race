import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import {
  getMonsters,
  recordVote,
  removeVote,
  findMembership,
  resetAllVotes,
  updateMonster,
  restoreDefaults,
  saveMonsters
} from './storage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'DELETE', 'PUT']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.get('/api/monsters', (req, res) => {
  try {
    const monsters = getMonsters();
    res.json({ success: true, monsters });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/vote', (req, res) => {
  try {
    const { monsterNumber, membership, allowTransfer, deviceId } = req.body;
    const result = recordVote({
      monsterNumber,
      membership,
      allowTransfer: Boolean(allowTransfer),
      deviceId: deviceId || 'Dispositivo Web'
    });

    // Broadcast to all connected clients
    io.emit('monsters:updated', {
      monsters: result.monsters,
      event: 'vote_added',
      vote: result.vote
    });

    res.json({ success: true, ...result });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
      code: error.code || 'BAD_REQUEST',
      previousMonster: error.previousMonster || null
    });
  }
});

app.delete('/api/vote', (req, res) => {
  try {
    const { monsterNumber, membership } = req.body;
    const result = removeVote({ monsterNumber, membership });

    // Broadcast update
    io.emit('monsters:updated', {
      monsters: result.monsters,
      event: 'vote_removed',
      removed: result.removed
    });

    res.json({ success: true, ...result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.get('/api/membership/:id', (req, res) => {
  try {
    const result = findMembership(req.params.id);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.post('/api/reset', (req, res) => {
  try {
    const result = resetAllVotes();
    io.emit('monsters:updated', {
      monsters: result.monsters,
      event: 'reset',
      timestamp: result.timestamp
    });
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/monsters/:number', (req, res) => {
  try {
    const result = updateMonster(req.params.number, req.body);
    io.emit('monsters:updated', {
      monsters: result.monsters,
      event: 'monster_updated',
      updatedMonster: result.updatedMonster
    });
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.post('/api/restore-defaults', (req, res) => {
  try {
    const result = restoreDefaults();
    io.emit('monsters:updated', {
      monsters: result.monsters,
      event: 'restored_defaults'
    });
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/export', (req, res) => {
  try {
    const monsters = getMonsters();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="carrera_monstruos.json"');
    res.send(JSON.stringify(monsters, null, 2));
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/import', (req, res) => {
  try {
    const { monsters } = req.body;
    if (!Array.isArray(monsters) || monsters.length === 0) {
      throw new Error('El formato del archivo JSON no es válido.');
    }
    saveMonsters(monsters);
    io.emit('monsters:updated', {
      monsters,
      event: 'imported'
    });
    res.json({ success: true, monsters });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Serve frontend build if exists
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  // Fallback for SPA routing
  app.use((req, res, next) => {
    // If request is for an API route that wasn't matched, return 404 json
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ success: false, message: 'Ruta no encontrada' });
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Connected clients tracking
let connectedCount = 0;

io.on('connection', (socket) => {
  connectedCount++;
  io.emit('stats:clients', { count: connectedCount });

  // Send initial data to connected client
  socket.emit('monsters:init', {
    monsters: getMonsters(),
    clientCount: connectedCount
  });

  socket.on('disconnect', () => {
    connectedCount = Math.max(0, connectedCount - 1);
    io.emit('stats:clients', { count: connectedCount });
  });

  // Support direct socket vote submissions as well
  socket.on('vote:submit', (data, callback) => {
    try {
      const result = recordVote(data);
      io.emit('monsters:updated', {
        monsters: result.monsters,
        event: 'vote_added',
        vote: result.vote
      });
      if (typeof callback === 'function') {
        callback({ success: true, ...result });
      }
    } catch (err) {
      if (typeof callback === 'function') {
        callback({
          success: false,
          message: err.message,
          code: err.code || 'ERROR',
          previousMonster: err.previousMonster || null
        });
      }
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor Carrera de Monstruos escuchando en el puerto ${PORT}`);
  console.log(`📡 WebSocket y API listos para sincronización multidispositivo`);
});
