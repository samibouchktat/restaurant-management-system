"use client";

import { useMemo } from "react";
import { ClipboardList, RefreshCcw, Search } from "lucide-react";
import { OrderCard } from "@/components/orders/order-card";
import { getApiErrorMessage } from "@/lib/api";
import { getAuthUser } from "@/lib/auth";
import {
  useActiveOrders,
  useActiveOrdersByServer,
  useUpdateOrderStatus,
} from "@/features/orders/use-orders";
import type { OrderStatus } from "@/types/order";

export default function DashboardOrdersPage() {
  const authUser = typeof window !== "undefined" ? getAuthUser() : null;
  const isServer = authUser?.role === "SERVEUR";

  const activeOrdersQuery = useActiveOrders();
  const activeOrdersByServerQuery = useActiveOrdersByServer(
    isServer ? authUser?.id : undefined
  );

  const updateStatusMutation = useUpdateOrderStatus();

  const orders = isServer
    ? activeOrdersByServerQuery.data ?? []
    : activeOrdersQuery.data ?? [];

  const isLoading = isServer
    ? activeOrdersByServerQuery.isLoading
    : activeOrdersQuery.isLoading;

  const error = isServer
    ? activeOrdersByServerQuery.error
    : activeOrdersQuery.error;

  const stats = useMemo(() => {
    return {
      total: orders.length,
      waiting: orders.filter((order) => order.status === "EN_ATTENTE").length,
      preparation: orders.filter((order) => order.status === "EN_PREPARATION")
        .length,
      served: orders.filter((order) => order.status === "SERVIE").length,
    };
  }, [orders]);

  function handleChangeStatus(orderId: number, status: OrderStatus) {
    updateStatusMutation.mutate({
      orderId,
      status,
    });
  }

  function handleRefresh() {
    if (isServer) {
      activeOrdersByServerQuery.refetch();
      return;
    }

    activeOrdersQuery.refetch();
  }

  return (
    <div className="space-y-8">
      <section className="premium-card overflow-hidden p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div
              className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-black"
              style={{
                background: "var(--color-success-bg)",
                color: "var(--color-success)",
                borderColor: "var(--color-success)",
              }}
            >
              <ClipboardList size={16} />
              Commandes actives
            </div>

            <h1
              className="mt-5 text-4xl font-black tracking-tight"
              style={{ color: "var(--color-text)" }}
            >
              Suivi des commandes
            </h1>

            <p
              className="mt-3 max-w-2xl"
              style={{ color: "var(--color-muted)" }}
            >
              Suivez les commandes en cours, consultez les produits commandés et
              mettez à jour leur avancement.
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

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <StatCard label="Total actives" value={stats.total} />
          <StatCard label="En attente" value={stats.waiting} accent="warning" />
          <StatCard
            label="En préparation"
            value={stats.preparation}
            accent="info"
          />
          <StatCard label="Servies" value={stats.served} accent="success" />
        </div>
      </section>

      {isLoading && (
        <div className="premium-card p-8 text-center">
          <p style={{ color: "var(--color-muted)" }}>
            Chargement des commandes actives...
          </p>
        </div>
      )}

      {error && (
        <div
          className="rounded-3xl border p-6"
          style={{
            background: "var(--color-danger-bg)",
            borderColor: "var(--color-danger)",
            color: "var(--color-danger)",
          }}
        >
          {getApiErrorMessage(error)}
        </div>
      )}

      {!isLoading && !error && orders.length === 0 && (
        <div className="premium-card p-10 text-center">
          <div
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{
              background: "var(--color-card-soft)",
              color: "var(--color-muted)",
            }}
          >
            <Search size={24} />
          </div>

          <p
            className="mt-5 text-lg font-black"
            style={{ color: "var(--color-text)" }}
          >
            Aucune commande active
          </p>

          <p className="mt-2" style={{ color: "var(--color-muted)" }}>
            Les nouvelles commandes QR ou serveur apparaîtront ici.
          </p>
        </div>
      )}

      {!isLoading && !error && orders.length > 0 && (
        <section className="grid gap-5 xl:grid-cols-2">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onChangeStatus={handleChangeStatus}
              isUpdating={updateStatusMutation.isPending}
            />
          ))}
        </section>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  accent = "text",
}: {
  label: string;
  value: number;
  accent?: "text" | "warning" | "info" | "success";
}) {
  const colorMap = {
    text: "var(--color-text)",
    warning: "var(--color-warning)",
    info: "var(--color-info)",
    success: "var(--color-success)",
  };

  return (
    <div className="premium-card-soft p-5">
      <p className="text-sm" style={{ color: "var(--color-muted)" }}>
        {label}
      </p>

      <p
        className="mt-2 text-4xl font-black"
        style={{ color: colorMap[accent] }}
      >
        {value}
      </p>
    </div>
  );
}