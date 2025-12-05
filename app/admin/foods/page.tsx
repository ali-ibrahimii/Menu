"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { toast } from "sonner";
import {
  Search,
  Edit,
  Trash2,
  Eye,
  Plus,
  RefreshCw,
  Filter,
  MoreVertical,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Food = {
  id: string;
  name_fa: string;
  name_ar: string;
  name_en: string;
  price: number;
  image_url: string;
  category_id: string;
  is_available: boolean;
  description_fa: string;
  description_ar: string;
  description_en: string;
  created_at: string;
  updated_at: string;
};

type SortConfig = {
  key: keyof Food;
  direction: 'asc' | 'desc';
};

export default function AdminFoodsPage() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [filteredFoods, setFilteredFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'created_at', direction: 'desc' });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; foodId: string | null }>({
    open: false,
    foodId: null,
  });
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [previewDialog, setPreviewDialog] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name_fa: string }[]>([]);

  // دریافت غذاها و دسته‌بندی‌ها
  useEffect(() => {
    fetchFoods();
    fetchCategories();
  }, []);

  // فیلتر کردن و مرتب‌سازی غذاها
  useEffect(() => {
    let result = [...foods];

    // جستجو
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (food) =>
          food.name_fa.toLowerCase().includes(query) ||
          food.name_en.toLowerCase().includes(query) ||
          food.description_fa?.toLowerCase().includes(query) ||
          food.price.toString().includes(query)
      );
    }

    // فیلتر دسته‌بندی
    if (categoryFilter !== "all") {
      result = result.filter((food) => food.category_id === categoryFilter);
    }

    // فیلتر وضعیت
    if (availabilityFilter !== "all") {
      const isAvailable = availabilityFilter === "available";
      result = result.filter((food) => food.is_available === isAvailable);
    }

    // مرتب‌سازی
    result.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    setFilteredFoods(result);
  }, [foods, searchQuery, categoryFilter, availabilityFilter, sortConfig]);

  const fetchFoods = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("foods")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFoods(data || []);
    } catch (error) {
      console.error("Error fetching foods:", error);
      toast.error("خطا در دریافت لیست غذاها");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await supabase
        .from("categories")
        .select("id, name_fa")
        .order("name_fa");

      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.foodId) return;

    try {
      const { error } = await supabase
        .from("foods")
        .delete()
        .eq("id", deleteDialog.foodId);

      if (error) throw error;

      toast.success("غذا با موفقیت حذف شد");
      fetchFoods();
    } catch (error) {
      console.error("Error deleting food:", error);
      toast.error("خطا در حذف غذا");
    } finally {
      setDeleteDialog({ open: false, foodId: null });
    }
  };

  const toggleAvailability = async (foodId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("foods")
        .update({ is_available: !currentStatus })
        .eq("id", foodId);

      if (error) throw error;

      toast.success(`غذا ${!currentStatus ? 'فعال' : 'غیرفعال'} شد`);
      fetchFoods();
    } catch (error) {
      console.error("Error updating availability:", error);
      toast.error("خطا در بروزرسانی وضعیت");
    }
  };

  const handleSort = (key: keyof Food) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name_fa : "بدون دسته‌بندی";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR');
  };

  const getSortIcon = (key: keyof Food) => {
    if (sortConfig.key !== key) return <ChevronDown className="h-4 w-4 opacity-50" />;
    return sortConfig.direction === 'asc' ? 
      <ChevronUp className="h-4 w-4" /> : 
      <ChevronDown className="h-4 w-4" />;
  };

  if (loading && foods.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto mb-4" size={32} />
          <p className="text-gray-600">در حال بارگذاری غذاها...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* هدر */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">مدیریت غذاها</h1>
          <p className="text-gray-600 mt-2">
            مشاهده و مدیریت تمام غذاهای منو
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={fetchFoods}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw size={16} />
            بروزرسانی
          </Button>
          <Link href="/admin/add-food">
            <Button className="flex items-center gap-2">
              <Plus size={16} />
              افزودن غذا جدید
            </Button>
          </Link>
        </div>
      </div>

      {/* فیلترها و جستجو */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* جستجو */}
            <div className="md:col-span-4">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="جستجو در غذاها (نام، توضیحات، قیمت...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>

            {/* فیلتر دسته‌بندی */}
            <div className="md:col-span-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <Filter size={16} className="ml-2" />
                    {categoryFilter === "all" ? "همه دسته‌بندی‌ها" : 
                     getCategoryName(categoryFilter)}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>دسته‌بندی</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setCategoryFilter("all")}>
                    همه دسته‌بندی‌ها
                  </DropdownMenuItem>
                  {categories.map((category) => (
                    <DropdownMenuItem
                      key={category.id}
                      onClick={() => setCategoryFilter(category.id)}
                    >
                      {category.name_fa}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* فیلتر وضعیت */}
            <div className="md:col-span-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <Filter size={16} className="ml-2" />
                    {availabilityFilter === "all" ? "همه وضعیت‌ها" : 
                     availabilityFilter === "available" ? "فقط فعال" : "فقط غیرفعال"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>وضعیت</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setAvailabilityFilter("all")}>
                    همه وضعیت‌ها
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setAvailabilityFilter("available")}>
                    فقط فعال
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setAvailabilityFilter("unavailable")}>
                    فقط غیرفعال
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* ریست فیلترها */}
            <div className="md:col-span-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSearchQuery("");
                  setCategoryFilter("all");
                  setAvailabilityFilter("all");
                }}
              >
                حذف فیلترها
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* آمار */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="flex justify-center shadow-lg border-0">
          <CardContent className="">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">کل غذاها</p>
                <p className="text-2xl font-bold">{foods.length}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="">
                  <img src="/foods.png" className="w-10 h-10" alt="" />
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="flex justify-center shadow-lg border-0">
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">غذاهای فعال</p>
                <p className="text-2xl font-bold text-green-600">
                  {foods.filter(f => f.is_available).length}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">
                  <img src="/check.png" className="w-10 h-10" alt="" />
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">غذاهای غیرفعال</p>
                <p className="text-2xl font-bold text-red-600">
                  {foods.filter(f => !f.is_available).length}
                </p>
              </div>
              <div className="p-2 bg-red-100 rounded-lg">
                <span className="text-2xl">❌</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">نتایج جستجو</p>
                <p className="text-2xl font-bold">{filteredFoods.length}</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Search className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* جدول غذاها */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>لیست غذاها</CardTitle>
              <CardDescription>
                نمایش {filteredFoods.length} غذا از {foods.length} غذا
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredFoods.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-4xl">🍕</span>
              <p className="text-lg text-gray-500 mt-4">هیچ غذایی یافت نشد</p>
              <p className="text-gray-400 mt-2">
                {searchQuery ? "سعی کنید عبارت جستجوی دیگری وارد کنید" : 
                 "اولین غذا را اضافه کنید"}
              </p>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">
                      <Button
                        variant="ghost"
                        className="p-0 h-auto font-medium"
                        onClick={() => handleSort('image_url')}
                      >
                        تصویر
                        {getSortIcon('image_url')}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        className="p-0 h-auto font-medium"
                        onClick={() => handleSort('name_fa')}
                      >
                        نام غذا
                        {getSortIcon('name_fa')}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        className="p-0 h-auto font-medium"
                        onClick={() => handleSort('price')}
                      >
                        قیمت
                        {getSortIcon('price')}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        className="p-0 h-auto font-medium"
                        onClick={() => handleSort('category_id')}
                      >
                        دسته‌بندی
                        {getSortIcon('category_id')}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        className="p-0 h-auto font-medium"
                        onClick={() => handleSort('is_available')}
                      >
                        وضعیت
                        {getSortIcon('is_available')}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        className="p-0 h-auto font-medium"
                        onClick={() => handleSort('created_at')}
                      >
                        تاریخ ایجاد
                        {getSortIcon('created_at')}
                      </Button>
                    </TableHead>
                    <TableHead className="text-center">عملیات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFoods.map((food) => (
                    <TableRow key={food.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="w-16 h-16 rounded-lg overflow-hidden border">
                          <img
                            src={food.image_url}
                            alt={food.name_fa}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = 'https://via.placeholder.com/100x100?text=No+Image';
                            }}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-semibold">{food.name_fa}</p>
                          <p className="text-sm text-gray-500">{food.name_en}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-green-600">
                          {food.price.toLocaleString()} افغانی
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getCategoryName(food.category_id)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant={food.is_available ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleAvailability(food.id, food.is_available)}
                          className={food.is_available ? 
                            "bg-green-100 text-green-800 hover:bg-green-200" : 
                            "text-gray-600 hover:bg-gray-100"}
                        >
                          {food.is_available ? "فعال" : "غیرفعال"}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          {formatDate(food.created_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedFood(food);
                              setPreviewDialog(true);
                            }}
                            title="پیش‌نمایش"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          <Link href={`/admin/edit/${food.id}`}>
                            <Button size="sm" variant="outline" title="ویرایش">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="ghost">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>عملیات سریع</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => toggleAvailability(food.id, food.is_available)}
                              >
                                {food.is_available ? "غیرفعال کردن" : "فعال کردن"}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setDeleteDialog({
                                    open: true,
                                    foodId: food.id,
                                  });
                                }}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 ml-2" />
                                حذف غذا
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* پاگینیشن */}
          {filteredFoods.length > 0 && (
            <div className="flex items-center justify-between border-t pt-4 mt-4">
              <div className="text-sm text-gray-500">
                نمایش 1 تا {filteredFoods.length} از {filteredFoods.length} نتیجه
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* دیالوگ حذف */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, foodId: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>آیا مطمئن هستید؟</AlertDialogTitle>
            <AlertDialogDescription>
              این عمل غیرقابل بازگشت است. غذا به طور کامل از سیستم حذف خواهد شد.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>لغو</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              بله، حذف شود
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* دیالوگ پیش‌نمایش */}
      <AlertDialog open={previewDialog} onOpenChange={setPreviewDialog}>
        <AlertDialogContent className="max-w-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>پیش‌نمایش غذا</AlertDialogTitle>
          </AlertDialogHeader>
          {selectedFood && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3">
                  <img
                    src={selectedFood.image_url}
                    alt={selectedFood.name_fa}
                    className="w-full h-64 object-cover rounded-lg border"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/400x300?text=No+Image';
                    }}
                  />
                </div>
                <div className="md:w-2/3 space-y-4">
                  <div>
                    <h3 className="text-xl font-bold">{selectedFood.name_fa}</h3>
                    <p className="text-gray-600">{selectedFood.name_en}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">قیمت</p>
                      <p className="text-lg font-bold text-green-600">
                        {selectedFood.price.toLocaleString()} افغانی
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">وضعیت</p>
                      <Badge variant={selectedFood.is_available ? "default" : "secondary"}>
                        {selectedFood.is_available ? "فعال" : "غیرفعال"}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">دسته‌بندی</p>
                      <p>{getCategoryName(selectedFood.category_id)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">تاریخ ایجاد</p>
                      <p>{formatDate(selectedFood.created_at)}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">توضیحات</p>
                    <p className="mt-1">{selectedFood.description_fa || "بدون توضیحات"}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>بستن</AlertDialogCancel>
            {selectedFood && (
              <Link href={`/admin/edit/${selectedFood.id}`}>
                <AlertDialogAction>ویرایش غذا</AlertDialogAction>
              </Link>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}