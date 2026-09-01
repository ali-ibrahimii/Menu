"use client";

import { useEffect, useState, useMemo } from "react";
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
  Store,
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
import type { Food, Category, Branch } from "@/types";
import type { SortConfig } from "@/types/foods";

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50' y='55' font-size='12' text-anchor='middle' fill='%239ca3af'%3ENo Image%3C/text%3E%3C/svg%3E";

const theme = {
  page: "min-h-screen w-full bg-[#fff8ed] text-slate-900 dark:bg-slate-950 dark:text-white",
  headerCard:
    "relative overflow-hidden rounded-[1.25rem] sm:rounded-[1.75rem] bg-gradient-to-l from-emerald-600 to-teal-600 p-5 sm:p-8 md:p-10 shadow-xl shadow-emerald-600/20",
  statCard:
    "rounded-[1.25rem] border border-black/[0.06] bg-white/90 backdrop-blur-sm shadow-sm dark:border-white/10 dark:bg-slate-900/70",
  filterCard:
    "rounded-[1.25rem] border border-black/[0.06] bg-white/90 dark:border-white/10 dark:bg-slate-900/70",
  tableCard:
    "rounded-[1.25rem] border border-black/[0.06] bg-white/90 dark:border-white/10 dark:bg-slate-900/70 overflow-hidden",
  mutedText: "text-slate-500 dark:text-slate-400",
};

export default function AdminFoodsPage() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [filteredFoods, setFilteredFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [branchFilter, setBranchFilter] = useState<string>("all");
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "created_at" as keyof Food,
    direction: "desc",
  });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    foodId: string | null;
  }>({ open: false, foodId: null });
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [previewDialog, setPreviewDialog] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  useEffect(() => {
    fetchFoods();
    fetchCategories();
    fetchBranches();
  }, []);

  useEffect(() => {
    let result = [...foods];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (f) =>
          String(f.name_fa ?? "")
            .toLowerCase()
            .includes(q) ||
          String(f.name_en ?? "")
            .toLowerCase()
            .includes(q) ||
          String(f.name_ar ?? "")
            .toLowerCase()
            .includes(q) ||
          String(f.description_fa ?? "")
            .toLowerCase()
            .includes(q) ||
          String(f.price ?? "")
            .toString()
            .includes(q),
      );
    }
    if (categoryFilter !== "all") {
      result = result.filter((f) => {
        const catId = (f as any).category_id;
        const catSlug = (f as any).category;
        return catId === categoryFilter || catSlug === categoryFilter;
      });
    }
    if (branchFilter !== "all")
      result = result.filter((f) => f.branch_id === branchFilter);
    if (availabilityFilter !== "all") {
      const isAv = availabilityFilter === "available";
      result = result.filter((f) => Boolean(f.is_available) === isAv);
    }
    result.sort((a, b) => {
      const av = (a as any)[sortConfig.key];
      const bv = (b as any)[sortConfig.key];
      if (av == null) return 1;
      if (bv == null) return -1;
      if (av < bv) return sortConfig.direction === "asc" ? -1 : 1;
      if (av > bv) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
    setFilteredFoods(result);
  }, [
    foods,
    searchQuery,
    categoryFilter,
    branchFilter,
    availabilityFilter,
    sortConfig,
  ]);

  const fetchFoods = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("foods")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setFoods((data as Food[]) || []);
    } catch {
      toast.error("خطا در دریافت لیست غذاها");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      // جدول categories ستون name داره نه name_fa
      const { data } = await supabase
        .from("categories")
        .select("id, name, name_ar, slug, order_number")
        .order("order_number", { ascending: true });
      setCategories((data as any) || []);
    } catch {}
  };

  const fetchBranches = async () => {
    try {
      const { data } = await supabase
        .from("branches")
        .select("id, name_fa, slug")
        .order("name_fa");
      setBranches((data as Branch[]) || []);
    } catch {}
  };

  const handleDelete = async () => {
    if (!deleteDialog.foodId) return;
    try {
      const { error } = await supabase
        .from("foods")
        .delete()
        .eq("id", deleteDialog.foodId);
      if (error) throw error;
      toast.success("غذا حذف شد");
      fetchFoods();
    } catch {
      toast.error("خطا در حذف");
    } finally {
      setDeleteDialog({ open: false, foodId: null });
    }
  };

  const toggleAvailability = async (foodId: string, current: boolean) => {
    try {
      const { error } = await supabase
        .from("foods")
        .update({ is_available: !current })
        .eq("id", foodId);
      if (error) throw error;
      toast.success(`غذا ${!current ? "فعال" : "غیرفعال"} شد`);
      fetchFoods();
    } catch {
      toast.error("خطا");
    }
  };

  const handleSort = (key: keyof Food) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // فیکس نمایش دسته - هم id هم slug هم name رو چک میکنه
  const getCategoryName = (categoryId: string) => {
    if (!categoryId) return "بدون دسته‌بندی";
    const cat = categories.find(
      (c) => c.id === categoryId || (c as any).slug === categoryId,
    );
    if (cat)
      return (cat as any).name || (cat as any).name_fa || (cat as any).slug;
    // اگر تو جدول نبود، خود مقدار رو نشون بده (مثل "Afghan foods")
    return categoryId;
  };

  const getBranchName = (branchId: string) => {
    if (!branchId) return "همه شعب";
    const b = branches.find((x) => x.id === branchId);
    return b ? b.name_fa : branchId.slice(0, 8);
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("fa-IR-u-nu-latn");

  const getSortIcon = (key: keyof Food) => {
    if (sortConfig.key !== key)
      return <ChevronDown className="h-3.5 w-3.5 opacity-40" />;
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="h-3.5 w-3.5 text-emerald-600" />
    ) : (
      <ChevronDown className="h-3.5 w-3.5 text-emerald-600" />
    );
  };

  const resetFilters = () => {
    setSearchQuery("");
    setCategoryFilter("all");
    setBranchFilter("all");
    setAvailabilityFilter("all");
  };

  const statsByBranch = useMemo(() => {
    const inBranch =
      branchFilter === "all"
        ? foods
        : foods.filter((f) => f.branch_id === branchFilter);
    return {
      total: inBranch.length,
      active: inBranch.filter((f) => f.is_available).length,
      inactive: inBranch.filter((f) => !f.is_available).length,
    };
  }, [foods, branchFilter]);

  if (loading && foods.length === 0) {
    return (
      <div
        className={`flex items-center justify-center min-h-screen ${theme.page}`}
      >
        <div className="text-center">
          <div className="relative mx-auto mb-6 w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-emerald-200/50 dark:border-white/10" />
            <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
          </div>
          <p className="font-semibold">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className={`${theme.page} pb-20 lg:pb-0`}>
      <div className="mx-auto w-full max-w-7xl p-3 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
        <div className={theme.headerCard}>
          <div className="relative flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2.5 sm:p-3.5 bg-white/20 backdrop-blur-md rounded-xl sm:rounded-2xl border border-white/20">
                <UtensilsCrossed className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-3xl md:text-4xl font-black text-white">
                  مدیریت غذاها
                </h1>
                <p className="text-white/90 mt-1 text-xs sm:text-sm">
                  فیلتر بر اساس شعبه و دسته‌بندی
                </p>
              </div>
            </div>
            <div className="flex gap-2 sm:gap-3">
              <Button
                onClick={fetchFoods}
                variant="secondary"
                size="sm"
                className="flex-1 sm:flex-none bg-white/20 text-white border border-white/30 hover:bg-white/30 rounded-full h-10"
              >
                <RefreshCw size={16} /> بروزرسانی
              </Button>
              <Link href="/admin/add-food" className="flex-1 sm:flex-none">
                <Button
                  size="sm"
                  className="w-full bg-white text-emerald-700 font-bold rounded-full h-10"
                >
                  <Plus size={16} /> افزودن
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatCard
            title="کل غذاها"
            value={statsByBranch.total}
            icon={<UtensilsCrossed className="w-5 h-5 text-blue-500" />}
            iconBg="bg-blue-500/10"
          />
          <StatCard
            title="فعال"
            value={statsByBranch.active}
            icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />}
            iconBg="bg-emerald-500/10"
            valueColor="text-emerald-600 dark:text-emerald-300"
          />
          <StatCard
            title="غیرفعال"
            value={statsByBranch.inactive}
            icon={<XCircle className="w-5 h-5 text-red-400" />}
            iconBg="bg-red-500/10"
            valueColor="text-red-500"
          />
          <StatCard
            title="نتایج"
            value={filteredFoods.length}
            icon={<TrendingUp className="w-5 h-5 text-purple-500" />}
            iconBg="bg-purple-500/10"
          />
        </div>

        <Card className={theme.filterCard}>
          <CardContent className="p-3 sm:p-6">
            <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-12">
              <div className="md:col-span-3">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 h-4 w-4" />
                  <Input
                    placeholder="جستجو..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10 h-11 rounded-xl bg-white dark:bg-slate-900 border-black/10 dark:border-white/10 text-sm"
                  />
                </div>
              </div>
              <div className="md:col-span-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between h-11 rounded-xl bg-white dark:bg-slate-900 border-black/10 dark:border-white/10 text-sm"
                    >
                      <span className="flex items-center truncate">
                        <Filter size={14} className="ml-2 text-emerald-500" />
                        {categoryFilter === "all"
                          ? "همه دسته‌ها"
                          : getCategoryName(categoryFilter)}
                      </span>
                      <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-56 max-h-[50vh] overflow-y-auto"
                    align="start"
                  >
                    <DropdownMenuLabel>دسته‌بندی</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setCategoryFilter("all")}>
                      همه دسته‌ها
                    </DropdownMenuItem>
                    {categories.map((cat) => (
                      <DropdownMenuItem
                        key={cat.id}
                        onClick={() => setCategoryFilter(cat.id)}
                      >
                        {(cat as any).name || cat.slug}
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
                      className="w-full justify-between h-11 rounded-xl bg-white dark:bg-slate-900 border-black/10 dark:border-white/10 text-sm"
                    >
                      <span className="flex items-center truncate">
                        <Store size={14} className="ml-2 text-blue-500" />
                        {branchFilter === "all"
                          ? "همه شعبه‌ها"
                          : getBranchName(branchFilter)}
                      </span>
                      <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="start">
                    <DropdownMenuItem onClick={() => setBranchFilter("all")}>
                      همه شعبه‌ها
                    </DropdownMenuItem>
                    {branches.map((b) => (
                      <DropdownMenuItem
                        key={b.id}
                        onClick={() => setBranchFilter(b.id)}
                      >
                        {b.name_fa}
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
                      className="w-full justify-between h-11 rounded-xl bg-white dark:bg-slate-900 border-black/10 dark:border-white/10 text-sm"
                    >
                      <span className="truncate">
                        {availabilityFilter === "all"
                          ? "همه وضعیت‌ها"
                          : availabilityFilter === "available"
                            ? "فقط فعال"
                            : "غیرفعال"}
                      </span>
                      <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
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
                      غیرفعال
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="md:col-span-1">
                <Button
                  variant="outline"
                  className="w-full h-11 rounded-xl border-black/10 dark:border-white/10"
                  onClick={resetFilters}
                >
                  حذف
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={theme.tableCard}>
          <CardHeader className="p-4 sm:p-6 border-b border-black/5 dark:border-white/10">
            <CardTitle className="text-base sm:text-xl">
              لیست غذاها ({filteredFoods.length})
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              فیلتر:{" "}
              {branchFilter !== "all"
                ? `شعبه ${getBranchName(branchFilter)}`
                : "همه شعب"}{" "}
              •{" "}
              {categoryFilter !== "all"
                ? `دسته ${getCategoryName(categoryFilter)}`
                : "همه دسته‌ها"}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {filteredFoods.length === 0 ? (
              <div className="text-center py-12 px-4">
                <UtensilsCrossed className="mx-auto w-8 h-8 opacity-20 mb-3" />
                <p className="text-sm">غذایی با این فیلتر یافت نشد</p>
              </div>
            ) : (
              <>
                {/* موبایل - با دکمه ویرایش */}
                <div className="grid grid-cols-1 gap-2.5 p-3 md:hidden">
                  {filteredFoods.map((food) => (
                    <div
                      key={food.id}
                      className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-slate-900 p-3 flex gap-3"
                    >
                      <img
                        src={food.image_url || PLACEHOLDER_IMAGE}
                        alt={food.name_fa}
                        className="h-16 w-16 rounded-xl object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <p className="font-bold truncate text-sm">
                          {food.name_fa}
                        </p>
                        <p className="text-[11px] opacity-60 truncate">
                          {getCategoryName(
                            (food as any).category_id || (food as any).category,
                          )}{" "}
                          • {getBranchName(food.branch_id)}
                        </p>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-black text-emerald-600 dark:text-emerald-300">
                            {food.price.toLocaleString()} ؋
                          </span>
                          <div className="flex items-center gap-1.5">
                            <Link href={`/admin/edit/${food.id}`}>
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-7 w-7 rounded-full"
                              >
                                <Edit size={12} />
                              </Button>
                            </Link>
                            <button
                              onClick={() =>
                                toggleAvailability(food.id, !!food.is_available)
                              }
                              className={`rounded-full px-2.5 py-1 text-[10px] font-bold border ${food.is_available ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-slate-100 text-slate-500"}`}
                            >
                              {food.is_available ? "فعال" : "غیرفعال"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* لپ‌تاپ - دسته نمایش داده میشه */}
                <div className="hidden md:block overflow-x-auto">
                  <Table dir="rtl">
                    <TableHeader>
                      <TableRow
                        dir="ltr"
                        className="bg-slate-50/80 dark:bg-white/[0.03] border-b border-black/5 dark:border-white/10"
                      >
                        <TableHead>تصویر</TableHead>
                        <TableHead>
                          <SortButton
                            label="نام"
                            onClick={() => handleSort("name_fa" as any)}
                            icon={getSortIcon("name_fa" as any)}
                          />
                        </TableHead>
                        <TableHead>شعبه</TableHead>
                        <TableHead>دسته‌بندی</TableHead>
                        <TableHead>وضعیت</TableHead>
                        <TableHead>قیمت</TableHead>
                        <TableHead className="text-center">عملیات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredFoods.map((food) => (
                        <TableRow
                          dir="ltr"
                          key={food.id}
                          className="border-b border-black/5 dark:border-white/10"
                        >
                          <TableCell>
                            <img
                              src={food.image_url || PLACEHOLDER_IMAGE}
                              alt=""
                              className="h-12 w-12 rounded-xl object-cover border border-black/5 dark:border-white/10"
                            />
                          </TableCell>
                          <TableCell>
                            <p className="font-bold text-sm">{food.name_fa}</p>
                            <p className="text-xs opacity-60">{food.name_en}</p>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="rounded-full bg-blue-50 dark:bg-blue-950/30 text-xs"
                            >
                              <Store size={10} className="ml-1" />
                              {getBranchName(food.branch_id)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 text-xs"
                            >
                              {getCategoryName(
                                (food as any).category_id ||
                                  (food as any).category,
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <button
                              onClick={() =>
                                toggleAvailability(food.id, !!food.is_available)
                              }
                              className={`px-3 py-1 rounded-full text-xs font-bold border ${food.is_available ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-300" : "bg-slate-100 text-slate-600 dark:bg-white/5"}`}
                            >
                              {food.is_available ? "فعال" : "غیرفعال"}
                            </button>
                          </TableCell>
                          <TableCell className="font-bold text-emerald-600 text-sm">
                            {food.price.toLocaleString()} تومان
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-center gap-1">
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8 rounded-full"
                                onClick={() => {
                                  setSelectedFood(food);
                                  setPreviewDialog(true);
                                }}
                              >
                                <Eye size={14} />
                              </Button>
                              <Link href={`/admin/edit/${food.id}`}>
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="h-8 w-8 rounded-full"
                                >
                                  <Edit size={14} />
                                </Button>
                              </Link>
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8 rounded-full text-red-500"
                                onClick={() =>
                                  setDeleteDialog({
                                    open: true,
                                    foodId: food.id,
                                  })
                                }
                              >
                                <Trash2 size={14} />
                              </Button>
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

        <AlertDialog
          open={deleteDialog.open}
          onOpenChange={(open) => setDeleteDialog({ open, foodId: null })}
        >
          <AlertDialogContent
            dir="rtl"
            className="bg-white dark:bg-slate-900 rounded-[1.5rem] max-w-[90vw] sm:max-w-md"
          >
            <CardHeader className="text-center pb-2">
              <CardTitle>حذف شود؟</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1 rounded-full"
                onClick={() => setDeleteDialog({ open: false, foodId: null })}
              >
                لغو
              </Button>
              <Button
                className="flex-1 rounded-full bg-red-600 hover:bg-red-700"
                onClick={handleDelete}
              >
                حذف
              </Button>
            </CardContent>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={previewDialog} onOpenChange={setPreviewDialog}>
          <AlertDialogContent
            dir="rtl"
            className="max-w-[95vw] sm:max-w-2xl bg-white dark:bg-slate-900 rounded-[1.5rem] p-0 overflow-hidden"
          >
            <div className="p-4 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <img
                src={selectedFood?.image_url || PLACEHOLDER_IMAGE}
                alt=""
                className="w-full h-56 sm:h-72 object-cover rounded-2xl"
              />
              <div>
                <p className="font-black text-lg">{selectedFood?.name_fa}</p>
                <p className="text-xs opacity-60">{selectedFood?.name_en}</p>
              </div>
              <p className="text-sm leading-6 bg-slate-50 dark:bg-white/5 p-3 rounded-xl">
                {selectedFood?.description_fa || "بدون توضیح"}
              </p>
              <div className="flex gap-2 flex-wrap">
                <Badge variant="outline" className="rounded-full">
                  <Store size={12} className="ml-1" />
                  {selectedFood?.branch_id
                    ? getBranchName(selectedFood.branch_id)
                    : ""}
                </Badge>
                <Badge
                  variant="outline"
                  className="rounded-full bg-emerald-50 text-emerald-700"
                >
                  {selectedFood
                    ? getCategoryName(
                        (selectedFood as any).category_id ||
                          (selectedFood as any).category,
                      )
                    : ""}
                </Badge>
                <Badge
                  className={`rounded-full ${selectedFood?.is_available ? "bg-emerald-500" : "bg-slate-400"}`}
                >
                  {selectedFood?.is_available ? "فعال" : "غیرفعال"}
                </Badge>
              </div>
              <p className="font-black text-emerald-600 text-lg">
                {selectedFood?.price.toLocaleString()} تومان
              </p>
            </div>
            <div className="p-4 border-t flex gap-2">
              <Button
                variant="outline"
                className="flex-1 rounded-full"
                onClick={() => setPreviewDialog(false)}
              >
                بستن
              </Button>
              {selectedFood && (
                <Link
                  href={`/admin/edit/${selectedFood.id}`}
                  className="flex-1"
                >
                  <Button className="w-full rounded-full bg-emerald-600 text-white">
                    ویرایش
                  </Button>
                </Link>
              )}
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, iconBg, valueColor = "" }: any) {
  return (
    <Card className="rounded-[1.25rem] border border-black/[0.06] bg-white/90 dark:border-white/10 dark:bg-slate-900/70">
      <CardContent className="p-3 sm:p-4 flex items-center justify-between">
        <div>
          <p className="text-[11px] sm:text-sm opacity-60">{title}</p>
          <p className={`text-lg sm:text-2xl font-black mt-1 ${valueColor}`}>
            {value}
          </p>
        </div>
        <div
          className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-black/5 dark:border-white/10 ${iconBg}`}
        >
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}

function SortButton({ label, onClick, icon }: any) {
  return (
    <Button
      variant="ghost"
      className="p-0 h-auto font-semibold flex items-center gap-1 text-sm"
      onClick={onClick}
    >
      {label} {icon}
    </Button>
  );
}
