// app/admin/page.tsx
'use client';

export default function AdminPage() {
  return (
    <div>
      <h1 style={{
        fontSize: '28px',
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: '16px'
      }}>
        خوش آمدید 👋
      </h1>
      
      <p style={{
        color: '#6b7280',
        marginBottom: '32px',
        fontSize: '16px'
      }}>
        این پنل مدیریت رستوران شماست. از منوی بالا برای دسترسی به بخش‌های مختلف استفاده کنید.
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginTop: '32px'
      }}>
        {[
          { title: 'تعداد غذاها', value: '42', icon: '🍔', color: '#3b82f6' },
          { title: 'سفارشات امروز', value: '18', icon: '📋', color: '#10b981' },
          { title: 'درآمد امروز', value: '۲.۵M', icon: '💰', color: '#f59e0b' },
          { title: 'مشتریان جدید', value: '12', icon: '👥', color: '#8b5cf6' },
        ].map((stat, index) => (
          <div
            key={index}
            style={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '24px',
              textAlign: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>
              {stat.icon}
            </div>
            <div style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: stat.color,
              marginBottom: '8px'
            }}>
              {stat.value}
            </div>
            <div style={{ color: '#6b7280', fontSize: '14px' }}>
              {stat.title}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}