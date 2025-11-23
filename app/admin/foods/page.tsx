"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { toast } from "sonner";

type Food = {
  id: string;
  name_fa: string;
  price: number;
  image_url: string;
};

export default function AdminFoodsPage() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFoods();
  }, []);

  const fetchFoods = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("foods")
      .select("*")
      .order("id", { ascending: false });
    if (error) console.error(error);
    else setFoods(data || []);
    setLoading(false);
  };

  const deleteFood = async (id: string) => {
    if (!confirm("آیا مطمئنی که می‌خواهی حذف کنی؟")) return;

    const { error } = await supabase.from("foods").delete().eq("id", id);
    if (error) {
      alert("خطا در حذف غذا");
      console.error(error);
    } else {
      toast.success("غذا حذف شد");
      fetchFoods();
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-center mb-6">Food Lists</h1>

      {loading ? (
        <p className="text-center text-gray-500">در حال بارگذاری...</p>
      ) : foods.length === 0 ? (
        <p className="text-center text-gray-500">غذایی یافت نشد</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {foods.map((food) => (
            <div
              key={food.id}
              className="border rounded-xl shadow p-3 flex flex-col items-center bg-white"
            >
              <img
                src={food.image_url}
                alt={food.name_fa}
                className="w-48 h-48 object-cover rounded-xl"
              />
              <h2 className="mt-2 font-bold text-lg">{food.name_fa}</h2>
              <p className="text-gray-600">{food.price} افغانی</p>

              <div className="flex gap-3 mt-3">
                <button
                  onClick={() => deleteFood(food.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  🗑️ حذف
                </button>
                <Link
                  href={`/admin/edit/${food.id}`}
                  className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                >
                  ویرایش
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
