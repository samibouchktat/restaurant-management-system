import type { TableStatus } from "@/types/table";

type TableStatusBadgeProps = {
  status: TableStatus;
};

const statusConfig: Record<
  TableStatus,
  {
    label: string;
    className: string;
    dotClassName: string;
  }
> = {
  LIBRE: {
    label: "Libre",
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    dotClassName: "bg-emerald-400",
  },
  OCCUPEE: {
    label: "Occupée",
    className: "border-red-500/30 bg-red-500/10 text-red-300",
    dotClassName: "bg-red-400",
  },
  EN_ATTENTE: {
    label: "En attente",
    className: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    dotClassName: "bg-amber-400",
  },
};

export function TableStatusBadge({ status }: TableStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${config.className}`}
    >
      <span className={`h-2 w-2 rounded-full ${config.dotClassName}`} />
      {config.label}
    </span>
  );
}