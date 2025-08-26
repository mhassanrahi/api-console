import { Server as SocketIOServer } from 'socket.io';
import { AuthenticatedSocket, authenticateSocket } from '../middleware/auth';
import { CommandController } from '../controllers/commandController';

export class WebSocketHandler {
  private io: SocketIOServer;

  constructor(io: SocketIOServer) {
    this.io = io;
    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    // Apply authentication middleware to all connections
    this.io.use(authenticateSocket);
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      console.log('WebSocket client connected:', socket.id);

      // Handle chat commands
      socket.on('chat_command', async (data) => {
        await this.handleChatCommand(socket, data);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log('WebSocket client disconnected:', socket.id);
      });
    });
  }

  private async handleChatCommand(socket: AuthenticatedSocket, data: any) {
    try {
      console.log('Received command:', data);
      
      // Send processing status
      socket.emit('command_status', { status: 'processing' });
      socket.emit('typing_indicator', { isProcessing: true });

      // Process the command
      const result = await CommandController.processCommand(data.command, socket);

      // Handle special system commands
      if (result.api === 'System' && result.result === 'Chat history cleared.') {
        socket.emit('clear_chat_history');
      }

      // Send the response
      socket.emit('api_response', {
        command: data.command,
        result: result.result,
        api: result.api,
        timestamp: Date.now(),
      });

      // Send success status
      socket.emit('command_status', { status: 'success' });
      socket.emit('typing_indicator', { isProcessing: false });

    } catch (error) {
      console.error('Error processing command:', error);
      
      // Send error status
      socket.emit('command_status', { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'An unknown error occurred' 
      });
      socket.emit('typing_indicator', { isProcessing: false });
    }
  }

  // Method to broadcast messages to all connected clients
  public broadcastMessage(event: string, data: any) {
    this.io.emit(event, data);
  }

  // Method to send message to specific room
  public sendToRoom(room: string, event: string, data: any) {
    this.io.to(room).emit(event, data);
  }

  // Method to get connected clients count
  public getConnectedClientsCount(): number {
    return this.io.engine.clientsCount;
  }
}
