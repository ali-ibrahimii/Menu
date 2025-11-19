import "./globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <LanguageProvider>
          <Toaster />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
