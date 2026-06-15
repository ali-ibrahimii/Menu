// app/admin/foods/page.tsx

"use client";

import { useEffect, useState } from "react";
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
  UtensilsCrossed,
  CheckCircle2,
  XCircle,
  TrendingUp,
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
  direction: "asc" | "desc";
};

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50' y='55' font-size='12' text-anchor='middle' fill='%239ca3af'%3ENo Image%3C/text%3E%3C/svg%3E";

export default function AdminFoodsPage() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [filteredFoods, setFilteredFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "created_at",
    direction: "desc",
  });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    foodId: string | null;
  }>({
    open: false,
    foodId: null,
  });
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [previewDialog, setPreviewDialog] = useState(false);
  const [categories, setCategories] = useState<
    { id: string; name_fa: string }[]
  >([]);

  // دریافت غذاها و دسته‌بندی‌ها
  useEffect(() => {
    fetchFoods();
    fetchCategories();
  }, []);

  // فیلتر کردن و مرتب‌سازی غذاها
  useEffect(() => {
    let result = [...foods];

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

    if (categoryFilter !== "all") {
      result = result.filter((food) => food.category_id === categoryFilter);
    }

    if (availabilityFilter !== "all") {
      const isAvailable = availabilityFilter === "available";
      result = result.filter((food) => food.is_available === isAvailable);
    }

    result.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
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

      toast.success(`غذا ${!currentStatus ? "فعال" : "غیرفعال"} شد`);
      fetchFoods();
    } catch (error) {
      console.error("Error updating availability:", error);
      toast.error("خطا در بروزرسانی وضعیت");
    }
  };

  const handleSort = (key: keyof Food) => {
    setSortConfig((prev) => ({
      key,
      direction:
        prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.name_fa : "بدون دسته‌بندی";
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("fa-IR");

  const getSortIcon = (key: keyof Food) => {
    if (sortConfig.key !== key)
      return <ChevronDown className="h-3.5 w-3.5 opacity-40" />;
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="h-3.5 w-3.5 text-primary" />
    ) : (
      <ChevronDown className="h-3.5 w-3.5 text-primary" />
    );
  };

  const resetFilters = () => {
    setSearchQuery("");
    setCategoryFilter("all");
    setAvailabilityFilter("all");
  };

  if (loading && foods.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="relative mx-auto mb-6 w-20 h-20">
            <div className="absolute inset-0 rounded-full border-4 border-orange-300/30" />
            <div className="absolute inset-0 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
          </div>
          <p className="text-gray-300 font-semibold text-lg">در حال بارگذاری غذاها...</p>
          <p className="text-gray-500 text-sm mt-2">لطفا صبر کنید</p>
        </div>
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900"
    >
      <div className="container mx-auto p-4 md:p-8 space-y-6">
        {/* هدر */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-orange-500 via-orange-600 to-red-600 p-8 md:p-12 shadow-2xl shadow-orange-500/30">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -right-16 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-white/10 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2" />
          
          <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg">
                <UtensilsCrossed className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-white drop-shadow-lg">
                  مدیریت غذاها
                </h1>
                <p className="text-white/90 mt-2 text-sm md:text-base font-medium">
                  مشاهده و مدیریت تمام غذاهای منو
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={fetchFoods}
                variant="secondary"
                className="flex items-center gap-2 bg-white/20 text-white border border-white/30 hover:bg-white/30 backdrop-blur-md shadow-lg transition-all duration-300 hover:shadow-xl"
              >
                <RefreshCw size={18} />
                بروزرسانی
              </Button>
              <Link href="/admin/add-food">
                <Button className="flex items-center gap-2 bg-white text-orange-600 hover:bg-white/95 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold">
                  <Plus size={18} />
                  افزودن غذا جدید
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* آمار */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatCard
            title="کل غذاها"
            value={foods.length}
            icon={<UtensilsCrossed className="w-7 h-7 text-blue-400" />}
            gradient="from-blue-600/20 to-blue-500/10"
            borderColor="border-blue-500/30"
            iconBg="bg-blue-500/20"
          />
          <StatCard
            title="غذاهای فعال"
            value={foods.filter((f) => f.is_available).length}
            icon={<CheckCircle2 className="w-7 h-7 text-green-400" />}
            gradient="from-green-600/20 to-green-500/10"
            borderColor="border-green-500/30"
            iconBg="bg-green-500/20"
            valueColor="text-green-300"
          />
          <StatCard
            title="غذاهای غیرفعال"
            value={foods.filter((f) => !f.is_available).length}
            icon={<XCircle className="w-7 h-7 text-red-400" />}
            gradient="from-red-600/20 to-red-500/10"
            borderColor="border-red-500/30"
            iconBg="bg-red-500/20"
            valueColor="text-red-300"
          />
          <StatCard
            title="نتایج جستجو"
            value={filteredFoods.length}
            icon={<TrendingUp className="w-7 h-7 text-purple-400" />}
            gradient="from-purple-600/20 to-purple-500/10"
            borderColor="border-purple-500/30"
            iconBg="bg-purple-500/20"
            valueColor="text-purple-300"
          />
        </div>

        {/* فیلترها و جستجو */}
        <Card className="border border-slate-700 shadow-xl bg-gradient-to-br from-slate-800 to-slate-800/50 backdrop-blur-sm">
          <CardContent className="pt-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-4">
                <div className="relative">
                  <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-orange-400 h-5 w-5" />
                  <Input
                    placeholder="جستجو در غذاها (نام، توضیحات، قیمت...)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-12 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus-visible:ring-orange-500 focus-visible:border-orange-500 transition-all"
                  />
                </div>
              </div>

              <div className="md:col-span-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between bg-slate-700/50 border-slate-600 text-white hover:bg-slate-700 hover:border-orange-500 transition-all"
                    >
                      <span className="flex items-center truncate">
                        <Filter size={16} className="ml-2 shrink-0 text-orange-400" />
                        {categoryFilter === "all"
                          ? "همه دسته‌بندی‌ها"
                          : getCategoryName(categoryFilter)}
                      </span>
                      <ChevronDown className="h-4 w-4 opacity-70 shrink-0" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-slate-800 border-slate-700" align="start">
                    <DropdownMenuLabel className="text-gray-300">دسته‌بندی</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-slate-700" />
                    <DropdownMenuItem 
                      onClick={() => setCategoryFilter("all")}
                      className="text-gray-200 hover:bg-slate-700 hover:text-orange-400 cursor-pointer transition-colors"
                    >
                      همه دسته‌بندی‌ها
                    </DropdownMenuItem>
                    {categories.map((category) => (
                      <DropdownMenuItem
                        key={category.id}
                        onClick={() => setCategoryFilter(category.id)}
                        className="text-gray-200 hover:bg-slate-700 hover:text-orange-400 cursor-pointer transition-colors"
                      >
                        {category.name_fa}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="md:col-span-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between bg-slate-700/50 border-slate-600 text-white hover:bg-slate-700 hover:border-orange-500 transition-all"
                    >
                      <span className="flex items-center truncate">
                        <Filter size={16} className="ml-2 shrink-0 text-orange-400" />
                        {availabilityFilter === "all"
                          ? "همه وضعیت‌ها"
                          : availabilityFilter === "available"
                          ? "فقط فعال"
                          : "فقط غیرفعال"}
                      </span>
                      <ChevronDown className="h-4 w-4 opacity-70 shrink-0" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-slate-800 border-slate-700" align="start">
                    <DropdownMenuLabel className="text-gray-300">وضعیت</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-slate-700" />
                    <DropdownMenuItem
                      onClick={() => setAvailabilityFilter("all")}
                      className="text-gray-200 hover:bg-slate-700 hover:text-orange-400 cursor-pointer transition-colors"
                    >
                      همه وضعیت‌ها
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setAvailabilityFilter("available")}
                      className="text-gray-200 hover:bg-slate-700 hover:text-orange-400 cursor-pointer transition-colors"
                    >
                      فقط فعال
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setAvailabilityFilter("unavailable")}
                      className="text-gray-200 hover:bg-slate-700 hover:text-orange-400 cursor-pointer transition-colors"
                    >
                      فقط غیرفعال
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="md:col-span-2">
                <Button
                  variant="outline"
                  className="w-full text-gray-300 border-slate-600 hover:text-orange-400 hover:border-orange-500 hover:bg-orange-500/10 transition-all"
                  onClick={resetFilters}
                >
                  حذف فیلترها
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* جدول غذاها */}
        <Card className="border border-slate-700 shadow-xl bg-gradient-to-br from-slate-800 to-slate-800/50 backdrop-blur-sm">
          <CardHeader className="border-b border-slate-700">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl text-white">لیست غذاها</CardTitle>
                <CardDescription className="text-gray-400 mt-1">
                  نمایش {filteredFoods.length} غذا از {foods.length} غذا
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {filteredFoods.length === 0 ? (
              <div className="text-center py-20">
                <div className="mx-auto w-24 h-24 rounded-full bg-slate-700/50 border border-slate-600 flex items-center justify-center mb-6">
                  <UtensilsCrossed className="w-12 h-12 text-slate-500" />
                </div>
                <p className="text-xl font-semibold text-gray-300">
                  هیچ غذایی یافت نشد
                </p>
                <p className="text-gray-500 mt-2 text-sm">
                  {searchQuery
                    ? "سعی کنید عبارت جستجوی دیگری وارد کنید"
                    : "اولین غذا را اضافه کنید"}
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-700 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-slate-800 to-slate-700/50 border-b border-slate-700 hover:bg-gradient-to-r hover:from-slate-800 hover:to-slate-700/50">
                      <TableHead className="w-20">
                        <SortButton
                          label="تصویر"
                          onClick={() => handleSort("image_url")}
                          icon={getSortIcon("image_url")}
                        />
                      </TableHead>
                      <TableHead>
                        <SortButton
                          label="نام غذا"
                          onClick={() => handleSort("name_fa")}
                          icon={getSortIcon("name_fa")}
                        />
                      </TableHead>
                      <TableHead>
                        <SortButton
                          label="قیمت"
                          onClick={() => handleSort("price")}
                          icon={getSortIcon("price")}
                        />
                      </TableHead>
                      <TableHead>
                        <SortButton
                          label="دسته‌بندی"
                          onClick={() => handleSort("category_id")}
                          icon={getSortIcon("category_id")}
                        />
                      </TableHead>
                      <TableHead>
                        <SortButton
                          label="وضعیت"
                          onClick={() => handleSort("is_available")}
                          icon={getSortIcon("is_available")}
                        />
                      </TableHead>
                      <TableHead>
                        <SortButton
                          label="تاریخ ایجاد"
                          onClick={() => handleSort("created_at")}
                          icon={getSortIcon("created_at")}
                        />
                      </TableHead>
                      <TableHead className="text-center">عملیات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFoods.map((food) => (
                      <TableRow
                        key={food.id}
                        className="border-b border-slate-700 hover:bg-slate-700/30 transition-colors duration-200"
                      >
                        <TableCell>
                          <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-600 shadow-lg hover:shadow-orange-500/20 transition-shadow">
                            <img
                              src={food.image_url || PLACEHOLDER_IMAGE}
                              alt={food.name_fa}
                              className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                              onError={(e) => {
                                e.currentTarget.src = PLACEHOLDER_IMAGE;
                              }}
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-bold text-white">
                              {food.name_fa}
                            </p>
                            <p className="text-sm text-gray-400 mt-1">
                              {food.name_en}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-bold text-green-400 whitespace-nowrap text-lg">
                            {food.price.toLocaleString()}
                            <span className="text-xs font-normal text-gray-500 mr-2">
                              افغانی
                            </span>
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="bg-slate-700/50 border-slate-600 text-gray-200 font-medium"
                          >
                            {getCategoryName(food.category_id)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <button
                            onClick={() =>
                              toggleAvailability(food.id, food.is_available)
                            }
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 ${
                              food.is_available
                                ? "bg-green-500/20 text-green-300 border border-green-500/50 hover:bg-green-500/30"
                                : "bg-gray-500/20 text-gray-300 border border-gray-500/50 hover:bg-gray-500/30"
                            }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full animate-pulse ${
                                food.is_available
                                  ? "bg-green-400"
                                  : "bg-gray-400"
                              }`}
                            />
                            {food.is_available ? "فعال" : "غیرفعال"}
                          </button>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-400 whitespace-nowrap">
                            {formatDate(food.created_at)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-9 w-9 border-slate-600 text-gray-400 hover:text-blue-400 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all"
                              onClick={() => {
                                setSelectedFood(food);
                                setPreviewDialog(true);
                              }}
                              title="پیش‌نمایش"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>

                            <Link href={`/admin/edit/${food.id}`}>
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-9 w-9 border-slate-600 text-gray-400 hover:text-orange-400 hover:border-orange-500/50 hover:bg-orange-500/10 transition-all"
                                title="ویرایش"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-9 w-9 text-gray-400 hover:text-orange-400 hover:bg-slate-700/50"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                                <DropdownMenuLabel className="text-gray-300">
                                  عملیات سریع
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-slate-700" />
                                <DropdownMenuItem
                                  onClick={() =>
                                    toggleAvailability(
                                      food.id,
                                      food.is_available
                                    )
                                  }
                                  className="text-gray-200 hover:bg-slate-700 hover:text-orange-400 cursor-pointer transition-colors"
                                >
                                  {food.is_available
                                    ? "غیرفعال کردن"
                                    : "فعال کردن"}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    setDeleteDialog({
                                      open: true,
                                      foodId: food.id,
                                    })
                                  }
                                  className="text-red-400 hover:bg-red-500/20 focus:text-red-400 cursor-pointer transition-colors"
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

            {filteredFoods.length > 0 && (
              <div className="flex items-center justify-between border-t border-slate-700 pt-6 mt-6">
                <div className="text-sm text-gray-400">
                  نمایش 1 تا {filteredFoods.length} از {filteredFoods.length}{" "}
                  نتیجه
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* دیالوگ حذف */}
        <AlertDialog
          open={deleteDialog.open}
          onOpenChange={(open) => setDeleteDialog({ open, foodId: null })}
        >
          <AlertDialogContent dir="rtl" className="bg-slate-800 border border-slate-700 shadow-2xl">
            <AlertDialogHeader>
              <div className="mx-auto w-16 h-16 rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center mb-4">
                <Trash2 className="w-8 h-8 text-red-400" />
              </div>
              <AlertDialogTitle className="text-center text-white text-xl">
                آیا مطمئن هستید؟
              </AlertDialogTitle>
              <AlertDialogDescription className="text-center text-gray-300">
                این عمل غیرقابل بازگشت است. غذا به طور کامل از سیستم حذف خواهد
                شد.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-slate-600 text-gray-300 hover:bg-slate-700 hover:text-white transition-all">لغو</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white transition-all"
              >
                بله، حذف شود
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* دیالوگ پیش‌نمایش */}
        <AlertDialog open={previewDialog} onOpenChange={setPreviewDialog}>
          <AlertDialogContent className="max-w-3xl bg-slate-800 border border-slate-700 shadow-2xl" dir="rtl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white text-2xl">پیش‌نمایش غذا</AlertDialogTitle>
            </AlertDialogHeader>
            {selectedFood && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="md:w-1/3">
                    <img
                      src={selectedFood.image_url || PLACEHOLDER_IMAGE}
                      alt={selectedFood.name_fa}
                      className="w-full h-72 object-cover rounded-2xl border border-slate-600 shadow-lg"
                      onError={(e) => {
                        e.currentTarget.src = PLACEHOLDER_IMAGE;
                      }}
                    />
                  </div>
                  <div className="md:w-2/3 space-y-6">
                    <div>
                      <h3 className="text-2xl font-bold text-white">
                        {selectedFood.name_fa}
                      </h3>
                      <p className="text-gray-400 mt-2">{selectedFood.name_en}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-700/50 border border-slate-600 rounded-xl p-4">
                        <p className="text-xs text-gray-400 font-medium">قیمت</p>
                        <p className="text-2xl font-bold text-green-400 mt-2">
                          {selectedFood.price.toLocaleString()} افغانی
                        </p>
                      </div>
                      <div className="bg-slate-700/50 border border-slate-600 rounded-xl p-4">
                        <p className="text-xs text-gray-400 font-medium">وضعیت</p>
                        <Badge
                          variant={
                            selectedFood.is_available ? "default" : "secondary"
                          }
                          className={`mt-3 font-semibold ${
                            selectedFood.is_available
                              ? "bg-green-500/20 border-green-500/50 text-green-300"
                              : "bg-gray-500/20 border-gray-500/50 text-gray-300"
                          }`}
                        >
                          {selectedFood.is_available ? "فعال" : "غیرفعال"}
                        </Badge>
                      </div>
                      <div className="bg-slate-700/50 border border-slate-600 rounded-xl p-4">
                        <p className="text-xs text-gray-400 font-medium">دسته‌بندی</p>
                        <p className="font-semibold text-white mt-2">
                          {getCategoryName(selectedFood.category_id)}
                        </p>
                      </div>
                      <div className="bg-slate-700/50 border border-slate-600 rounded-xl p-4">
                        <p className="text-xs text-gray-400 font-medium">تاریخ ایجاد</p>
                        <p className="font-semibold text-white mt-2">
                          {formatDate(selectedFood.created_at)}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-400 mb-3 font-medium">توضیحات</p>
                      <p className="text-gray-200 leading-relaxed bg-slate-700/30 border border-slate-600 rounded-lg p-4">
                        {selectedFood.description_fa || "بدون توضیحات"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <AlertDialogFooter className="pt-6 border-t border-slate-700">
              <AlertDialogCancel className="border-slate-600 text-gray-300 hover:bg-slate-700 hover:text-white transition-all">بستن</AlertDialogCancel>
              {selectedFood && (
                <Link href={`/admin/edit/${selectedFood.id}`}>
                  <AlertDialogAction className="bg-orange-600 hover:bg-orange-700 text-white transition-all">ویرایش غذا</AlertDialogAction>
                </Link>
              )}
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

/* ---------- کامپوننت‌های کمکی ---------- */

function StatCard({
  title,
  value,
  icon,
  gradient,
  iconBg,
  borderColor,
  valueColor = "text-gray-100",
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  gradient: string;
  iconBg: string;
  borderColor: string;
  valueColor?: string;
}) {
  return (
    <Card
      className={`border ${borderColor} shadow-lg bg-gradient-to-br ${gradient} hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 backdrop-blur-sm`}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400 font-medium">{title}</p>
            <p className={`text-3xl md:text-4xl font-black mt-2 ${valueColor}`}>
              {value}
            </p>
          </div>
          <div className={`p-4 ${iconBg} rounded-2xl border border-orange-500/20`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function SortButton({
  label,
  onClick,
  icon,
}: {
  label: string;
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <Button
      variant="ghost"
      className="p-0 h-auto font-semibold text-gray-300 hover:text-orange-400 hover:bg-transparent flex items-center gap-2 transition-colors"
      onClick={onClick}
    >
      {label}
      {icon}
    </Button>
  );
}
