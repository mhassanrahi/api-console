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
        console.log('ChatController: User not found in request');
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
        pinned: msg.pinned,
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

  // Toggle pin status of a message
  static async toggleMessagePin(req: AuthenticatedRequest, res: Response) {
    try {
      console.log(' ChatController: /api/chat/messages/pin endpoint called');
      const dbUser = getCurrentDbUser(req);

      if (!dbUser) {
        console.log(' ChatController: User not found in request');
        return res.status(401).json({ error: 'User not found' });
      }

      const { messageId } = req.params;

      if (!messageId) {
        return res.status(400).json({ error: 'Message ID is required' });
      }

      console.log(
        'ChatController: Toggling pin for message:',
        messageId,
        'user:',
        dbUser.id
      );

      const result = await UserService.toggleMessagePin(dbUser.id, messageId);

      if (result.success) {
        console.log(
          'ChatController: Successfully toggled pin for message:',
          messageId,
          'pinned:',
          result.pinned
        );
        res.json({
          success: true,
          pinned: result.pinned,
          message: `Message ${result.pinned ? 'pinned' : 'unpinned'} successfully`,
        });
      } else {
        console.log('ChatController: Failed to toggle pin:', result.error);
        res.status(400).json({
          success: false,
          error: result.error || 'Failed to toggle pin',
        });
      }
    } catch (error) {
      console.error('Error toggling message pin:', error);
      res.status(500).json({ error: 'Failed to toggle message pin' });
    }
  }

  // Get pinned messages for current user
  static async getPinnedMessages(req: AuthenticatedRequest, res: Response) {
    try {
      console.log('ChatController: /api/chat/messages/pinned endpoint called');
      const dbUser = getCurrentDbUser(req);

      if (!dbUser) {
        console.log('ChatController: User not found in request');
        return res.status(401).json({ error: 'User not found' });
      }

      console.log(
        'ChatController: Getting pinned messages for user:',
        dbUser.id
      );

      const pinnedMessages = await UserService.getPinnedMessages(dbUser.id);

      // Transform messages to match frontend format
      const transformedMessages = pinnedMessages.map(msg => ({
        id: msg.id,
        command: msg.command || '',
        result: msg.content,
        api: msg.apiName || 'unknown',
        timestamp: new Date(msg.createdAt).getTime(),
        pinned: msg.pinned,
        messageType: msg.messageType,
        success: msg.success,
        errorMessage: msg.errorMessage,
      }));

      console.log(
        'ChatController: Found',
        transformedMessages.length,
        'pinned messages'
      );
      res.json(transformedMessages);
    } catch (error) {
      console.error('Error fetching pinned messages:', error);
      res.status(500).json({ error: 'Failed to fetch pinned messages' });
    }
  }
}
