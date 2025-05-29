
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

export default function SignupPage() {
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signUp } = useMockAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      toast({
        title: "Password Tidak Cocok",
        description: "Pastikan password dan konfirmasi password sama.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    
    const result = await signUp(username, name, password);
    if (result.success) {
      toast({
        title: "Pendaftaran Berhasil",
        description: "Akun Anda telah dibuat. Silakan masuk.",
      });
      router.push('/'); // Redirect to home/chat page after signup
    } else {
      toast({
        title: "Pendaftaran Gagal",
        description: result.message,
        variant: "destructive",
      });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="items-center">
          <HibeurLogo className="h-12 mb-2" />
          <CardTitle className="text-2xl">Buat Akun Baru</CardTitle>
          <CardDescription>Isi form di bawah ini untuk mendaftar.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Pilih username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap (Opsional)</Label>
              <Input
                id="name"
                type="text"
                placeholder="Nama Anda"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Buat password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Ulangi password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Daftar
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex-col items-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Sudah punya akun?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Masuk di sini
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
