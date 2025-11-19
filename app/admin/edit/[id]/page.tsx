'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { toast } from "sonner"

export default function EditFoodPage() {
  const { id } = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState('')

  const [form, setForm] = useState({
    name_fa: '',
    name_en: '',
    name_ar: '',
    description_fa: '',
    description_en: '',
    description_ar: '',
    price: '',
  })

  // گرفتن اطلاعات غذا از Supabase
  useEffect(() => {
    if (!id) return
    fetchFood()
  }, [id])

  const fetchFood = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('foods')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error(error)
      toast("خطا در دریافت اطلاعات")
      return
    }

    setForm({
      name_fa: data.name_fa || '',
      name_en: data.name_en || '',
      name_ar: data.name_ar || '',
      description_fa: data.description_fa || '',
      description_en: data.description_en || '',
      description_ar: data.description_ar || '',
      price: data.price?.toString() || '',
    })

    setImageUrl(data.image_url || '')
    setLoading(false)
  }

  const handleUpload = async () => {
    if (!file) return alert('لطفاً عکس انتخاب کن')

    const fileName = `${Date.now()}-${file.name}`
    const { data, error } = await supabase.storage
      .from('menu-images')
      .upload(fileName, file)

    if (error) {
      console.error(error)
      alert('خطا در آپلود تصویر')
      return
    }

    const { data: publicUrlData } = supabase.storage
      .from('menu-images')
      .getPublicUrl(fileName)

    setImageUrl(publicUrlData.publicUrl)
  }

  const handleUpdate = async () => {
    if (!form.name_fa || !form.price) return alert('لطفاً فیلدها را پر کن')

    setUpdating(true)

    const { error } = await supabase
      .from('foods')
      .update({
        ...form,
        price: Number(form.price),
        image_url: imageUrl,
      })
      .eq('id', id)

    setUpdating(false)

    if (error) {
      console.error(error)
      alert('خطا در به‌روزرسانی اطلاعات')
    } else {
      toast.success("غذا با موفقیت بروز رسانی شد")
      router.push('/admin/foods')
    }
  }

  if (loading) return <p className="text-center mt-10">در حال بارگذاری...</p>

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-center">✏️ ویرایش غذا</h1>

      {/* عکس */}
      <div>
        <label className="block font-medium mb-1">عکس غذا</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="border p-2 w-full rounded"
        />
        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'در حال آپلود عکس جدید...' : 'آپلود عکس جدید'}
        </button>

        {imageUrl && (
          <img
            src={imageUrl}
            alt="uploaded"
            className="w-48 h-48 object-cover rounded-xl mt-3"
          />
        )}
      </div>

      {/* اطلاعات غذا */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input
          type="text"
          placeholder="نام فارسی"
          value={form.name_fa}
          onChange={(e) => setForm({ ...form, name_fa: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="نام انگلیسی"
          value={form.name_en}
          onChange={(e) => setForm({ ...form, name_en: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="نام عربی"
          value={form.name_ar}
          onChange={(e) => setForm({ ...form, name_ar: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          type="number"
          placeholder="قیمت"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          className="border p-2 rounded"
        />
      </div>

      <textarea
        placeholder="توضیحات فارسی"
        value={form.description_fa}
        onChange={(e) =>
          setForm({ ...form, description_fa: e.target.value })
        }
        className="border p-2 w-full rounded"
      />
      <textarea
        placeholder="توضیحات انگلیسی"
        value={form.description_en}
        onChange={(e) =>
          setForm({ ...form, description_en: e.target.value })
        }
        className="border p-2 w-full rounded"
      />
      <textarea
        placeholder="توضیحات عربی"
        value={form.description_ar}
        onChange={(e) =>
          setForm({ ...form, description_ar: e.target.value })
        }
        className="border p-2 w-full rounded"
      />

      <button
        onClick={handleUpdate}
        disabled={updating}
        className="w-full bg-green-600 text-white py-2 rounded-xl hover:bg-green-700 disabled:opacity-50"
      >
        {updating ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
      </button>
    </div>
  )
}
