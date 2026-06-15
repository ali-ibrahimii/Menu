// app/admin/add-food/page.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

// --- Types & Interfaces ---
interface Branch {
  id: string;
  name_fa: string;
  slug: string;
}

interface FoodFormState {
  name_fa: string;
  name_ar: string;
  name_en: string;
  description_fa: string;
  description_ar: string;
  description_en: string;
  price: string;
  branch_id: string;
  cooking_time: string;
  serves: string;
  ingredients_fa: string;
  ingredients_ar: string;
  ingredients_en: string;
  is_available: boolean;
  is_spicy: boolean;
  is_vegetarian: boolean;
  tags: string;
}

// --- Constants ---
const INITIAL_FORM_STATE: FoodFormState = {
  name_fa: "",
  name_ar: "",
  name_en: "",
  description_fa: "",
  description_ar: "",
  description_en: "",
  price: "",
  branch_id: "",
  cooking_time: "",
  serves: "",
  ingredients_fa: "",
  ingredients_ar: "",
  ingredients_en: "",
  is_available: true,
  is_spicy: false,
  is_vegetarian: false,
  tags: "",
};

export default function AddFoodPage() {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [category, setCategory] = useState("");
  const [branches, setBranches] = useState<Branch[]>([]);
  const [form, setForm] = useState<FoodFormState>(INITIAL_FORM_STATE);

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const { data, error } = await supabase
        .from("branches")
        .select("id, name_fa, slug")
        .order("created_at");

      if (error) throw error;
      setBranches(data || []);

      if (data?.length === 0) {
        toast.warning("ابتدا باید شعبه‌ای ایجاد کنید");
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
      toast.error("خطا در دریافت اطلاعات شعب");
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploadLoading(true);

    try {
      // Parallel uploading for better performance
      const uploadPromises = Array.from(files).map(async (file, index) => {
        const fileName = `${Date.now()}-${index}-${file.name.replace(/\s+/g, '-')}`;

        const { error } = await supabase.storage
          .from("menu-images")
          .upload(fileName, file);

        if (error) throw error;

        const { data: publicUrlData } = supabase.storage
          .from("menu-images")
          .getPublicUrl(fileName);

        return publicUrlData.publicUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      
      setImageUrls((prev) => [...prev, ...uploadedUrls]);
      toast.success(`${uploadedUrls.length} عکس با موفقیت آپلود شد`);
    } catch (error) {
      console.error("Error uploading files:", error);
      toast.error("خطا در آپلود یک یا چند عکس. لطفاً دوباره تلاش کنید.");
    } finally {
      setUploadLoading(false);
    }
  };

  const removeImage = (indexToRemove: number) => {
    setImageUrls((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: keyof FoodFormState, checked: boolean) => {
    setForm((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!form.name_fa || !form.price || imageUrls.length === 0 || !category || !form.branch_id) {
      toast.warning("لطفاً تمام فیلدهای ستاره‌دار و حداقل یک عکس را وارد کنید.");
      return;
    }

    setLoading(true);

    try {
      const foodData = {
        name_fa: form.name_fa.trim(),
        name_ar: form.name_ar.trim(),
        name_en: form.name_en.trim(),
        description_fa: form.description_fa.trim(),
        description_ar: form.description_ar.trim(),
        description_en: form.description_en.trim(),
        price: Number(form.price),
        image_url: imageUrls[0], // Main image
        images: imageUrls,
        category,
        branch_id: form.branch_id,
        cooking_time: form.cooking_time ? Number(form.cooking_time) : null,
        serves: form.serves ? Number(form.serves) : null,
        ingredients_fa: form.ingredients_fa?.trim() || null,
        ingredients_ar: form.ingredients_ar?.trim() || null,
        ingredients_en: form.ingredients_en?.trim() || null,
        is_available: form.is_available,
        is_spicy: form.is_spicy,
        is_vegetarian: form.is_vegetarian,
        tags: form.tags ? form.tags.split(",").map((tag) => tag.trim()).filter(Boolean) : [],
      };

      const { error } = await supabase.from("foods").insert([foodData]);

      if (error) throw error;

      toast.success("غذا با موفقیت به منو اضافه شد");

      // Reset form
      setForm(INITIAL_FORM_STATE);
      setImageUrls([]);
      setCategory("");
      
      // Reset file input visually if needed
      const fileInput = document.getElementById('food-images') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error: any) {
      console.error("Error saving food:", error);
      toast.error(error.message || "خطا در ذخیره اطلاعات غذا");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-16 pt-5  mx-auto space-y-8 bg-slate-50 dark:bg-slate-950">
      <h1 className="text-3xl font-bold text-center">افزودن غذای جدید</h1>

      <form onSubmit={handleSubmit} className="space-y-8 ">
        
        {/* Section 1: Main Info & Images */}
        <div className="p-6 rounded-xl border shadow-sm space-y-6">
          <h2 className="text-xl font-semibold text-green-600 border-b pb-2">
            تصاویر و اطلاعات اصلی
          </h2>

          {/* Image Upload */}
          <div className="space-y-4">
            <Label htmlFor="food-images">
              عکس‌های غذا <span className="text-destructive">*</span>
            </Label>
            <div className="space-y-2">
              <input
                id="food-images"
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleFileUpload(e.target.files)}
                className="border p-2 w-full rounded-md text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 transition-all cursor-pointer"
                disabled={uploadLoading}
              />
              {uploadLoading && (
                <p className="text-sm text-blue-600 animate-pulse">در حال آپلود تصاویر...</p>
              )}
              <p className="text-xs text-gray-500">
                عکس اول به عنوان تصویر اصلی نمایش داده خواهد شد.
              </p>
            </div>

            {/* Image Preview Gallery */}
            {imageUrls.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {imageUrls.map((url, index) => (
                  <div key={url} className="relative group rounded-lg overflow-hidden border">
                    <img
                      src={url}
                      alt={`پیش‌نمایش ${index + 1}`}
                      className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition"
                        title="حذف تصویر"
                      >
                        ×
                      </button>
                    </div>
                    {index === 0 && (
                      <span className="absolute bottom-2 right-2 bg-green-500/90 text-white text-xs px-2 py-1 rounded shadow-sm">
                        تصویر اصلی
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Names */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 ">
            <div className="space-y-2">
              <Label htmlFor="name_fa">نام فارسی <span className="text-destructive">*</span></Label>
              <Input
                id="name_fa"
                name="name_fa"
                placeholder="مثلاً: قابلی ماهیچه"
                value={form.name_fa}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name_ar">نام عربی <span className="text-destructive">*</span></Label>
              <Input
                id="name_ar"
                name="name_ar"
                placeholder="مثلاً: قابلي لحم"
                value={form.name_ar}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name_en">نام انگلیسی <span className="text-destructive">*</span></Label>
              <Input
                id="name_en"
                name="name_en"
                placeholder="e.g., Qabili Mahiche"
                value={form.name_en}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          {/* Descriptions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="description_fa">توضیحات فارسی <span className="text-destructive">*</span></Label>
              <Textarea
                id="description_fa"
                name="description_fa"
                placeholder="توضیحات کامل شامل نحوه پخت و طعم..."
                value={form.description_fa}
                onChange={handleInputChange}
                required
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description_ar">توضیحات عربی <span className="text-destructive">*</span></Label>
              <Textarea
                id="description_ar"
                name="description_ar"
                value={form.description_ar}
                onChange={handleInputChange}
                required
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description_en">توضیحات انگلیسی <span className="text-destructive">*</span></Label>
              <Textarea
                id="description_en"
                name="description_en"
                value={form.description_en}
                onChange={handleInputChange}
                required
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Technical Details */}
        <div className="p-6 rounded-xl border shadow-sm space-y-6">
          <h2 className="text-xl font-semibold text-blue-600 border-b pb-2">
            جزئیات و قیمت‌گذاری
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label htmlFor="cooking_time">زمان پخت (دقیقه)</Label>
              <Input
                id="cooking_time"
                name="cooking_time"
                type="number"
                placeholder="مثلاً: 45"
                value={form.cooking_time}
                onChange={handleInputChange}
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="serves">تعداد نفرات (پرس)</Label>
              <Input
                id="serves"
                name="serves"
                type="number"
                placeholder="مثلاً: 2"
                value={form.serves}
                onChange={handleInputChange}
                min="1"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="price">قیمت (تومان) <span className="text-destructive">*</span></Label>
              <Input
                id="price"
                name="price"
                type="number"
                placeholder="مثلاً: 350000"
                value={form.price}
                onChange={handleInputChange}
                required
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Ingredients */}
        <div className="p-6 rounded-xl border shadow-sm space-y-6">
          <h2 className="text-xl font-semibold text-orange-600 border-b pb-2">
            مواد تشکیل دهنده (اختیاری)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="ingredients_fa">فارسی (جدا شده با کاما)</Label>
              <Textarea
                id="ingredients_fa"
                name="ingredients_fa"
                placeholder="برنج اعلا، گوشت گوسفندی، هویج، کشمش..."
                value={form.ingredients_fa}
                onChange={handleInputChange}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ingredients_ar">عربی</Label>
              <Textarea
                id="ingredients_ar"
                name="ingredients_ar"
                value={form.ingredients_ar}
                onChange={handleInputChange}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ingredients_en">انگلیسی</Label>
              <Textarea
                id="ingredients_en"
                name="ingredients_en"
                value={form.ingredients_en}
                onChange={handleInputChange}
                rows={2}
              />
            </div>
          </div>
        </div>
        
        {/* Section 4: Categorization & Settings */}
        <div className="p-6 rounded-xl border shadow-sm space-y-6">
          <h2 className="text-xl font-semibold text-purple-600 border-b pb-2">
            دسته‌بندی و وضعیت
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              {/* Category & Branch Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">دسته‌بندی <span className="text-destructive">*</span></Label>
                  <Select value={category} onValueChange={setCategory} required>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="انتخاب دسته" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Afghan foods">غذای افغانی</SelectItem>
                      <SelectItem value="Iranian foods">غذای ایرانی</SelectItem>
                      <SelectItem value="Drinks">دمنوش</SelectItem>
                      <SelectItem value="Dessert">دسر</SelectItem>
                      <SelectItem value="Cold drinks">نوشیدنی سرد</SelectItem>
                      <SelectItem value="Hot drinks">نوشیدنی گرم</SelectItem>
                      <SelectItem value="Breakfast">صبحانه</SelectItem>
                      <SelectItem value="Coffee-based drinks">نوشیدنی برپایه قهوه</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="branch">شعبه <span className="text-destructive">*</span></Label>
                  <Select 
                    value={form.branch_id} 
                    onValueChange={(value) => setForm(prev => ({ ...prev, branch_id: value }))} 
                    required
                    disabled={branches.length === 0}
                  >
                    <SelectTrigger id="branch">
                      <SelectValue placeholder={branches.length === 0 ? "در حال دریافت شعب..." : "انتخاب شعبه"} />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.name_fa}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label htmlFor="tags">تگ‌های جستجو (اختیاری)</Label>
                <Input
                  id="tags"
                  name="tags"
                  placeholder="پرفروش, پیشنهاد سرآشپز, ویژه"
                  value={form.tags}
                  onChange={handleInputChange}
                />
                <p className="text-xs text-gray-500">تگ‌ها را با کاما از هم جدا کنید.</p>
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-xl transition">
                <div className="space-y-0.5">
                  <Label htmlFor="is_available" className="cursor-pointer text-base">موجود در منو</Label>
                  <p className="text-sm text-gray-500">آیا این غذا هم‌اکنون قابل سفارش است؟</p>
                </div>
                <Switch
                  id="is_available"
                  checked={form.is_available}
                  onCheckedChange={(checked) => handleSwitchChange("is_available", checked)}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-xl transition">
                <div className="space-y-0.5">
                  <Label htmlFor="is_spicy" className="cursor-pointer text-base">تند و ادویه‌دار</Label>
                  <p className="text-sm text-gray-500">نمایش آیکون تندی برای مشتریان حساس</p>
                </div>
                <Switch
                  id="is_spicy"
                  checked={form.is_spicy}
                  onCheckedChange={(checked) => handleSwitchChange("is_spicy", checked)}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-xl transition">
                <div className="space-y-0.5">
                  <Label htmlFor="is_vegetarian" className="cursor-pointer text-base">غذای گیاهی</Label>
                  <p className="text-sm text-gray-500">مناسب برای رژیم‌های بدون گوشت</p>
                </div>
                <Switch
                  id="is_vegetarian"
                  checked={form.is_vegetarian}
                  onCheckedChange={(checked) => handleSwitchChange("is_vegetarian", checked)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="backdrop-blur-sm p-4 border-t shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)] rounded-t-xl z-10">
          <Button
            type="submit"
            disabled={loading || uploadLoading || imageUrls.length === 0 || branches.length === 0}
            className="w-full bg-green-600 hover:bg-green-700 text-white h-14 rounded-xl text-lg font-bold shadow-md transition-all active:scale-[0.98]"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></span>
                در حال ذخیره‌سازی...
              </span>
            ) : (
              "ثبت نهایی غذای جدید"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}