import type { UserRole } from "@/types/auth";

type UserRoleBadgeProps = {
  role: UserRole;
};

const roleConfig: Record<
  UserRole,
  {
    label: string;
    bg: string;
    color: string;
    border: string;
  }
> = {
  ADMIN: {
    label: "Admin",
    bg: "var(--color-danger-bg)",
    color: "var(--color-danger)",
    border: "var(--color-danger)",
  },
  GERANT: {
    label: "Gérant",
    bg: "var(--color-info-bg)",
    color: "var(--color-info)",
    border: "var(--color-info)",
  },
  SERVEUR: {
    label: "Serveur",
    bg: "var(--color-success-bg)",
    color: "var(--color-success)",
    border: "var(--color-success)",
  },
  CAISSIER: {
    label: "Caissier",
    bg: "var(--color-warning-bg)",
    color: "var(--color-warning)",
    border: "var(--color-warning)",
  },
};

export function UserRoleBadge({ role }: UserRoleBadgeProps) {
  const config = roleConfig[role];

  return (
    <span
      className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-black"
      style={{
        background: config.bg,
        color: config.color,
        borderColor: config.border,
      }}
    >
      {config.label}
    </span>
  );
}