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

  const error = isServer ? activeOrdersByServerQuery.error : activeOrdersQuery.error;

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
      <section className="overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-8 shadow-2xl shadow-black/20">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-300">
              <ClipboardList size={16} />
              Commandes actives
            </div>

            <h1 className="mt-5 text-4xl font-black tracking-tight text-white">
              Suivi des commandes
            </h1>

            <p className="mt-3 max-w-2xl text-slate-400">
              Suivez les commandes en cours, consultez les produits commandés et
              mettez à jour leur avancement.
            </p>
          </div>

          <button
            onClick={handleRefresh}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-800 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700"
          >
            <RefreshCcw size={16} />
            Actualiser
          </button>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <StatCard label="Total actives" value={stats.total} />
          <StatCard label="En attente" value={stats.waiting} accent="amber" />
          <StatCard
            label="En préparation"
            value={stats.preparation}
            accent="sky"
          />
          <StatCard label="Servies" value={stats.served} accent="emerald" />
        </div>
      </section>

      {isLoading && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
          Chargement des commandes actives...
        </div>
      )}

      {error && (
        <div className="rounded-3xl border border-red-800 bg-red-950/40 p-6 text-red-200">
          {getApiErrorMessage(error)}
        </div>
      )}

      {!isLoading && !error && orders.length === 0 && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800 text-slate-400">
            <Search size={24} />
          </div>

          <p className="mt-5 text-lg font-semibold text-white">
            Aucune commande active
          </p>

          <p className="mt-2 text-slate-400">
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
  accent = "slate",
}: {
  label: string;
  value: number;
  accent?: "slate" | "amber" | "sky" | "emerald";
}) {
  const accentClass = {
    slate: "text-white",
    amber: "text-amber-300",
    sky: "text-sky-300",
    emerald: "text-emerald-300",
  }[accent];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className={`mt-2 text-4xl font-black ${accentClass}`}>{value}</p>
    </div>
  );
}