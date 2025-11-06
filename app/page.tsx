'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type Food = {
  id: string
  name_fa: string
  description_fa: string
  price: number
  image_url: string
}

export default function Home() {
  const [foods, setFoods] = useState<Food[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchFoods = async () => {
    const { data, error } = await supabase.from('foods').select('*')
    if (error) console.error('Error fetching foods:', error)
    else setFoods(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchFoods()
  }, [])

  // ✅ کشیدن برای رفرش (Pull to refresh)
  useEffect(() => {
    let startY = 0
    let isPulled = false

    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        startY = e.touches[0].clientY
        isPulled = true
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulled) return
      const currentY = e.touches[0].clientY
      const distance = currentY - startY
      if (distance > 80) {
        setRefreshing(true)
      }
    }

    const handleTouchEnd = async () => {
      if (refreshing) {
        await fetchFoods()
        setTimeout(() => setRefreshing(false), 800)
      }
      isPulled = false
    }

    window.addEventListener('touchstart', handleTouchStart)
    window.addEventListener('touchmove', handleTouchMove)
    window.addEventListener('touchend', handleTouchEnd)

    return () => {
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [refreshing])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <p className="text-gray-600 text-lg animate-pulse">در حال بارگذاری...</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 overflow-y-auto">
      <div
        className={`fixed top-0 left-0 right-0 flex justify-center transition-transform duration-300 ${
          refreshing ? 'translate-y-4 opacity-100' : '-translate-y-10 opacity-0'
        }`}
      >
        <div className="bg-green-100 text-green-600 px-4 py-1 rounded-full text-sm shadow">
          منو به‌روزرسانی شد ✅
        </div>
      </div>

      <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
        🍽 منوی رستوران
      </h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {foods.map((food) => (
          <div
            key={food.id}
            className="flex items-center p-3 bg-white rounded-xl shadow hover:shadow-lg transition-all duration-200 active:scale-95"
          >
            <div className="w-3/12 h-20 bg-gray-200 rounded-md overflow-hidden">
              <img
                src={food.image_url}
                alt={food.name_fa}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="flex flex-col justify-between ml-3 w-9/12 px-6">
              <h2 className="text-lg font-semibold text-gray-800 truncate">{food.name_fa}</h2>
              <p className="text-sm text-gray-500 line-clamp-2">{food.description_fa}</p>
              <span className="text-base font-bold text-green-600 mt-1">
                {food.price.toLocaleString()} افغانی
              </span>
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-gray-400 text-sm mt-6 mb-4">
        © 2025 Watandar Restaurant
      </p>
    </main>
  )
}
