import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";

const MENU_ITEMS = [
  { icon: "📸", label: "成长相册", href: "/photos", enabled: true },
  { icon: "🥣", label: "辅食管理", href: "/food", enabled: true },
  { icon: "🎯", label: "里程碑", href: "/milestones", enabled: true },
  { icon: "💌", label: "时间胶囊", href: "/capsule", enabled: true },
  { icon: "💉", label: "疫苗日历", href: "/vaccines", enabled: true },
  { icon: "🌡️", label: "健康记录", href: "/health", enabled: true },
  { icon: "⚙️", label: "设置", href: null, enabled: false },
];

function ChevronRight() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#9ca3af"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

export default function MorePage() {
  return (
    <div className="pb-8">
      <PageHeader title="更多" subtitle="功能导航" />
      <div className="px-4 mt-2">
        <Card className="p-0 overflow-hidden">
          {MENU_ITEMS.map((item, idx) => {
            const isLast = idx === MENU_ITEMS.length - 1;
            const content = (
              <div
                className={`flex items-center justify-between px-4 py-3.5 ${
                  !isLast ? "border-b border-gray-100" : ""
                } ${
                  item.enabled
                    ? "active:bg-gray-50 transition-colors"
                    : "opacity-60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-sm font-medium text-gray-900">
                    {item.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {!item.enabled && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">
                      即将推出
                    </span>
                  )}
                  <ChevronRight />
                </div>
              </div>
            );

            if (item.href && item.enabled) {
              return (
                <Link key={item.label} href={item.href} className="block">
                  {content}
                </Link>
              );
            }

            return (
              <div key={item.label} className="cursor-default">
                {content}
              </div>
            );
          })}
        </Card>
      </div>
    </div>
  );
}
