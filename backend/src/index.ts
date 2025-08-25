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
    const cmd = data.command.trim().toLowerCase();
    try {
      let api = '';
      let result = '';
      if (cmd === 'get cat fact') {
        api = 'Cat Facts';
        const resp = await fetch('https://catfact.ninja/fact');
        const json = await resp.json();
        result = json.fact || 'No fact found.';
      } else if (cmd === 'get joke') {
        api = 'Chuck Norris Jokes';
        const resp = await fetch('https://official-joke-api.appspot.com/random_joke');
        const json = await resp.json();
        result = json.setup && json.punchline ? `${json.setup} — ${json.punchline}` : 'No joke found.';
      } else if (cmd.startsWith('define ')) {
        api = 'Dictionary';
        const word = cmd.replace('define ', '').trim();
        if (!word) {
          result = 'Please provide a word to define.';
        } else {
          const resp = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
          if (resp.ok) {
            const json = await resp.json();
            if (Array.isArray(json) && json[0]?.meanings?.[0]?.definitions?.[0]?.definition) {
              result = `${word}: ${json[0].meanings[0].definitions[0].definition}`;
            } else {
              result = `No definition found for "${word}".`;
            }
          } else {
            result = `No definition found for "${word}".`;
          }
        }
      } else if (cmd.startsWith('get weather')) {
        api = 'Weather';
        // Example: get weather Berlin
        const city = cmd.replace('get weather', '').trim() || 'Berlin';
        // Hardcoded city-to-coords for demo
        const cityCoords = {
          berlin: { lat: 52.52, lon: 13.41 },
          london: { lat: 51.51, lon: -0.13 },
          paris: { lat: 48.85, lon: 2.35 },
          tokyo: { lat: 35.68, lon: 139.76 },
        };
        const coords = cityCoords[city.toLowerCase()] || cityCoords['berlin'];
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current_weather=true`;
        const resp = await fetch(url);
        const json = await resp.json();
        if (json.current_weather) {
          result = `Weather in ${city}: ${json.current_weather.temperature}°C, wind ${json.current_weather.windspeed} km/h`;
        } else {
          result = 'Weather data not found.';
        }
      } else {
        api = 'General';
        result = `Unknown command: ${data.command}`;
      }

      console.log("result", result);
      socket.emit('api_response', {
        command: data.command,
        result,
        api,
        timestamp: Date.now(),
      });
      socket.emit('command_status', { status: 'success' });
    } catch (err: any) {
      socket.emit('command_status', { status: 'error', error: err.message });
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Backend API server running on http://localhost:${PORT}`);
});
