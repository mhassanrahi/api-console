import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { loadMessages } from '../features/chatSlice';
import apiService from '../services/apiService';
import { useAuthUser } from '../utils/useAuthUser';

export function useChatMessages() {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useAuthUser();

  const loadChatMessages = async () => {
    try {
      // Only load messages if user is authenticated
      if (!isAuthenticated || !user) {
        console.log('⏭️ Skipping chat message load - user not authenticated');
        return;
      }

      console.log('user', user);

      console.log(
        '🔄 Loading chat messages from database for user:',
        user.signInDetails.loginId
      );

      const response = await apiService.getAllChatMessages(100); // Load last 100 messages

      if (response.success && response.data) {
        console.log(
          '✅ Loaded',
          response.data.length,
          'chat messages from database'
        );

        // Transform the data to match the frontend format if needed
        const messages = response.data.map((msg: any) => ({
          id: msg.id,
          command: msg.command || '',
          result: msg.result || msg.content || '',
          api: msg.api || msg.apiName || 'unknown',
          timestamp: msg.timestamp || new Date(msg.createdAt).getTime(),
          pinned: msg.pinned || false,
          messageType: msg.messageType,
          success: msg.success !== false, // Default to true if not specified
          errorMessage: msg.errorMessage,
        }));

        // Update Redux store with loaded messages
        dispatch(loadMessages(messages));
      } else {
        console.warn('⚠️ Failed to load chat messages:', response.error);
      }
    } catch (error) {
      console.error('❌ Error loading chat messages:', error);
    }
  };

  // Load messages when user authentication changes
  useEffect(() => {
    console.log('🔍 useChatMessages effect triggered:', {
      isAuthenticated,
      user: user ? { email: user.email, id: user.id } : null,
      loading: false, // We don't have loading from useAuthUser
    });

    if (isAuthenticated && user) {
      console.log('🚀 Starting to load chat messages...');
      loadChatMessages();
    } else {
      console.log('⏸️ Skipping chat message load - conditions not met');
    }
  }, [isAuthenticated, user]);

  return {
    loadChatMessages,
  };
}
