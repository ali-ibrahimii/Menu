
// components/CustomerInfoForm.tsx
"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Hash } from 'lucide-react';

export default function CustomerInfoForm({ onSave }: { onSave: (info: any) => void }) {
  const [formData, setFormData] = useState({
    customerName: '',
    tableNumber: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.customerName.trim()) {
      localStorage.setItem('customerName', formData.customerName);
      if (formData.tableNumber.trim()) {
        localStorage.setItem('tableNumber', formData.tableNumber);
      }
      onSave(formData);
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User size={24} />
          اطلاعات شما
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              نام شما (اختیاری)
            </label>
            <Input
              value={formData.customerName}
              onChange={(e) => setFormData({...formData, customerName: e.target.value})}
              placeholder="مثلاً: علی"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              شماره میز (اختیاری)
            </label>
            <Input
              value={formData.tableNumber}
              onChange={(e) => setFormData({...formData, tableNumber: e.target.value})}
              placeholder="مثلاً: 5"
            />
          </div>
          
          <Button type="submit" className="w-full">
            تأیید و مشاهده سفارشات
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}