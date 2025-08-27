import { Response } from 'express';
import { UserService } from '../services/userService';
import { AuthenticatedRequest, getCurrentDbUser } from '../middleware/httpAuth';

export class SearchController {
  // Get search history
  static async getSearchHistory(req: AuthenticatedRequest, res: Response) {
    try {
      const dbUser = getCurrentDbUser(req);

      if (!dbUser) {
        return res.status(401).json({ error: 'User not found' });
      }

      const limit = parseInt(req.query.limit as string) || 50;
      const history = await UserService.getSearchHistory(dbUser.id, limit);
      res.json(history);
    } catch (error) {
      console.error('Error fetching search history:', error);
      res.status(500).json({ error: 'Failed to fetch search history' });
    }
  }

  // Save search query
  static async saveSearchQuery(req: AuthenticatedRequest, res: Response) {
    try {
      const dbUser = getCurrentDbUser(req);

      if (!dbUser) {
        return res.status(401).json({ error: 'User not found' });
      }

      const { query, api, metadata } = req.body;
      if (!query) {
        return res.status(400).json({ error: 'Query is required' });
      }

      const searchHistory = await UserService.saveSearchQuery(
        dbUser.id,
        query,
        api,
        metadata
      );
      res.json({
        success: true,
        id: searchHistory.id,
        query: searchHistory.query,
        api: searchHistory.api,
        createdAt: searchHistory.createdAt,
      });
    } catch (error) {
      console.error('Error saving search query:', error);
      res.status(500).json({ error: 'Failed to save search query' });
    }
  }

  // Delete search from history
  static async deleteSearchFromHistory(
    req: AuthenticatedRequest,
    res: Response
  ) {
    try {
      const dbUser = getCurrentDbUser(req);

      if (!dbUser) {
        return res.status(401).json({ error: 'User not found' });
      }

      const { id } = req.params;
      const success = await UserService.deleteSearchFromHistory(dbUser.id, id);

      if (success) {
        res.json({ success: true, message: 'Search deleted' });
      } else {
        res.status(404).json({ error: 'Search not found' });
      }
    } catch (error) {
      console.error('Error deleting search from history:', error);
      res.status(500).json({ error: 'Failed to delete search from history' });
    }
  }
}
