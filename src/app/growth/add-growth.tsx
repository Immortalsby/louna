"use client";

import { useState, useTransition } from "react";
import { addGrowthLog } from "./actions";
import { format } from "date-fns";

export function AddGrowth() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        await addGrowthLog(formData);
        setOpen(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "保存失败");
      }
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-3 py-1.5 rounded-lg bg-[var(--primary)] text-white text-sm font-medium shadow-sm active:scale-95 transition-transform"
      >
        + 记录
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30">
          <div className="w-full max-w-lg bg-white rounded-t-2xl p-5 pb-8 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                添加测量记录
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 text-xl leading-none"
              >
                &times;
              </button>
            </div>

            <form action={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  日期
                </label>
                <input
                  type="date"
                  name="date"
                  defaultValue={format(new Date(), "yyyy-MM-dd")}
                  required
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-light)]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    体重 (kg)
                  </label>
                  <input
                    type="number"
                    name="weight"
                    step="0.01"
                    min="0"
                    placeholder="例: 5.2"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-light)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    身高 (cm)
                  </label>
                  <input
                    type="number"
                    name="height"
                    step="0.1"
                    min="0"
                    placeholder="例: 60.5"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-light)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    头围 (cm)
                  </label>
                  <input
                    type="number"
                    name="head"
                    step="0.1"
                    min="0"
                    placeholder="例: 38.0"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-light)]"
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3 rounded-xl bg-[var(--primary)] text-white font-semibold text-base shadow-sm active:scale-95 transition-transform disabled:opacity-50"
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
