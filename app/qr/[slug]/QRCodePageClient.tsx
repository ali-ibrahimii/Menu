// app/qr/[slug]/QRCodePageClient.tsx
"use client";

import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Download, Printer } from 'lucide-react';

export default function QRCodePageClient({ branch }: any) {
  const menuUrl = `${window.location.origin}/menu?branch=${branch.slug}`;

  const handleDownload = () => {
    const svg = document.getElementById('qr-code');
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        const pngFile = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `watandar-${branch.slug}-qrcode.png`;
        link.href = pngFile;
        link.click();
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">{branch.name_fa}</h1>
          <p className="text-gray-600 mt-2">{branch.address}</p>
          {branch.phone && (
            <p className="text-gray-500 mt-1">📞 {branch.phone}</p>
          )}
        </div>
        
        <div className="my-8 flex justify-center">
          <div className="p-6 border-2 border-dashed border-gray-300 rounded-xl">
            <QRCodeSVG
              id="qr-code"
              value={menuUrl}
              size={250}
              level="H"
              includeMargin
              fgColor="#1e40af"
              bgColor="#ffffff"
            />
          </div>
        </div>
        
        <div className="mb-8">
          <p className="text-sm text-gray-500 mb-4">لینک منوی این شعبه:</p>
          <div className="bg-gray-100 p-3 rounded-lg break-all text-sm">
            {menuUrl}
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={handleDownload} className="gap-2">
            <Download size={18} />
            دانلود QR Code
          </Button>
          
          <Button onClick={handlePrint} variant="outline" className="gap-2">
            <Printer size={18} />
            پرینت
          </Button>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="font-semibold mb-2">راهنمایی نصب:</h3>
          <ul className="text-sm text-gray-600 text-right space-y-1">
            <li>۱. QR Code را روی میزهای شعبه {branch.name_fa} نصب کنید</li>
            <li>۲. مشتری با اسکن مستقیماً به منوی این شعبه هدایت می‌شود</li>
            <li>۳. برای مدیریت شعب به /branches مراجعه کنید</li>
          </ul>
        </div>
      </div>
    </div>
  );
}