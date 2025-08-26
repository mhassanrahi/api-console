import { Router, Request, Response } from 'express';
import { UserService } from '../services/userService';

const router = Router();

// Health check endpoint
router.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// User preferences endpoints
router.get('/user/preferences', async (req: Request, res: Response) => {
  try {
    // TODO: Get actual user ID from JWT token
    const userId = 'default'; // This should come from authenticated user
    const preferences = await UserService.getUserPreferences(userId);
    res.json(preferences);
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    res.status(500).json({ error: 'Failed to fetch user preferences' });
  }
});

router.post('/user/preferences', async (req: Request, res: Response) => {
  try {
    // TODO: Get actual user ID from JWT token
    const userId = 'default'; // This should come from authenticated user
    const success = await UserService.saveUserPreferences(userId, req.body);

    if (success) {
      res.json({ success: true, message: 'Preferences saved' });
    } else {
      res.status(500).json({ error: 'Failed to save preferences' });
    }
  } catch (error) {
    console.error('Error saving user preferences:', error);
    res.status(500).json({ error: 'Failed to save user preferences' });
  }
});

// Search history endpoints
router.get('/searches/history', async (req: Request, res: Response) => {
  try {
    // TODO: Get actual user ID from JWT token
    const userId = 'default'; // This should come from authenticated user
    const history = await UserService.getSearchHistory(userId);
    res.json(history);
  } catch (error) {
    console.error('Error fetching search history:', error);
    res.status(500).json({ error: 'Failed to fetch search history' });
  }
});

router.post('/searches', async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // TODO: Get actual user ID from JWT token
    const userId = 'default'; // This should come from authenticated user
    const searchHistory = await UserService.saveSearchQuery(userId, query);
    res.json({
      success: true,
      id: searchHistory.id,
      query: searchHistory.query,
      timestamp: searchHistory.timestamp,
    });
  } catch (error) {
    console.error('Error saving search query:', error);
    res.status(500).json({ error: 'Failed to save search query' });
  }
});

router.delete('/searches/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const searchId = parseInt(id);

    if (isNaN(searchId)) {
      return res.status(400).json({ error: 'Invalid search ID' });
    }

    // TODO: Get actual user ID from JWT token
    const userId = 'default'; // This should come from authenticated user
    const success = await UserService.deleteSearchFromHistory(userId, searchId);

    if (success) {
      res.json({ success: true, message: 'Search deleted' });
    } else {
      res.status(500).json({ error: 'Failed to delete search' });
    }
  } catch (error) {
    console.error('Error deleting search from history:', error);
    res.status(500).json({ error: 'Failed to delete search from history' });
  }
});

export default router;
