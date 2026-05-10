import type { TableStatus } from "@/types/table";

type TableStatusBadgeProps = {
  status: TableStatus;
};

const statusConfig: Record<
  TableStatus,
  {
    label: string;
    bg: string;
    color: string;
    border: string;
  }
> = {
  LIBRE: {
    label: "Libre",
    bg: "var(--color-success-bg)",
    color: "var(--color-success)",
    border: "var(--color-success)",
  },
  OCCUPEE: {
    label: "Occupée",
    bg: "var(--color-danger-bg)",
    color: "var(--color-danger)",
    border: "var(--color-danger)",
  },
  EN_ATTENTE: {
    label: "En attente",
    bg: "var(--color-warning-bg)",
    color: "var(--color-warning)",
    border: "var(--color-warning)",
  },
};

export function TableStatusBadge({ status }: TableStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-black"
      style={{
        background: config.bg,
        color: config.color,
        borderColor: config.border,
      }}
    >
      <span
        className="h-2 w-2 rounded-full"
        style={{ background: config.color }}
      />
      {config.label}
    </span>
  );
}