"use client";

import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  ClipboardList,
  LayoutGrid,
  LogOut,
  MenuSquare,
  ReceiptText,
  Users,
  Utensils,
} from "lucide-react";
import { clearAuthSession, getAuthUser } from "@/lib/auth";
import type { AuthUser } from "@/types/auth";

type DashboardLayoutProps = {
  children: ReactNode;
};

const navItems = [
  {
    label: "Accueil",
    href: "/dashboard",
    icon: BarChart3,
  },
  {
    label: "Tables",
    href: "/dashboard/tables",
    icon: LayoutGrid,
  },
  {
    label: "Commandes",
    href: "/dashboard/orders",
    icon: ClipboardList,
  },
  {
    label: "Catégories",
    href: "/dashboard/menu/categories",
    icon: MenuSquare,
  },
  {
    label: "Produits",
    href: "/dashboard/menu/products",
    icon: Utensils,
  },
  {
    label: "Factures",
    href: "/dashboard/invoices",
    icon: ReceiptText,
  },
  {
    label: "Utilisateurs",
    href: "/dashboard/users",
    icon: Users,
  },
  {
  label: "Caisse",
  href: "/cashier/invoices",
  icon: ReceiptText,
},
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setUser(getAuthUser());
  }, []);

  function handleLogout() {
    clearAuthSession();
    router.replace("/login");
  }

  return (
    <main className="min-h-screen" style={{ background: "var(--color-background)" }}>
      <aside
        className="fixed left-0 top-0 z-20 h-screen w-72 border-r p-6"
        style={{
          background: "var(--color-card)",
          borderColor: "var(--color-border)",
          boxShadow: "var(--shadow-premium)",
        }}
      >
        <div>
          <p
            className="text-xs font-black uppercase tracking-[0.24em]"
            style={{ color: "var(--color-secondary)" }}
          >
            Premium Restaurant
          </p>

          <h1
            className="mt-3 text-2xl font-black tracking-tight"
            style={{ color: "var(--color-text)" }}
          >
            Restaurant MS
          </h1>

          <p className="mt-2 text-sm" style={{ color: "var(--color-muted)" }}>
            Gestion locale intelligente
          </p>
        </div>

        <nav className="mt-10 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition hover:translate-x-1"
                style={{
                  color: "var(--color-text)",
                }}
              >
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{
                    background: "var(--color-card-soft)",
                    color: "var(--color-primary)",
                  }}
                >
                  <Icon size={17} />
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          {user && (
            <div className="premium-card-soft mb-4 p-4">
              <p
                className="text-sm font-black"
                style={{ color: "var(--color-text)" }}
              >
                {user.firstName} {user.lastName}
              </p>

              <p className="mt-1 text-xs" style={{ color: "var(--color-muted)" }}>
                {user.internalId} — {user.role}
              </p>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black transition hover:opacity-90"
            style={{
              background: "var(--color-danger-bg)",
              color: "var(--color-danger)",
            }}
          >
            <LogOut size={16} />
            Déconnexion
          </button>
        </div>
      </aside>

      <section className="ml-72 min-h-screen p-8">{children}</section>
    </main>
  );
}