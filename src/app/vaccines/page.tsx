import { PageHeader } from "@/components/ui/page-header";
import { VaccineCalendar } from "./vaccine-calendar";

export default function VaccinesPage() {
  return (
    <div className="pb-8">
      <PageHeader title="💉 疫苗日历" subtitle="法国婴儿疫苗接种计划" />
      <div className="px-4 mt-2">
        <VaccineCalendar />
      </div>
    </div>
  );
}
