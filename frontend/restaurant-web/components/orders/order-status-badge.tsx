import type { OrderStatus } from "@/types/order";

type OrderStatusBadgeProps = {
  status: OrderStatus;
};

const statusConfig: Record<
  OrderStatus,
  {
    label: string;
    colorVar: string;
    bgVar: string;
  }
> = {
  EN_ATTENTE: {
    label: "En attente",
    colorVar: "var(--color-warning)",
    bgVar: "var(--color-warning-bg)",
  },
  EN_PREPARATION: {
    label: "En préparation",
    colorVar: "var(--color-info)",
    bgVar: "var(--color-info-bg)",
  },
  SERVIE: {
    label: "Servie",
    colorVar: "var(--color-success)",
    bgVar: "var(--color-success-bg)",
  },
  FACTUREE: {
    label: "Facturée",
    colorVar: "var(--color-primary)",
    bgVar: "var(--color-card-soft)",
  },
  ANNULEE: {
    label: "Annulée",
    colorVar: "var(--color-danger)",
    bgVar: "var(--color-danger-bg)",
  },
};

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-black"
      style={{
        background: config.bgVar,
        color: config.colorVar,
        borderColor: config.colorVar,
      }}
    >
      <span
        className="h-2 w-2 rounded-full"
        style={{ background: config.colorVar }}
      />
      {config.label}
    </span>
  );
}