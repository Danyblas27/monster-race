import { io } from 'socket.io-client';

// Connect to current origin or fallback
const URL = import.meta.env.VITE_SERVER_URL || '';

export const socket = io(URL, {
  transports: ['websocket', 'polling'],
  autoConnect: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
});
