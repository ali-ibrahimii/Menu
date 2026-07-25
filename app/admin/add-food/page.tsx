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

// تم روشن / تاریک - بدون تغییر لایه اصلی
const theme = {
  page: "min-h-screen w-full bg-[#fff8ed] text-slate-900 dark:bg-slate-950 dark:text-white transition-colors duration-500",
  container: "mx-auto w-full max-w-5xl",
  card: "rounded-[1.5rem] border border-black/[0.08] bg-white/90 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/70 dark:shadow-none transition-colors",
  cardHeader: "border-b border-black/5 dark:border-white/10 pb-3",
  label: "text-[13px] font-semibold text-slate-700 dark:text-slate-200",
  input:
    "bg-white dark:bg-slate-900 dark:border-white/10 dark:text-white dark:placeholder:text-slate-400 border-black/10 focus-visible:ring-emerald-500/30",
  textarea:
    "bg-white dark:bg-slate-900 dark:border-white/10 dark:text-white dark:placeholder:text-slate-400 border-black/10 focus-visible:ring-emerald-500/30",
  selectTrigger:
    "bg-white dark:bg-slate-900 dark:border-white/10 dark:text-white border-black/10",
  hint: "text-[11px] text-slate-500 dark:text-slate-400",
  toggleCard:
    "flex items-center justify-between rounded-2xl border border-black/5 bg-slate-50/80 p-4 transition-colors dark:border-white/10 dark:bg-white/[0.04] hover:bg-white dark:hover:bg-white/[0.06]",
  fileInput:
    "w-full rounded-xl border border-dashed border-black/15 bg-white p-2 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-emerald-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-emerald-700 hover:file:bg-emerald-100 dark:border-white/15 dark:bg-slate-900 dark:text-slate-200 file:dark:bg-white/10 file:dark:text-white transition-all cursor-pointer",
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
      const uploadPromises = Array.from(files).map(async (file, index) => {
        const fileName = `${Date.now()}-${index}-${file.name.replace(/\s+/g, "-")}`;

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
      imageUrls.length === 0 ||
      !category ||
      !form.branch_id
    ) {
      toast.warning(
        "لطفاً تمام فیلدهای ستاره‌دار و حداقل یک عکس را وارد کنید.",
      );
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
        image_url: imageUrls[0],
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
        tags: form.tags
          ? form.tags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean)
          : [],
      };

      const { error } = await supabase.from("foods").insert([foodData]);

      if (error) throw error;

      toast.success("غذا با موفقیت به منو اضافه شد");

      setForm(INITIAL_FORM_STATE);
      setImageUrls([]);
      setCategory("");

      const fileInput = document.getElementById(
        "food-images",
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (error: any) {
      console.error("Error saving food:", error);
      toast.error(error.message || "خطا در ذخیره اطلاعات غذا");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={theme.page} dir="rtl">
      <div className={`${theme.container} px-4 py-6 sm:px-6 lg:px-8 lg:py-8`}>
        {/* Header */}
        <div className="mb-6 flex flex-col gap-2 sm:mb-8">
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-[2rem]">
            افزودن غذای جدید
            <span className="ms-2 inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            اطلاعات غذا رو کامل وارد کن، عکس اول به عنوان کاور اصلی ذخیره میشه.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-8">
          {/* Section 1 */}
          <div className={`${theme.card} p-4 sm:p-6 space-y-6`}>
            <h2
              className={`${theme.cardHeader} flex items-center gap-2 text-base font-bold text-emerald-700 dark:text-emerald-300 sm:text-lg`}
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-300">
                1
              </span>
              تصاویر و اطلاعات اصلی
            </h2>

            {/* Image Upload */}
            <div className="space-y-4">
              <Label htmlFor="food-images" className={theme.label}>
                عکس‌های غذا <span className="text-red-500">*</span>
              </Label>

              <div className="space-y-3">
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
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 animate-pulse">
                    در حال آپلود تصاویر...
                  </p>
                )}
                <p className={theme.hint}>
                  حداکثر 5 مگابایت برای هر عکس - عکس اول کاور اصلی است.
                </p>
              </div>

              {imageUrls.length > 0 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:gap-4">
                  {imageUrls.map((url, index) => (
                    <div
                      key={url}
                      className="group relative overflow-hidden rounded-2xl border border-black/10 dark:border-white/10"
                    >
                      <img
                        src={url}
                        alt={`پیش‌نمایش ${index + 1}`}
                        className="h-28 w-full object-cover transition-transform duration-300 group-hover:scale-105 sm:h-32"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
                          title="حذف تصویر"
                        >
                          ×
                        </button>
                      </div>
                      {index === 0 && (
                        <span className="absolute bottom-2 right-2 rounded-full bg-emerald-500/90 px-2 py-1 text-[10px] font-bold text-white shadow">
                          تصویر اصلی
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Names */}
            <div className="grid grid-cols-1 gap-4 pt-2 md:grid-cols-3 md:gap-5">
              {[
                {
                  id: "name_fa",
                  label: "نام فارسی",
                  ph: "مثلاً: قابلی ماهیچه",
                },
                { id: "name_ar", label: "نام عربی", ph: "مثلاً: قابلي لحم" },
                {
                  id: "name_en",
                  label: "نام انگلیسی",
                  ph: "e.g., Qabili Mahiche",
                  ltr: true,
                },
              ].map((f) => (
                <div key={f.id} className="space-y-2">
                  <Label htmlFor={f.id} className={theme.label}>
                    {f.label} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={f.id}
                    name={f.id}
                    placeholder={f.ph}
                    value={(form as any)[f.id]}
                    onChange={handleInputChange}
                    required
                    dir={f.ltr ? "ltr" : "rtl"}
                    className={theme.input}
                  />
                </div>
              ))}
            </div>

            {/* Descriptions */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
              <div className="space-y-2">
                <Label htmlFor="description_fa" className={theme.label}>
                  توضیحات فارسی <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description_fa"
                  name="description_fa"
                  placeholder="توضیحات کامل شامل نحوه پخت و طعم..."
                  value={form.description_fa}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className={theme.textarea}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description_ar" className={theme.label}>
                  توضیحات عربی <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description_ar"
                  name="description_ar"
                  placeholder="الوصف..."
                  value={form.description_ar}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className={theme.textarea}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description_en" className={theme.label}>
                  توضیحات انگلیسی <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description_en"
                  name="description_en"
                  placeholder="Full description..."
                  value={form.description_en}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  dir="ltr"
                  className={theme.textarea}
                />
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div className={`${theme.card} p-4 sm:p-6 space-y-6`}>
            <h2
              className={`${theme.cardHeader} flex items-center gap-2 text-base font-bold text-blue-600 dark:text-blue-300 sm:text-lg`}
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-300">
                2
              </span>
              جزئیات و قیمت‌گذاری
            </h2>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
              <div className="space-y-2">
                <Label htmlFor="cooking_time" className={theme.label}>
                  زمان پخت (دقیقه)
                </Label>
                <Input
                  id="cooking_time"
                  name="cooking_time"
                  type="number"
                  placeholder="45"
                  value={form.cooking_time}
                  onChange={handleInputChange}
                  min="0"
                  className={theme.input}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="serves" className={theme.label}>
                  تعداد نفرات
                </Label>
                <Input
                  id="serves"
                  name="serves"
                  type="number"
                  placeholder="2"
                  value={form.serves}
                  onChange={handleInputChange}
                  min="1"
                  className={theme.input}
                />
              </div>
              <div className="space-y-2 col-span-2 md:col-span-2">
                <Label htmlFor="price" className={theme.label}>
                  قیمت (تومان) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  placeholder="350000"
                  value={form.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className={theme.input}
                />
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div className={`${theme.card} p-4 sm:p-6 space-y-6`}>
            <h2
              className={`${theme.cardHeader} flex items-center gap-2 text-base font-bold text-orange-600 dark:text-orange-300 sm:text-lg`}
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-orange-500/10 text-orange-600 dark:bg-orange-400/10 dark:text-orange-300">
                3
              </span>
              مواد تشکیل دهنده (اختیاری)
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
              <div className="space-y-2">
                <Label htmlFor="ingredients_fa" className={theme.label}>
                  فارسی (با کاما جدا کنید)
                </Label>
                <Textarea
                  id="ingredients_fa"
                  name="ingredients_fa"
                  placeholder="برنج اعلا، گوشت..."
                  value={form.ingredients_fa}
                  onChange={handleInputChange}
                  rows={3}
                  className={theme.textarea}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ingredients_ar" className={theme.label}>
                  عربی
                </Label>
                <Textarea
                  id="ingredients_ar"
                  name="ingredients_ar"
                  value={form.ingredients_ar}
                  onChange={handleInputChange}
                  rows={3}
                  className={theme.textarea}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ingredients_en" className={theme.label}>
                  انگلیسی
                </Label>
                <Textarea
                  id="ingredients_en"
                  name="ingredients_en"
                  dir="ltr"
                  value={form.ingredients_en}
                  onChange={handleInputChange}
                  rows={3}
                  className={theme.textarea}
                />
              </div>
            </div>
          </div>

          {/* Section 4 */}
          <div className={`${theme.card} p-4 sm:p-6 space-y-6`}>
            <h2
              className={`${theme.cardHeader} flex items-center gap-2 text-base font-bold text-purple-600 dark:text-purple-300 sm:text-lg`}
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-purple-500/10 text-purple-600 dark:bg-purple-400/10 dark:text-purple-300">
                4
              </span>
              دسته‌بندی و وضعیت
            </h2>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className={theme.label}>
                      دسته‌بندی <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={category}
                      onValueChange={setCategory}
                      required
                    >
                      <SelectTrigger className={theme.selectTrigger}>
                        <SelectValue placeholder="انتخاب دسته" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-slate-900 dark:border-white/10">
                        <SelectItem value="Afghan foods">
                          غذای افغانی
                        </SelectItem>
                        <SelectItem value="Iranian foods">
                          غذای ایرانی
                        </SelectItem>
                        <SelectItem value="Drinks">دمنوش</SelectItem>
                        <SelectItem value="Dessert">دسر</SelectItem>
                        <SelectItem value="Cold drinks">نوشیدنی سرد</SelectItem>
                        <SelectItem value="Hot drinks">نوشیدنی گرم</SelectItem>
                        <SelectItem value="Breakfast">صبحانه</SelectItem>
                        <SelectItem value="Coffee-based drinks">
                          نوشیدنی برپایه قهوه
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className={theme.label}>
                      شعبه <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={form.branch_id}
                      onValueChange={(value) =>
                        setForm((prev) => ({ ...prev, branch_id: value }))
                      }
                      required
                      disabled={branches.length === 0}
                    >
                      <SelectTrigger className={theme.selectTrigger}>
                        <SelectValue
                          placeholder={
                            branches.length === 0
                              ? "در حال دریافت..."
                              : "انتخاب شعبه"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-slate-900 dark:border-white/10">
                        {branches.map((branch) => (
                          <SelectItem key={branch.id} value={branch.id}>
                            {branch.name_fa}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags" className={theme.label}>
                    تگ‌های جستجو (اختیاری)
                  </Label>
                  <Input
                    id="tags"
                    name="tags"
                    placeholder="پرفروش, پیشنهاد سرآشپز, ویژه"
                    value={form.tags}
                    onChange={handleInputChange}
                    className={theme.input}
                  />
                  <p className={theme.hint}>تگ‌ها را با کاما جدا کنید.</p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  {
                    id: "is_available",
                    title: "موجود در منو",
                    desc: "آیا قابل سفارش است؟",
                    key: "is_available" as const,
                  },
                  {
                    id: "is_spicy",
                    title: "تند و ادویه‌دار",
                    desc: "نمایش آیکون تندی",
                    key: "is_spicy" as const,
                  },
                  {
                    id: "is_vegetarian",
                    title: "غذای گیاهی",
                    desc: "مناسب برای رژیم بدون گوشت",
                    key: "is_vegetarian" as const,
                  },
                ].map((item) => (
                  <div key={item.id} className={theme.toggleCard}>
                    <div className="space-y-0.5">
                      <Label
                        htmlFor={item.id}
                        className="cursor-pointer text-[14px] font-semibold"
                      >
                        {item.title}
                      </Label>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {item.desc}
                      </p>
                    </div>
                    <Switch
                      id={item.id}
                      checked={form[item.key]}
                      onCheckedChange={(checked) =>
                        handleSwitchChange(item.key, checked)
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="sticky bottom-0 z-10 -mx-4 mt-2 border-t border-black/5 bg-[#fff8ed]/80 p-4 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80 sm:mx-0 sm:rounded-[1.5rem] sm:border sm:p-4">
            <Button
              type="submit"
              disabled={
                loading ||
                uploadLoading ||
                imageUrls.length === 0 ||
                branches.length === 0
              }
              className="h-12 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-[15px] font-bold text-white shadow-lg shadow-emerald-500/20 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 dark:from-emerald-500 dark:to-teal-500 sm:h-14 sm:text-lg active:scale-[0.98] transition-all"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <span className="h-5 w-5 animate-spin rounded-full border-b-2 border-white"></span>
                  در حال ذخیره‌سازی...
                </span>
              ) : (
                "ثبت نهایی غذای جدید"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
