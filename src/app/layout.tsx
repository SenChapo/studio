
import type {Metadata} from 'next';
import { Geist_Mono } from 'next/font/google'; // Keep Geist_Mono for monospaced text
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

// Remove Geist (sans-serif)
// const geistSans = Geist({
//   variable: '--font-geist-sans',
//   subsets: ['latin'],
// });

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Hibeur AI',
  description: 'Asisten AI cerdas Hibeur',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      {/* Update body className to remove geistSans.variable and rely on tailwind's font-sans */}
      <body className={`${geistMono.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
