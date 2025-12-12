// app/branches/page.tsx
"use client";

import { useRouter } from 'next/navigation';
import { useBranch } from '@/contexts/BranchContext';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Check } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function BranchesPage() {
  const router = useRouter();
  const { branches, setSelectedBranch } = useBranch();
  const { language } = useLanguage();

  const handleSelectBranch = (branch: any) => {
    setSelectedBranch(branch);
    // هدایت به صفحه اصلی با پارامتر شعبه
    router.push(`/?branch=${branch.slug}`);
  };

  const getBranchName = (branch: any) => {
    switch (language) {
      case 'fa': return branch.name_fa;
      case 'ar': return branch.name_ar;
      case 'en': return branch.name_en;
      default: return branch.name_fa;
    }
  };

  const getBranchAddress = (branch: any) => {
    switch (language) {
      case 'fa': return branch.address_fa;
      case 'ar': return branch.address_ar;
      case 'en': return branch.address_en;
      default: return branch.address_fa;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* هدر */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-800 mb-3">
            انتخاب شعبه رستوران وطندار
          </h1>
          <p className="text-gray-600">
            لطفاً شعبه مورد نظر خود را انتخاب کنید
          </p>
        </div>

        {/* لیست شعب */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {branches.map((branch) => (
            <div
              key={branch.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow"
            >
              {/* تصویر شعبه */}
              <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="text-4xl mb-2">🍽️</div>
                    <h3 className="text-xl font-bold">{getBranchName(branch)}</h3>
                  </div>
                </div>
              </div>

              {/* اطلاعات شعبه */}
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="text-blue-500 mt-1 flex-shrink-0" size={20} />
                    <p className="text-gray-700">{getBranchAddress(branch)}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="text-green-500 flex-shrink-0" size={20} />
                    <p className="text-gray-700">{branch.phone}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${branch.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className={`text-sm ${branch.is_active ? 'text-green-600' : 'text-red-600'}`}>
                      {branch.is_active ? 'باز' : 'بسته'}
                    </span>
                  </div>
                </div>

                {/* دکمه انتخاب */}
                <Button
                  onClick={() => handleSelectBranch(branch)}
                  className="w-full mt-6 h-12 text-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  <Check className="ml-2" size={20} />
                  انتخاب این شعبه
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* راهنمایی */}
        <div className="mt-12 p-6 bg-blue-50 rounded-2xl border border-blue-100">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">
            📱 نحوه استفاده از QR Code:
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-700">
            <li>QR Code را روی میز اسکن کنید</li>
            <li>شعبه مورد نظر خود را انتخاب کنید</li>
            <li>در صفحه اصلی، روی دکمه "مشاهده منو" کلیک کنید</li>
            <li>مستقیماً به منوی همان شعبه هدایت می‌شوید</li>
          </ol>
        </div>
      </div>
    </div>
  );
}