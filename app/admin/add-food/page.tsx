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

export default function AddFoodPage() {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [category, setCategory] = useState("");

  const [form, setForm] = useState({
    name_fa: "",
    name_ar: "",
    name_en: "",
    description_fa: "",
    description_ar: "",
    description_en: "",
    price: "",
  });

  const handleUpload = async () => {
    if (!file) {
      alert("عکس رو انتخاب کنید");
      return;
    }
    
    setUploadLoading(true);

    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from("menu-images")
      .upload(fileName, file);

    if (error) {
      console.error(error);
      alert("خطا در آپلود تصویر");
      setUploadLoading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("menu-images")
      .getPublicUrl(fileName);

    setImageUrl(publicUrlData.publicUrl);
    setUploadLoading(false);
    alert("عکس با موفقیت آپلود شد");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.name_fa || !form.price || !imageUrl || !category) {
      alert("تمام فیلدهای ضروری را پر کنید");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from("foods").insert([
        {
          ...form,
          price: Number(form.price),
          image_url: imageUrl,
          category,
        },
      ]);

      if (error) {
        console.error(error);
        alert("خطا در ذخیره غذا: " + error.message);
      } else {
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
        });
        setImageUrl("");
        setFile(null);
        setCategory("");
      }
    } catch (error) {
      console.error(error);
      alert("خطا در ذخیره غذا");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-center">فورم افزودن غذا</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* بخش آپلود عکس */}
        <div className="space-y-3">
          <Label htmlFor="image-upload">
            عکس <span className="text-destructive">*</span>
          </Label>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="border p-2 w-full rounded"
          />
          <Button
            type="button"
            onClick={handleUpload}
            disabled={!file || uploadLoading}
            className="w-full"
          >
            {uploadLoading ? "در حال آپلود..." : "آپلود عکس"}
          </Button>

          {imageUrl && (
            <div className="mt-3">
              <img
                src={imageUrl}
                alt="uploaded"
                className="w-48 h-48 object-cover rounded-xl border"
              />
              <p className="text-sm text-green-600 mt-2">عکس با موفقیت آپلود شد</p>
            </div>
          )}
        </div>

        {/* اطلاعات اصلی غذا */}
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

        {/* توضیحات */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description_fa">
              توضیحات فارسی <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description_fa"
              name="description_fa"
              placeholder="توضیحات فارسی"
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
              placeholder="توضیحات عربی"
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
              placeholder="توضیحات انگلیسی"
              value={form.description_en}
              onChange={handleInputChange}
              required
              rows={3}
            />
          </div>
        </div>

        {/* قیمت و دسته‌بندی */}
        <div className="grid grid-cols-2 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="category">
              انتخاب دسته <span className="text-destructive">*</span>
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
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">
              قیمت (تومان) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="price"
              name="price"
              type="number"
              placeholder="قیمت"
              value={form.price}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        {/* دکمه سابمیت */}
        <Button
          type="submit"
          disabled={loading || !imageUrl}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-md"
          size="lg"
        >
          {loading ? "در حال ثبت..." : "ثبت غذا"}
        </Button>
      </form>
    </div>
  );
}