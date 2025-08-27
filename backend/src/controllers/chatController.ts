import { Response } from 'express';
import { UserService } from '../services/userService';
import { AuthenticatedRequest, getCurrentDbUser } from '../middleware/httpAuth';

export class ChatController {
  // Get all chat messages for current user
  static async getChatMessages(req: AuthenticatedRequest, res: Response) {
    try {
      console.log('🔍 ChatController: /api/chat/messages endpoint called');
      const dbUser = getCurrentDbUser(req);
      console.log(
        '🔍 ChatController: dbUser found:',
        dbUser ? { id: dbUser.id, email: dbUser.email } : null
      );

      if (!dbUser) {
        console.log('❌ ChatController: User not found in request');
        return res.status(401).json({ error: 'User not found' });
      }

      const limit = parseInt(req.query.limit as string) || 100;

      console.log(
        '🔍 ChatController: Getting chat messages for user:',
        dbUser.id
      );

      // Get messages directly for the user
      const messages = await UserService.getChatMessages(dbUser.id, limit);
      console.log(
        '🔍 ChatController: Found',
        messages.length,
        'messages for user'
      );

      // Transform messages to match frontend format
      const transformedMessages = messages.map(msg => ({
        id: msg.id,
        command: msg.command || '',
        result: msg.content,
        api: msg.apiName || 'unknown',
        timestamp: new Date(msg.createdAt).getTime(),
        pinned: false,
        messageType: msg.messageType,
        success: msg.success,
        errorMessage: msg.errorMessage,
      }));

      console.log(
        '🔍 ChatController: Sending',
        transformedMessages.length,
        'transformed messages'
      );
      res.json(transformedMessages);
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      res.status(500).json({ error: 'Failed to fetch chat messages' });
    }
  }
}
