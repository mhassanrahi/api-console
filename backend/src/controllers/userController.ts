import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import { AuthenticatedRequest, getCurrentDbUser } from '../middleware/httpAuth';

export class UserController {
  // Get user profile
  static async getUserProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const dbUser = getCurrentDbUser(req);

      if (!dbUser) {
        return res.status(401).json({ error: 'User not found' });
      }

      // Return the actual user profile from database
      const userProfile = {
        id: dbUser.id,
        email: dbUser.email,
        username: dbUser.username,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        emailVerified: dbUser.emailVerified,
        active: dbUser.active,
        accountStatus: dbUser.accountStatus,
        userType: dbUser.userType,
        loginCount: dbUser.loginCount,
        lastLogin: dbUser.lastLogin,
        timezone: dbUser.timezone,
        locale: dbUser.locale,
        avatarUrl: dbUser.avatarUrl,
        bio: dbUser.bio,
        website: dbUser.website,
        location: dbUser.location,
        company: dbUser.company,
        jobTitle: dbUser.jobTitle,
      };

      res.json(userProfile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ error: 'Failed to fetch user profile' });
    }
  }

  // Update user profile
  static async updateUserProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const dbUser = getCurrentDbUser(req);

      if (!dbUser) {
        return res.status(401).json({ error: 'User not found' });
      }

      const profileData = req.body;
      const updatedUser = await UserService.updateUserProfile(
        dbUser.id,
        profileData
      );

      if (updatedUser) {
        res.json({
          success: true,
          message: 'Profile updated successfully',
          user: updatedUser,
        });
      } else {
        res.status(400).json({ error: 'Failed to update profile' });
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
      res.status(500).json({ error: 'Failed to update user profile' });
    }
  }

  // Get user preferences
  static async getUserPreferences(req: AuthenticatedRequest, res: Response) {
    try {
      const dbUser = getCurrentDbUser(req);
      console.log(
        '🔍 UserController - dbUser:',
        dbUser ? { id: dbUser.id, email: dbUser.email } : null
      );

      if (!dbUser) {
        return res.status(401).json({ error: 'User not found' });
      }

      console.log(
        '🔍 UserController - Calling getUserPreferences with userId:',
        dbUser.id
      );
      const preferences = await UserService.getUserPreferences(dbUser.id);
      res.json(preferences);
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      res.status(500).json({ error: 'Failed to fetch user preferences' });
    }
  }

  // Save user preferences
  static async saveUserPreferences(req: AuthenticatedRequest, res: Response) {
    try {
      const dbUser = getCurrentDbUser(req);

      if (!dbUser) {
        return res.status(401).json({ error: 'User not found' });
      }

      const success = await UserService.saveUserPreferences(
        dbUser.id,
        req.body
      );

      if (success) {
        res.json({ success: true, message: 'Preferences saved' });
      } else {
        res.status(500).json({ error: 'Failed to save preferences' });
      }
    } catch (error) {
      console.error('Error saving user preferences:', error);
      res.status(500).json({ error: 'Failed to save user preferences' });
    }
  }

  // Get user statistics
  static async getUserStats(req: AuthenticatedRequest, res: Response) {
    try {
      const dbUser = getCurrentDbUser(req);

      if (!dbUser) {
        return res.status(401).json({ error: 'User not found' });
      }

      const stats = await UserService.getUserStats(dbUser.id);
      res.json(stats);
    } catch (error) {
      console.error('Error fetching user stats:', error);
      res.status(500).json({ error: 'Failed to fetch user stats' });
    }
  }

  // Sync user data (triggered after login)
  static async syncUserData(req: Request, res: Response) {
    try {
      // This endpoint is called after login to ensure user data is synced
      // The actual sync happens in the auth middleware, so we just return success
      res.json({ success: true, message: 'User data synced' });
    } catch (error) {
      console.error('Error in user sync endpoint:', error);
      res.status(500).json({ error: 'Failed to sync user data' });
    }
  }
}
