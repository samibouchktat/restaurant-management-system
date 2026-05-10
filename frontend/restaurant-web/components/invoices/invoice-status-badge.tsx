import type { InvoiceStatus } from "@/types/invoice";

type InvoiceStatusBadgeProps = {
  status: InvoiceStatus;
};

const config: Record<
  InvoiceStatus,
  {
    label: string;
    bg: string;
    color: string;
    border: string;
  }
> = {
  DRAFT: {
    label: "Brouillon",
    bg: "var(--color-warning-bg)",
    color: "var(--color-warning)",
    border: "var(--color-warning)",
  },
  PAID: {
    label: "Payée",
    bg: "var(--color-success-bg)",
    color: "var(--color-success)",
    border: "var(--color-success)",
  },
  CANCELLED: {
    label: "Annulée",
    bg: "var(--color-danger-bg)",
    color: "var(--color-danger)",
    border: "var(--color-danger)",
  },
};

export function InvoiceStatusBadge({ status }: InvoiceStatusBadgeProps) {
  const current = config[status];

  return (
    <span
      className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-black"
      style={{
        background: current.bg,
        color: current.color,
        borderColor: current.border,
      }}
    >
      <span
        className="h-2 w-2 rounded-full"
        style={{ background: current.color }}
      />
      {current.label}
    </span>
  );
}