import { useEffect, useState } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';

export function useAuthUser() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getCurrentUser()
      .then(u => isMounted && setUser(u))
      .catch(() => isMounted && setUser(null))
      .finally(() => isMounted && setLoading(false));
    return () => {
      isMounted = false;
    };
  }, []);

  return { user, loading, isAuthenticated: !!user };
}
