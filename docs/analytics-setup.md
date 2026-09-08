# راهنمای تنظیم آمار بازدید سایت

## معرفی

این سیستم برای ثبت و نمایش آمار بازدید سایت در صفحه ادمین طراحی شده است. با استفاده از این سیستم می‌توانید:
- تعداد کل بازدیدها را ببینید
- بازدیدهای روزانه را مشاهده کنید
- صفحات پر بازدید را شناسایی کنید
- آمار بازدیدها را در داشبورد ادمین ببینید

## مراحل راه‌اندازی

### 1. ایجاد جدول در پایگاه داده Supabase

ابتدا باید جدول `site_visits` را در پایگاه داده Supabase خود ایجاد کنید. برای این کار:

1. به [Supabase Dashboard](https://app.supabase.com/) بروید
2. پروژه خود را انتخاب کنید
3. به بخش **SQL Editor** بروید
4. کد زیر را اجرا کنید:

```sql
-- ایجاد جدول برای ثبت بازدیدهای سایت
CREATE TABLE IF NOT EXISTS site_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL,
  page TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- فعال کردن Row Level Security
ALTER TABLE site_visits ENABLE ROW LEVEL SECURITY;

-- ایجاد Policy برای اجازه دسترسی کامل
CREATE POLICY "Allow all site visits access" 
ON site_visits 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- ایجاد ایندکس برای جستجوی سریع‌تر
CREATE INDEX IF NOT EXISTS idx_site_visits_device_id ON site_visits(device_id);
CREATE INDEX IF NOT EXISTS idx_site_visits_page ON site_visits(page);
CREATE INDEX IF NOT EXISTS idx_site_visits_created_at ON site_visits(created_at);
```

یا می‌توانید از فایل آماده استفاده کنید:
```bash
# فایل SQL را در پوشه sql پیدا می‌کنید
sql/create_site_visits_table.sql
```

### 2. بررسی تنظیمات فعلی

کد ثبت بازدید به صورت خودکار در همه صفحات سایت قرار گرفته است:
- کامپوننت `VisitTracker` در `components/VisitTracker.tsx` ایجاد شده
- این کامپوننت در `app/layout.tsx` فراخوانی شده
- اطلاعات بازدید در صفحه ادمین (`app/admin/page.tsx`) نمایش داده می‌شود

### 3. ویژگی‌های ثبت بازدید

- **Device ID منحصر به فرد**: برای هر دستگاه یک ID منحصر به فرد تولید می‌شود و در localStorage ذخیره می‌شود
- **صفحه بازدید شده**: آدرس صفحه فعلی (pathname) ثبت می‌شود
- **User Agent**: اطلاعات مرورگر کاربر ثبت می‌شود
- **زمان بازدید**: به صورت خودکار ثبت می‌شود

### 4. مشاهده آمار در صفحه ادمین

پس از راه‌اندازی، می‌توانید آمار بازدید را در صفحه ادمین مشاهده کنید:
- **بازدید کل**: تعداد کل بازدیدهای ثبت شده
- **بازدید امروز**: تعداد بازدیدهای روز جاری
- **گراف 7 روز اخیر**: نمایش بازدیدها در طول هفته
- **صفحات پر بازدید**: می‌توانید با استفاده از کوئری‌های SQL صفحات پر بازدید را شناسایی کنید

## کوئری‌های مفید برای آنالیز

### تعداد بازدیدهای کل
```sql
SELECT COUNT(*) FROM site_visits;
```

### بازدیدهای امروز
```sql
SELECT COUNT(*) FROM site_visits 
WHERE DATE(created_at) = CURRENT_DATE;
```

### بازدیدهای دیروز
```sql
SELECT COUNT(*) FROM site_visits 
WHERE DATE(created_at) = CURRENT_DATE - INTERVAL '1 day';
```

### صفحات پر بازدید
```sql
SELECT page, COUNT(*) as visit_count 
FROM site_visits 
GROUP BY page 
ORDER BY visit_count DESC 
LIMIT 10;
```

### بازدیدها بر اساس دستگاه
```sql
SELECT device_id, COUNT(*) as visit_count 
FROM site_visits 
GROUP BY device_id 
ORDER BY visit_count DESC 
LIMIT 10;
```

### بازدیدها در بازه زمانی خاص
```sql
SELECT DATE(created_at) as date, COUNT(*) as visit_count 
FROM site_visits 
WHERE created_at BETWEEN '2024-01-01' AND '2024-12-31'
GROUP BY DATE(created_at) 
ORDER BY date;
```

## عیب‌یابی

### اگر آمار بازدید نمایش داده نمی‌شود:

1. **چک کنید جدول ایجاد شده است**:
   ```sql
   SELECT * FROM site_visits LIMIT 1;
   ```

2. **چک کنید Policy درست تنظیم شده است**:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'site_visits';
   ```

3. **چک کنید RLS فعال است**:
   ```sql
   SELECT * FROM pg_tables WHERE tablename = 'site_visits';
   ```

4. **چک کنید داده‌ها ثبت می‌شوند**:
   - به کنسول مرورگر بروید (F12)
   - صفحه را refresh کنید
   - در تب Network، درخواست به Supabase را چک کنید

### خطاهای رایج

- **خطا: table "site_visits" does not exist**
  راه حل: جدول را ایجاد کنید (مرحله 1 را دنبال کنید)

- **خطا: permission denied for table site_visits**
  راه حل: Policy را برای جدول تنظیم کنید

- **خطا: new row violates row-level security policy**
  راه حل: مطمئن شوید Policy برای INSERT اجازه می‌دهد

## سفارشی‌سازی

### تغییر فیلدهای ثبت شده

اگر می‌خواهید فیلدهای بیشتری ثبت کنید، می‌توانید کامپوننت `VisitTracker` را ویرایش کنید:

```typescript
// مثال: اضافه کردن فیلد referrer
supabase
  .from("site_visits")
  .insert({ 
    device_id: id, 
    page: window.location.pathname,
    user_agent: navigator.userAgent,
    referrer: document.referrer
  });
```

### فیلتر کردن صفحات خاص

اگر نمی‌خواهید بازدید از برخی صفحات ثبت شود:

```typescript
const excludedPages = ['/admin', '/login'];
if (!excludedPages.includes(window.location.pathname)) {
  supabase
    .from("site_visits")
    .insert({ device_id: id, page: window.location.pathname });
}
```

## نکات امنیتی

1. **RLS را فعال نگه دارید**: همیشه Row Level Security را فعال نگه دارید
2. **Policy را محدود کنید**: در محیط production، Policy را محدودتر کنید
3. **داده‌های حساس را ثبت نکنید**: از ثبت اطلاعات حساس کاربر خودداری کنید

## پشتیبانی

برای سوال یا مشکل، می‌توانید:
- کدها را در پوشه‌های مربوطه بررسی کنید
- از جامعه Supabase کمک بگیرید
- مستندات رسمی Supabase را مطالعه کنید
