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

interface Branch {
  id: string;
  name_fa: string;
  slug: string;
}

export default function AddFoodPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [category, setCategory] = useState("");
  const [branches, setBranches] = useState<Branch[]>([]);

  const [form, setForm] = useState({
    // اطلاعات اصلی
    name_fa: "",
    name_ar: "",
    name_en: "",
    description_fa: "",
    description_ar: "",
    description_en: "",
    price: "",
    branch: "", // اینجا branch_id شعبه ذخیره می‌شود

    // جزئیات غذا
    cooking_time: "",
    serves: "",

    // مواد تشکیل دهنده
    ingredients_fa: "",
    ingredients_ar: "",
    ingredients_en: "",

    // اطلاعات اضافی
    is_available: true,
    is_spicy: false,
    is_vegetarian: false,
    tags: "",
  });

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const { data, error } = await supabase
        .from('branches')
        .select('id, name_fa, slug')
        .order('created_at');

      if (error) throw error;
      setBranches(data || []);
      
      if (data && data.length === 0) {
        toast.warning("ابتدا باید شعبه‌ای ایجاد کنید");
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
      toast.error('خطا در دریافت اطلاعات شعب');
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) {
      toast.warning("لطفاً حداقل یک عکس انتخاب کنید");
      return;
    }

    setUploadLoading(true);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileName = `${Date.now()}-${i}-${file.name}`;

        const { data, error } = await supabase.storage
          .from("menu-images")
          .upload(fileName, file);

        if (error) {
          console.error(error);
          toast.warning(`خطا در آپلود عکس ${i + 1}`);
          continue;
        }

        const { data: publicUrlData } = supabase.storage
          .from("menu-images")
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrlData.publicUrl);
      }

      setImageUrls((prev) => [...prev, ...uploadedUrls]);
      toast.success(`${uploadedUrls.length} عکس با موفقیت آپلود شد`);
    } catch (error) {
      console.error("Error uploading files:", error);
      toast.warning("خطا در آپلود عکس‌ها");
    } finally {
      setUploadLoading(false);
    }
  };

  const removeImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // اعتبارسنجی فیلدهای ضروری
    if (!form.name_fa || !form.price || imageUrls.length === 0 || !category || !form.branch) {
      toast.warning("تمام فیلدهای ضروری را پر کنید");
      return;
    }

    // بررسی اینکه شعبه معتبر است
    if (!branches.find(b => b.id === form.branch)) {
      toast.warning("لطفاً یک شعبه معتبر انتخاب کنید");
      return;
    }

    setLoading(true);

    try {
      const foodData = {
        // اطلاعات اصلی
        name_fa: form.name_fa,
        name_ar: form.name_ar,
        name_en: form.name_en,
        description_fa: form.description_fa,
        description_ar: form.description_ar,
        description_en: form.description_en,
        price: Number(form.price),
        image_url: imageUrls[0],
        images: imageUrls,
        category,
        branch_id: form.branch, // این مهم است - باید branch_id باشد

        // جزئیات غذا
        cooking_time: form.cooking_time ? Number(form.cooking_time) : null,
        serves: form.serves ? Number(form.serves) : null,

        // مواد تشکیل دهنده
        ingredients_fa: form.ingredients_fa || null,
        ingredients_ar: form.ingredients_ar || null,
        ingredients_en: form.ingredients_en || null,

        // اطلاعات اضافی
        is_available: form.is_available,
        is_spicy: form.is_spicy,
        is_vegetarian: form.is_vegetarian,
        tags: form.tags ? form.tags.split(",").map((tag) => tag.trim()) : [],
      };

      const { error } = await supabase.from("foods").insert([foodData]);

      if (error) {
        throw error;
      }

      toast.success("غذا با موفقیت اضافه شد");

      // ریست فرم
      setForm({
        name_fa: "",
        name_ar: "",
        name_en: "",
        description_fa: "",
        description_ar: "",
        description_en: "",
        price: "",
        branch: "",
        cooking_time: "",
        serves: "",
        ingredients_fa: "",
        ingredients_ar: "",
        ingredients_en: "",
        is_available: true,
        is_spicy: false,
        is_vegetarian: false,
        tags: "",
      });
      setImageUrls([]);
      setFiles([]);
      setCategory("");
    } catch (error: any) {
      console.error("Error saving food:", error);
      toast.error("خطا در ذخیره غذا: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setForm((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-center">افزودن غذای جدید</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* بخش ۱: اطلاعات اصلی */}
        <div className="p-6 rounded-lg border space-y-6">
          <h2 className="text-xl font-semibold text-green-600 border-b pb-2">
            اطلاعات اصلی
          </h2>

          {/* آپلود چند عکس */}
          <div className="space-y-4">
            <Label>
              عکس‌های غذا <span className="text-destructive">*</span>
            </Label>
            <div className="space-y-2">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleFileUpload(e.target.files)}
                className="border p-2 w-full rounded"
                disabled={uploadLoading}
              />
              {uploadLoading && (
                <p className="text-sm text-blue-600">در حال آپلود عکس...</p>
              )}
              <p className="text-xs text-gray-500">
                می‌توانید چند عکس آپلود کنید. عکس اول به عنوان تصویر اصلی استفاده می‌شود.
              </p>
            </div>

            {/* پیشنمایش عکس‌ها */}
            {imageUrls.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {imageUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`غذا ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border group-hover:opacity-90 transition"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition"
                      aria-label="حذف عکس"
                    >
                      ×
                    </button>
                    {index === 0 && (
                      <span className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                        اصلی
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* نام غذا در سه زبان */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name_fa">
                نام فارسی <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name_fa"
                name="name_fa"
                placeholder="مثلا: قورمه سبزی"
                value={form.name_fa}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name_ar">
                نام عربی <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name_ar"
                name="name_ar"
                placeholder="مثلا: قورمة سبزی"
                value={form.name_ar}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name_en">
                نام انگلیسی <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name_en"
                name="name_en"
                placeholder="مثلا: Ghormeh Sabzi"
                value={form.name_en}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          {/* توضیحات در سه زبان */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description_fa">
                توضیحات فارسی <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description_fa"
                name="description_fa"
                placeholder="توضیحات کامل به فارسی (مواد، طعم، نحوه سرو)"
                value={form.description_fa}
                onChange={handleInputChange}
                required
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description_ar">
                توضیحات عربی <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description_ar"
                name="description_ar"
                placeholder="توضیحات کامل به عربی"
                value={form.description_ar}
                onChange={handleInputChange}
                required
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description_en">
                توضیحات انگلیسی <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description_en"
                name="description_en"
                placeholder="توضیحات کامل به انگلیسی"
                value={form.description_en}
                onChange={handleInputChange}
                required
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* بخش ۲: جزئیات فنی */}
        <div className="p-6 rounded-lg border space-y-6">
          <h2 className="text-xl font-semibold text-blue-600 border-b pb-2">
            جزئیات فنی
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cooking_time">زمان پخت (دقیقه)</Label>
              <Input
                id="cooking_time"
                name="cooking_time"
                type="number"
                placeholder="30"
                value={form.cooking_time}
                onChange={handleInputChange}
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="serves">تعداد نفرات</Label>
              <Input
                id="serves"
                name="serves"
                type="number"
                placeholder="2"
                value={form.serves}
                onChange={handleInputChange}
                min="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">
                قیمت (تومان) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                placeholder="50000"
                value={form.price}
                onChange={handleInputChange}
                required
                min="0"
              />
            </div>
          </div>
        </div>

        {/* بخش ۳: مواد تشکیل دهنده */}
        <div className="p-6 rounded-lg border space-y-6">
          <h2 className="text-xl font-semibold text-orange-600 border-b pb-2">
            مواد تشکیل دهنده
          </h2>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ingredients_fa">مواد تشکیل دهنده (فارسی)</Label>
              <Textarea
                id="ingredients_fa"
                name="ingredients_fa"
                placeholder="گوشت گوساله، برنج، سبزیجات معطر، لیمو عمانی..."
                value={form.ingredients_fa}
                onChange={handleInputChange}
                rows={3}
              />
              <p className="text-xs text-gray-500">مواد را با کاما جدا کنید</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ingredients_ar">مواد تشکیل دهنده (عربی)</Label>
              <Textarea
                id="ingredients_ar"
                name="ingredients_ar"
                placeholder="لحم بقري، أرز، أعشاب عطرية، لیمون عماني..."
                value={form.ingredients_ar}
                onChange={handleInputChange}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ingredients_en">مواد تشکیل دهنده (انگلیسی)</Label>
              <Textarea
                id="ingredients_en"
                name="ingredients_en"
                placeholder="Beef, rice, aromatic herbs, dried lime..."
                value={form.ingredients_en}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
          </div>
        </div>
        
        {/* بخش ۴: تنظیمات و دسته‌بندی */}
        <div className="p-6 rounded-lg border space-y-6">
          <h2 className="text-xl font-semibold text-purple-600 border-b pb-2">
            تنظیمات و دسته‌بندی
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {/* فیلد دسته‌بندی */}
              <div className="space-y-2">
                <Label htmlFor="category">
                  دسته‌بندی <span className="text-destructive">*</span>
                </Label>
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

              {/* فیلد اصلاح شده: انتخاب شعبه */}
              <div className="space-y-2">
                <Label htmlFor="branch">
                  شعبه <span className="text-destructive">*</span>
                </Label>
                <Select 
                  value={form.branch} 
                  onValueChange={(value) => 
                    setForm(prev => ({ ...prev, branch: value }))
                  } 
                  required
                  disabled={branches.length === 0}
                >
                  <SelectTrigger id="branch">
                    <SelectValue placeholder={
                      branches.length === 0 
                        ? "در حال دریافت شعب..." 
                        : "انتخاب شعبه"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name_fa}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {branches.length === 0 && (
                  <p className="text-xs text-red-500">
                    ابتدا باید شعبه‌ای ایجاد کنید
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  غذای اضافه شده به کدام شعبه تعلق دارد؟
                </p>
              </div>

              {/* تگ‌ها */}
              <div className="space-y-2">
                <Label htmlFor="tags">تگ‌ها (اختیاری)</Label>
                <Input
                  id="tags"
                  name="tags"
                  placeholder="پرفروش, جدید, ویژه"
                  value={form.tags}
                  onChange={handleInputChange}
                />
                <p className="text-xs text-gray-500">
                  تگ‌ها را با کاما جدا کنید (مثلا: پرفروش, جدید)
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* سوئیچ‌های تنظیمات */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label htmlFor="is_available" className="cursor-pointer font-medium">
                    موجود است
                  </Label>
                  <p className="text-xs text-gray-500">غذا در منو نمایش داده شود</p>
                </div>
                <Switch
                  id="is_available"
                  checked={form.is_available}
                  onCheckedChange={(checked) =>
                    handleSwitchChange("is_available", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label htmlFor="is_spicy" className="cursor-pointer font-medium">
                    تند است
                  </Label>
                  <p className="text-xs text-gray-500">برای مشتریان حساس به تندی</p>
                </div>
                <Switch
                  id="is_spicy"
                  checked={form.is_spicy}
                  onCheckedChange={(checked) =>
                    handleSwitchChange("is_spicy", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label htmlFor="is_vegetarian" className="cursor-pointer font-medium">
                    گیاهی است
                  </Label>
                  <p className="text-xs text-gray-500">فاقد گوشت و محصولات حیوانی</p>
                </div>
                <Switch
                  id="is_vegetarian"
                  checked={form.is_vegetarian}
                  onCheckedChange={(checked) =>
                    handleSwitchChange("is_vegetarian", checked)
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* دکمه ثبت */}
        <div className=" bg-white pt-4 border-t">
          <div className="max-w-4xl mx-auto">
            <Button
              type="submit"
              disabled={loading || imageUrls.length === 0 || branches.length === 0}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 rounded-lg text-lg font-semibold shadow-lg"
              size="lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                  در حال ثبت غذا...
                </span>
              ) : (
                "ثبت غذای جدید"
              )}
            </Button>
            
            
          </div>
        </div>
      </form>
    </div>
  );
}