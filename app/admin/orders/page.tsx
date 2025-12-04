// app/admin/orders/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Receipt,
  User,
  Hash,
  Notebook,
  Search,
  Calendar,
  Filter,
  ChevronDown,
  Eye,
  Printer,
  Download,
  MoreVertical,
} from "lucide-react";
import { toast } from "sonner";
import { format, parseISO, isToday, isYesterday, subDays } from "date-fns";
import { faIR } from "date-fns/locale";

interface OrderItem {
  id: string;
  name_fa: string;
  name_ar: string;
  name_en: string;
  price: number;
  quantity: number;
  image_url: string;
}

interface Order {
  id: string;
  created_at: string;
  customer_name: string;
  table_number: string;
  deviceId: string;
  notes: string;
  total_price: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  items: OrderItem[];
}

type DateFilter = "today" | "yesterday" | "week" | "month" | "all";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("today");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // دریافت سفارشات از دیتابیس
  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
      applyFilters(data || [], searchQuery, statusFilter, dateFilter);
      toast.success("سفارشات با موفقیت بارگذاری شدند");
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("خطا در دریافت سفارشات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // فیلتر کردن سفارشات بر اساس تاریخ
  const filterByDate = (orders: Order[], filterType: DateFilter): Order[] => {
    const now = new Date();
    
    switch (filterType) {
      case "today":
        return orders.filter(order => isToday(parseISO(order.created_at)));
      case "yesterday":
        return orders.filter(order => isYesterday(parseISO(order.created_at)));
      case "week":
        const weekAgo = subDays(now, 7);
        return orders.filter(order => 
          parseISO(order.created_at) >= weekAgo
        );
      case "month":
        const monthAgo = subDays(now, 30);
        return orders.filter(order => 
          parseISO(order.created_at) >= monthAgo
        );
      default:
        return orders;
    }
  };

  // اعمال فیلترها
  const applyFilters = (
    ordersList: Order[],
    search: string,
    status: string,
    date: DateFilter
  ) => {
    let filtered = ordersList;

    // فیلتر بر اساس تاریخ
    filtered = filterByDate(filtered, date);

    // فیلتر بر اساس وضعیت
    if (status !== "all") {
      filtered = filtered.filter(order => order.status === status);
    }

    // جستجو
    if (search) {
      filtered = filtered.filter(order =>
        order.customer_name.toLowerCase().includes(search.toLowerCase()) ||
        order.id.toLowerCase().includes(search.toLowerCase()) ||
        order.table_number?.toLowerCase().includes(search.toLowerCase()) ||
        order.notes?.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredOrders(filtered);
  };

  useEffect(() => {
    applyFilters(orders, searchQuery, statusFilter, dateFilter);
  }, [searchQuery, statusFilter, dateFilter, orders]);

  // آپدیت وضعیت سفارش
  const updateOrderStatus = async (
    orderId: string,
    newStatus: Order["status"]
  ) => {
    setUpdatingOrder(orderId);
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) throw error;

      // آپدیت local state
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );

      toast.success(`سفارش با موفقیت ${getStatusLabel(newStatus)} شد`);
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("خطا در آپدیت سفارش");
    } finally {
      setUpdatingOrder(null);
    }
  };

  // نمایش وضعیت سفارش
  const getStatusBadge = (status: Order["status"]) => {
    const statusConfig = {
      pending: {
        color: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
        icon: Clock,
        label: "در انتظار",
      },
      confirmed: {
        color: "bg-blue-100 text-blue-800 hover:bg-blue-100",
        icon: CheckCircle,
        label: "تأیید شده",
      },
      completed: {
        color: "bg-green-100 text-green-800 hover:bg-green-100",
        icon: CheckCircle,
        label: "تکمیل شده",
      },
      cancelled: {
        color: "bg-red-100 text-red-800 hover:bg-red-100",
        icon: XCircle,
        label: "لغو شده",
      },
    };

    const config = statusConfig[status];
    const IconComponent = config.icon;

    return (
      <Badge className={`${config.color} gap-1`}>
        <IconComponent size={12} />
        {config.label}
      </Badge>
    );
  };

  const getStatusLabel = (status: Order["status"]) => {
    const labels = {
      pending: "در انتظار",
      confirmed: "تأیید شده",
      completed: "تکمیل شده",
      cancelled: "لغو شده",
    };
    return labels[status];
  };

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, "yyyy/MM/dd - HH:mm", { locale: faIR });
    } catch {
      return dateString;
    }
  };

  // آمار و اطلاعات
  const stats = {
    total: filteredOrders.length,
    pending: filteredOrders.filter(o => o.status === "pending").length,
    confirmed: filteredOrders.filter(o => o.status === "confirmed").length,
    completed: filteredOrders.filter(o => o.status === "completed").length,
    totalRevenue: filteredOrders
      .filter(o => o.status === "completed")
      .reduce((sum, order) => sum + order.total_price, 0),
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto mb-4" size={32} />
          <p className="text-gray-600">در حال بارگذاری سفارشات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* هدر */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Receipt size={28} />
            مدیریت سفارشات
          </h1>
          <p className="text-gray-600 mt-2">
            مشاهده و مدیریت تمام سفارشات دریافتی
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={fetchOrders}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw size={16} />
            بروزرسانی
          </Button>
          <Button className="flex items-center gap-2">
            <Download size={16} />
            خروجی گزارش
          </Button>
        </div>
      </div>

      {/* آمار */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">کل سفارشات</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Receipt className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">در انتظار</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">تأیید شده</p>
                <p className="text-2xl font-bold text-blue-600">{stats.confirmed}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">تکمیل شده</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">درآمد کل</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.totalRevenue.toLocaleString()} تومان
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <Receipt className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
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
                  placeholder="جستجو در سفارشات (نام مشتری، شماره سفارش، ...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>

            {/* فیلتر وضعیت */}
            <div className="md:col-span-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <Filter size={16} className="ml-2" />
                  <SelectValue placeholder="فیلتر بر اساس وضعیت" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">همه وضعیت‌ها</SelectItem>
                  <SelectItem value="pending">در انتظار</SelectItem>
                  <SelectItem value="confirmed">تأیید شده</SelectItem>
                  <SelectItem value="completed">تکمیل شده</SelectItem>
                  <SelectItem value="cancelled">لغو شده</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* فیلتر تاریخ */}
            <div className="md:col-span-3">
              <Select 
                value={dateFilter} 
                onValueChange={(value: DateFilter) => setDateFilter(value)}
              >
                <SelectTrigger>
                  <Calendar size={16} className="ml-2" />
                  <SelectValue placeholder="فیلتر بر اساس تاریخ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">امروز</SelectItem>
                  <SelectItem value="yesterday">دیروز</SelectItem>
                  <SelectItem value="week">هفته جاری</SelectItem>
                  <SelectItem value="month">ماه جاری</SelectItem>
                  <SelectItem value="all">همه زمان‌ها</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* ریست فیلترها */}
            <div className="md:col-span-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setDateFilter("today");
                }}
              >
                حذف فیلترها
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* جدول سفارشات */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>لیست سفارشات</CardTitle>
              <CardDescription>
                نمایش {filteredOrders.length} سفارش از {orders.length} سفارش
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <Receipt size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg text-gray-500">هیچ سفارشی یافت نشد</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">شماره سفارش</TableHead>
                    <TableHead className="text-right">مشتری</TableHead>
                    <TableHead className="text-right">تاریخ</TableHead>
                    <TableHead className="text-right">میز</TableHead>
                    <TableHead className="text-right">مبلغ</TableHead>
                    <TableHead className="text-right">وضعیت</TableHead>
                    <TableHead className="text-right">عملیات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody dir="ltr" className="text-right">
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        #{order.id.slice(-8).toUpperCase()}
                      </TableCell>
                      <TableCell>{order.customer_name}</TableCell>
                      <TableCell>{formatDate(order.created_at)}</TableCell>
                      <TableCell>
                        {order.table_number ? (
                          <Badge variant="outline">{order.table_number}</Badge>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {order.total_price.toLocaleString()} تومان
                      </TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2 border" dir="rtl">
                          <Dialog
                            open={isDetailsOpen && selectedOrder?.id === order.id}
                            onOpenChange={(open) => {
                              setIsDetailsOpen(open);
                              if (open) setSelectedOrder(order);
                              else setSelectedOrder(null);
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedOrder(order)}
                              >
                                <Eye size={14} />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>
                                  {/* جزئیات سفارش #{order.id.slice(-8).toUpperCase()} */}
                                </DialogTitle>
                                <DialogDescription>
                                  {/* {formatDate(order.created_at)} */}
                                </DialogDescription>
                              </DialogHeader>
                              {/* محتوای دیالوگ مشابه کارت قبلی */}
                            </DialogContent>
                          </Dialog>

                          {order.status === "pending" && (
                            <Button
                              size="sm"
                              onClick={() => updateOrderStatus(order.id, "confirmed")}
                              disabled={updatingOrder === order.id}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              {updatingOrder === order.id ? "..." : "تأیید"}
                            </Button>
                          )}

                          {order.status === "confirmed" && (
                            <Button
                              size="sm"
                              onClick={() => updateOrderStatus(order.id, "completed")}
                              disabled={updatingOrder === order.id}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {updatingOrder === order.id ? "..." : "تکمیل"}
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              // پرینت فاکتور
                              window.print();
                            }}
                          >
                            <Printer size={14} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* پاگینیشن */}
          {filteredOrders.length > 0 && (
            <div className="flex items-center justify-between border-t pt-4 mt-4">
              <div className="text-sm text-gray-500">
                نمایش 1 تا {filteredOrders.length} از {filteredOrders.length} نتیجه
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled>
                  قبلی
                </Button>
                <Button variant="outline" size="sm" className="bg-blue-50">
                  1
                </Button>
                <Button variant="outline" size="sm">
                  2
                </Button>
                <Button variant="outline" size="sm">
                  بعدی
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* جزئیات سفارش در حالت دیالوگ */}
      {selectedOrder && (
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                جزئیات سفارش #{selectedOrder.id.slice(-8).toUpperCase()}
              </DialogTitle>
              <DialogDescription>
                {formatDate(selectedOrder.created_at)}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* اطلاعات مشتری */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-gray-500" />
                    <span className="font-medium">مشتری:</span>
                    <span>{selectedOrder.customer_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Hash size={16} className="text-gray-500" />
                    <span className="font-medium">میز:</span>
                    <span>{selectedOrder.table_number || "-"}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">وضعیت:</span>
                    <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">جمع کل:</span>
                    <div className="text-2xl font-bold text-green-600 mt-1">
                      {selectedOrder.total_price.toLocaleString()} تومان
                    </div>
                  </div>
                </div>
              </div>

              {/* یادداشت */}
              {selectedOrder.notes && (
                <div className="flex items-start gap-2 p-4 bg-blue-50 rounded-lg">
                  <Notebook size={18} className="text-blue-500 mt-1 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-blue-700">یادداشت:</span>
                    <p className="text-blue-600 mt-1">{selectedOrder.notes}</p>
                  </div>
                </div>
              )}

              {/* آیتم‌های سفارش */}
              <div>
                <h4 className="font-semibold mb-3 text-lg border-b pb-2">
                  آیتم‌های سفارش
                </h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <img
                          src={item.image_url}
                          alt={item.name_fa}
                          className="w-20 h-20 rounded-lg object-cover border"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-lg">{item.name_fa}</p>
                          <p className="text-gray-500">
                            قیمت واحد: {item.price.toLocaleString()} تومان
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-lg">
                          تعداد: {item.quantity}
                        </p>
                        <p className="text-green-600 font-bold text-lg mt-2">
                          {(item.price * item.quantity).toLocaleString()} تومان
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* دکمه‌های مدیریت */}
              <div className="flex gap-2 pt-4 border-t">
                {selectedOrder.status === "pending" && (
                  <>
                    <Button
                      onClick={() => {
                        updateOrderStatus(selectedOrder.id, "confirmed");
                        setIsDetailsOpen(false);
                      }}
                      disabled={updatingOrder === selectedOrder.id}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      {updatingOrder === selectedOrder.id ? "..." : "تأیید سفارش"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        updateOrderStatus(selectedOrder.id, "cancelled");
                        setIsDetailsOpen(false);
                      }}
                      disabled={updatingOrder === selectedOrder.id}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      لغو سفارش
                    </Button>
                  </>
                )}

                {selectedOrder.status === "confirmed" && (
                  <>
                    <Button
                      onClick={() => {
                        updateOrderStatus(selectedOrder.id, "completed");
                        setIsDetailsOpen(false);
                      }}
                      disabled={updatingOrder === selectedOrder.id}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {updatingOrder === selectedOrder.id ? "..." : "تکمیل سفارش"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        updateOrderStatus(selectedOrder.id, "cancelled");
                        setIsDetailsOpen(false);
                      }}
                      disabled={updatingOrder === selectedOrder.id}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      لغو سفارش
                    </Button>
                  </>
                )}

                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => window.print()}
                >
                  <Printer size={16} />
                  پرینت فاکتور
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}