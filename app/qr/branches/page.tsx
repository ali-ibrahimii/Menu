// app/qr/branches/page.tsx
"use client";

import { QRCodeSVG } from 'qrcode.react';
import { useBranch } from '@/contexts/BranchContext';
import { Button } from '@/components/ui/button';
import { Download, Printer, Copy } from 'lucide-react';
import { useState } from 'react';

export default function QRCodeBranchesPage() {
  const { branches } = useBranch();
  const [copied, setCopied] = useState(false);

  const downloadQRCode = (branchSlug: string, branchName: string) => {
    const svg = document.getElementById(`qr-${branchSlug}`);
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
        link.download = `watandar-${branchSlug}-qrcode.png`;
        link.href = pngFile;
        link.click();
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  };

  const copyLink = (branchSlug: string) => {
    const url = `${window.location.origin}/branches?branch=${branchSlug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-800 mb-3">
            QR Code های شعب رستوران وطندار
          </h1>
          <p className="text-gray-600">
            QR Code هر شعبه را دانلود و روی میزهای همان شعبه نصب کنید
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {branches.map((branch) => {
            const qrValue = `${window.location.origin}/branches?branch=${branch.slug}`;
            
            return (
              <div key={branch.id} className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  {/* اطلاعات شعبه */}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{branch.name_fa}</h3>
                    <p className="text-gray-600 mb-4">{branch.address_fa}</p>
                    <p className="text-gray-500">📞 {branch.phone}</p>
                    
                    <div className="mt-4 space-y-3">
                      <Button
                        onClick={() => downloadQRCode(branch.slug, branch.name_fa)}
                        variant="outline"
                        className="w-full justify-start gap-2"
                      >
                        <Download size={18} />
                        دانلود QR Code
                      </Button>
                      
                      <Button
                        onClick={() => copyLink(branch.slug)}
                        variant="ghost"
                        className="w-full justify-start gap-2"
                      >
                        <Copy size={18} />
                        {copied ? 'کپی شد!' : 'کپی لینک'}
                      </Button>
                    </div>
                  </div>
                  
                  {/* QR Code */}
                  <div className="flex flex-col items-center">
                    <div className="p-4 bg-white border-2 border-dashed border-gray-300 rounded-xl">
                      <QRCodeSVG
                        id={`qr-${branch.slug}`}
                        value={qrValue}
                        size={180}
                        level="H"
                        includeMargin
                        fgColor="#1e40af"
                        bgColor="#ffffff"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-3 text-center max-w-[180px] break-all">
                      اسکن → انتخاب شعبه → منو
                    </p>
                  </div>
                </div>
                
                {/* توضیحات */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-semibold mb-2">نحوه استفاده:</h4>
                  <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
                    <li>این QR Code را پرینت و روی میزهای شعبه <strong>{branch.name_fa}</strong> نصب کنید</li>
                    <li>مشتری با اسکن به صفحه انتخاب شعبه هدایت می‌شود</li>
                    <li>پس از انتخاب شعبه، به صفحه اصلی رستوران هدایت می‌شود</li>
                    <li>با کلیک روی "مشاهده منو" وارد منوی همین شعبه می‌شود</li>
                  </ol>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}