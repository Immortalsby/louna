"use client";

import { useActionState, useRef } from "react";
import { addFood } from "./actions";

const initialState = { error: "", success: false };

export function AddFood() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await addFood(formData);
      if (result?.success) {
        formRef.current?.reset();
        return { error: "", success: true };
      }
      return { error: result?.error ?? "添加失败", success: false };
    },
    initialState
  );

  return (
    <form ref={formRef} action={formAction} className="flex gap-2">
      <input
        type="text"
        name="food"
        placeholder="输入新食物名称..."
        required
        className="flex-1 px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-light)] focus:border-transparent"
      />
      <button
        type="submit"
        disabled={pending}
        className="px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-sm font-medium hover:bg-[var(--primary-dark)] disabled:opacity-50 transition-colors whitespace-nowrap"
      >
        {pending ? "添加中..." : "开始观察"}
      </button>
      {state.error && (
        <p className="text-red-500 text-xs mt-1">{state.error}</p>
      )}
    </form>
  );
}
