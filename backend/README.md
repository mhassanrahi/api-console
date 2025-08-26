# Backend API Server

A modular Node.js/Express backend with WebSocket support for the Reactive API Console application.

## 🏗️ Project Structure

```
src/
├── config/
│   └── database.ts          # Database configuration and interfaces
├── controllers/
│   └── commandController.ts # Chat command processing logic
├── middleware/
│   └── auth.ts             # JWT authentication middleware
├── routes/
│   └── apiRoutes.ts        # REST API endpoints
├── services/
│   ├── apiService.ts       # External API integrations
│   └── userService.ts      # User preferences and search history
├── socket/
│   └── websocketHandler.ts # WebSocket event handling
└── index.ts                # Main application entry point
```

## 🚀 Features

### REST API Endpoints
- `GET /api/health` - Health check
- `GET /api/user/preferences` - Get user preferences
- `POST /api/user/preferences` - Save user preferences
- `GET /api/searches/history` - Get search history
- `POST /api/searches` - Save search query
- `DELETE /api/searches/:id` - Delete search from history

### WebSocket Events
- `chat_command` - Process chat commands
- `api_response` - Send API responses
- `command_status` - Send processing status
- `typing_indicator` - Show typing indicators
- `clear_chat_history` - Clear chat history

### Supported Commands
- `get cat fact` - Get random cat facts
- `get chuck joke` - Get Chuck Norris jokes
- `search chuck [term]` - Search Chuck Norris jokes
- `get activity` - Get random activity suggestions
- `search github [username]` - Search GitHub users
- `get weather [city]` - Get weather information
- `define [word]` - Get word definitions
- `get my preferences` - Get user preferences
- `save search [query]` - Save search queries
- `get search history` - Get search history
- `clear` - Clear chat history
- `help` - Show available commands

## 🛠️ Installation

```bash
npm install
```

## 🏃‍♂️ Development

```bash
npm run dev
```

## 🏗️ Build

```bash
npm run build
```

## 🚀 Production

```bash
npm start
```

## 📦 Dependencies

- **Express** - Web framework
- **Socket.IO** - WebSocket server
- **AWS JWT Verify** - JWT token validation
- **CORS** - Cross-origin resource sharing
- **TypeScript** - Type safety

## 🔧 Configuration

### Environment Variables
- `PORT` - Server port (default: 3001)
- `AWS_COGNITO_USER_POOL_ID` - AWS Cognito User Pool ID
- `AWS_COGNITO_CLIENT_ID` - AWS Cognito Client ID

### AWS Cognito Setup
The application uses AWS Cognito for authentication. Configure your Cognito User Pool and Client ID in the `middleware/auth.ts` file.

## 🧪 Testing

```bash
npm test
```

## 📝 API Documentation

### Authentication
All WebSocket connections require JWT authentication via AWS Cognito. Include the token in the connection handshake:

```javascript
const socket = io('http://localhost:3001', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

### WebSocket Events

#### Sending Commands
```javascript
socket.emit('chat_command', {
  command: 'get cat fact',
  timestamp: Date.now()
});
```

#### Receiving Responses
```javascript
socket.on('api_response', (data) => {
  console.log('API Response:', data);
  // data: { command, result, api, timestamp }
});

socket.on('command_status', (data) => {
  console.log('Status:', data.status);
  // status: 'processing' | 'success' | 'error'
});

socket.on('typing_indicator', (data) => {
  console.log('Typing:', data.isProcessing);
});
```

## 🔄 Architecture

### Modular Design
The application follows a modular architecture with clear separation of concerns:

1. **Controllers** - Handle business logic
2. **Services** - Manage external API calls and data operations
3. **Routes** - Define REST API endpoints
4. **Middleware** - Handle authentication and request processing
5. **Socket Handlers** - Manage WebSocket connections and events

### Error Handling
- Comprehensive error handling in all modules
- Graceful degradation for external API failures
- Proper error responses to clients

### Scalability
- Modular structure allows easy scaling
- Service layer can be easily extended
- WebSocket handler supports multiple connections

## 🤝 Contributing

1. Follow the existing code structure
2. Add proper TypeScript types
3. Include error handling
4. Update documentation as needed

## 📄 License

ISC
