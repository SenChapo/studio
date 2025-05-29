
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChatPage } from "@/components/chat/ChatPage";
import { useMockAuth } from "@/hooks/useMockAuth";
import { Skeleton } from '@/components/ui/skeleton'; // For loading state

export default function HomePage() {
  const { user, isLoading, isMounted } = useMockAuth();
  const router = useRouter();

  useEffect(() => {
    if (isMounted && !isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, isMounted, router]);

  if (isLoading || !isMounted) {
    // Show a loading skeleton or a spinner while checking auth state
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-background">
        <Skeleton className="h-12 w-12 rounded-full mb-4" />
        <Skeleton className="h-4 w-[250px] mb-2" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    );
  }

  if (!user) {
    // This case should ideally be handled by the redirect,
    // but as a fallback, show loading or nothing to prevent flashing ChatPage
    return (
        <div className="flex flex-col h-screen items-center justify-center bg-background">
            <p className="text-muted-foreground">Mengarahkan ke halaman login...</p>
        </div>
    );
  }

  return <ChatPage />;
}
