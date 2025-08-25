import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});



// JWT validation middleware for Socket.IO using aws-jwt-verify
import { CognitoJwtVerifier } from 'aws-jwt-verify';
const verifier = CognitoJwtVerifier.create({
  userPoolId: 'us-east-1_PIG8yV895',
  tokenUse: 'id',
  clientId: '5ek2a00qgbfhns0d31p6utfdbq',
});
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) throw new Error('No token provided');
    const payload = await verifier.verify(token);
    socket.data.user = payload;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log('WebSocket client connected:', socket.id);

  socket.on('chat_command', async (data) => {
    console.log('Received command:', data);
    socket.emit('command_status', { status: 'processing' });
    // Simulate command processing
    setTimeout(() => {
      socket.emit('api_response', {
        command: data.command,
        result: `Echo: ${data.command}`,
        api: 'Cat Facts',
        timestamp: Date.now(),
      });
      socket.emit('command_status', { status: 'success' });
    }, 1000);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Backend API server running on http://localhost:${PORT}`);
});
