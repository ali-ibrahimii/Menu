// app/branches/page.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useBranch } from "@/contexts/BranchContext";
import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";

export default function BranchesPage() {
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { setSelectedBranch } = useBranch();
  const { language } = useLanguage();
  const router = useRouter();

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

  const handleSelectBranch = (branch: any) => {
    setSelectedBranch(branch);
    router.push(`/menu?branch=${branch.slug}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">شعبه‌های رستوران</h1>
          <p className="text-gray-600">لطفاً شعبه مورد نظر خود را انتخاب کنید</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {branches.map((branch) => (
            <Card key={branch.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{branch.name_fa}</CardTitle>
                    <CardDescription>{branch.name_ar}</CardDescription>
                  </div>
                  <Badge variant={branch.is_active ? "default" : "destructive"}>
                    {branch.is_active ? "فعال" : "غیرفعال"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-2 text-gray-600">
                  <MapPin className="w-5 h-5 mt-0.5" />
                  <span>{branch.address}</span>
                </div>
                
                {branch.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-5 h-5" />
                    <span>{branch.phone}</span>
                  </div>
                )}

                <Button 
                  onClick={() => handleSelectBranch(branch)}
                  className="w-full bg-blue-600 hover:bg-blue-700"
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
            <p className="text-gray-500 text-lg">هیچ شعبه‌ای یافت نشد</p>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/">
            <Button variant="outline">بازگشت به صفحه اصلی</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}