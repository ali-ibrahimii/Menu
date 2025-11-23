"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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

export default function EditFoodPage() {
  const { id } = useParams();
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
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

  // گرفتن اطلاعات غذا از Supabase
  useEffect(() => {
    if (!id) return;
    fetchFood();
  }, [id]);

  const fetchFood = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("foods")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        throw error;
      }

      // پر کردن فرم با اطلاعات موجود
      setForm({
        name_fa: data.name_fa || "",
        name_ar: data.name_ar || "",
        name_en: data.name_en || "",
        description_fa: data.description_fa || "",
        description_ar: data.description_ar || "",
        description_en: data.description_en || "",
        price: data.price?.toString() || "",
        cooking_time: data.cooking_time?.toString() || "",
        serves: data.serves?.toString() || "",
        ingredients_fa: data.ingredients_fa || "",
        ingredients_ar: data.ingredients_ar || "",
        ingredients_en: data.ingredients_en || "",
        is_available: data.is_available ?? true,
        is_spicy: data.is_spicy ?? false,
        is_vegetarian: data.is_vegetarian ?? false,
        tags: data.tags ? data.tags.join(", ") : "",
      });

      setCategory(data.category || "");

      // تنظیم تصاویر
      if (data.images && data.images.length > 0) {
        setImageUrls(data.images);
      } else if (data.image_url) {
        setImageUrls([data.image_url]);
      }
    } catch (error: any) {
      console.error("Error fetching food:", error);
      toast.error("خطا در دریافت اطلاعات غذا");
    } finally {
      setLoading(false);
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

    if (!form.name_fa || !form.price || imageUrls.length === 0 || !category) {
      toast.warning("تمام فیلدهای ضروری را پر کنید");
      return;
    }

    setUpdating(true);

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
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("foods")
        .update(foodData)
        .eq("id", id);

      if (error) {
        throw error;
      }

      toast.success("غذا با موفقیت ویرایش شد");
      router.push("/admin/foods");
    } catch (error: any) {
      console.error("Error updating food:", error);
      toast.error("خطا در ویرایش غذا: " + error.message);
    } finally {
      setUpdating(false);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg">در حال بارگذاری اطلاعات غذا...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-center">ویرایش غذا</h1>

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
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFileUpload(e.target.files)}
              className="border p-2 w-full rounded"
            />
            <Button
              type="button"
              disabled={uploadLoading}
              className="w-full"
              onClick={() => {
                const fileInput = document.querySelector(
                  'input[type="file"]'
                ) as HTMLInputElement;
                fileInput?.click();
              }}
            >
              {uploadLoading ? "در حال آپلود..." : "آپلود عکس‌های جدید"}
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
        </div>

        {/* بخش ۳: مواد تشکیل دهنده */}
        <div className="bg-white p-6 rounded-lg border space-y-6">
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

        {/* دکمه‌های ثبت و انصراف */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/foods")}
            className="flex-1"
          >
            انصراف
          </Button>
          <Button
            type="submit"
            disabled={updating || imageUrls.length === 0}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg text-lg font-semibold"
            size="lg"
          >
            {updating ? "در حال ویرایش غذا..." : "ذخیره تغییرات"}
          </Button>
        </div>
      </form>
    </div>
  );
}
