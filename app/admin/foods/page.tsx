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

// ✅ تایپ‌ها از پوشه مرکزی
import type { Food, Category, Branch } from "@/types";
import type { SortConfig } from "@/types";

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50' y='55' font-size='12' text-anchor='middle' fill='%239ca3af'%3ENo Image%3C/text%3E%3C/svg%3E";

const theme = {
  page: "min-h-screen w-full bg-[#fff8ed] text-slate-900 dark:bg-slate-950 dark:text-white transition-colors duration-500",
  headerCard:
    "relative overflow-hidden rounded-[1.75rem] bg-gradient-to-l from-emerald-600 via-emerald-600 to-teal-600 p-6 sm:p-8 md:p-10 shadow-xl shadow-emerald-600/20 dark:from-emerald-600 dark:via-emerald-700 dark:to-teal-700 dark:shadow-black/30",
  statCard:
    "rounded-[1.25rem] border border-black/[0.06] bg-white/90 backdrop-blur-sm shadow-sm dark:border-white/10 dark:bg-slate-900/70",
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
      result = result.filter(
        (f) =>
          f.category_id === categoryFilter || f.category === categoryFilter,
      );
    }

    if (branchFilter !== "all") {
      result = result.filter((f) => f.branch_id === branchFilter);
    }

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
      const { data } = await supabase
        .from("categories")
        .select("id, name, name_ar, slug, order_number")
        .order("order_number", { ascending: true });
      setCategories((data as Category[]) || []);
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
      toast.error("خطا در بروزرسانی");
    }
  };

  const handleSort = (key: keyof Food) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const getCategoryName = (categoryId: string) => {
    const cat = categories.find(
      (c) => c.id === categoryId || c.slug === categoryId,
    );
    return cat
      ? (cat as any).name_fa || cat.name || cat.slug
      : "بدون دسته‌بندی";
  };

  const getBranchName = (branchId: string) => {
    const b = branches.find((x) => x.id === branchId);
    return b ? b.name_fa : "همه شعب";
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("fa-IR");

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
    setBranchFilter("all");
    setAvailabilityFilter("all");
  };

  // آمار بر اساس فیلتر شعبه
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
          <div className="relative mx-auto mb-6 w-20 h-20">
            <div className="absolute inset-0 rounded-full border-4 border-emerald-200/50 dark:border-white/10" />
            <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
          </div>
          <p className="font-semibold text-lg">در حال بارگذاری...</p>
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
              <div className="p-3.5 bg-white/20 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg">
                <UtensilsCrossed className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white">
                  مدیریت غذاها
                </h1>
                <p className="text-white/90 mt-1 text-sm">
                  فیلتر بر اساس شعبه و دسته‌بندی
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={fetchFoods}
                variant="secondary"
                className="bg-white/20 text-white border border-white/30 hover:bg-white/30 backdrop-blur-md"
              >
                <RefreshCw size={18} /> بروزرسانی
              </Button>
              <Link href="/admin/add-food">
                <Button className="bg-white text-emerald-700 hover:bg-white/95 font-bold shadow-lg">
                  <Plus size={18} /> افزودن غذا
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* آمار */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="کل غذاها"
            value={statsByBranch.total}
            icon={<UtensilsCrossed className="w-6 h-6 text-blue-500" />}
            iconBg="bg-blue-500/10"
          />
          <StatCard
            title="فعال"
            value={statsByBranch.active}
            icon={<CheckCircle2 className="w-6 h-6 text-emerald-500" />}
            iconBg="bg-emerald-500/10"
            valueColor="text-emerald-600 dark:text-emerald-300"
          />
          <StatCard
            title="غیرفعال"
            value={statsByBranch.inactive}
            icon={<XCircle className="w-6 h-6 text-red-400" />}
            iconBg="bg-red-500/10"
            valueColor="text-red-500"
          />
          <StatCard
            title="نتایج فیلتر"
            value={filteredFoods.length}
            icon={<TrendingUp className="w-6 h-6 text-purple-500" />}
            iconBg="bg-purple-500/10"
          />
        </div>

        {/* فیلترها - جدید با شعبه */}
        <Card className={theme.filterCard}>
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
              {/* جستجو */}
              <div className="md:col-span-3">
                <div className="relative">
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 h-5 w-5" />
                  <Input
                    placeholder="جستجو نام، قیمت..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-12 bg-white dark:bg-slate-900 border-black/10 dark:border-white/10"
                  />
                </div>
              </div>

              {/* فیلتر دسته‌بندی */}
              <div className="md:col-span-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between bg-white dark:bg-slate-900 border-black/10 dark:border-white/10"
                    >
                      <span className="flex items-center truncate">
                        <Filter size={14} className="ml-2 text-emerald-500" />
                        {categoryFilter === "all"
                          ? "همه دسته‌ها"
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
                    {categories.map((cat) => (
                      <DropdownMenuItem
                        key={cat.id}
                        onClick={() => setCategoryFilter(cat.id)}
                      >
                        {(cat as any).name_fa || cat.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* فیلتر شعبه - جدید */}
              <div className="md:col-span-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between bg-white dark:bg-slate-900 border-black/10 dark:border-white/10"
                    >
                      <span className="flex items-center truncate">
                        <Store size={14} className="ml-2 text-blue-500" />
                        {branchFilter === "all"
                          ? "همه شعبه‌ها"
                          : getBranchName(branchFilter)}
                      </span>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="start">
                    <DropdownMenuLabel>شعبه</DropdownMenuLabel>
                    <DropdownMenuSeparator />
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

              {/* فیلتر وضعیت */}
              <div className="md:col-span-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between bg-white dark:bg-slate-900 border-black/10 dark:border-white/10"
                    >
                      <span className="truncate text-sm">
                        {availabilityFilter === "all"
                          ? "همه وضعیت‌ها"
                          : availabilityFilter === "available"
                            ? "فقط فعال"
                            : "غیرفعال"}
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
                      غیرفعال
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="md:col-span-1">
                <Button
                  variant="outline"
                  className="w-full border-black/10 dark:border-white/10"
                  onClick={resetFilters}
                >
                  حذف
                </Button>
              </div>
            </div>

            {(branchFilter !== "all" || categoryFilter !== "all") && (
              <div className="mt-4 flex flex-wrap gap-2">
                {branchFilter !== "all" && (
                  <Badge
                    variant="outline"
                    className="bg-blue-50 dark:bg-blue-950 border-blue-200 text-blue-700"
                  >
                    <Store size={12} className="ml-1" /> شعبه:{" "}
                    {getBranchName(branchFilter)}{" "}
                    <button
                      onClick={() => setBranchFilter("all")}
                      className="mr-2 text-blue-500"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {categoryFilter !== "all" && (
                  <Badge
                    variant="outline"
                    className="bg-emerald-50 dark:bg-emerald-950 border-emerald-200 text-emerald-700"
                  >
                    دسته: {getCategoryName(categoryFilter)}{" "}
                    <button
                      onClick={() => setCategoryFilter("all")}
                      className="mr-2"
                    >
                      ×
                    </button>
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* جدول */}
        <Card className={theme.tableCard}>
          <CardHeader className="border-b border-black/5 dark:border-white/10 p-4 sm:p-6">
            <CardTitle>لیست غذاها ({filteredFoods.length})</CardTitle>
            <CardDescription>
              فیلتر:{" "}
              {branchFilter !== "all"
                ? `شعبه ${getBranchName(branchFilter)}`
                : "همه شعبه‌ها"}{" "}
              •{" "}
              {categoryFilter !== "all"
                ? `دسته ${getCategoryName(categoryFilter)}`
                : "همه دسته‌ها"}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {filteredFoods.length === 0 ? (
              <div className="text-center py-16">
                <UtensilsCrossed className="mx-auto w-10 h-10 opacity-20 mb-3" />
                <p>غذایی با این فیلتر یافت نشد</p>
              </div>
            ) : (
              <>
                {/* موبایل */}
                <div className="grid grid-cols-1 gap-3 p-4 md:hidden">
                  {filteredFoods.map((food) => (
                    <div
                      key={food.id}
                      className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-slate-900 p-3 flex gap-3"
                    >
                      <img
                        src={food.image_url || PLACEHOLDER_IMAGE}
                        alt={food.name_fa}
                        className="h-20 w-20 rounded-xl object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold truncate">{food.name_fa}</p>
                        <p className="text-xs opacity-60 truncate">
                          {food.name_en} • {getBranchName(food.branch_id)}
                        </p>
                        <p className="text-sm font-bold text-emerald-600 mt-1">
                          {food.price.toLocaleString()} ؋
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* دسکتاپ */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/80 dark:bg-white/[0.03] border-b border-black/5 dark:border-white/10">
                        <TableHead>تصویر</TableHead>
                        <TableHead>
                          <SortButton
                            label="نام"
                            onClick={() => handleSort("name_fa" as any)}
                            icon={getSortIcon("name_fa" as any)}
                          />
                        </TableHead>
                        <TableHead>شعبه</TableHead>
                        <TableHead>دسته</TableHead>
                        <TableHead>وضعیت</TableHead>
                        <TableHead>قیمت</TableHead>
                        <TableHead className="text-center">عملیات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredFoods.map((food) => (
                        <TableRow
                          key={food.id}
                          className="border-b border-black/5 dark:border-white/10"
                        >
                          <TableCell>
                            <img
                              src={food.image_url || PLACEHOLDER_IMAGE}
                              alt=""
                              className="h-12 w-12 rounded-xl object-cover"
                            />
                          </TableCell>
                          <TableCell>
                            <p className="font-bold">{food.name_fa}</p>
                            <p className="text-xs opacity-60">{food.name_en}</p>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="bg-blue-50 dark:bg-blue-950/30"
                            >
                              <Store size={10} className="ml-1" />
                              {getBranchName(food.branch_id)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {getCategoryName(food.category_id)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <button
                              onClick={() =>
                                toggleAvailability(food.id, !!food.is_available)
                              }
                              className={`px-3 py-1 rounded-full text-xs font-bold border ${food.is_available ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" : "bg-slate-100 text-slate-600"}`}
                            >
                              {food.is_available ? "فعال" : "غیرفعال"}
                            </button>
                          </TableCell>
                          <TableCell className="font-bold text-emerald-600">
                            {food.price.toLocaleString()} ؋
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-center gap-1">
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8"
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
                                  className="h-8 w-8"
                                >
                                  <Edit size={14} />
                                </Button>
                              </Link>
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8 text-red-500"
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

        {/* دیالوگ حذف و پیش‌نمایش - همون قبلی */}
        <AlertDialog
          open={deleteDialog.open}
          onOpenChange={(open) => setDeleteDialog({ open, foodId: null })}
        >
          <AlertDialogContent dir="rtl" className="bg-white dark:bg-slate-900">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-center">
                حذف شود؟
              </AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>لغو</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600">
                حذف
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={previewDialog} onOpenChange={setPreviewDialog}>
          <AlertDialogContent
            dir="rtl"
            className="max-w-2xl bg-white dark:bg-slate-900"
          >
            <AlertDialogHeader>
              <AlertDialogTitle>{selectedFood?.name_fa}</AlertDialogTitle>
            </AlertDialogHeader>
            <div className="space-y-3">
              <img
                src={selectedFood?.image_url || PLACEHOLDER_IMAGE}
                alt=""
                className="w-full h-60 object-cover rounded-xl"
              />
              <p className="text-sm">{selectedFood?.description_fa}</p>
              <p className="font-bold text-emerald-600">
                {selectedFood?.price.toLocaleString()} ؋ -{" "}
                {selectedFood?.branch_id
                  ? getBranchName(selectedFood.branch_id)
                  : ""}
              </p>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>بستن</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, iconBg, valueColor = "" }: any) {
  return (
    <Card className="rounded-[1.25rem] border border-black/[0.06] bg-white/90 dark:border-white/10 dark:bg-slate-900/70">
      <CardContent className="p-4 sm:p-5 flex items-center justify-between">
        <div>
          <p className="text-sm opacity-60">{title}</p>
          <p className={`text-2xl font-black mt-1 ${valueColor}`}>{value}</p>
        </div>
        <div
          className={`p-3 rounded-2xl border border-black/5 dark:border-white/10 ${iconBg}`}
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
      className="p-0 h-auto font-semibold flex items-center gap-1"
      onClick={onClick}
    >
      {label} {icon}
    </Button>
  );
}
