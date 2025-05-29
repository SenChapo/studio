
'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { HibeurLogo } from '@/components/icons/CunenkLogo'; // Assuming CunenkLogo exports HibeurLogo now
import { useMockAuth } from '@/hooks/useMockAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useMockAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    
    const result = await login(username, password);
    if (result.success) {
      toast({
        title: "Login Berhasil",
        description: "Selamat datang kembali!",
      });
      router.push('/'); // Redirect to home/chat page
    } else {
      toast({
        title: "Login Gagal",
        description: result.message,
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="items-center">
          <HibeurLogo className="h-12 mb-2" />
          <CardTitle className="text-2xl">Masuk ke Akun Anda</CardTitle>
          <CardDescription>Masukkan username dan password Anda untuk melanjutkan.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Username Anda"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Password Anda"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Masuk
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex-col items-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Belum punya akun?{' '}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Daftar di sini
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
