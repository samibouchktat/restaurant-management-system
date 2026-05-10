type StatusPillProps = {
  label: string;
  variant: "success" | "warning" | "danger" | "info" | "muted";
};

export function StatusPill({ label, variant }: StatusPillProps) {
  const config = {
    success: {
      bg: "var(--color-success-bg)",
      color: "var(--color-success)",
      border: "var(--color-success)",
    },
    warning: {
      bg: "var(--color-warning-bg)",
      color: "var(--color-warning)",
      border: "var(--color-warning)",
    },
    danger: {
      bg: "var(--color-danger-bg)",
      color: "var(--color-danger)",
      border: "var(--color-danger)",
    },
    info: {
      bg: "var(--color-info-bg)",
      color: "var(--color-info)",
      border: "var(--color-info)",
    },
    muted: {
      bg: "var(--color-card-soft)",
      color: "var(--color-muted)",
      border: "var(--color-border)",
    },
  }[variant];

  return (
    <span
      className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-black"
      style={{
        background: config.bg,
        color: config.color,
        borderColor: config.border,
      }}
    >
      {label}
    </span>
  );
}