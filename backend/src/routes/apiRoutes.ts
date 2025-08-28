import { Router, Request, Response } from 'express';
import { UserController } from '../controllers/userController';
import { SearchController } from '../controllers/searchController';
import { ChatController } from '../controllers/chatController';
import { authenticateRequest } from '../middleware/httpAuth';

const router = Router();

// Health check endpoint
router.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// User sync endpoint (triggered after login)
router.post('/user/sync', UserController.syncUserData);

// User profile endpoints
router.get('/user/profile', authenticateRequest, UserController.getUserProfile);
router.put(
  '/user/profile',
  authenticateRequest,
  UserController.updateUserProfile
);

// User preferences endpoints
router.get(
  '/user/preferences',
  authenticateRequest,
  UserController.getUserPreferences
);
router.post(
  '/user/preferences',
  authenticateRequest,
  UserController.saveUserPreferences
);

// User stats endpoint
router.get('/user/stats', authenticateRequest, UserController.getUserStats);

// Search history endpoints
router.get(
  '/searches/history',
  authenticateRequest,
  SearchController.getSearchHistory
);
router.post('/searches', authenticateRequest, SearchController.saveSearchQuery);
router.delete(
  '/searches/:id',
  authenticateRequest,
  SearchController.deleteSearchFromHistory
);

// Get all chat messages for current user
router.get(
  '/chat/messages',
  authenticateRequest,
  ChatController.getChatMessages
);

// Pin/Unpin chat message
router.post(
  '/chat/messages/:messageId/pin',
  authenticateRequest,
  ChatController.toggleMessagePin
);

// Get pinned messages for current user
router.get(
  '/chat/messages/pinned',
  authenticateRequest,
  ChatController.getPinnedMessages
);

export default router;
