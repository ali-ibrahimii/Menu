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
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableItem } from "@/components/ui/sortable-item";
import { GripVertical, Trash2, ArrowRight } from "lucide-react";
import type { Branch, Category } from "@/types";

interface FoodItem {
  id: string;
  name_fa: string;
  name_ar?: string;
  name_en?: string;
  price: number;
  category: string;
  category_id?: string;
  image_url: string;
  images: string[];
  branch_id: string;
  [key: string]: any;
}

const theme = {
  page: "min-h-screen w-full bg-[#fff8ed] text-slate-900 dark:bg-slate-950 dark:text-white",
  container: "mx-auto w-full max-w-5xl px-3 sm:px-6 lg:px-8",
  card: "rounded-[1.25rem] sm:rounded-[1.5rem] border border-black/[0.06] bg-white/90 shadow-sm dark:border-white/10 dark:bg-slate-900/70 backdrop-blur",
  cardHeader:
    "border-b border-black/5 dark:border-white/10 pb-3 font-bold text-[15px] sm:text-base",
  label: "text-[13px] font-bold text-slate-700 dark:text-slate-200",
  input:
    "h-12 rounded-xl bg-white dark:bg-slate-900 border-black/10 dark:border-white/10 text-[14px] dark:text-white focus-visible:ring-emerald-500/30",
  textarea:
    "rounded-xl bg-white dark:bg-slate-900 border-black/10 dark:border-white/10 text-[14px] dark:text-white min-h-[80px]",
  selectTrigger:
    "h-12 rounded-xl bg-white dark:bg-slate-900 border-black/10 dark:border-white/10 text-[14px]",
  fileInput:
    "w-full rounded-xl border-2 border-dashed border-black/15 bg-white p-3 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-emerald-50 file:px-4 file:py-2 file:text-sm file:font-bold file:text-emerald-700 dark:border-white/15 dark:bg-slate-900 dark:text-slate-200 file:dark:bg-white/10 file:dark:text-white cursor-pointer",
};

export default function EditFoodPage() {
  const { id } = useParams();
  const router = useRouter();
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [category, setCategory] = useState("");
  const [branches, setBranches] = useState<Branch[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [originalFoodData, setOriginalFoodData] = useState<FoodItem | null>(
    null,
  );

  const [form, setForm] = useState({
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
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    fetchBranches();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!id) return;
    fetchFood();
  }, [id]);

  const fetchBranches = async () => {
    try {
      const { data, error } = await supabase
        .from("branches")
        .select("id, name_fa, slug")
        .order("created_at");
      if (error) throw error;
      setBranches((data as Branch[]) || []);
    } catch {
      toast.error("خطا در دریافت شعب");
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await supabase
        .from("categories")
        .select("id, name, slug")
        .order("name");
      setCategories((data as any) || []);
    } catch {}
  };

  const fetchFood = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("foods")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      setOriginalFoodData(data);
      setForm({
        name_fa: data.name_fa || "",
        name_ar: data.name_ar || "",
        name_en: data.name_en || "",
        description_fa: data.description_fa || "",
        description_ar: data.description_ar || "",
        description_en: data.description_en || "",
        price: data.price?.toString() || "",
        branch_id: data.branch_id || "",
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
      setCategory(data.category_id || data.category || "");
      if (data.images?.length) setImageUrls(data.images);
      else if (data.image_url) setImageUrls([data.image_url]);
    } catch {
      toast.error("خطا در دریافت غذا");
      router.push("/admin/foods");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files?.length) {
      toast.warning("لطفا عکس انتخاب کنید");
      return;
    }
    setUploadLoading(true);
    const uploadedUrls: string[] = [];
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 5 * 1024 * 1024) {
          toast.warning(`عکس ${file.name} باید کمتر از 5MB باشد`);
          continue;
        }
        const fileName = `${Date.now()}-${i}-${file.name.replace(/\s+/g, "_")}`;
        const { error } = await supabase.storage
          .from("menu-images")
          .upload(fileName, file, { cacheControl: "3600", upsert: false });
        if (error) {
          toast.warning(`خطا در آپلود ${file.name}`);
          continue;
        }
        const { data } = supabase.storage
          .from("menu-images")
          .getPublicUrl(fileName);
        uploadedUrls.push(data.publicUrl);
      }
      if (uploadedUrls.length > 0) {
        setImageUrls((prev) => [...prev, ...uploadedUrls]);
        toast.success(`${uploadedUrls.length} عکس اضافه شد`);
      }
    } catch {
      toast.error("خطا در آپلود");
    } finally {
      setUploadLoading(false);
    }
  };

  const removeImage = async (index: number) => {
    const urlToRemove = imageUrls[index];
    try {
      const fileName = urlToRemove.split("/").pop();
      if (fileName && originalFoodData?.images?.includes(urlToRemove)) {
        await supabase.storage.from("menu-images").remove([fileName]);
      }
    } catch {}
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
    toast.success("عکس حذف شد");
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setImageUrls((items) => {
        const oldIndex = items.findIndex((item) => item === active.id);
        const newIndex = items.findIndex((item) => item === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSetAsPrimary = (index: number) => {
    if (index === 0) return;
    const newUrls = [...imageUrls];
    const [selected] = newUrls.splice(index, 1);
    newUrls.unshift(selected);
    setImageUrls(newUrls);
    toast.success("تصویر اصلی تنظیم شد");
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
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
      toast.warning("فیلدهای ضروری را پر کنید");
      return;
    }
    setUpdating(true);
    try {
      const selectedCat = categories.find(
        (c) => c.id === category || (c as any).slug === category,
      );
      const foodData: any = {
        name_fa: form.name_fa,
        name_ar: form.name_ar,
        name_en: form.name_en,
        description_fa: form.description_fa,
        description_ar: form.description_ar,
        description_en: form.description_en,
        price: Number(form.price),
        image_url: imageUrls[0],
        images: imageUrls,
        category: selectedCat?.slug || category,
        branch_id: form.branch_id,
        cooking_time: form.cooking_time ? Number(form.cooking_time) : null,
        serves: form.serves ? Number(form.serves) : null,
        ingredients_fa: form.ingredients_fa || null,
        ingredients_ar: form.ingredients_ar || null,
        ingredients_en: form.ingredients_en || null,
        is_available: form.is_available,
        is_spicy: form.is_spicy,
        is_vegetarian: form.is_vegetarian,
        tags: form.tags
          ? form.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
        updated_at: new Date().toISOString(),
      };
      // فقط اگر ستون category_id وجود داشت بفرست - برای جلوگیری از ارور schema cache
      // اگر ارور category_id گرفتی، این خط را کامنت کن
      if (selectedCat?.id) {
        // سعی می‌کنیم بفرستیم، اگر ارور داد بدون category_id دوباره می‌فرستیم
        const { error: errWithCatId } = await supabase
          .from("foods")
          .update({ ...foodData, category_id: selectedCat.id })
          .eq("id", id);
        if (errWithCatId && errWithCatId.message.includes("category_id")) {
          const { error } = await supabase
            .from("foods")
            .update(foodData)
            .eq("id", id);
          if (error) throw error;
        } else if (errWithCatId) {
          throw errWithCatId;
        }
      } else {
        const { error } = await supabase
          .from("foods")
          .update(foodData)
          .eq("id", id);
        if (error) throw error;
      }

      toast.success("غذا ویرایش شد");
      router.push("/admin/foods");
    } catch (err: any) {
      toast.error("خطا: " + err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#fff8ed] dark:bg-slate-950 p-4">
        <div className="text-center">
          <div className="h-10 w-10 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin mx-auto" />
          <p className="mt-3 text-sm font-medium">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${theme.page} pb-28 sm:pb-6`} dir="rtl">
      <div className={`${theme.container} py-4 sm:py-6`}>
        <div className="flex items-center justify-between gap-3 mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-3xl font-black tracking-tight">
            ویرایش غذا
          </h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/admin/foods")}
            className="rounded-full h-10 gap-1 border-black/10 dark:border-white/10 bg-white dark:bg-slate-900 text-xs sm:text-sm"
          >
            <ArrowRight size={16} className="rotate-180" /> بازگشت
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className={`${theme.card} p-3.5 sm:p-6 space-y-4`}>
            <h2
              className={`${theme.cardHeader} text-emerald-600 dark:text-emerald-300 flex items-center gap-2`}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 text-xs">
                ۱
              </span>
              تصاویر
            </h2>

            <div className="space-y-2">
              <Label className={theme.label}>
                عکس‌ها * ({imageUrls.length})
              </Label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleFileUpload(e.target.files)}
                className={theme.fileInput}
                disabled={uploadLoading}
              />
              {uploadLoading && (
                <p className="text-xs text-emerald-600 animate-pulse">
                  در حال آپلود...
                </p>
              )}
              <p className="text-[11px] text-slate-500">
                حداکثر ۱۰ عکس، هر کدام کمتر از ۵MB - عکس اول اصلی است - بکشید تا
                ترتیب عوض شود
              </p>
            </div>

            {imageUrls.length > 0 && (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={imageUrls}
                  strategy={rectSortingStrategy}
                >
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4 sm:gap-4">
                    {imageUrls.map((url, index) => (
                      <SortableItem key={url} id={url}>
                        <div className="relative group border rounded-xl sm:rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 aspect-square">
                          <div className="absolute top-1.5 left-1.5 z-10">
                            <div className="bg-black/50 text-white p-1 rounded-full">
                              <GripVertical size={14} />
                            </div>
                          </div>
                          <img
                            src={url}
                            alt={`غذا ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 flex justify-between items-center">
                            {index === 0 ? (
                              <span className="bg-emerald-500 text-white text-[10px] px-2 py-1 rounded-full font-bold">
                                اصلی
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleSetAsPrimary(index)}
                                className="text-[10px] text-white bg-white/20 backdrop-blur px-2 py-1 rounded-full"
                              >
                                اصلی کن
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="h-7 w-7 rounded-full bg-red-500 text-white flex items-center justify-center"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      </SortableItem>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}

            <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label className={theme.label}>نام فارسی *</Label>
                <Input
                  name="name_fa"
                  value={form.name_fa}
                  onChange={handleInputChange}
                  required
                  placeholder="قورمه سبزی"
                  className={theme.input}
                />
              </div>
              <div className="space-y-1.5">
                <Label className={theme.label}>نام عربی</Label>
                <Input
                  name="name_ar"
                  value={form.name_ar}
                  onChange={handleInputChange}
                  className={theme.input}
                />
              </div>
              <div className="space-y-1.5">
                <Label className={theme.label}>نام انگلیسی</Label>
                <Input
                  name="name_en"
                  value={form.name_en}
                  onChange={handleInputChange}
                  dir="ltr"
                  className={theme.input}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label className={theme.label}>توضیحات فارسی</Label>
                <Textarea
                  name="description_fa"
                  value={form.description_fa}
                  onChange={handleInputChange}
                  rows={3}
                  className={theme.textarea}
                />
              </div>
              <div className="space-y-1.5">
                <Label className={theme.label}>توضیحات عربی</Label>
                <Textarea
                  name="description_ar"
                  value={form.description_ar}
                  onChange={handleInputChange}
                  rows={3}
                  className={theme.textarea}
                />
              </div>
              <div className="space-y-1.5">
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

          <div className={`${theme.card} p-3.5 sm:p-6 space-y-4`}>
            <h2
              className={`${theme.cardHeader} text-blue-600 dark:text-blue-300 flex items-center gap-2`}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/10 text-xs">
                ۲
              </span>{" "}
              جزئیات و دسته‌بندی
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
              <div className="space-y-1.5 col-span-2 md:col-span-1">
                <Label className={theme.label}>قیمت *</Label>
                <Input
                  name="price"
                  type="number"
                  inputMode="numeric"
                  value={form.price}
                  onChange={handleInputChange}
                  required
                  className={theme.input}
                />
              </div>
              <div className="space-y-1.5">
                <Label className={theme.label}>زمان پخت</Label>
                <Input
                  name="cooking_time"
                  type="number"
                  value={form.cooking_time}
                  onChange={handleInputChange}
                  className={theme.input}
                />
              </div>
              <div className="space-y-1.5">
                <Label className={theme.label}>نفرات</Label>
                <Input
                  name="serves"
                  type="number"
                  value={form.serves}
                  onChange={handleInputChange}
                  className={theme.input}
                />
              </div>
              <div className="space-y-1.5 col-span-2 md:col-span-1">
                <Label className={theme.label}>دسته‌بندی *</Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger className={theme.selectTrigger}>
                    <SelectValue placeholder="انتخاب دسته" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[50vh]">
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id} className="py-3">
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
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
                    <SelectValue placeholder="انتخاب شعبه" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((b) => (
                      <SelectItem key={b.id} value={b.id} className="py-3">
                        {b.name_fa}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
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
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="space-y-1.5">
                <Label className={theme.label}>مواد فارسی</Label>
                <Textarea
                  name="ingredients_fa"
                  value={form.ingredients_fa}
                  onChange={handleInputChange}
                  rows={2}
                  className={theme.textarea}
                />
              </div>
              <div className="space-y-1.5">
                <Label className={theme.label}>مواد عربی</Label>
                <Textarea
                  name="ingredients_ar"
                  value={form.ingredients_ar}
                  onChange={handleInputChange}
                  rows={2}
                  className={theme.textarea}
                />
              </div>
              <div className="space-y-1.5">
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

          <div className={`${theme.card} p-3.5 sm:p-6 space-y-3`}>
            <h2
              className={`${theme.cardHeader} text-purple-600 dark:text-purple-300 flex items-center gap-2`}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/10 text-xs">
                ۳
              </span>{" "}
              وضعیت
            </h2>
            <div className="space-y-2.5">
              {[
                {
                  key: "is_available" as const,
                  title: "موجود",
                  desc: "نمایش در منو",
                },
                { key: "is_spicy" as const, title: "تند", desc: "حاوی فلفل" },
                {
                  key: "is_vegetarian" as const,
                  title: "گیاهی",
                  desc: "بدون گوشت",
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between rounded-xl border border-black/5 bg-slate-50/80 p-3.5 dark:border-white/10 dark:bg-white/[0.04] gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <Label className="font-bold text-[13px]">
                      {item.title}
                    </Label>
                    <p className="text-[11px] opacity-60 mt-0.5">{item.desc}</p>
                  </div>
                  <Switch
                    checked={form[item.key]}
                    onCheckedChange={(c) => handleSwitchChange(item.key, c)}
                    className="shrink-0"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="fixed bottom-0 left-0 right-0 z-20 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-t border-black/10 dark:border-white/10 p-3 sm:static sm:bg-transparent sm:border-0 sm:p-0 sm:backdrop-blur-none">
            <div className="mx-auto max-w-5xl flex gap-2 sm:gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/foods")}
                className="flex-1 h-12 rounded-xl border-black/10 dark:border-white/10 bg-white dark:bg-slate-900"
              >
                انصراف
              </Button>
              <Button
                type="submit"
                disabled={updating || !imageUrls.length}
                className="flex-1 h-12 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black shadow-lg disabled:opacity-50"
              >
                {updating ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />{" "}
                    ذخیره...
                  </span>
                ) : (
                  "ذخیره تغییرات"
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
