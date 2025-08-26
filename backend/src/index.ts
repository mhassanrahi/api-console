import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';

// Import modular components
import apiRoutes from './routes/apiRoutes';
import { WebSocketHandler } from './socket/websocketHandler';

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Create Socket.IO server with CORS configuration
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use('/api', apiRoutes);

// Initialize WebSocket handler
const webSocketHandler = new WebSocketHandler(io);

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Backend API server running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket server ready for connections`);
  console.log(`🔗 Connected clients: ${webSocketHandler.getConnectedClientsCount()}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});
