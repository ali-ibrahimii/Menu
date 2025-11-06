'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type Food = {
  id: string
  name_fa: string
  name_en: string
  name_ar: string
  description_fa: string
  price: number
  image_url: string
}

export default function Home() {
  const [foods, setFoods] = useState<Food[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFoods = async () => {
      const { data, error } = await supabase.from('foods').select('*')
      if (error) console.error('Error fetching foods:', error)
      else setFoods(data || [])
      setLoading(false)
    }

    fetchFoods()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-500 text-lg">در حال بارگذاری...</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
        منوی رستوران
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 p-4">
        {foods.map((food) => (
          <div
            key={food.id}
            className="w-full h-23 flex items-center p-2 bg-gray-200 rounded-md shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >

            {/* image */}
            <div className='w-3/12 bg-amber-300 h-18 rounded-md ml-2 overflow-hidden'>
              <img
                src={food.image_url}
                alt={food.name_fa}
                className="object-cover w-full h-full"
                />
              </div>
              
              {/* text */}
            <div className="p-4 flex flex-col">
              <h2 className="text-xl font-semibold truncate">{food.name_fa}</h2>
              <p className='text-gray-600'>{food.description_fa}</p>
              <span className="text-base font-bold text-green-600">
                {food.price.toLocaleString()} افغانی
              </span>
            </div>
            
          </div>
        ))}
      </div>
    </main>
  )
}
