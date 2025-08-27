import { Server as SocketIOServer } from 'socket.io';
import {
  AuthenticatedSocket,
  authenticateSocket,
  getCurrentDbUser,
} from '../middleware/auth';
import { CommandController } from '../controllers/commandController';
import { UserService } from '../services/userService';

interface ProcessingStep {
  message: string;
  duration: number;
}

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
      socket.on('chat_command', async data => {
        await this.handleChatCommand(socket, data);
      });

      // Handle typing indicators
      socket.on('typing_start', () => {
        socket.broadcast.emit('user_typing', {
          userId: socket.data.user?.sub || 'unknown',
          isTyping: true,
        });
      });

      socket.on('typing_stop', () => {
        socket.broadcast.emit('user_typing', {
          userId: socket.data.user?.sub || 'unknown',
          isTyping: false,
        });
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log('WebSocket client disconnected:', socket.id);
        // Notify other users that this user stopped typing
        socket.broadcast.emit('user_typing', {
          userId: socket.data.user?.sub || 'unknown',
          isTyping: false,
        });
      });
    });
  }

  private async handleChatCommand(socket: AuthenticatedSocket, data: any) {
    const processingSteps: ProcessingStep[] = [
      { message: 'Processing your command', duration: 500 },
      { message: 'Fetching data from API', duration: 800 },
      { message: 'Analyzing response', duration: 600 },
      { message: 'Preparing results', duration: 400 },
    ];

    const startTime = Date.now();
    let dbUser: any = null;

    try {
      console.log('Received command:', data);

      // Get user from socket
      dbUser = getCurrentDbUser(socket);

      // Save user message directly to database
      await UserService.saveChatMessage(dbUser.id, {
        messageType: 'user',
        content: data.command,
        command: data.command,
        metadata: {
          timestamp: data.timestamp,
          socketId: socket.id,
        },
      });

      // Send initial processing status
      socket.emit('command_status', { status: 'processing' });
      socket.emit('typing_indicator', { isProcessing: true });

      // Simulate processing steps for better UX
      for (const step of processingSteps) {
        socket.emit('processing_step', {
          message: step.message,
          timestamp: Date.now(),
        });

        // Wait for the step duration (but don't block too long)
        await new Promise(resolve =>
          setTimeout(resolve, Math.min(step.duration, 200))
        );
      }

      // Process the command
      const result = await CommandController.processCommand(
        data.command,
        socket
      );

      const processingTime = Date.now() - startTime;

      // Save API response to database
      await UserService.saveChatMessage(dbUser.id, {
        messageType: 'api_response',
        content:
          typeof result.result === 'string'
            ? result.result
            : JSON.stringify(result.result),
        command: data.command,
        apiName: result.api,
        responseStatus: 200,
        responseTime: processingTime,
        success: true,
        apiResponse:
          typeof result.result === 'string' ? undefined : result.result,
        metadata: {
          processingTime,
          timestamp: Date.now(),
          socketId: socket.id,
        },
      });

      // Handle special system commands
      if (
        result.api === 'System' &&
        result.result === 'Chat history cleared.'
      ) {
        socket.emit('clear_chat_history');
      }

      // Send the response with enhanced metadata
      socket.emit('api_response', {
        command: data.command,
        result: result.result,
        api: result.api,
        timestamp: Date.now(),
        processingTime,
        success: true,
        sessionId: 'default',
      });

      // Send success status
      socket.emit('command_status', {
        status: 'success',
        message: 'Command executed successfully',
        timestamp: Date.now(),
      });
      socket.emit('typing_indicator', { isProcessing: false });

      // Log successful command execution
      console.log(
        `Command executed successfully: ${data.command} by user ${socket.data.user?.sub || 'unknown'}`
      );
    } catch (error) {
      console.error('Error processing command:', error);

      const processingTime = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred';
      const errorCode =
        error instanceof Error && 'code' in error
          ? (error as any).code
          : 'UNKNOWN_ERROR';

      // Save error message to database
      try {
        await UserService.saveChatMessage(dbUser.id, {
          messageType: 'error',
          content: `Error: ${errorMessage}`,
          command: data.command,
          responseStatus: 500,
          responseTime: processingTime,
          success: false,
          errorMessage,
          metadata: {
            errorCode,
            processingTime,
            timestamp: Date.now(),
            socketId: socket.id,
          },
        });
      } catch (dbError) {
        console.error('Failed to save error message to database:', dbError);
      }

      // Send detailed error status
      socket.emit('command_status', {
        status: 'error',
        error: errorMessage,
        errorCode,
        timestamp: Date.now(),
        command: data.command,
      });
      socket.emit('typing_indicator', { isProcessing: false });

      // Send error response to chat
      socket.emit('api_response', {
        command: data.command,
        result: `Error: ${errorMessage}`,
        api: 'System',
        timestamp: Date.now(),
        processingTime,
        success: false,
        error: true,
        sessionId: 'default',
      });

      // Log error for debugging
      console.error(
        `Command failed: ${data.command} by user ${socket.data.user?.sub || 'unknown'}`,
        {
          error: errorMessage,
          errorCode,
          timestamp: new Date().toISOString(),
        }
      );
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

  // Method to get connected clients info
  public getConnectedClientsInfo() {
    const clients = Array.from(this.io.sockets.sockets.values());
    return clients.map(client => ({
      id: client.id,
      userId: (client as AuthenticatedSocket).data.user?.sub || 'unknown',
      connectedAt: (client as any).connectedAt || Date.now(),
    }));
  }

  // Method to send system notification to all clients
  public broadcastSystemNotification(
    message: string,
    type: 'info' | 'warning' | 'error' = 'info'
  ) {
    this.io.emit('system_notification', {
      message,
      type,
      timestamp: Date.now(),
    });
  }

  // Method to send user-specific notification
  public sendUserNotification(
    userId: string,
    message: string,
    type: 'info' | 'warning' | 'error' = 'info'
  ) {
    const clients = Array.from(
      this.io.sockets.sockets.values()
    ) as AuthenticatedSocket[];
    const userSocket = clients.find(client => client.data.user?.sub === userId);

    if (userSocket) {
      userSocket.emit('user_notification', {
        message,
        type,
        timestamp: Date.now(),
      });
    }
  }
}
