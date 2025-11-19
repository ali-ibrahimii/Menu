"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock,
  Receipt,
  User,
  Hash,
  Notebook,
  Package,
  Calendar,
  DollarSign,
  Smartphone
} from "lucide-react";
import { translations } from "@/translations/translation";
import { useLanguage } from "@/contexts/LanguageContext";

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
  device_id: string; // این فیلد ضروری است
}

// تابع ایجاد شناسه دستگاه
const getDeviceId = () => {
  if (typeof window === 'undefined') return 'unknown';
  
  let deviceId = localStorage.getItem('deviceId');
  
  if (!deviceId) {
    // ایجاد شناسه منحصر بفرد برای دستگاه
    deviceId = 'device_' + Math.random().toString(36).substr(2, 9) + 
               '_' + Date.now().toString(36);
    localStorage.setItem('deviceId', deviceId);
    
    // ذخیره نام پیش‌فرض
    localStorage.setItem('customerName', 'مهمان');
  }
  
  return deviceId;
};

export default function MyOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNameForm, setShowNameForm] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const { language } = useLanguage();
  
  const t = (key: string) => {
    const langTranslations = translations[language] as Record<string, string>;
    return langTranslations[key] || key;
  };

  // دریافت اطلاعات دستگاه
  const getDeviceInfo = () => {
    if (typeof window === 'undefined') return { deviceId: 'unknown', customerName: 'مهمان', tableNumber: '' };
    
    const deviceId = getDeviceId();
    const customerName = localStorage.getItem('customerName') || 'مهمان';
    const tableNumber = localStorage.getItem('tableNumber') || '';
    
    return { deviceId, customerName, tableNumber };
  };

  // دریافت سفارشات فقط برای این دستگاه
  const fetchOrders = async () => {
    try {
      const { deviceId, customerName, tableNumber } = getDeviceInfo();
      
      console.log('جستجوی سفارشات برای دستگاه:', deviceId);
      
      // فقط سفارشات این دستگاه را بگیر
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('device_id', deviceId) // فیلتر بر اساس device_id
        .order('created_at', { ascending: false });

      if (error) {
        console.error('خطا در دریافت سفارشات:', error);
        
        // اگر ستون device_id وجود ندارد، با customer_name و table_number فیلتر کنیم
        if (error.code === '42703') { // ستون وجود ندارد
          console.log('ستون device_id وجود ندارد، جستجو با اطلاعات مشتری...');
          
          let query = supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

          if (tableNumber) {
            query = query.eq('table_number', tableNumber);
          } else if (customerName && customerName !== 'مهمان') {
            query = query.eq('customer_name', customerName);
          }

          const { data: fallbackData, error: fallbackError } = await query;
          
          if (fallbackError) {
            console.error('خطا در جستجوی جایگزین:', fallbackError);
            setOrders([]);
          } else {
            console.log('سفارشات یافت شده (جایگزین):', fallbackData?.length || 0);
            setOrders(fallbackData || []);
          }
        } else {
          setOrders([]);
        }
        return;
      }
      
      console.log('سفارشات یافت شده برای این دستگاه:', data?.length || 0);
      setOrders(data || []);
      
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // ذخیره اطلاعات مشتری
  const saveCustomerInfo = () => {
    if (customerName.trim()) {
      localStorage.setItem('customerName', customerName.trim());
    }
    if (tableNumber.trim()) {
      localStorage.setItem('tableNumber', tableNumber.trim());
    }
    setShowNameForm(false);
    fetchOrders();
  };

  useEffect(() => {
    const { customerName } = getDeviceInfo();
    
    // اگر نام مشتری 'مهمان' هست، فرم را نشان بده
    if (customerName === 'مهمان') {
      setShowNameForm(true);
    } else {
      fetchOrders();
    }
  }, []);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fa-IR');
  };

  // گرفتن نام غذا بر اساس زبان
  const getItemName = (item: OrderItem) => {
    switch (language) {
      case "fa":
        return item.name_fa;
      case "ar":
        return item.name_ar;
      case "en":
        return item.name_en;
      default:
        return item.name_fa;
    }
  };

  // فرم اطلاعات مشتری
  if (showNameForm) {
    return (
      <div className="container mx-auto p-6 max-w-md">
        <Card>
          <CardHeader className="text-center">
            <Smartphone size={48} className="mx-auto mb-4 text-green-600" />
            <CardTitle>شناسایی سفارشات شما</CardTitle>
            <CardDescription>
              لطفاً اطلاعات خود را وارد کنید تا سفارشات شما نمایش داده شود
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                نام شما (اختیاری)
              </label>
              <Input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="مثلاً: علی"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                شماره میز (اختیاری)
              </label>
              <Input
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="مثلاً: 5"
              />
            </div>
            
            <Button onClick={saveCustomerInfo} className="w-full">
              تأیید و مشاهده سفارشات
            </Button>
            
            <p className="text-xs text-gray-500 text-center">
              این اطلاعات فقط برای نمایش سفارشات شما استفاده می‌شود
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">در حال دریافت سفارشات شما...</p>
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
            سفارشات من
          </h1>
          <p className="text-gray-600 mt-2">
            سفارشات ثبت شده از این دستگاه ({orders.length} سفارش)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => setShowNameForm(true)} 
            variant="outline" 
            className="flex items-center gap-2"
          >
            <Smartphone size={16} />
            تغییر اطلاعات
          </Button>
          <Button onClick={fetchOrders} variant="outline" className="flex items-center gap-2">
            <RefreshCw size={16} />
            بروزرسانی
          </Button>
        </div>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Receipt size={48} className="mx-auto mb-4 opacity-50" />
            <CardDescription className="text-lg">
              هیچ سفارشی از این دستگاه پیدا نشد
            </CardDescription>
            <p className="text-sm text-gray-500 mt-2">
              اگر قبلاً سفارش داده‌اید، اطلاعات خود را بررسی کنید
            </p>
            <Button 
              onClick={() => setShowNameForm(true)} 
              variant="outline" 
              className="mt-4"
            >
              تغییر اطلاعات جستجو
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {orders.map((order) => (
            <Card key={order.id} className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      سفارش #{order.id.slice(-8).toUpperCase()}
                      {getStatusBadge(order.status)}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Calendar size={14} />
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
                    <span className="font-sm">نام:</span>
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
                    <span className="font-sm">جمع کل:</span>
                    <span className="text-sm font-light text-green-600">
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
                  <h4 className="font-semibold mb-3 text-md flex items-center gap-2">
                    <Package size={18} />
                    آیتم‌های سفارش:
                  </h4>
                  <div className="space-y-3">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-white">
                        <div className="flex items-center gap-3 flex-1">
                          <img
                            src={item.image_url}
                            alt={getItemName(item)}
                            className="w-16 h-16 rounded-lg object-cover border"
                          />
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800">{getItemName(item)}</p>
                            <p className="text-sm font-light text-gray-500 mt-1">
                              {item.price.toLocaleString()} تومان
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-700">تعداد: {item.quantity}</p>
                          <p className="text-green-600 font-light text-md mt-1">
                            {(item.price * item.quantity).toLocaleString()} تومان
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* جمع کل نهایی */}
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <span className="font-bold text-md text-gray-800">مبلغ نهایی:</span>
                  <span className="text-md font-light text-green-600">
                    {order.total_price.toLocaleString()} تومان
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}