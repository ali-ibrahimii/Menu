"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock,
  Receipt,
  User,
  Hash,
  Notebook
} from "lucide-react";

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
  notes: string;
  total_price: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  items: OrderItem[];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

  // دریافت سفارشات از دیتابیس
  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      alert('خطا در دریافت سفارشات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // آپدیت وضعیت سفارش
  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    setUpdatingOrder(orderId);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      
      // آپدیت local state
      setOrders(prev => 
        prev.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      
      alert(`سفارش با موفقیت ${getStatusLabel(newStatus)} شد`);
    } catch (error) {
      console.error('Error updating order:', error);
      alert('خطا در آپدیت سفارش');
    } finally {
      setUpdatingOrder(null);
    }
  };

  // نمایش وضعیت سفارش
  const getStatusBadge = (status: Order['status']) => {
    const statusConfig = {
      pending: { 
        color: "bg-yellow-100 text-yellow-800 border-yellow-200", 
        icon: Clock, 
        label: "در انتظار" 
      },
      confirmed: { 
        color: "bg-blue-100 text-blue-800 border-blue-200", 
        icon: CheckCircle, 
        label: "تأیید شده" 
      },
      completed: { 
        color: "bg-green-100 text-green-800 border-green-200", 
        icon: CheckCircle, 
        label: "تکمیل شده" 
      },
      cancelled: { 
        color: "bg-red-100 text-red-800 border-red-200", 
        icon: XCircle, 
        label: "لغو شده" 
      }
    };

    const config = statusConfig[status];
    const IconComponent = config.icon;

    return (
      <Badge variant="outline" className={config.color}>
        <IconComponent size={14} className="ml-1" />
        {config.label}
      </Badge>
    );
  };

  const getStatusLabel = (status: Order['status']) => {
    const labels = {
      pending: "در انتظار",
      confirmed: "تأیید شده",
      completed: "تکمیل شده",
      cancelled: "لغو شده"
    };
    return labels[status];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fa-IR');
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
        <Button onClick={fetchOrders} variant="outline" className="flex items-center gap-2">
          <RefreshCw size={16} />
          بروزرسانی
        </Button>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Receipt size={48} className="mx-auto mb-4 opacity-50" />
            <CardDescription className="text-lg">
              هنوز هیچ سفارشی ثبت نشده است
            </CardDescription>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {orders.map((order) => (
            <Card key={order.id} className="border-l-4 border-l-blue-500">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      سفارش #{order.id.slice(-8).toUpperCase()}
                      {getStatusBadge(order.status)}
                    </CardTitle>
                    <CardDescription>
                      {formatDate(order.created_at)}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* اطلاعات مشتری */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-gray-500" />
                    <span className="font-medium">مشتری:</span>
                    <span>{order.customer_name}</span>
                  </div>
                  
                  {order.table_number && (
                    <div className="flex items-center gap-2">
                      <Hash size={16} className="text-gray-500" />
                      <span className="font-medium">میز:</span>
                      <span>{order.table_number}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <span className="font-medium">جمع کل:</span>
                    <span className="text-lg font-bold text-green-600">
                      {order.total_price.toLocaleString()} تومان
                    </span>
                  </div>
                </div>

                {/* یادداشت */}
                {order.notes && (
                  <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                    <Notebook size={16} className="text-blue-500 mt-1" />
                    <div>
                      <span className="font-medium text-blue-700">یادداشت:</span>
                      <p className="text-blue-600 mt-1">{order.notes}</p>
                    </div>
                  </div>
                )}

                {/* آیتم‌های سفارش */}
                <div>
                  <h4 className="font-semibold mb-3 text-lg">آیتم‌های سفارش:</h4>
                  <div className="space-y-3">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3 flex-1">
                          <img
                            src={item.image_url}
                            alt={item.name_fa}
                            className="w-16 h-16 rounded-lg object-cover border"
                          />
                          <div className="flex-1">
                            <p className="font-semibold">{item.name_fa}</p>
                            <p className="text-sm text-gray-500">
                              {item.price.toLocaleString()} تومان
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">تعداد: {item.quantity}</p>
                          <p className="text-green-600 font-semibold">
                            {(item.price * item.quantity).toLocaleString()} تومان
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* دکمه‌های مدیریت */}
                <div className="flex gap-2 pt-4 border-t">
                  {order.status === 'pending' && (
                    <>
                      <Button
                        onClick={() => updateOrderStatus(order.id, 'confirmed')}
                        disabled={updatingOrder === order.id}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        {updatingOrder === order.id ? "..." : "تأیید سفارش"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => updateOrderStatus(order.id, 'cancelled')}
                        disabled={updatingOrder === order.id}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        لغو سفارش
                      </Button>
                    </>
                  )}
                  
                  {order.status === 'confirmed' && (
                    <>
                      <Button
                        onClick={() => updateOrderStatus(order.id, 'completed')}
                        disabled={updatingOrder === order.id}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        {updatingOrder === order.id ? "..." : "تکمیل سفارش"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => updateOrderStatus(order.id, 'cancelled')}
                        disabled={updatingOrder === order.id}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        لغو سفارش
                      </Button>
                    </>
                  )}
                  
                  {(order.status === 'completed' || order.status === 'cancelled') && (
                    <Button
                      variant="outline"
                      className="flex-1"
                      disabled
                    >
                      {order.status === 'completed' ? 'تکمیل شده' : 'لغو شده'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}