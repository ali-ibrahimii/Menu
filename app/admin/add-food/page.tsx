"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AddFoodPage() {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
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
    if (!file) return alert("عکس رو انتخاب کنید");
    setLoading(true);

    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from("menu-images")
      .upload(fileName, file);

    if (error) {
      console.error(error);
      alert("خطا در آپلود تصویر");
      setLoading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("menu-images")
      .getPublicUrl(fileName);

    setImageUrl(publicUrlData.publicUrl);
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!form.name_fa || !form.price || !imageUrl)
      return alert("تمام فیلد هارو پر کنید");

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
      alert("خطا در ذخیره غذا");
    } else {
      alert("غذا با موفقیت اضافه شد");
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
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-center">➕ افزودن غذای جدید</h1>

      {/* عکس */}
      <div>
        <label className="block font-medium mb-1">عکس غذا</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="border p-2 w-full rounded"
        />
        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "در حال آپلود..." : "آپلود عکس"}
        </button>

        {imageUrl && (
          <img
            src={imageUrl}
            alt="uploaded"
            className="w-48 h-48 object-cover rounded-xl mt-3"
          />
        )}
      </div>

      {/* اطلاعات غذا */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input
          type="text"
          placeholder="نام فارسی"
          value={form.name_fa}
          onChange={(e) => setForm({ ...form, name_fa: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="نام انگلیسی"
          value={form.name_en}
          onChange={(e) => setForm({ ...form, name_en: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="نام عربی"
          value={form.name_ar}
          onChange={(e) => setForm({ ...form, name_ar: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          type="number"
          placeholder="قیمت"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          className="border p-2 rounded"
        />
      </div>

      <textarea
        placeholder="توضیحات فارسی"
        value={form.description_fa}
        onChange={(e) => setForm({ ...form, description_fa: e.target.value })}
        className="border p-2 w-full rounded"
      />
      <textarea
        placeholder="توضیحات انگلیسی"
        value={form.description_en}
        onChange={(e) => setForm({ ...form, description_en: e.target.value })}
        className="border p-2 w-full rounded"
      />
      <textarea
        placeholder="توضیحات عربی"
        value={form.description_ar}
        onChange={(e) => setForm({ ...form, description_ar: e.target.value })}
        className="border p-2 w-full rounded"
      />
      <div>
        <label className="block text-sm font-medium mb-1">دسته‌بندی</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border rounded p-2 w-full"
        >
          <option value="">انتخاب دسته...</option>
          <option value="afghan">غذای افغانی</option>
          <option value="iranian">غذای ایرانی</option>
          <option value="drinks">نوشیدنی</option>
          <option value="dessert">دسر</option>
        </select>
      </div>

      <button
        onClick={handleSubmit}
        className="w-full bg-green-600 text-white py-2 rounded-xl hover:bg-green-700"
      >
        ثبت غذا
      </button>
    </div>
  );
}
