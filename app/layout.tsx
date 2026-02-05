import type { Viewport } from "next";
import type { Metadata } from "next";
import "../styles/globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Toaster } from "@/components/ui/sonner";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import { BranchProvider } from "@/contexts/BranchContext";

export const metadata: Metadata = {
  title: "Your App",
  // ...
};

export const viewport: Viewport = {
  width: "device-width",
  height: "device-height",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover", // این خط را اضافه کنید
  // Also supported but less commonly used
  // interactiveWidget: 'resizes-visual',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <LanguageProvider>
          <BranchProvider>
            <AdminAuthProvider>
              <Toaster position="top-center" />
              {children}
            </AdminAuthProvider>
          </BranchProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}