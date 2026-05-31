import { connection } from "next/server";
import { prisma, getDefaultBabyId } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { nowParis } from "@/lib/timezone";
import { FoodChips } from "./food-chips";
import { AddFood } from "./add-food";
import { differenceInDays, format } from "date-fns";

const BABY_ID = await getDefaultBabyId();

const SUGGESTED_FOODS: { category: string; items: string[]; age: string }[] = [
  {
    category: "蔬菜",
    items: ["胡萝卜", "南瓜", "西葫芦", "四季豆", "菠菜", "土豆"],
    age: "6月+",
  },
  {
    category: "水果",
    items: ["苹果", "梨", "香蕉", "桃子"],
    age: "6月+",
  },
  {
    category: "谷物/蛋白质",
    items: ["婴儿米粉", "小面条", "鸡肉泥", "白鱼泥"],
    age: "7月+",
  },
];

export default async function FoodPage() {
  await connection();
  const allFoods = await prisma.foodSafety.findMany({
    where: { babyId: BABY_ID },
    orderBy: { introduced: "desc" },
  });

  const now = nowParis();

  const observingFoods = allFoods.filter((f) => f.status === "OBSERVING");
  const safeFoods = allFoods.filter((f) => f.status === "SAFE");
  const allFoodNames = new Set(allFoods.map((f) => f.food));

  const suggestedNotTried = SUGGESTED_FOODS.map((group) => ({
    ...group,
    items: group.items.filter((item) => !allFoodNames.has(item)),
  })).filter((group) => group.items.length > 0);

  return (
    <div className="px-4 pb-8">
      <PageHeader title="🥣 辅食管理" subtitle="跟踪辅食引入与过敏观察" />

      {/* Add new food */}
      <div className="mt-4">
        <AddFood />
      </div>

      {/* Observing section */}
      <section className="mt-6">
        <h2 className="text-base font-semibold text-gray-800 mb-3">
          ⚠️ 过敏观察中
        </h2>
        {observingFoods.length === 0 ? (
          <Card>
            <p className="text-sm text-gray-400 italic text-center">
              当前没有正在观察的食物
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {observingFoods.map((food) => {
              const daysLeft = Math.max(
                0,
                differenceInDays(food.observationEnd, now)
              );
              return (
                <Card key={food.id} className="border-l-4 border-l-amber-400">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{food.food}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        观察截止:{" "}
                        {format(food.observationEnd, "MM/dd")}
                        <span className="ml-2 text-amber-600 font-medium">
                          还剩 {daysLeft} 天
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-50 text-amber-600 text-sm font-bold">
                        {daysLeft}
                      </span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Safe foods section */}
      <section className="mt-6">
        <h2 className="text-base font-semibold text-gray-800 mb-3">
          ✅ 已安全食物
        </h2>
        <Card>
          <FoodChips foods={safeFoods.map((f) => f.food)} />
        </Card>
      </section>

      {/* Suggested foods section */}
      {suggestedNotTried.length > 0 && (
        <section className="mt-6">
          <h2 className="text-base font-semibold text-gray-800 mb-3">
            📋 建议引入
          </h2>
          <p className="text-xs text-gray-500 mb-3">
            根据法国PMI指南，6月龄以上宝宝可逐步引入以下食物
          </p>
          <div className="space-y-3">
            {suggestedNotTried.map((group) => (
              <Card key={group.category}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {group.category}
                  </span>
                  <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                    {group.age}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-600 border border-blue-100"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Timeline section */}
      <section className="mt-6">
        <h2 className="text-base font-semibold text-gray-800 mb-3">
          📅 引入时间线
        </h2>
        {allFoods.length === 0 ? (
          <Card>
            <p className="text-sm text-gray-400 italic text-center">
              还没有辅食记录
            </p>
          </Card>
        ) : (
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
            <div className="space-y-3">
              {allFoods.map((food) => {
                const statusColor =
                  food.status === "SAFE"
                    ? "bg-green-400"
                    : food.status === "OBSERVING"
                      ? "bg-amber-400"
                      : "bg-red-400";
                const statusLabel =
                  food.status === "SAFE"
                    ? "安全"
                    : food.status === "OBSERVING"
                      ? "观察中"
                      : "有反应";
                return (
                  <div key={food.id} className="relative pl-10">
                    <div
                      className={`absolute left-2.5 top-3 w-3 h-3 rounded-full ${statusColor} ring-2 ring-white`}
                    />
                    <Card>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {food.food}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {format(food.introduced, "yyyy-MM-dd")}
                          </p>
                        </div>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            food.status === "SAFE"
                              ? "bg-green-50 text-green-600"
                              : food.status === "OBSERVING"
                                ? "bg-amber-50 text-amber-600"
                                : "bg-red-50 text-red-600"
                          }`}
                        >
                          {statusLabel}
                        </span>
                      </div>
                      {food.reaction && (
                        <p className="text-xs text-red-500 mt-1">
                          反应: {food.reaction}
                        </p>
                      )}
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
