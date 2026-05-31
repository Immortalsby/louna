"use client";

interface FoodChipsProps {
  foods: string[];
}

export function FoodChips({ foods }: FoodChipsProps) {
  if (foods.length === 0) {
    return (
      <p className="text-sm text-gray-400 italic">还没有安全食物记录</p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {foods.map((food) => (
        <span
          key={food}
          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-50 text-green-700 border border-green-200"
        >
          {food}
        </span>
      ))}
    </div>
  );
}
