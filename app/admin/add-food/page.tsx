"use client";

import { useState } from "react";
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

export default function AddFoodPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [category, setCategory] = useState("");

  const [form, setForm] = useState({
    // اطلاعات اصلی
    name_fa: "",
    name_ar: "",
    name_en: "",
    description_fa: "",
    description_ar: "",
    description_en: "",
    price: "",

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

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) {
      alert("لطفاً حداقل یک عکس انتخاب کنید");
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
          alert(`خطا در آپلود عکس ${i + 1}`);
          continue;
        }

        const { data: publicUrlData } = supabase.storage
          .from("menu-images")
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrlData.publicUrl);
      }

      setImageUrls((prev) => [...prev, ...uploadedUrls]);
      alert(`${uploadedUrls.length} عکس با موفقیت آپلود شد`);
    } catch (error) {
      console.error("Error uploading files:", error);
      alert("خطا در آپلود عکس‌ها");
    } finally {
      setUploadLoading(false);
    }
  };

  const removeImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name_fa || !form.price || imageUrls.length === 0 || !category) {
      alert("تمام فیلدهای ضروری را پر کنید");
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
        image_url: imageUrls[0], // تصویر اصلی
        images: imageUrls, // تمام تصاویر
        category,

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

      alert("غذا با موفقیت اضافه شد");

      // ریست فرم
      setForm({
        name_fa: "",
        name_ar: "",
        name_en: "",
        description_fa: "",
        description_ar: "",
        description_en: "",
        price: "",
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
      alert("خطا در ذخیره غذا: " + error.message);
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
    <div className="p-6 max-w-4xl mx-auto space-y-8 bg-amber-30">
      <h1 className="text-3xl font-bold text-center">افزودن غذای جدید</h1>

      <form onSubmit={handleSubmit} className="space-y-8 bg-amber-40">
        {/* بخش ۱: اطلاعات اصلی */}
        <div className="p-6 rounded-lg border  space-y-6">
          

          {/* آپلود چند عکس */}
          <div className="space-y-4">
            <Label>
              عکس‌های غذا <span className="text-destructive">*</span>
            </Label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFileUpload(e.target.files)}
              className="border p-2 w-full rounded"
            />
            <Button type="button" disabled={uploadLoading} className="w-full">
              {uploadLoading ? "در حال آپلود..." : "آپلود عکس‌ها"}
            </Button>

            {/* پیشنمایش عکس‌ها */}
            {imageUrls.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {imageUrls.map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url}
                      alt={`غذا ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
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
                placeholder="نام فارسی"
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
                placeholder="نام عربی"
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
                placeholder="نام انگلیسی"
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
                placeholder="توضیحات کامل به فارسی"
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
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4"></div>
        </div>

        

        {/* بخش ۴: تنظیمات و دسته‌بندی */}
        <div className="p-6 rounded-lg border space-y-6">
          <h2 className="text-xl font-semibold text-purple-600 border-b pb-2">
            تنظیمات و دسته‌بندی
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">
                  دسته‌بندی <span className="text-destructive">*</span>
                </Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="انتخاب دسته" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="afghan">غذای افغانی</SelectItem>
                    <SelectItem value="iranian">غذای ایرانی</SelectItem>
                    <SelectItem value="drinks">نوشیدنی</SelectItem>
                    <SelectItem value="dessert">دسر</SelectItem>
                    <SelectItem value="appetizer">پیش غذا</SelectItem>
                    <SelectItem value="main">غذای اصلی</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="is_available" className="cursor-pointer">
                  موجود است
                </Label>
                <Switch
                  id="is_available"
                  checked={form.is_available}
                  onCheckedChange={(checked) =>
                    handleSwitchChange("is_available", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="is_spicy" className="cursor-pointer">
                  تند است
                </Label>
                <Switch
                  id="is_spicy"
                  checked={form.is_spicy}
                  onCheckedChange={(checked) =>
                    handleSwitchChange("is_spicy", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="is_vegetarian" className="cursor-pointer">
                  گیاهی است
                </Label>
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
        <Button
          type="submit"
          disabled={loading || imageUrls.length === 0}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg text-lg font-semibold"
          size="lg"
        >
          {loading ? "در حال ثبت غذا..." : "ثبت غذای جدید"}
        </Button>
      </form>
    </div>
  );
}
