'use client';

import { onAuthStateChanged, type User } from 'firebase/auth';
import { useEffect, useState } from 'react';

import { useAuth } from '..';

export function useUser() {
  const auth = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [aac, setAac] = useState<any>(null); // App-specific user data.

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Reload user data from localStorage when auth state changes.
        // This ensures we have the latest profile info after updates.
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            setAac(JSON.parse(storedUser));
        }
      } else {
        setAac(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  return { user, aac, isLoading };
}
