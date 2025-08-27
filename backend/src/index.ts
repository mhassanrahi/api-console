import 'dotenv/config';
import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';

// Import modular components
import apiRoutes from './routes/apiRoutes';
import { WebSocketHandler } from './socket/websocketHandler';
import { initializeDatabase, closeDatabase } from './config/database';

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Create Socket.IO server with CORS configuration
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
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

const startServer = async () => {
  try {
    // Initialize database connection
    await initializeDatabase();

    server.listen(PORT, () => {
      console.log(`Backend API server running on http://localhost:${PORT}`);
      console.log(`WebSocket server ready for connections`);
      console.log(
        `🔗 Connected clients: ${webSocketHandler.getConnectedClientsCount()}`
      );
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await closeDatabase();
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await closeDatabase();
  server.close(() => {
    console.log('Process terminated');
  });
});
