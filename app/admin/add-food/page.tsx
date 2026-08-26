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

// تایپ‌ها از پوشه مرکزی
import type { Branch, FoodFormState, Category } from "@/types";

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

const theme = {
  page: "min-h-screen w-full bg-white text-slate-900 dark:bg-black dark:text-white transition-colors duration-500",
  container: "mx-auto w-full max-w-5xl",
  card: "rounded-[1.5rem] border border-black/[0.08] bg-white/90 shadow-sm dark:border-white/10 dark:bg-slate-900/70",
  cardHeader: "border-b border-black/5 dark:border-white/10 pb-3",
  label: "text-[13px] font-semibold text-slate-700 dark:text-slate-200",
  input:
    "bg-white dark:bg-slate-900 dark:border-white/10 dark:text-white border-black/10 focus-visible:ring-emerald-500/30",
  textarea:
    "bg-white dark:bg-slate-900 dark:border-white/10 dark:text-white border-black/10 focus-visible:ring-emerald-500/30",
  selectTrigger:
    "bg-white dark:bg-slate-900 dark:border-white/10 dark:text-white border-black/10",
  hint: "text-[11px] text-slate-500 dark:text-slate-400",
  toggleCard:
    "flex items-center justify-between rounded-2xl border border-black/5 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.04]",
  fileInput:
    "w-full rounded-xl border border-dashed border-black/15 bg-white p-2 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-emerald-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-emerald-700 hover:file:bg-emerald-100 dark:border-white/15 dark:bg-slate-900 dark:text-slate-200 file:dark:bg-white/10 file:dark:text-white cursor-pointer",
};

export default function AddFoodPage() {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [category, setCategory] = useState("");
  const [branches, setBranches] = useState<Branch[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [form, setForm] = useState<FoodFormState>(INITIAL_FORM_STATE);

  useEffect(() => {
    fetchBranches();
    fetchCategories();
  }, []);

  const fetchBranches = async () => {
    try {
      const { data, error } = await supabase
        .from("branches")
        .select("id, name_fa, slug, name_ar, name_en, is_active")
        .order("created_at");
      if (error) throw error;
      setBranches((data as Branch[]) || []);
      if (data?.length === 0) toast.warning("ابتدا باید شعبه‌ای ایجاد کنید");
    } catch {
      toast.error("خطا در دریافت شعب");
    }
  };

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, name_ar, slug")
        .order("name", { ascending: false });
      if (error) throw error;
      setCategories((data as Category[]) || []);
      console.log("✅ دسته‌بندی‌ها از Supabase:", data);
    } catch (err: any) {
      console.error("خطا در دریافت دسته‌بندی‌ها:", err.message);
      toast.error("خطا در دریافت دسته‌بندی‌ها");
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploadLoading(true);
    try {
      const urls = await Promise.all(
        Array.from(files).map(async (file, i) => {
          const fileName = `${Date.now()}-${i}-${file.name.replace(/\s+/g, "-")}`;
          const { error } = await supabase.storage
            .from("menu-images")
            .upload(fileName, file);
          if (error) throw error;
          const { data } = supabase.storage
            .from("menu-images")
            .getPublicUrl(fileName);
          return data.publicUrl;
        }),
      );
      setImageUrls((p) => [...p, ...urls]);
      toast.success(`${urls.length} عکس آپلود شد`);
    } catch {
      toast.error("خطا در آپلود عکس");
    } finally {
      setUploadLoading(false);
    }
  };

  const removeImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: keyof FoodFormState, checked: boolean) => {
    setForm((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.name_fa ||
      !form.price ||
      !imageUrls.length ||
      !category ||
      !form.branch_id
    ) {
      toast.warning("تمام فیلدهای ستاره‌دار و حداقل یک عکس الزامی است");
      return;
    }

    setLoading(true);
    try {
      // پیدا کردن دسته انتخاب شده برای ذخیره slug و id
      const selectedCat = categories.find(
        (c) => c.id === category || c.slug === category,
      );

      const payload = {
        name_fa: form.name_fa.trim(),
        name_ar: form.name_ar.trim() || form.name_fa.trim(),
        name_en: form.name_en.trim() || form.name_fa.trim(),
        description_fa: form.description_fa.trim(),
        description_ar: form.description_ar.trim(),
        description_en: form.description_en.trim(),
        price: Number(form.price),
        image_url: imageUrls[0],
        images: imageUrls,
        category: selectedCat?.slug || category, // مثل "Afghan foods"
        category_id: selectedCat?.id || null, // id واقعی از جدول categories
        branch_id: form.branch_id,
        cooking_time: form.cooking_time ? Number(form.cooking_time) : null,
        serves: form.serves ? Number(form.serves) : null,
        ingredients_fa: form.ingredients_fa.trim() || null,
        ingredients_ar: form.ingredients_ar.trim() || null,
        ingredients_en: form.ingredients_en.trim() || null,
        is_available: form.is_available,
        is_spicy: form.is_spicy,
        is_vegetarian: form.is_vegetarian,
        tags: form.tags
          ? form.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
      };

      const { error } = await supabase.from("foods").insert([payload]);
      if (error) throw error;

      toast.success("غذا با موفقیت اضافه شد");
      setForm(INITIAL_FORM_STATE);
      setImageUrls([]);
      setCategory("");
      const input = document.getElementById("food-images") as HTMLInputElement;
      if (input) input.value = "";
    } catch (err: any) {
      toast.error(err.message || "خطا در ذخیره");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={theme.page} dir="rtl">
      <div className={`${theme.container} px-4 py-6 sm:px-6 lg:py-8`}>
        <div className="mb-6">
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
            افزودن غذای جدید
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            دسته‌بندی‌ها از جدول categories سوپابیس میاد
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className={`${theme.card} p-4 sm:p-6 space-y-5`}>
            <h2
              className={`${theme.cardHeader} font-bold text-emerald-700 dark:text-emerald-300`}
            >
              ۱. تصاویر و نام
            </h2>

            <div className="space-y-3">
              <Label className={theme.label}>
                عکس‌ها <span className="text-red-500">*</span>
              </Label>
              <input
                id="food-images"
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleFileUpload(e.target.files)}
                className={theme.fileInput}
                disabled={uploadLoading}
              />
              {uploadLoading && (
                <p className="text-sm text-emerald-600 animate-pulse">
                  در حال آپلود...
                </p>
              )}
            </div>

            {imageUrls.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {imageUrls.map((url, i) => (
                  <div
                    key={url}
                    className="relative overflow-hidden rounded-2xl border border-black/10 dark:border-white/10 group"
                  >
                    <img
                      src={url}
                      alt=""
                      className="h-28 w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute inset-0 m-auto h-8 w-8 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100"
                    >
                      ×
                    </button>
                    {i === 0 && (
                      <span className="absolute bottom-1 right-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] text-white">
                        اصلی
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className={theme.label}>نام فارسی *</Label>
                <Input
                  name="name_fa"
                  value={form.name_fa}
                  onChange={handleInputChange}
                  placeholder="قابلی پلو"
                  required
                  className={theme.input}
                />
              </div>
              <div className="space-y-2">
                <Label className={theme.label}>نام عربی</Label>
                <Input
                  name="name_ar"
                  value={form.name_ar}
                  onChange={handleInputChange}
                  placeholder="قابلي"
                  className={theme.input}
                />
              </div>
              <div className="space-y-2">
                <Label className={theme.label}>نام انگلیسی</Label>
                <Input
                  name="name_en"
                  value={form.name_en}
                  onChange={handleInputChange}
                  placeholder="Qabili"
                  dir="ltr"
                  className={theme.input}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className={theme.label}>توضیحات فارسی</Label>
                <Textarea
                  name="description_fa"
                  value={form.description_fa}
                  onChange={handleInputChange}
                  rows={3}
                  className={theme.textarea}
                />
              </div>
              <div className="space-y-2">
                <Label className={theme.label}>توضیحات عربی</Label>
                <Textarea
                  name="description_ar"
                  value={form.description_ar}
                  onChange={handleInputChange}
                  rows={3}
                  className={theme.textarea}
                />
              </div>
              <div className="space-y-2">
                <Label className={theme.label}>توضیحات انگلیسی</Label>
                <Textarea
                  name="description_en"
                  value={form.description_en}
                  onChange={handleInputChange}
                  rows={3}
                  dir="ltr"
                  className={theme.textarea}
                />
              </div>
            </div>
          </div>

          <div className={`${theme.card} p-4 sm:p-6 space-y-5`}>
            <h2
              className={`${theme.cardHeader} font-bold text-blue-600 dark:text-blue-300`}
            >
              ۲. قیمت و دسته‌بندی
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className={theme.label}>قیمت (تومان) *</Label>
                <Input
                  name="price"
                  type="number"
                  value={form.price}
                  onChange={handleInputChange}
                  required
                  className={theme.input}
                />
              </div>
              <div className="space-y-2">
                <Label className={theme.label}>زمان پخت (دقیقه)</Label>
                <Input
                  name="cooking_time"
                  type="number"
                  value={form.cooking_time}
                  onChange={handleInputChange}
                  className={theme.input}
                />
              </div>
              <div className="space-y-2">
                <Label className={theme.label}>تعداد نفرات</Label>
                <Input
                  name="serves"
                  type="number"
                  value={form.serves}
                  onChange={handleInputChange}
                  className={theme.input}
                />
              </div>
              <div className="space-y-2">
                <Label className={theme.label}>تگ‌ها</Label>
                <Input
                  name="tags"
                  value={form.tags}
                  onChange={handleInputChange}
                  placeholder="پرفروش, ویژه"
                  className={theme.input}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className={theme.label}>
                  دسته‌بندی *{" "}
                  {loadingCategories && (
                    <span className="text-xs opacity-50">
                      (در حال بارگذاری از Supabase...)
                    </span>
                  )}
                </Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger className={theme.selectTrigger}>
                    <SelectValue
                      placeholder={
                        loadingCategories
                          ? "در حال بارگذاری..."
                          : "انتخاب دسته‌بندی"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-slate-900 dark:border-white/10">
                    {categories.length === 0 && !loadingCategories ? (
                      <SelectItem value="Afghan foods" disabled>
                        دسته‌ای یافت نشد
                      </SelectItem>
                    ) : (
                      categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className={theme.label}>شعبه *</Label>
                <Select
                  value={form.branch_id}
                  onValueChange={(v) =>
                    setForm((p) => ({ ...p, branch_id: v }))
                  }
                  required
                  disabled={!branches.length}
                >
                  <SelectTrigger className={theme.selectTrigger}>
                    <SelectValue
                      placeholder={
                        branches.length ? "انتخاب شعبه" : "در حال بارگذاری..."
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-slate-900 dark:border-white/10">
                    {branches.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name_fa}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className={theme.label}>مواد فارسی</Label>
                <Textarea
                  name="ingredients_fa"
                  value={form.ingredients_fa}
                  onChange={handleInputChange}
                  rows={2}
                  className={theme.textarea}
                />
              </div>
              <div className="space-y-2">
                <Label className={theme.label}>مواد عربی</Label>
                <Textarea
                  name="ingredients_ar"
                  value={form.ingredients_ar}
                  onChange={handleInputChange}
                  rows={2}
                  className={theme.textarea}
                />
              </div>
              <div className="space-y-2">
                <Label className={theme.label}>مواد انگلیسی</Label>
                <Textarea
                  name="ingredients_en"
                  value={form.ingredients_en}
                  onChange={handleInputChange}
                  rows={2}
                  dir="ltr"
                  className={theme.textarea}
                />
              </div>
            </div>
          </div>

          <div className={`${theme.card} p-4 sm:p-6 space-y-4`}>
            <h2
              className={`${theme.cardHeader} font-bold text-purple-600 dark:text-purple-300`}
            >
              ۳. وضعیت
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {[
                {
                  key: "is_available" as const,
                  title: "موجود در منو",
                  desc: "قابل سفارش باشد؟",
                },
                { key: "is_spicy" as const, title: "تند", desc: "آیکون تندی" },
                {
                  key: "is_vegetarian" as const,
                  title: "گیاهی",
                  desc: "بدون گوشت",
                },
              ].map((item) => (
                <div key={item.key} className={theme.toggleCard}>
                  <div>
                    <Label className="font-semibold text-[14px]">
                      {item.title}
                    </Label>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {item.desc}
                    </p>
                  </div>
                  <Switch
                    checked={form[item.key]}
                    onCheckedChange={(c) => handleSwitchChange(item.key, c)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="sticky bottom-0 z-10 -mx-4 p-4 bg-[#fff8ed]/80 dark:bg-slate-950/80 backdrop-blur-xl border-t border-black/5 dark:border-white/10 sm:mx-0 sm:rounded-2xl sm:border">
            <Button
              type="submit"
              disabled={
                loading ||
                uploadLoading ||
                !imageUrls.length ||
                !branches.length
              }
              className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold shadow-lg disabled:opacity-50"
            >
              {loading ? "در حال ذخیره..." : "ثبت غذا"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
