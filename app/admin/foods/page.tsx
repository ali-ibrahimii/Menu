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

// تم اصلی پروژه - روشن / تاریک
const theme = {
  page: "min-h-screen w-full bg-[#fff8ed] text-slate-900 dark:bg-slate-950 dark:text-white transition-colors duration-500",
  headerCard:
    "relative overflow-hidden rounded-[1.75rem] bg-gradient-to-l from-emerald-600 via-emerald-600 to-teal-600 p-6 sm:p-8 md:p-10 shadow-xl shadow-emerald-600/20 dark:from-emerald-600 dark:via-emerald-700 dark:to-teal-700 dark:shadow-black/30",
  statCard:
    "rounded-[1.25rem] border border-black/[0.06] bg-white/90 backdrop-blur-sm shadow-sm transition-all hover:shadow-md dark:border-white/10 dark:bg-slate-900/70 dark:hover:bg-slate-900",
  filterCard:
    "rounded-[1.25rem] border border-black/[0.06] bg-white/90 backdrop-blur-sm shadow-sm dark:border-white/10 dark:bg-slate-900/70",
  tableCard:
    "rounded-[1.25rem] border border-black/[0.06] bg-white/90 backdrop-blur-sm shadow-sm dark:border-white/10 dark:bg-slate-900/70 overflow-hidden",
  mutedText: "text-slate-500 dark:text-slate-400",
};

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

  useEffect(() => {
    fetchFoods();
    fetchCategories();
  }, []);

  useEffect(() => {
    let result = [...foods];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (food) =>
          food.name_fa?.toLowerCase().includes(query) ||
          food.name_en?.toLowerCase().includes(query) ||
          food.description_fa?.toLowerCase().includes(query) ||
          food.price.toString().includes(query),
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
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
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
      <ChevronUp className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
    ) : (
      <ChevronDown className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
    );
  };

  const resetFilters = () => {
    setSearchQuery("");
    setCategoryFilter("all");
    setAvailabilityFilter("all");
  };

  if (loading && foods.length === 0) {
    return (
      <div
        className={`flex items-center justify-center min-h-screen ${theme.page}`}
      >
        <div className="text-center">
          <div className="relative mx-auto mb-6 w-20 h-20">
            <div className="absolute inset-0 rounded-full border-4 border-emerald-200/50 dark:border-white/10" />
            <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
          </div>
          <p className="font-semibold text-lg">در حال بارگذاری غذاها...</p>
          <p className={`text-sm mt-2 ${theme.mutedText}`}>لطفا صبر کنید</p>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className={theme.page}>
      <div className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8 space-y-6">
        {/* هدر */}
        <div className={theme.headerCard}>
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -right-16 w-72 h-72 bg-white/10 rounded-full blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-white/20 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg sm:p-4">
                <UtensilsCrossed className="w-7 h-7 text-white sm:w-8 sm:h-8" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white drop-shadow">
                  مدیریت غذاها
                </h1>
                <p className="text-white/90 mt-1.5 text-sm sm:text-base">
                  مشاهده و مدیریت تمام غذاهای منو
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                onClick={fetchFoods}
                variant="secondary"
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/20 text-white border border-white/30 hover:bg-white/30 backdrop-blur-md"
              >
                <RefreshCw size={18} />
                بروزرسانی
              </Button>
              <Link href="/admin/add-food" className="w-full sm:w-auto">
                <Button className="w-full flex items-center justify-center gap-2 bg-white text-emerald-700 hover:bg-white/95 font-bold shadow-lg">
                  <Plus size={18} />
                  افزودن غذا جدید
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* آمار */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-5">
          <StatCard
            title="کل غذاها"
            value={foods.length}
            icon={<UtensilsCrossed className="w-6 h-6 text-blue-500" />}
            iconBg="bg-blue-500/10 dark:bg-blue-400/10"
          />
          <StatCard
            title="غذاهای فعال"
            value={foods.filter((f) => f.is_available).length}
            icon={<CheckCircle2 className="w-6 h-6 text-emerald-500" />}
            iconBg="bg-emerald-500/10 dark:bg-emerald-400/10"
            valueColor="text-emerald-600 dark:text-emerald-300"
          />
          <StatCard
            title="غذاهای غیرفعال"
            value={foods.filter((f) => !f.is_available).length}
            icon={<XCircle className="w-6 h-6 text-red-400" />}
            iconBg="bg-red-500/10 dark:bg-red-400/10"
            valueColor="text-red-500 dark:text-red-300"
          />
          <StatCard
            title="نتایج جستجو"
            value={filteredFoods.length}
            icon={<TrendingUp className="w-6 h-6 text-purple-500" />}
            iconBg="bg-purple-500/10 dark:bg-purple-400/10"
            valueColor="text-purple-600 dark:text-purple-300"
          />
        </div>

        {/* فیلترها */}
        <Card className={theme.filterCard}>
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
              <div className="md:col-span-5">
                <div className="relative">
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 h-5 w-5" />
                  <Input
                    placeholder="جستجو در غذاها..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-12 bg-white dark:bg-slate-900 border-black/10 dark:border-white/10"
                  />
                </div>
              </div>

              <div className="md:col-span-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between bg-white dark:bg-slate-900 border-black/10 dark:border-white/10"
                    >
                      <span className="flex items-center truncate">
                        <Filter
                          size={16}
                          className="ml-2 shrink-0 text-emerald-500"
                        />
                        {categoryFilter === "all"
                          ? "همه دسته‌بندی‌ها"
                          : getCategoryName(categoryFilter)}
                      </span>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="start">
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

              <div className="md:col-span-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between bg-white dark:bg-slate-900 border-black/10 dark:border-white/10"
                    >
                      <span className="truncate">
                        {availabilityFilter === "all"
                          ? "همه وضعیت‌ها"
                          : availabilityFilter === "available"
                            ? "فقط فعال"
                            : "فقط غیرفعال"}
                      </span>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="start">
                    <DropdownMenuItem
                      onClick={() => setAvailabilityFilter("all")}
                    >
                      همه
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setAvailabilityFilter("available")}
                    >
                      فقط فعال
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setAvailabilityFilter("unavailable")}
                    >
                      فقط غیرفعال
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="md:col-span-2">
                <Button
                  variant="outline"
                  className="w-full border-black/10 dark:border-white/10"
                  onClick={resetFilters}
                >
                  حذف فیلترها
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* جدول - دسکتاپ + کارت - موبایل */}
        <Card className={theme.tableCard}>
          <CardHeader className="border-b border-black/5 dark:border-white/10 p-4 sm:p-6">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl">لیست غذاها</CardTitle>
                <CardDescription>
                  نمایش {filteredFoods.length} از {foods.length}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {filteredFoods.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="mx-auto w-20 h-20 rounded-full bg-slate-100 dark:bg-white/5 border border-black/5 dark:border-white/10 flex items-center justify-center mb-4">
                  <UtensilsCrossed className="w-10 h-10 text-slate-400" />
                </div>
                <p className="text-lg font-semibold">هیچ غذایی یافت نشد</p>
                <p className={`text-sm mt-1 ${theme.mutedText}`}>
                  {searchQuery
                    ? "عبارت جستجو رو عوض کن"
                    : "اولین غذا را اضافه کنید"}
                </p>
              </div>
            ) : (
              <>
                {/* MOBILE CARDS */}
                <div className="grid grid-cols-1 gap-3 p-4 sm:p-4 md:hidden">
                  {filteredFoods.map((food) => (
                    <div
                      key={food.id}
                      className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-slate-900 p-3 flex gap-3"
                    >
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-black/10 dark:border-white/10">
                        <img
                          src={food.image_url || PLACEHOLDER_IMAGE}
                          alt={food.name_fa}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = PLACEHOLDER_IMAGE;
                          }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold truncate">{food.name_fa}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {food.name_en} • {getCategoryName(food.category_id)}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-300">
                            {food.price.toLocaleString()} افغانی
                          </span>
                          <button
                            onClick={() =>
                              toggleAvailability(food.id, food.is_available)
                            }
                            className={`rounded-full px-2.5 py-1 text-[10px] font-bold border ${
                              food.is_available
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-300"
                                : "bg-slate-100 text-slate-500 border-black/10 dark:bg-white/5 dark:text-slate-400"
                            }`}
                          >
                            {food.is_available ? "فعال" : "غیرفعال"}
                          </button>
                        </div>
                        <div className="mt-2 flex gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 flex-1"
                            onClick={() => {
                              setSelectedFood(food);
                              setPreviewDialog(true);
                            }}
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Link
                            href={`/admin/edit/${food.id}`}
                            className="flex-1"
                          >
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 w-full"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-red-500"
                            onClick={() =>
                              setDeleteDialog({ open: true, foodId: food.id })
                            }
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* DESKTOP TABLE */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/80 dark:bg-white/[0.03] border-b border-black/5 dark:border-white/10 hover:bg-slate-50/80">
                        <TableHead className="w-20">تصویر</TableHead>
                        <TableHead>
                          <SortButton
                            label="نام"
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
                        <TableHead>دسته‌بندی</TableHead>
                        <TableHead>
                          <SortButton
                            label="وضعیت"
                            onClick={() => handleSort("is_available")}
                            icon={getSortIcon("is_available")}
                          />
                        </TableHead>
                        <TableHead>تاریخ</TableHead>
                        <TableHead className="text-center">عملیات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredFoods.map((food) => (
                        <TableRow
                          key={food.id}
                          className="border-b border-black/5 dark:border-white/10 hover:bg-black/[0.02] dark:hover:bg-white/[0.03]"
                        >
                          <TableCell>
                            <div className="w-14 h-14 rounded-xl overflow-hidden border border-black/10 dark:border-white/10">
                              <img
                                src={food.image_url || PLACEHOLDER_IMAGE}
                                alt={food.name_fa}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = PLACEHOLDER_IMAGE;
                                }}
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="font-bold">{food.name_fa}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {food.name_en}
                            </p>
                          </TableCell>
                          <TableCell className="font-bold text-emerald-600 dark:text-emerald-300 whitespace-nowrap">
                            {food.price.toLocaleString()}{" "}
                            <span className="text-[10px] font-normal text-slate-500">
                              افغانی
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="bg-slate-50 dark:bg-white/5 border-black/10 dark:border-white/10"
                            >
                              {getCategoryName(food.category_id)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <button
                              onClick={() =>
                                toggleAvailability(food.id, food.is_available)
                              }
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                                food.is_available
                                  ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-300"
                                  : "bg-slate-100 text-slate-600 border-black/10 dark:bg-white/5 dark:text-slate-400"
                              }`}
                            >
                              <span
                                className={`w-2 h-2 rounded-full ${food.is_available ? "bg-emerald-500" : "bg-slate-400"}`}
                              />
                              {food.is_available ? "فعال" : "غیرفعال"}
                            </button>
                          </TableCell>
                          <TableCell className="text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            {formatDate(food.created_at)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-1.5">
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8"
                                onClick={() => {
                                  setSelectedFood(food);
                                  setPreviewDialog(true);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Link href={`/admin/edit/${food.id}`}>
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="h-8 w-8"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>عملیات</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() =>
                                      toggleAvailability(
                                        food.id,
                                        food.is_available,
                                      )
                                    }
                                  >
                                    {food.is_available
                                      ? "غیرفعال کردن"
                                      : "فعال کردن"}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-red-500"
                                    onClick={() =>
                                      setDeleteDialog({
                                        open: true,
                                        foodId: food.id,
                                      })
                                    }
                                  >
                                    <Trash2 className="h-4 w-4 ml-2" />
                                    حذف
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
              </>
            )}
          </CardContent>
        </Card>

        {/* Delete Dialog */}
        <AlertDialog
          open={deleteDialog.open}
          onOpenChange={(open) => setDeleteDialog({ open, foodId: null })}
        >
          <AlertDialogContent
            dir="rtl"
            className="bg-white dark:bg-slate-900 border-black/10 dark:border-white/10"
          >
            <AlertDialogHeader>
              <div className="mx-auto w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-3">
                <Trash2 className="w-7 h-7 text-red-500" />
              </div>
              <AlertDialogTitle className="text-center">
                آیا مطمئن هستید؟
              </AlertDialogTitle>
              <AlertDialogDescription className="text-center">
                این عمل غیرقابل بازگشت است.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
              <AlertDialogCancel className="w-full sm:w-auto">
                لغو
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
              >
                بله، حذف شود
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Preview Dialog */}
        <AlertDialog open={previewDialog} onOpenChange={setPreviewDialog}>
          <AlertDialogContent
            className="max-w-[95vw] sm:max-w-3xl bg-white dark:bg-slate-900 border-black/10 dark:border-white/10 p-4 sm:p-6"
            dir="rtl"
          >
            <AlertDialogHeader>
              <AlertDialogTitle>پیش‌نمایش غذا</AlertDialogTitle>
            </AlertDialogHeader>
            {selectedFood && (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="sm:w-1/3">
                    <img
                      src={selectedFood.image_url || PLACEHOLDER_IMAGE}
                      alt={selectedFood.name_fa}
                      className="w-full h-64 sm:h-72 object-cover rounded-2xl border border-black/10 dark:border-white/10"
                      onError={(e) => {
                        e.currentTarget.src = PLACEHOLDER_IMAGE;
                      }}
                    />
                  </div>
                  <div className="sm:w-2/3 space-y-4">
                    <div>
                      <h3 className="text-xl font-bold">
                        {selectedFood.name_fa}
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">
                        {selectedFood.name_en}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-black/10 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] p-3">
                        <p className="text-xs text-slate-500">قیمت</p>
                        <p className="text-lg font-bold text-emerald-600 dark:text-emerald-300 mt-1">
                          {selectedFood.price.toLocaleString()} افغانی
                        </p>
                      </div>
                      <div className="rounded-xl border border-black/10 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] p-3">
                        <p className="text-xs text-slate-500">وضعیت</p>
                        <Badge
                          className={`mt-2 ${selectedFood.is_available ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" : ""}`}
                        >
                          {selectedFood.is_available ? "فعال" : "غیرفعال"}
                        </Badge>
                      </div>
                      <div className="rounded-xl border border-black/10 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] p-3">
                        <p className="text-xs text-slate-500">دسته‌بندی</p>
                        <p className="font-semibold mt-1">
                          {getCategoryName(selectedFood.category_id)}
                        </p>
                      </div>
                      <div className="rounded-xl border border-black/10 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] p-3">
                        <p className="text-xs text-slate-500">تاریخ ایجاد</p>
                        <p className="font-semibold mt-1">
                          {formatDate(selectedFood.created_at)}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">توضیحات</p>
                      <p className="text-sm leading-relaxed rounded-xl border border-black/10 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] p-3">
                        {selectedFood.description_fa || "بدون توضیحات"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <AlertDialogFooter className="flex-col sm:flex-row gap-2 border-t border-black/5 dark:border-white/10 pt-4">
              <AlertDialogCancel className="w-full sm:w-auto">
                بستن
              </AlertDialogCancel>
              {selectedFood && (
                <Link
                  href={`/admin/edit/${selectedFood.id}`}
                  className="w-full sm:w-auto"
                >
                  <AlertDialogAction className="w-full bg-emerald-600 hover:bg-emerald-700">
                    ویرایش
                  </AlertDialogAction>
                </Link>
              )}
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  iconBg,
  valueColor = "",
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  iconBg: string;
  valueColor?: string;
}) {
  return (
    <Card className={`${theme.statCard}`}>
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {title}
            </p>
            <p
              className={`text-2xl sm:text-3xl font-black mt-1.5 ${valueColor}`}
            >
              {value}
            </p>
          </div>
          <div
            className={`p-3 rounded-2xl border border-black/5 dark:border-white/10 ${iconBg}`}
          >
            {icon}
          </div>
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
      className="p-0 h-auto font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-600 hover:bg-transparent flex items-center gap-1.5"
      onClick={onClick}
    >
      {label}
      {icon}
    </Button>
  );
}
