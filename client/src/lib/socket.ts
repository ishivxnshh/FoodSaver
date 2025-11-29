import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

let socket: Socket | null = null;

export const initSocket = (userId: string) => {
  if (socket) return socket;

  socket = io(SOCKET_URL, {
    transports: ['websocket'],
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    autoConnect: true,
  });

  socket.on('connect', () => {
    console.log('Socket connected');
    socket?.emit('join-room', userId);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  socket.on('connect_error', (error) => {
    console.warn('Socket connection error:', error.message);
    // Silently handle connection errors - don't show to user
  });

  socket.on('reconnect_failed', () => {
    console.warn('Socket reconnection failed - server may be offline');
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export default { initSocket, getSocket, disconnectSocket };

