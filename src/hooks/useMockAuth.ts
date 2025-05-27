import { useState, useCallback, useEffect } from 'react';

type User = { name: string; avatar: string };

export const useMockAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Simulate checking auth status on mount
    const storedUser = localStorage.getItem('luminaUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    return () => setIsMounted(false);
  }, []);

  const signIn = useCallback(() => {
    if (!isMounted) return;
    setIsLoading(true);
    setTimeout(() => {
      const demoUser = { name: 'Demo User', avatar: 'https://placehold.co/40x40.png' };
      setUser(demoUser);
      localStorage.setItem('luminaUser', JSON.stringify(demoUser));
      setIsLoading(false);
    }, 500);
  }, [isMounted]);

  const signOut = useCallback(() => {
    if (!isMounted) return;
    setIsLoading(true);
    setTimeout(() => {
      setUser(null);
      localStorage.removeItem('luminaUser');
      setIsLoading(false);
    }, 500);
  }, [isMounted]);

  return { user, signIn, signOut, isLoading, isMounted };
};
