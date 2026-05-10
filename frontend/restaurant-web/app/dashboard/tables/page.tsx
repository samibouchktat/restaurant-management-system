"use client";

import { useMemo, useState } from "react";
import { Filter, LayoutGrid, RefreshCcw, Search } from "lucide-react";
import { TableCard } from "@/components/tables/table-card";
import { getApiErrorMessage } from "@/lib/api";
import { getAuthUser } from "@/lib/auth";
import {
  useFloorPlan,
  useTablesByServer,
  useUpdateTableStatus,
} from "@/features/tables/use-tables";
import type { TableResponse, TableStatus } from "@/types/table";

type StatusFilter = "ALL" | TableStatus;

const statusLabels: Record<StatusFilter, string> = {
  ALL: "Toutes",
  LIBRE: "Libres",
  OCCUPEE: "Occupées",
  EN_ATTENTE: "En attente",
};

export default function DashboardTablesPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [zoneFilter, setZoneFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const authUser = typeof window !== "undefined" ? getAuthUser() : null;
  const isServer = authUser?.role === "SERVEUR";

  const floorPlanQuery = useFloorPlan();
  const serverTablesQuery = useTablesByServer(
    isServer ? authUser?.id : undefined
  );

  const updateStatusMutation = useUpdateTableStatus();

  const tables = isServer
    ? serverTablesQuery.data ?? []
    : floorPlanQuery.data ?? [];

  const isLoading = isServer
    ? serverTablesQuery.isLoading
    : floorPlanQuery.isLoading;

  const error = isServer ? serverTablesQuery.error : floorPlanQuery.error;

  const zones = useMemo(() => {
    const uniqueZones = new Set(tables.map((table) => table.zoneName));
    return Array.from(uniqueZones).sort();
  }, [tables]);

  const filteredTables = useMemo(() => {
    return tables.filter((table) => {
      const matchesStatus =
        statusFilter === "ALL" || table.status === statusFilter;

      const matchesZone = zoneFilter === "ALL" || table.zoneName === zoneFilter;

      const normalizedSearch = search.trim().toLowerCase();

      const matchesSearch =
        !normalizedSearch ||
        table.tableNumber.toLowerCase().includes(normalizedSearch) ||
        table.zoneName.toLowerCase().includes(normalizedSearch) ||
        table.assignedServerInternalId
          ?.toLowerCase()
          .includes(normalizedSearch);

      return matchesStatus && matchesZone && matchesSearch;
    });
  }, [tables, statusFilter, zoneFilter, search]);

  const stats = useMemo(() => {
    return {
      total: tables.length,
      free: tables.filter((table) => table.status === "LIBRE").length,
      occupied: tables.filter((table) => table.status === "OCCUPEE").length,
      waiting: tables.filter((table) => table.status === "EN_ATTENTE").length,
    };
  }, [tables]);

  function handleChangeStatus(tableId: number, status: TableStatus) {
    updateStatusMutation.mutate({
      tableId,
      status,
    });
  }

  function handleRefresh() {
    if (isServer) {
      serverTablesQuery.refetch();
      return;
    }

    floorPlanQuery.refetch();
  }

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-8 shadow-2xl shadow-black/20">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-300">
              <LayoutGrid size={16} />
              Plan de salle
            </div>

            <h1 className="mt-5 text-4xl font-black tracking-tight text-white">
              Gestion des tables
            </h1>

            <p className="mt-3 max-w-2xl text-slate-400">
              Visualisez l’état de la salle en temps réel, filtrez par zone et
              mettez à jour rapidement le statut des tables.
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
          <StatCard label="Total tables" value={stats.total} />
          <StatCard label="Libres" value={stats.free} accent="emerald" />
          <StatCard label="Occupées" value={stats.occupied} accent="red" />
          <StatCard label="En attente" value={stats.waiting} accent="amber" />
        </div>
      </section>

      <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_220px_220px]">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher une table, une zone, un serveur..."
              className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-12 py-3 text-sm text-white outline-none focus:border-emerald-500"
            />
          </div>

          <div className="relative">
            <Filter
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as StatusFilter)
              }
              className="w-full appearance-none rounded-2xl border border-slate-800 bg-slate-950 px-12 py-3 text-sm text-white outline-none focus:border-emerald-500"
            >
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <select
            value={zoneFilter}
            onChange={(event) => setZoneFilter(event.target.value)}
            className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500"
          >
            <option value="ALL">Toutes les zones</option>
            {zones.map((zoneName) => (
              <option key={zoneName} value={zoneName}>
                {zoneName}
              </option>
            ))}
          </select>
        </div>
      </section>

      {isLoading && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
          Chargement du plan de salle...
        </div>
      )}

      {error && (
        <div className="rounded-3xl border border-red-800 bg-red-950/40 p-6 text-red-200">
          {getApiErrorMessage(error)}
        </div>
      )}

      {!isLoading && !error && filteredTables.length === 0 && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center">
          <p className="text-lg font-semibold text-white">
            Aucune table trouvée
          </p>
          <p className="mt-2 text-slate-400">
            Modifiez les filtres ou créez des tables depuis l’API.
          </p>
        </div>
      )}

      {!isLoading && !error && filteredTables.length > 0 && (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredTables.map((table) => (
            <TableCard
              key={table.id}
              table={table}
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
  accent?: "slate" | "emerald" | "red" | "amber";
}) {
  const accentClass = {
    slate: "text-white",
    emerald: "text-emerald-300",
    red: "text-red-300",
    amber: "text-amber-300",
  }[accent];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className={`mt-2 text-4xl font-black ${accentClass}`}>{value}</p>
    </div>
  );
}