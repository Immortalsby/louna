"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type FeedingType = "MILK" | "SOLID";

export function AddFeeding() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<FeedingType>("MILK");
  const [ml, setMl] = useState("");
  const [food, setFood] = useState("");
  const [amount, setAmount] = useState("");
  const [time, setTime] = useState(() => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  });
  const [error, setError] = useState("");

  function resetForm() {
    setType("MILK");
    setMl("");
    setFood("");
    setAmount("");
    setError("");
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
    setTime(`${pad(now.getHours())}:${pad(now.getMinutes())}`);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (type === "MILK" && (!ml || Number(ml) <= 0)) {
      setError("请输入有效的奶量");
      return;
    }
    if (type === "SOLID" && !food.trim()) {
      setError("请输入食物名称");
      return;
    }

    const [hours, minutes] = time.split(":").map(Number);
    const now = new Date();
    const feedingTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hours,
      minutes
    );

    const body: Record<string, unknown> = {
      type,
      time: feedingTime.toISOString(),
    };

    if (type === "MILK") {
      body.ml = Number(ml);
    } else {
      body.food = food.trim();
      if (amount.trim()) {
        body.amount = amount.trim();
      }
    }

    try {
      const res = await fetch("/api/feeding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "保存失败，请重试");
        return;
      }

      setOpen(false);
      resetForm();
      startTransition(() => {
        router.refresh();
      });
    } catch {
      setError("网络错误，请重试");
    }
  }

  return (
    <>
      {/* Floating action button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 w-14 h-14 bg-[var(--primary)] text-white rounded-full shadow-lg flex items-center justify-center text-2xl active:bg-[var(--primary-dark)] transition-colors z-40"
        aria-label="添加喂养记录"
      >
        +
      </button>

      {/* Modal overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="bg-white w-full max-w-lg rounded-t-2xl p-6 animate-[slideUp_0.2s_ease-out]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">添加喂养记录</h2>
              <button
                onClick={() => {
                  setOpen(false);
                  resetForm();
                }}
                className="text-gray-400 text-xl leading-none p-1"
                aria-label="关闭"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type selector */}
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => setType("MILK")}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                    type === "MILK"
                      ? "bg-white text-[var(--primary)] shadow-sm"
                      : "text-gray-500"
                  }`}
                >
                  🍼 奶
                </button>
                <button
                  type="button"
                  onClick={() => setType("SOLID")}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                    type === "SOLID"
                      ? "bg-white text-[var(--primary)] shadow-sm"
                      : "text-gray-500"
                  }`}
                >
                  🥣 辅食
                </button>
              </div>

              {/* Milk input */}
              {type === "MILK" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    奶量 (ml)
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={ml}
                    onChange={(e) => setMl(e.target.value)}
                    placeholder="例如: 120"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-light)] focus:border-[var(--primary)]"
                  />
                </div>
              )}

              {/* Solid food inputs */}
              {type === "SOLID" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      食物名称
                    </label>
                    <input
                      type="text"
                      value={food}
                      onChange={(e) => setFood(e.target.value)}
                      placeholder="例如: 米糊"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-light)] focus:border-[var(--primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      份量（选填）
                    </label>
                    <input
                      type="text"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="例如: 半碗"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-light)] focus:border-[var(--primary)]"
                    />
                  </div>
                </>
              )}

              {/* Time picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  时间
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-light)] focus:border-[var(--primary)]"
                />
              </div>

              {/* Error */}
              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3 bg-[var(--primary)] text-white font-medium rounded-xl active:bg-[var(--primary-dark)] transition-colors disabled:opacity-50"
              >
                {isPending ? "保存中..." : "保存"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
