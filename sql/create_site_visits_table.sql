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

-- برای مشاهده آمار بازدید در صفحه ادمین:
-- SELECT COUNT(*) FROM site_visits;
-- SELECT COUNT(*) FROM site_visits WHERE DATE(created_at) = CURRENT_DATE;
-- SELECT page, COUNT(*) FROM site_visits GROUP BY page ORDER BY COUNT(*) DESC;
