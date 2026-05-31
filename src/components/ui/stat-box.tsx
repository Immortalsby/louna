interface StatBoxProps {
  value: string | number;
  label: string;
  unit?: string;
  className?: string;
}

export function StatBox({ value, label, unit, className = "" }: StatBoxProps) {
  return (
    <div
      className={`rounded-xl bg-white shadow-sm border border-gray-100 p-3 text-center ${className}`}
    >
      <div className="text-2xl font-bold text-[var(--primary)]">
        {value}
        {unit && (
          <span className="text-sm font-normal text-gray-400 ml-0.5">
            {unit}
          </span>
        )}
      </div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  );
}
