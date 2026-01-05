// app/admin/edit/[id]/page.tsx
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
import { GripVertical, Trash2 } from "lucide-react";

interface Branch {
  id: string;
  name_fa: string;
  slug: string;
}

interface FoodItem {
  id: string;
  name_fa: string;
  price: number;
  category: string;
  image_url: string;
  images: string[];
  branch_id: string;
  [key: string]: any;
}

export default function EditFoodPage() {
  const { id } = useParams();
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [category, setCategory] = useState("");
  const [branches, setBranches] = useState<Branch[]>([]);
  const [originalFoodData, setOriginalFoodData] = useState<FoodItem | null>(null);

  const [form, setForm] = useState({
    // اطلاعات اصلی
    name_fa: "",
    name_ar: "",
    name_en: "",
    description_fa: "",
    description_ar: "",
    description_en: "",
    price: "",
    branch_id: "",

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

  // سنسورهای DnD
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // گرفتن اطلاعات شعب
  useEffect(() => {
    fetchBranches();
  }, []);

  // گرفتن اطلاعات غذا
  useEffect(() => {
    if (!id) return;
    fetchFood();
  }, [id]);

  const fetchBranches = async () => {
    try {
      const { data, error } = await supabase
        .from('branches')
        .select('id, name_fa, slug')
        .order('created_at');

      if (error) throw error;
      setBranches(data || []);
    } catch (error) {
      console.error('Error fetching branches:', error);
      toast.error('خطا در دریافت اطلاعات شعب');
    }
  };

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

      // ذخیره اطلاعات اصلی برای مقایسه
      setOriginalFoodData(data);

      // پر کردن فرم با اطلاعات موجود
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
      router.push("/admin/foods");
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
        
        // بررسی سایز فایل (حداکثر 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.warning(`عکس ${file.name} باید کمتر از ۵ مگابایت باشد`);
          continue;
        }

        const fileName = `${Date.now()}-${i}-${file.name.replace(/\s+/g, '_')}`;

        const { data, error } = await supabase.storage
          .from("menu-images")
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          console.error(error);
          toast.warning(`خطا در آپلود عکس ${file.name}`);
          continue;
        }

        const { data: publicUrlData } = supabase.storage
          .from("menu-images")
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrlData.publicUrl);
      }

      if (uploadedUrls.length > 0) {
        setImageUrls((prev) => [...prev, ...uploadedUrls]);
        toast.success(`${uploadedUrls.length} عکس جدید اضافه شد`);
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      toast.warning("خطا در آپلود عکس‌ها");
    } finally {
      setUploadLoading(false);
    }
  };

  const removeImage = async (index: number) => {
    const urlToRemove = imageUrls[index];
    
    // استخراج نام فایل از URL
    try {
      const fileName = urlToRemove.split('/').pop();
      
      if (fileName && originalFoodData?.images?.includes(urlToRemove)) {
        // حذف از storage فقط اگر عکس اصلی است
        const { error } = await supabase.storage
          .from("menu-images")
          .remove([fileName]);
        
        if (error) {
          console.error("Error deleting image from storage:", error);
        }
      }
    } catch (error) {
      console.error("Error extracting filename:", error);
    }

    // حذف از لیست نمایش
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
    toast.success("عکس حذف شد");
  };

  // مرتب‌سازی عکس‌ها با drag & drop
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // اعتبارسنجی فیلدهای ضروری
    if (!form.name_fa || !form.price || imageUrls.length === 0 || !category || !form.branch_id) {
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
        image_url: imageUrls[0], // اولین عکس به عنوان تصویر اصلی
        images: imageUrls, // تمام تصاویر با ترتیب جدید
        category,
        branch_id: form.branch_id,

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

  const handleSetAsPrimary = (index: number) => {
    if (index === 0) return;
    
    const newImageUrls = [...imageUrls];
    const [selectedImage] = newImageUrls.splice(index, 1);
    newImageUrls.unshift(selectedImage);
    setImageUrls(newImageUrls);
    
    toast.success("عکس به عنوان تصویر اصلی تنظیم شد");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">در حال بارگذاری اطلاعات غذا...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold">ویرایش غذا</h1>
        <Button
          variant="outline"
          onClick={() => router.push("/admin/foods")}
          className="flex items-center gap-2"
        >
          ← بازگشت به لیست غذاها
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* بخش ۱: اطلاعات اصلی */}
        <div className="p-4 md:p-6 rounded-lg border space-y-6">
          <h2 className="text-xl font-semibold text-green-600 border-b pb-2">
            اطلاعات اصلی
          </h2>

          {/* آپلود عکس‌ها */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base">
                عکس‌های غذا <span className="text-destructive">*</span>
              </Label>
              <span className="text-sm text-gray-500">
                {imageUrls.length} عکس
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="border border-dashed border-gray-300 p-3 w-full rounded-lg hover:border-green-500 transition cursor-pointer"
                    disabled={uploadLoading}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => (document.querySelector('input[type="file"]') as HTMLInputElement | null)?.click()}
                  disabled={uploadLoading}
                  className="whitespace-nowrap"
                >
                  {uploadLoading ? "در حال آپلود..." : "انتخاب عکس"}
                </Button>
              </div>
              
              <div className="text-sm space-y-1">
                <p className="text-gray-500">
                  • می‌توانید چند عکس انتخاب کنید (حداکثر ۱۰ عکس)
                </p>
                <p className="text-gray-500">
                  • سایز هر عکس باید کمتر از ۵MB باشد
                </p>
                <p className="text-gray-500">
                  • عکس اول به عنوان تصویر اصلی در منو نمایش داده می‌شود
                </p>
              </div>
            </div>

            {/* پیشنمایش عکس‌ها با قابلیت مرتب‌سازی */}
            {imageUrls.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">پیش‌نمایش عکس‌ها</h3>
                  <p className="text-sm text-gray-500">
                    برای تغییر ترتیب، عکس‌ها را بکشید و رها کنید
                  </p>
                </div>

                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={imageUrls}
                    strategy={rectSortingStrategy}
                  >
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {imageUrls.map((url, index) => (
                        <SortableItem key={url} id={url}>
                          <div className="relative group border rounded-lg overflow-hidden">
                            <div className="absolute top-2 left-2 z-10">
                              <button
                                type="button"
                                className="bg-black/50 text-white p-1 rounded cursor-move"
                                aria-label="تغییر ترتیب"
                              >
                                <GripVertical size={16} />
                              </button>
                            </div>
                            
                            <img
                              src={url}
                              alt={`غذا ${index + 1}`}
                              className="w-full h-40 object-cover group-hover:scale-105 transition duration-300"
                            />
                            
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition" />
                            
                            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                              <div className="flex justify-between items-center">
                                {index === 0 ? (
                                  <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                                    تصویر اصلی
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleSetAsPrimary(index)}
                                    className="text-xs text-white hover:text-green-300 transition"
                                  >
                                    تنظیم به عنوان اصلی
                                  </button>
                                )}
                                
                                <button
                                  type="button"
                                  onClick={() => removeImage(index)}
                                  className="text-white hover:text-red-400 transition"
                                  aria-label="حذف عکس"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </SortableItem>
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            )}
          </div>

          {/* نام غذا */}
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
              <Label htmlFor="name_ar">نام عربی</Label>
              <Input
                id="name_ar"
                name="name_ar"
                placeholder="مثلا: قورمة سبزی"
                value={form.name_ar}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name_en">نام انگلیسی</Label>
              <Input
                id="name_en"
                name="name_en"
                placeholder="مثلا: Ghormeh Sabzi"
                value={form.name_en}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* توضیحات */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description_fa">توضیحات فارسی</Label>
              <Textarea
                id="description_fa"
                name="description_fa"
                placeholder="توضیحات کامل به فارسی"
                value={form.description_fa}
                onChange={handleInputChange}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="description_ar">توضیحات عربی</Label>
                <Textarea
                  id="description_ar"
                  name="description_ar"
                  placeholder="توضیحات کامل به عربی"
                  value={form.description_ar}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description_en">توضیحات انگلیسی</Label>
                <Textarea
                  id="description_en"
                  name="description_en"
                  placeholder="توضیحات کامل به انگلیسی"
                  value={form.description_en}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>
            </div>
          </div>
        </div>

        {/* بخش ۲: جزئیات فنی */}
        <div className="p-4 md:p-6 rounded-lg border space-y-6">
          <h2 className="text-xl font-semibold text-blue-600 border-b pb-2">
            جزئیات فنی
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
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
          </div>
        </div>

        {/* بخش ۳: مواد تشکیل دهنده */}
        <div className="p-4 md:p-6 rounded-lg border space-y-6">
          <h2 className="text-xl font-semibold text-orange-600 border-b pb-2">
            مواد تشکیل دهنده
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ingredients_fa">مواد تشکیل دهنده (فارسی)</Label>
              <Textarea
                id="ingredients_fa"
                name="ingredients_fa"
                placeholder="گوشت گوساله، برنج، سبزیجات معطر، لیمو عمانی..."
                value={form.ingredients_fa}
                onChange={handleInputChange}
                rows={4}
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
                rows={4}
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
                rows={4}
              />
            </div>
          </div>
          
          <div className="text-sm text-gray-500">
            <p>• مواد را با کاما (،) یا خط جدید جدا کنید</p>
          </div>
        </div>
        
        {/* بخش ۴: تنظیمات */}
        <div className="p-4 md:p-6 rounded-lg border space-y-6">
          <h2 className="text-xl font-semibold text-purple-600 border-b pb-2">
            تنظیمات و اطلاعات اضافی
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ستون اول: تنظیمات شعبه و تگ‌ها */}
            <div className="space-y-4 lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* انتخاب شعبه */}
                <div className="space-y-2">
                  <Label htmlFor="branch_id">
                    شعبه <span className="text-destructive">*</span>
                  </Label>
                  <Select 
                    value={form.branch_id} 
                    onValueChange={(value) => 
                      setForm(prev => ({ ...prev, branch_id: value }))
                    } 
                    required
                    disabled={branches.length === 0}
                  >
                    <SelectTrigger id="branch_id">
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
                    تگ‌ها را با کاما جدا کنید
                  </p>
                </div>
              </div>
            </div>

            {/* ستون دوم: سوئیچ‌ها */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition">
                <div className="space-y-1">
                  <Label htmlFor="is_available" className="cursor-pointer font-medium">
                    موجود است
                  </Label>
                  <p className="text-xs text-gray-500">نمایش در منو</p>
                </div>
                <Switch
                  id="is_available"
                  checked={form.is_available}
                  onCheckedChange={(checked) =>
                    handleSwitchChange("is_available", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition">
                <div className="space-y-1">
                  <Label htmlFor="is_spicy" className="cursor-pointer font-medium">
                    تند است
                  </Label>
                  <p className="text-xs text-gray-500">حاوی مواد تند</p>
                </div>
                <Switch
                  id="is_spicy"
                  checked={form.is_spicy}
                  onCheckedChange={(checked) =>
                    handleSwitchChange("is_spicy", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition">
                <div className="space-y-1">
                  <Label htmlFor="is_vegetarian" className="cursor-pointer font-medium">
                    گیاهی است
                  </Label>
                  <p className="text-xs text-gray-500">فاقد محصولات حیوانی</p>
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

        {/* دکمه‌های ثبت */}
        <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm pt-4 border-t">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/foods")}
                className="flex-1 py-3"
                size="lg"
              >
                انصراف
              </Button>
              <Button
                type="submit"
                disabled={updating || imageUrls.length === 0 || branches.length === 0}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 text-lg font-semibold shadow-lg"
                size="lg"
              >
                {updating ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                    در حال ذخیره تغییرات...
                  </span>
                ) : (
                  "ذخیره تغییرات"
                )}
              </Button>
            </div>
            
            {/* راهنمایی */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-sm text-blue-700 text-center">
                <strong>توجه:</strong> تغییرات در منوی شعبه انتخاب شده اعمال خواهد شد.
                عکس اول به عنوان تصویر اصلی نمایش داده می‌شود.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}