"use client";

import { useState, useTransition } from "react";
import { recordSleepEvent } from "./actions";

interface SleepActionsProps {
  isSleeping: boolean;
}

export function SleepActions({ isSleeping: initialSleeping }: SleepActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [sleeping, setSleeping] = useState(initialSleeping);

  function handleAction(event: "START" | "WAKE") {
    startTransition(async () => {
      await recordSleepEvent(event);
      setSleeping(event === "START");
      setLastAction(event === "START" ? "已记录入睡" : "已记录醒来");
      setTimeout(() => setLastAction(null), 2000);
    });
  }

  return (
    <div className="flex gap-3 px-4 mt-4">
      {sleeping ? (
        <button
          onClick={() => handleAction("WAKE")}
          disabled={isPending}
          className="flex-1 py-3 rounded-xl bg-amber-400 text-white font-semibold text-base shadow-sm active:scale-95 transition-transform disabled:opacity-50"
        >
          {isPending ? "..." : "☀️ 醒了"}
        </button>
      ) : (
        <button
          onClick={() => handleAction("START")}
          disabled={isPending}
          className="flex-1 py-3 rounded-xl bg-indigo-500 text-white font-semibold text-base shadow-sm active:scale-95 transition-transform disabled:opacity-50"
        >
          {isPending ? "..." : "😴 睡了"}
        </button>
      )}
      {lastAction && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-sm px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in">
          {lastAction}
        </div>
      )}
    </div>
  );
}
