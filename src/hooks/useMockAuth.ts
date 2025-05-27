
import { useState, useCallback, useEffect } from 'react';

type User = { name: string; avatar: string };
const localStorageKey = 'cunenkUser';

export const useMockAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Simulate checking auth status on mount
    const storedUser = localStorage.getItem(localStorageKey);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    return () => setIsMounted(false);
  }, []);

  const signIn = useCallback(() => {
    if (!isMounted) return;
    setIsLoading(true);
    setTimeout(() => {
      // Check if user already exists, if so, use their data, otherwise create new
      const existingUser = localStorage.getItem(localStorageKey);
      if (existingUser) {
        setUser(JSON.parse(existingUser));
      } else {
        const demoUser = { name: 'Pengguna Demo', avatar: 'https://placehold.co/40x40.png' };
        setUser(demoUser);
        localStorage.setItem(localStorageKey, JSON.stringify(demoUser));
      }
      setIsLoading(false);
    }, 500);
  }, [isMounted]);

  const signOut = useCallback(() => {
    if (!isMounted) return;
    setIsLoading(true);
    setTimeout(() => {
      setUser(null);
      localStorage.removeItem(localStorageKey);
      setIsLoading(false);
    }, 500);
  }, [isMounted]);

  const updateAvatar = useCallback((newAvatarUrl: string) => {
    if (!isMounted || !user) return;
    const updatedUser = { ...user, avatar: newAvatarUrl };
    setUser(updatedUser);
    localStorage.setItem(localStorageKey, JSON.stringify(updatedUser));
  }, [isMounted, user]);


  return { user, signIn, signOut, isLoading, isMounted, updateAvatar };
};
