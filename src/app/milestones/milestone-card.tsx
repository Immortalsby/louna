"use client";

import { format } from "date-fns";

interface MilestoneCardProps {
  description: string;
  date: string;
  ageLabel: string;
  photoUrl: string | null;
}

export function MilestoneCard({
  description,
  date,
  ageLabel,
  photoUrl,
}: MilestoneCardProps) {
  return (
    <div className="rounded-2xl bg-white shadow-sm border border-gray-100 border-l-4 border-l-[var(--primary)] p-4">
      <div className="flex gap-3">
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[var(--secondary)] flex items-center justify-center overflow-hidden">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={description}
              className="w-full h-full object-cover rounded-xl"
            />
          ) : (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--primary)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 text-sm">{description}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-500">
              {format(new Date(date), "yyyy-MM-dd")}
            </span>
            <span className="text-xs text-[var(--primary)] bg-[var(--secondary)] px-2 py-0.5 rounded-full font-medium">
              {ageLabel}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
