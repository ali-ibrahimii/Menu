import "./globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <LanguageProvider>
          
            {children}
          
        </LanguageProvider>
      </body>
    </html>
  );
}
