// components/BranchSelectionPage.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Check, Store, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useBranch } from "@/contexts/BranchContext";
import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";
import { translations } from "@/translations/translation";

export default function BranchSelectionPage() {
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { setSelectedBranch } = useBranch();
  const { language } = useLanguage();
  const router = useRouter();

  const t = (key: string) => {
    const langTranslations = translations[language] as Record<string, string>;
    return langTranslations[key] || key;
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .eq('is_active', true)
        .order('created_at');

      if (error) throw error;
      setBranches(data || []);
    } catch (error) {
      console.error('Error fetching branches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBranch = async (branch: any) => {
    // ذخیره شعبه در context و localStorage
    setSelectedBranch(branch);
    
    // تاخیر کوچک برای UX بهتر
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // هدایت به صفحه اصلی
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">در حال بارگذاری شعبه‌ها...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* هدر */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <Store className="w-16 h-16 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-3">
            {t("welcome") || "به رستوران وطندار خوش آمدید"}
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {t("selectBranchDescription") || "لطفاً برای ادامه، شعبه مورد نظر خود را انتخاب کنید"}
          </p>
        </div>

        {/* کارت‌های شعبه */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {branches.map((branch) => (
            <Card 
              key={branch.id} 
              className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-2 hover:border-blue-300 cursor-pointer"
              onClick={() => handleSelectBranch(branch)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      {branch.name_fa}
                    </CardTitle>
                    <CardDescription className="mt-1">{branch.name_ar}</CardDescription>
                  </div>
                  <Badge variant={branch.is_active ? "default" : "destructive"}>
                    {branch.is_active ? "فعال" : "غیرفعال"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-2 text-gray-700">
                  <MapPin className="w-5 h-5 mt-0.5 text-blue-500 flex-shrink-0" />
                  <span className="text-sm">{branch.address}</span>
                </div>
                
                {branch.phone && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Phone className="w-5 h-5 text-blue-500" />
                    <span className="text-sm">{branch.phone}</span>
                  </div>
                )}

                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 mt-4"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectBranch(branch);
                  }}
                >
                  <Check className="w-5 h-5 ml-2" />
                  انتخاب این شعبه
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {branches.length === 0 && (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🏪</div>
            <p className="text-gray-500 text-lg">هیچ شعبه فعالی یافت نشد</p>
            <p className="text-gray-400 text-sm mt-2">لطفاً بعداً مجدداً تلاش کنید</p>
          </div>
        )}

        {/* اطلاعات تماس */}
        <div className="mt-12 text-center text-gray-600">
          <p className="text-sm">برای پشتیبانی: ۰۲۱-۱۲۳۴۵۶۷۸</p>
          <p className="text-xs mt-2">ساعات کاری: همه روزه از ۱۰ صبح تا ۱۲ شب</p>
        </div>
      </div>
    </div>
  );
}