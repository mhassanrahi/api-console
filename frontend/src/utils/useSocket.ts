import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { fetchAuthSession } from 'aws-amplify/auth';

export function useSocket(onEvents?: (socket: Socket) => void) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    (async () => {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      if (!token) return;
      const socket = io(
        import.meta.env.VITE_API_URL || 'http://localhost:3001',
        {
          auth: { token },
          transports: ['websocket'],
        }
      );
      socketRef.current = socket;

      // Let the component handle its own events
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
