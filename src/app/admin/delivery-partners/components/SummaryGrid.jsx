
import SummaryCard from "./SummaryCard";
import { SUMMARY_ITEMS } from "./constants";

export default function SummaryGrid({ summary }) {
  return (
    <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {SUMMARY_ITEMS.map((item) => (
        <SummaryCard
          key={item.key}
          title={item.title}
          value={summary?.[item.key] ?? 0}
          icon={item.icon}
          color={item.color}
        />
      ))}
    </section>
  );
}
