// app/qr/[slug]/page.tsx
import { notFound } from 'next/navigation';
import QRCodePageClient from '@/app/qr/[slug]/QRCodePageClient';

// شعبه‌های ثابت (می‌توانید بعداً از دیتابیس بیاورید)
const BRANCHES = [
  {
    slug: 'main',
    name_fa: 'شعبه اصلی وطندار',
    name_ar: 'الفرع الرئيسي لوطن دار',
    name_en: 'Watandar Main Branch',
    address: 'آدرس شعبه اصلی',
    phone: '021-12345678'
  },
  {
    slug: 'branch2',
    name_fa: 'شعبه دوم وطندار',
    name_ar: 'الفرع الثاني لوطن دار',
    name_en: 'Watandar Second Branch',
    address: 'آدرس شعبه دوم',
    phone: '021-87654321'
  }
];

export default async function QRCodePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const branch = BRANCHES.find(b => b.slug === slug);
  
  if (!branch) notFound();
  
  return <QRCodePageClient branch={branch} />;
}