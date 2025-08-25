import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { fetchAuthSession } from 'aws-amplify/auth';
import { useDispatch } from 'react-redux';
import { addMessage } from '../features/chatSlice';

export function useSocket(onEvents?: (socket: Socket) => void) {
  const socketRef = useRef<Socket | null>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      if (!token) return;
      const socket = io('http://localhost:3001', {
        auth: { token },
        transports: ['websocket'],
      });
      socketRef.current = socket;
      socket.on('api_response', (data) => {
        dispatch(addMessage(data));
      });
      if (onEvents) onEvents(socket);
    })();
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return socketRef;
}
