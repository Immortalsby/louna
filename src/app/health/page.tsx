import { PageHeader } from "@/components/ui/page-header";
import { HealthDashboard } from "./health-dashboard";

export default function HealthPage() {
  return (
    <div className="pb-8">
      <PageHeader title="🌡️ 健康记录" subtitle="体温监测与紧急联系" />
      <div className="px-4 mt-2">
        <HealthDashboard />
      </div>
    </div>
  );
}
