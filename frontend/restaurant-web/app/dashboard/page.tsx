"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  ArrowRight,
  ClipboardList,
  LayoutGrid,
  MapPinned,
  Package,
  RefreshCcw,
  Users,
  Utensils,
  WalletCards,
} from "lucide-react";
import { getApiErrorMessage } from "@/lib/api";
import { getAuthUser } from "@/lib/auth";
import { useTables } from "@/features/tables/use-tables";
import { useActiveOrders } from "@/features/orders/use-orders";
import { useProducts } from "@/features/products/use-products";
import { useZones } from "@/features/zones/use-zones";
import { useUsers } from "@/features/users/use-users";

export default function DashboardPage() {
  const authUser = typeof window !== "undefined" ? getAuthUser() : null;

  const tablesQuery = useTables();
  const ordersQuery = useActiveOrders();
  const productsQuery = useProducts();
  const zonesQuery = useZones();
  const usersQuery = useUsers();

  const tables = tablesQuery.data ?? [];
  const orders = ordersQuery.data ?? [];
  const products = productsQuery.data ?? [];
  const zones = zonesQuery.data ?? [];
  const users = usersQuery.data ?? [];

  const isLoading =
    tablesQuery.isLoading ||
    ordersQuery.isLoading ||
    productsQuery.isLoading ||
    zonesQuery.isLoading ||
    usersQuery.isLoading;

  const firstError =
    tablesQuery.error ||
    ordersQuery.error ||
    productsQuery.error ||
    zonesQuery.error ||
    usersQuery.error;

  const stats = useMemo(() => {
    const activeTables = tables.filter((table) => table.active);
    const activeProducts = products.filter((product) => product.active);
    const activeZones = zones.filter((zone) => zone.active);
    const activeUsers = users.filter((user) => user.active);

    return {
      tables: {
        total: tables.length,
        active: activeTables.length,
        free: activeTables.filter((table) => table.status === "LIBRE").length,
        occupied: activeTables.filter((table) => table.status === "OCCUPEE")
          .length,
        waiting: activeTables.filter((table) => table.status === "EN_ATTENTE")
          .length,
      },
      orders: {
        total: orders.length,
        waiting: orders.filter((order) => order.status === "EN_ATTENTE").length,
        preparation: orders.filter(
          (order) => order.status === "EN_PREPARATION"
        ).length,
        served: orders.filter((order) => order.status === "SERVIE").length,
      },
      products: {
        total: products.length,
        active: activeProducts.length,
        available: activeProducts.filter((product) => product.available).length,
        unavailable: activeProducts.filter((product) => !product.available)
          .length,
      },
      zones: {
        total: zones.length,
        active: activeZones.length,
        assigned: activeZones.filter((zone) => zone.assignedServerId).length,
      },
      users: {
        total: users.length,
        active: activeUsers.length,
        servers: activeUsers.filter((user) => user.role === "SERVEUR").length,
        cashiers: activeUsers.filter((user) => user.role === "CAISSIER").length,
      },
    };
  }, [tables, orders, products, zones, users]);

  function handleRefresh() {
    tablesQuery.refetch();
    ordersQuery.refetch();
    productsQuery.refetch();
    zonesQuery.refetch();
    usersQuery.refetch();
  }

  return (
    <div className="space-y-8">
      <section className="premium-card overflow-hidden p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div
              className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-black"
              style={{
                background: "var(--color-info-bg)",
                color: "var(--color-info)",
                borderColor: "var(--color-info)",
              }}
            >
              <Utensils size={16} />
              Restaurant Management System
            </div>

            <h1
              className="mt-5 text-4xl font-black tracking-tight"
              style={{ color: "var(--color-text)" }}
            >
              Tableau de bord
            </h1>

            <p
              className="mt-3 max-w-2xl"
              style={{ color: "var(--color-muted)" }}
            >
              Bienvenue{authUser ? `, ${authUser.firstName}` : ""}. Suivez
              l’activité du restaurant, les commandes, les tables et le menu en
              temps réel.
            </p>
          </div>

          <button
            onClick={handleRefresh}
            className="premium-button-secondary inline-flex items-center justify-center gap-2 px-5 py-3 text-sm"
          >
            <RefreshCcw size={16} />
            Actualiser
          </button>
        </div>

        {isLoading && (
          <div
            className="mt-6 rounded-2xl border p-4 text-sm font-semibold"
            style={{
              background: "var(--color-card-soft)",
              borderColor: "var(--color-border)",
              color: "var(--color-muted)",
            }}
          >
            Chargement des statistiques...
          </div>
        )}

        {firstError && (
          <div
            className="mt-6 rounded-2xl border p-4 text-sm font-semibold"
            style={{
              background: "var(--color-danger-bg)",
              borderColor: "var(--color-danger)",
              color: "var(--color-danger)",
            }}
          >
            {getApiErrorMessage(firstError)}
          </div>
        )}
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <DashboardStatCard
          title="Commandes actives"
          value={stats.orders.total}
          description={`${stats.orders.waiting} en attente · ${stats.orders.preparation} en préparation`}
          icon={<ClipboardList size={22} />}
          accent="info"
          href="/dashboard/orders"
        />

        <DashboardStatCard
          title="Tables actives"
          value={stats.tables.active}
          description={`${stats.tables.free} libres · ${stats.tables.occupied} occupées`}
          icon={<LayoutGrid size={22} />}
          accent="success"
          href="/dashboard/tables"
        />

        <DashboardStatCard
          title="Produits disponibles"
          value={stats.products.available}
          description={`${stats.products.unavailable} indisponibles · ${stats.products.total} total`}
          icon={<Package size={22} />}
          accent="warning"
          href="/dashboard/menu/products"
        />

        <DashboardStatCard
          title="Zones actives"
          value={stats.zones.active}
          description={`${stats.zones.assigned} zones affectées à un serveur`}
          icon={<MapPinned size={22} />}
          accent="primary"
          href="/dashboard/zones"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="premium-card p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2
                className="text-2xl font-black"
                style={{ color: "var(--color-text)" }}
              >
                Vue opérationnelle
              </h2>
              <p className="mt-2 text-sm" style={{ color: "var(--color-muted)" }}>
                Résumé rapide de la salle et des commandes en cours.
              </p>
            </div>

            <span
              className="rounded-full border px-3 py-1 text-xs font-black"
              style={{
                background: "var(--color-success-bg)",
                color: "var(--color-success)",
                borderColor: "var(--color-success)",
              }}
            >
              Live
            </span>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <MiniStat
              label="Tables libres"
              value={stats.tables.free}
              accent="success"
            />
            <MiniStat
              label="Tables occupées"
              value={stats.tables.occupied}
              accent="danger"
            />
            <MiniStat
              label="Tables en attente"
              value={stats.tables.waiting}
              accent="warning"
            />
          </div>

          <div className="mt-6 space-y-3">
            <ProgressLine
              label="Occupation de salle"
              value={stats.tables.occupied}
              total={stats.tables.active || 1}
              accent="danger"
            />
            <ProgressLine
              label="Commandes en préparation"
              value={stats.orders.preparation}
              total={stats.orders.total || 1}
              accent="info"
            />
            <ProgressLine
              label="Disponibilité du menu"
              value={stats.products.available}
              total={stats.products.active || 1}
              accent="success"
            />
          </div>
        </div>

        <div className="premium-card p-6">
          <h2
            className="text-2xl font-black"
            style={{ color: "var(--color-text)" }}
          >
            Accès rapides
          </h2>

          <p className="mt-2 text-sm" style={{ color: "var(--color-muted)" }}>
            Naviguez rapidement vers les modules principaux.
          </p>

          <div className="mt-6 space-y-3">
            <QuickAction
              href="/dashboard/tables"
              icon={<LayoutGrid size={18} />}
              title="Plan de salle"
              description="Voir et gérer les tables"
            />
            <QuickAction
              href="/dashboard/orders"
              icon={<ClipboardList size={18} />}
              title="Commandes"
              description="Suivre les commandes actives"
            />
            <QuickAction
              href="/dashboard/menu/products"
              icon={<Package size={18} />}
              title="Produits"
              description="Gérer le menu et les disponibilités"
            />
            <QuickAction
              href="/dashboard/users"
              icon={<Users size={18} />}
              title="Utilisateurs"
              description="Gérer les comptes internes"
            />
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <SmallInfoCard
          title="Utilisateurs actifs"
          value={stats.users.active}
          description={`${stats.users.servers} serveurs · ${stats.users.cashiers} caissiers`}
          icon={<Users size={20} />}
        />

        <SmallInfoCard
          title="Produits actifs"
          value={stats.products.active}
          description="Produits utilisables dans le système"
          icon={<Package size={20} />}
        />

        <SmallInfoCard
          title="Commandes servies"
          value={stats.orders.served}
          description="En attente de facturation"
          icon={<WalletCards size={20} />}
        />

        <SmallInfoCard
          title="Zones affectées"
          value={stats.zones.assigned}
          description="Zones avec serveur responsable"
          icon={<MapPinned size={20} />}
        />
      </section>
    </div>
  );
}

function DashboardStatCard({
  title,
  value,
  description,
  icon,
  accent,
  href,
}: {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  accent: "primary" | "success" | "warning" | "info";
  href: string;
}) {
  const colors = {
    primary: {
      bg: "var(--color-card-soft)",
      color: "var(--color-primary)",
      border: "var(--color-border)",
    },
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
    info: {
      bg: "var(--color-info-bg)",
      color: "var(--color-info)",
      border: "var(--color-info)",
    },
  }[accent];

  return (
    <Link href={href} className="premium-card block p-6 transition hover:-translate-y-1">
      <div className="flex items-start justify-between gap-4">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-2xl border"
          style={{
            background: colors.bg,
            color: colors.color,
            borderColor: colors.border,
          }}
        >
          {icon}
        </div>

        <ArrowRight size={18} style={{ color: "var(--color-muted)" }} />
      </div>

      <p className="mt-6 text-sm font-bold" style={{ color: "var(--color-muted)" }}>
        {title}
      </p>

      <p
        className="mt-2 text-4xl font-black tracking-tight"
        style={{ color: "var(--color-text)" }}
      >
        {value}
      </p>

      <p className="mt-2 text-sm" style={{ color: "var(--color-muted)" }}>
        {description}
      </p>
    </Link>
  );
}

function MiniStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: "success" | "warning" | "danger" | "info";
}) {
  const colorMap = {
    success: "var(--color-success)",
    warning: "var(--color-warning)",
    danger: "var(--color-danger)",
    info: "var(--color-info)",
  };

  return (
    <div className="premium-card-soft p-5">
      <p className="text-sm" style={{ color: "var(--color-muted)" }}>
        {label}
      </p>

      <p
        className="mt-2 text-3xl font-black"
        style={{ color: colorMap[accent] }}
      >
        {value}
      </p>
    </div>
  );
}

function ProgressLine({
  label,
  value,
  total,
  accent,
}: {
  label: string;
  value: number;
  total: number;
  accent: "success" | "warning" | "danger" | "info";
}) {
  const percent = Math.min(100, Math.round((value / total) * 100));

  const colorMap = {
    success: "var(--color-success)",
    warning: "var(--color-warning)",
    danger: "var(--color-danger)",
    info: "var(--color-info)",
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-bold" style={{ color: "var(--color-text)" }}>
          {label}
        </p>

        <p className="text-sm font-black" style={{ color: colorMap[accent] }}>
          {percent}%
        </p>
      </div>

      <div
        className="mt-2 h-3 overflow-hidden rounded-full"
        style={{ background: "var(--color-card-soft)" }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${percent}%`,
            background: colorMap[accent],
          }}
        />
      </div>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-4 rounded-3xl border p-4 transition hover:translate-x-1"
      style={{
        background: "var(--color-card-soft)",
        borderColor: "var(--color-border)",
      }}
    >
      <div className="flex items-center gap-4">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-2xl"
          style={{
            background: "var(--color-card)",
            color: "var(--color-primary)",
          }}
        >
          {icon}
        </div>

        <div>
          <p className="font-black" style={{ color: "var(--color-text)" }}>
            {title}
          </p>

          <p className="text-sm" style={{ color: "var(--color-muted)" }}>
            {description}
          </p>
        </div>
      </div>

      <ArrowRight size={16} style={{ color: "var(--color-muted)" }} />
    </Link>
  );
}

function SmallInfoCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="premium-card-soft p-5">
      <div className="flex items-center justify-between gap-4">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-2xl"
          style={{
            background: "var(--color-card)",
            color: "var(--color-primary)",
          }}
        >
          {icon}
        </div>

        <p
          className="text-3xl font-black"
          style={{ color: "var(--color-text)" }}
        >
          {value}
        </p>
      </div>

      <p className="mt-4 font-black" style={{ color: "var(--color-text)" }}>
        {title}
      </p>

      <p className="mt-1 text-sm" style={{ color: "var(--color-muted)" }}>
        {description}
      </p>
    </div>
  );
}