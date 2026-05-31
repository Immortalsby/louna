"use client";

import { useActionState, useRef } from "react";
import { addMilestoneFromForm } from "./actions";
import { addMilestone } from "./actions";

const initialState = { error: "", success: false };

const SUGGESTIONS = [
  "翻身（仰→俯）",
  "翻身（俯→仰）",
  "扶坐",
  "独坐",
  "伸手抓物",
  "第一口辅食",
  "第一颗牙",
  "会笑出声",
  "认识妈妈",
  "抓握玩具",
  "踢腿",
  "咿呀学语",
];

interface AddMilestoneProps {
  achievedDescriptions: string[];
}

export function AddMilestone({ achievedDescriptions }: AddMilestoneProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await addMilestoneFromForm(formData);
      if (result?.success) {
        formRef.current?.reset();
        return { error: "", success: true };
      }
      return { error: result?.error ?? "添加失败", success: false };
    },
    initialState
  );

  const achievedSet = new Set(achievedDescriptions);
  const unachieved = SUGGESTIONS.filter((s) => !achievedSet.has(s));

  async function handleSuggestionTap(description: string) {
    await addMilestone(description);
  }

  return (
    <div className="space-y-4">
      {/* Suggestions */}
      {unachieved.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-2">
            常见里程碑（点击标记为已达成）
          </h3>
          <div className="flex flex-wrap gap-2">
            {unachieved.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => handleSuggestionTap(suggestion)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm border border-gray-200 bg-white text-gray-600 hover:bg-[var(--secondary)] hover:border-[var(--primary-light)] hover:text-[var(--primary)] transition-colors"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                </svg>
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Custom milestone form */}
      <div>
        <h3 className="text-sm font-medium text-gray-600 mb-2">
          自定义里程碑
        </h3>
        <form ref={formRef} action={formAction} className="flex gap-2">
          <input
            type="text"
            name="description"
            placeholder="描述宝宝的新成就..."
            required
            className="flex-1 px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-light)] focus:border-transparent"
          />
          <input type="hidden" name="date" value={new Date().toISOString()} />
          <button
            type="submit"
            disabled={pending}
            className="px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-sm font-medium hover:bg-[var(--primary-dark)] disabled:opacity-50 transition-colors whitespace-nowrap"
          >
            {pending ? "添加中..." : "记录"}
          </button>
        </form>
        {state.error && (
          <p className="text-red-500 text-xs mt-1">{state.error}</p>
        )}
      </div>
    </div>
  );
}
