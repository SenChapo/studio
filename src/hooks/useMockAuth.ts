
'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type User = { name: string; username: string; avatar: string }; // Added username
type RegisteredUser = { username: string; password_DONT_STORE_PLAINTEXT_IN_PROD: string; avatar: string; name: string };

const currentUserKey = 'hibeurCurrentUser'; // Stores current logged-in user session
const registeredUsersKey = 'hibeurRegisteredUsers';

export const useMockAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start true to prevent premature redirects
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    try {
      const storedUser = sessionStorage.getItem(currentUserKey);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Error parsing current user from sessionStorage:", error);
      sessionStorage.removeItem(currentUserKey);
    }
    setIsLoading(false);
  }, []);

  const signUp = useCallback(async (username: string, name: string, password_DONT_STORE_PLAINTEXT_IN_PROD: string): Promise<{ success: boolean; message: string }> => {
    if (!isMounted) return { success: false, message: "Komponen belum terpasang."};
    setIsLoading(true);

    return new Promise((resolve) => {
      setTimeout(() => {
        const usersRaw = localStorage.getItem(registeredUsersKey);
        const users: RegisteredUser[] = usersRaw ? JSON.parse(usersRaw) : [];

        if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
          setIsLoading(false);
          resolve({ success: false, message: "Username sudah digunakan." });
          return;
        }

        const newUser: RegisteredUser = {
          username,
          name: name || username, // Default name to username if not provided
          password_DONT_STORE_PLAINTEXT_IN_PROD,
          avatar: `https://placehold.co/40x40.png?text=${username.charAt(0).toUpperCase()}`
        };
        users.push(newUser);
        localStorage.setItem(registeredUsersKey, JSON.stringify(users));

        const sessionUser: User = { name: newUser.name, username: newUser.username, avatar: newUser.avatar };
        setUser(sessionUser);
        sessionStorage.setItem(currentUserKey, JSON.stringify(sessionUser));
        setIsLoading(false);
        resolve({ success: true, message: "Pendaftaran berhasil!" });
      }, 500);
    });
  }, [isMounted]);

  const login = useCallback(async (username: string, password_DONT_STORE_PLAINTEXT_IN_PROD: string): Promise<{ success: boolean; message: string }> => {
    if (!isMounted) return { success: false, message: "Komponen belum terpasang."};
    setIsLoading(true);

    return new Promise((resolve) => {
      setTimeout(() => {
        const usersRaw = localStorage.getItem(registeredUsersKey);
        const users: RegisteredUser[] = usersRaw ? JSON.parse(usersRaw) : [];
        const foundUser = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password_DONT_STORE_PLAINTEXT_IN_PROD === password_DONT_STORE_PLAINTEXT_IN_PROD);

        if (foundUser) {
          const sessionUser: User = { name: foundUser.name, username: foundUser.username, avatar: foundUser.avatar };
          setUser(sessionUser);
          sessionStorage.setItem(currentUserKey, JSON.stringify(sessionUser));
          setIsLoading(false);
          resolve({ success: true, message: "Login berhasil!" });
        } else {
          setIsLoading(false);
          resolve({ success: false, message: "Username atau password salah." });
        }
      }, 500);
    });
  }, [isMounted]);

  const signOut = useCallback(() => {
    if (!isMounted) return;
    setIsLoading(true);
    setUser(null);
    sessionStorage.removeItem(currentUserKey);
    setIsLoading(false);
    router.push('/login');
  }, [isMounted, router]);

  const updateAvatar = useCallback((newAvatarUrl: string) => {
    if (!isMounted || !user) return;
    
    const updatedUser = { ...user, avatar: newAvatarUrl };
    setUser(updatedUser);
    sessionStorage.setItem(currentUserKey, JSON.stringify(updatedUser));

    // Also update in the registered users list in localStorage
    const usersRaw = localStorage.getItem(registeredUsersKey);
    let users: RegisteredUser[] = usersRaw ? JSON.parse(usersRaw) : [];
    users = users.map(u => u.username === user.username ? { ...u, avatar: newAvatarUrl } : u);
    localStorage.setItem(registeredUsersKey, JSON.stringify(users));

  }, [isMounted, user]);
  
  const updateName = useCallback((newName: string) => {
    if (!isMounted || !user) return;
    
    const updatedUser = { ...user, name: newName };
    setUser(updatedUser);
    sessionStorage.setItem(currentUserKey, JSON.stringify(updatedUser));

    // Also update in the registered users list in localStorage
    const usersRaw = localStorage.getItem(registeredUsersKey);
    let users: RegisteredUser[] = usersRaw ? JSON.parse(usersRaw) : [];
    users = users.map(u => u.username === user.username ? { ...u, name: newName } : u);
    localStorage.setItem(registeredUsersKey, JSON.stringify(users));
  }, [isMounted, user]);


  return { user, signUp, login, signOut, isLoading, isMounted, updateAvatar, updateName };
};
