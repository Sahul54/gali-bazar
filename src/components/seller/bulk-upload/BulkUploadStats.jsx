
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

const statsConfig = [
  {
    key: "total",
    label: "Total rows",
    description: "Products in the selected CSV",
    icon: FileSpreadsheet,
    cardClass: "border-gray-200",
    iconClass: "text-gray-400",
    valueClass: "text-gray-900",
  },
  {
    key: "valid",
    label: "Valid rows",
    description: "Ready for server-side validation",
    icon: CheckCircle2,
    cardClass: "border-green-200",
    iconClass: "text-green-600",
    valueClass: "text-green-700",
  },
  {
    key: "invalid",
    label: "Rows with errors",
    description: "Review and fix before importing",
    icon: AlertTriangle,
    cardClass: "border-red-200",
    iconClass: "text-red-500",
    valueClass: "text-red-600",
  },
];

export default function BulkUploadStats({
  totalRows = 0,
  validRows = 0,
  invalidRows = 0,
}) {
  const values = {
    total: totalRows,
    valid: validRows,
    invalid: invalidRows,
  };

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
      {statsConfig.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.key}
            className={`rounded-2xl border bg-white p-5 ${stat.cardClass}`}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">
                {stat.label}
              </p>

              <Icon
                size={20}
                className={stat.iconClass}
              />
            </div>

            <p
              className={`mt-3 text-3xl font-bold ${stat.valueClass}`}
            >
              {values[stat.key]}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              {stat.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}
