
'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import Link from 'next/link'; // Import Link
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, UploadCloud, Image as ImageIcon, Languages, ArrowLeft } from 'lucide-react'; // Added ArrowLeft
import { getImageSummaryAction } from '@/app/actions';
import NextImage from 'next/image';
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type SupportedLanguage = 'id' | 'en';

export default function SummarizeImagePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('id');
  const { toast } = useToast();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB size limit
        toast({
          title: "File Terlalu Besar",
          description: "Ukuran gambar maksimal adalah 5MB.",
          variant: "destructive",
        });
        event.target.value = ""; // Reset file input
        return;
      }
      setSelectedFile(file);
      setSummary(null);
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFile || !previewUrl) {
      setError('Silakan pilih file gambar terlebih dahulu.');
      toast({
        title: "Tidak Ada Gambar",
        description: "Silakan pilih file gambar untuk diringkas.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setSummary(null);

    const promptForAI = selectedLanguage === 'id'
      ? "Analisis gambar ini dalam Bahasa Indonesia dan berikan deskripsi mendetail tentang isinya. Apa saja elemen kunci, warna, objek, teks yang ada, latar, dan suasana atau subjek keseluruhan?"
      : "Analyze this image in English and provide a detailed description of its content. What are the key elements, colors, objects, text present, background, and the overall mood or subject?";

    try {
      const result = await getImageSummaryAction({ 
        imageDataUri: previewUrl,
        userPrompt: promptForAI 
      });
      if (result.summary) {
        setSummary(result.summary);
        toast({
          title: "Ringkasan Berhasil Dibuat",
          description: "Gambar telah berhasil dianalisis dan diringkas.",
        });
      } else {
        setError(result.error || 'Gagal mendapatkan ringkasan gambar.');
        toast({
          title: "Gagal Membuat Ringkasan",
          description: result.error || 'Terjadi kesalahan yang tidak diketahui.',
          variant: "destructive",
        });
      }
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'Terjadi kesalahan tak terduga.';
      setError(errorMessage);
      toast({
        title: "Kesalahan Sistem",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8 flex flex-col items-center min-h-screen bg-background text-foreground">
      <Card className="w-full max-w-2xl shadow-2xl my-8 animate-fade-in-up">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-primary">Ringkasan Gambar AI</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Unggah gambar dan biarkan Hibeur AI mendeskripsikan isinya untuk Anda.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="imageUpload" className="text-lg font-semibold">Unggah Gambar Anda</Label>
              <div className="flex items-center justify-center w-full">
                  <label
                      htmlFor="imageUpload"
                      className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer border-input bg-card hover:bg-muted transition-colors"
                  >
                      {previewUrl ? (
                          <div className="relative w-full h-full p-2">
                             <NextImage src={previewUrl} alt="Pratinjau gambar yang dipilih" layout="fill" objectFit="contain" className="rounded-md" data-ai-hint="image preview" />
                          </div>
                      ) : (
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <UploadCloud className="w-12 h-12 mb-4 text-muted-foreground" />
                              <p className="mb-2 text-base text-muted-foreground">
                                  <span className="font-semibold">Klik untuk mengunggah</span> atau seret dan lepas gambar
                              </p>
                              <p className="text-xs text-muted-foreground">PNG, JPG, GIF, WEBP (MAKS. 5MB)</p>
                          </div>
                      )}
                      <Input
                          id="imageUpload"
                          type="file"
                          accept="image/png, image/jpeg, image/gif, image/webp"
                          onChange={handleFileChange}
                          className="hidden"
                      />
                  </label>
              </div>
            </div>

            <div className="space-y-3">
                <Label htmlFor="languageSelect" className="text-lg font-semibold flex items-center">
                    <Languages className="mr-2 h-5 w-5 text-primary" />
                    Pilih Bahasa Hasil Ringkasan
                </Label>
                <RadioGroup
                    id="languageSelect"
                    value={selectedLanguage}
                    onValueChange={(value: string) => setSelectedLanguage(value as SupportedLanguage)}
                    className="flex space-x-4 pt-1"
                >
                    <div className="flex items-center space-x-2">
                    <RadioGroupItem value="id" id="lang-id" />
                    <Label htmlFor="lang-id" className="font-normal cursor-pointer">Bahasa Indonesia</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                    <RadioGroupItem value="en" id="lang-en" />
                    <Label htmlFor="lang-en" className="font-normal cursor-pointer">English</Label>
                    </div>
                </RadioGroup>
            </div>

            <Button type="submit" className="w-full text-lg py-3 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity" disabled={!selectedFile || isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <ImageIcon className="mr-2 h-5 w-5" />
              )}
              {isLoading ? 'Sedang Menganalisis...' : 'Buat Ringkasan Gambar'}
            </Button>
          </form>

          {error && !isLoading && (
            <div className="mt-6 p-4 bg-destructive/20 border border-destructive text-destructive rounded-md animate-fade-in">
              <p className="font-semibold text-lg">Oops, terjadi kesalahan:</p>
              <p>{error}</p>
            </div>
          )}

          {summary && !isLoading && (
            <div className="mt-6 space-y-3 animate-fade-in">
              <h3 className="text-2xl font-semibold text-primary">Ringkasan dari Hibeur AI:</h3>
              <Textarea
                value={summary}
                readOnly
                className="min-h-[200px] text-base bg-muted/30 border-input p-4 rounded-md shadow"
                aria-label="Ringkasan Gambar oleh AI"
              />
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-4">
            <Link href="/" passHref legacyBehavior>
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali ke Chat
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground">Didukung oleh Hibeur AI & Genkit</p>
        </CardFooter>
      </Card>
    </div>
  );
}
