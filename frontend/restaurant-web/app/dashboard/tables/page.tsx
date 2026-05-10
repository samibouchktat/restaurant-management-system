"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  Edit3,
  LayoutGrid,
  MapPin,
  QrCode,
  RefreshCcw,
  Search,
  Server,
  Table2,
  Users,
  X,
} from "lucide-react";
import { StatusPill } from "@/components/ui/status-pill";
import { TableStatusBadge } from "@/components/tables/table-status-badge";
import { getApiErrorMessage } from "@/lib/api";
import { getAuthUser } from "@/lib/auth";
import {
  useActivateTable,
  useCreateTable,
  useDeactivateTable,
  useTables,
  useTablesByServer,
  useUpdateTable,
  useUpdateTableStatus,
} from "@/features/tables/use-tables";
import { useZones } from "@/features/zones/use-zones";
import type { TableResponse, TableStatus } from "@/types/table";

type StatusFilter = "ALL" | TableStatus;
type ActiveFilter = "ALL" | "ACTIVE" | "INACTIVE";

const statusOptions: { label: string; value: TableStatus }[] = [
  { label: "Libre", value: "LIBRE" },
  { label: "En attente", value: "EN_ATTENTE" },
  { label: "Occupée", value: "OCCUPEE" },
];

export default function DashboardTablesPage() {
  const authUser = typeof window !== "undefined" ? getAuthUser() : null;
  const isServer = authUser?.role === "SERVEUR";

  const tablesQuery = useTables();
  const serverTablesQuery = useTablesByServer(
    isServer ? authUser?.id : undefined
  );
  const zonesQuery = useZones();

  const createTableMutation = useCreateTable();
  const updateTableMutation = useUpdateTable();
  const updateStatusMutation = useUpdateTableStatus();
  const activateTableMutation = useActivateTable();
  const deactivateTableMutation = useDeactivateTable();

  const [editingTable, setEditingTable] = useState<TableResponse | null>(null);

  const [tableNumber, setTableNumber] = useState("");
  const [capacity, setCapacity] = useState("2");
  const [zoneId, setZoneId] = useState("");

  const [search, setSearch] = useState("");
  const [zoneFilter, setZoneFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("ALL");

  const allTables = isServer ? serverTablesQuery.data ?? [] : tablesQuery.data ?? [];
  const zones = zonesQuery.data ?? [];
  const activeZones = zones.filter((zone) => zone.active);

  const isLoading = isServer ? serverTablesQuery.isLoading : tablesQuery.isLoading;
  const error = isServer ? serverTablesQuery.error : tablesQuery.error;

  const filteredTables = useMemo(() => {
    return allTables.filter((table) => {
      const normalizedSearch = search.trim().toLowerCase();

      const matchesSearch =
        !normalizedSearch ||
        table.tableNumber.toLowerCase().includes(normalizedSearch) ||
        table.zoneName.toLowerCase().includes(normalizedSearch) ||
        table.assignedServerInternalId
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        table.assignedServerFullName?.toLowerCase().includes(normalizedSearch);

      const matchesZone = zoneFilter === "ALL" || table.zoneId === Number(zoneFilter);

      const matchesStatus =
        statusFilter === "ALL" || table.status === statusFilter;

      const matchesActive =
        activeFilter === "ALL" ||
        (activeFilter === "ACTIVE" && table.active) ||
        (activeFilter === "INACTIVE" && !table.active);

      return matchesSearch && matchesZone && matchesStatus && matchesActive;
    });
  }, [allTables, search, zoneFilter, statusFilter, activeFilter]);

  const stats = useMemo(() => {
    return {
      total: allTables.length,
      free: allTables.filter((table) => table.status === "LIBRE").length,
      occupied: allTables.filter((table) => table.status === "OCCUPEE").length,
      waiting: allTables.filter((table) => table.status === "EN_ATTENTE").length,
      inactive: allTables.filter((table) => !table.active).length,
    };
  }, [allTables]);

  const canManageTables = authUser?.role === "ADMIN" || authUser?.role === "GERANT";

  function resetForm() {
    setEditingTable(null);
    setTableNumber("");
    setCapacity("2");
    setZoneId("");
  }

  function startEdit(table: TableResponse) {
    setEditingTable(table);
    setTableNumber(table.tableNumber);
    setCapacity(String(table.capacity));
    setZoneId(String(table.zoneId));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = {
      tableNumber: tableNumber.trim(),
      capacity: Number(capacity),
      zoneId: Number(zoneId),
    };

    if (editingTable) {
      updateTableMutation.mutate(
        {
          tableId: editingTable.id,
          request: payload,
        },
        {
          onSuccess: resetForm,
        }
      );
      return;
    }

    createTableMutation.mutate(payload, {
      onSuccess: resetForm,
    });
  }

  function handleChangeStatus(tableId: number, status: TableStatus) {
    updateStatusMutation.mutate({
      tableId,
      status,
    });
  }

  function handleToggleActive(table: TableResponse) {
    if (table.active) {
      deactivateTableMutation.mutate(table.id);
      return;
    }

    activateTableMutation.mutate(table.id);
  }

  function handleRefresh() {
    if (isServer) {
      serverTablesQuery.refetch();
      return;
    }

    tablesQuery.refetch();
  }

  const mutationError =
    createTableMutation.error ||
    updateTableMutation.error ||
    updateStatusMutation.error ||
    activateTableMutation.error ||
    deactivateTableMutation.error ||
    error;

  const isSubmitting =
    createTableMutation.isPending || updateTableMutation.isPending;

  return (
    <div className="space-y-8">
      <section className="premium-card p-8">
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
              <LayoutGrid size={16} />
              Plan de salle
            </div>

            <h1
              className="mt-5 text-4xl font-black tracking-tight"
              style={{ color: "var(--color-text)" }}
            >
              Gestion des tables
            </h1>

            <p
              className="mt-3 max-w-2xl"
              style={{ color: "var(--color-muted)" }}
            >
              Créez, organisez et suivez les tables du restaurant avec leur zone,
              leur statut et leur accès QR client.
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

        <div className="mt-8 grid gap-4 md:grid-cols-5">
          <StatCard label="Total" value={stats.total} />
          <StatCard label="Libres" value={stats.free} accent="success" />
          <StatCard label="Occupées" value={stats.occupied} accent="danger" />
          <StatCard label="En attente" value={stats.waiting} accent="warning" />
          <StatCard label="Inactives" value={stats.inactive} accent="muted" />
        </div>
      </section>

      <section
        className={
          canManageTables
            ? "grid gap-6 xl:grid-cols-[420px_1fr]"
            : "grid gap-6"
        }
      >
        {canManageTables && (
          <form onSubmit={handleSubmit} className="premium-card p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-2xl"
                  style={{
                    background: "var(--color-card-soft)",
                    color: "var(--color-primary)",
                  }}
                >
                  {editingTable ? <Edit3 size={20} /> : <Table2 size={20} />}
                </div>

                <div>
                  <h2
                    className="text-xl font-black"
                    style={{ color: "var(--color-text)" }}
                  >
                    {editingTable ? "Modifier table" : "Nouvelle table"}
                  </h2>

                  <p className="text-sm" style={{ color: "var(--color-muted)" }}>
                    {editingTable
                      ? `Modification de ${editingTable.tableNumber}`
                      : "Ajoutez une table au plan de salle."}
                  </p>
                </div>
              </div>

              {editingTable && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl p-2 transition hover:opacity-80"
                  style={{
                    background: "var(--color-card-soft)",
                    color: "var(--color-muted)",
                  }}
                >
                  <X size={18} />
                </button>
              )}
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label
                  className="text-sm font-black"
                  style={{ color: "var(--color-text)" }}
                >
                  Numéro de table
                </label>
                <input
                  value={tableNumber}
                  onChange={(event) => setTableNumber(event.target.value)}
                  className="premium-input mt-2 w-full px-4 py-3"
                  placeholder="Ex: T-01"
                  required
                />
              </div>

              <div>
                <label
                  className="text-sm font-black"
                  style={{ color: "var(--color-text)" }}
                >
                  Capacité
                </label>
                <input
                  value={capacity}
                  onChange={(event) => setCapacity(event.target.value)}
                  type="number"
                  min={1}
                  className="premium-input mt-2 w-full px-4 py-3"
                  required
                />
              </div>

              <div>
                <label
                  className="text-sm font-black"
                  style={{ color: "var(--color-text)" }}
                >
                  Zone
                </label>
                <select
                  value={zoneId}
                  onChange={(event) => setZoneId(event.target.value)}
                  className="premium-input mt-2 w-full px-4 py-3"
                  required
                >
                  <option value="">Choisir une zone</option>

                  {activeZones.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.name}
                    </option>
                  ))}

                  {editingTable &&
                    !activeZones.some((zone) => zone.id === editingTable.zoneId) && (
                      <option value={editingTable.zoneId}>
                        {editingTable.zoneName} — inactive
                      </option>
                    )}
                </select>
              </div>

              {activeZones.length === 0 && (
                <div
                  className="rounded-2xl border p-4 text-sm font-semibold"
                  style={{
                    background: "var(--color-warning-bg)",
                    color: "var(--color-warning)",
                    borderColor: "var(--color-warning)",
                  }}
                >
                  Créez ou activez au moins une zone avant d’ajouter une table.
                </div>
              )}

              {mutationError && (
                <div
                  className="rounded-2xl border p-4 text-sm font-semibold"
                  style={{
                    background: "var(--color-danger-bg)",
                    color: "var(--color-danger)",
                    borderColor: "var(--color-danger)",
                  }}
                >
                  {getApiErrorMessage(mutationError)}
                </div>
              )}

              <button
                disabled={isSubmitting || activeZones.length === 0}
                className="premium-button-primary w-full px-5 py-3 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting
                  ? "Enregistrement..."
                  : editingTable
                  ? "Enregistrer les modifications"
                  : "Créer la table"}
              </button>
            </div>
          </form>
        )}

        <section className="space-y-5">
          <div className="premium-card p-5">
            <div className="grid gap-4 xl:grid-cols-[1fr_180px_180px_180px]">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--color-muted)" }}
                />

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Rechercher table, zone ou serveur..."
                  className="premium-input w-full px-12 py-3"
                />
              </div>

              <select
                value={zoneFilter}
                onChange={(event) => setZoneFilter(event.target.value)}
                className="premium-input w-full px-4 py-3"
              >
                <option value="ALL">Toutes zones</option>
                {zones.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.name}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as StatusFilter)
                }
                className="premium-input w-full px-4 py-3"
              >
                <option value="ALL">Tous statuts</option>
                <option value="LIBRE">Libres</option>
                <option value="EN_ATTENTE">En attente</option>
                <option value="OCCUPEE">Occupées</option>
              </select>

              <select
                value={activeFilter}
                onChange={(event) =>
                  setActiveFilter(event.target.value as ActiveFilter)
                }
                className="premium-input w-full px-4 py-3"
              >
                <option value="ALL">Toutes</option>
                <option value="ACTIVE">Actives</option>
                <option value="INACTIVE">Inactives</option>
              </select>
            </div>
          </div>

          {isLoading && (
            <div className="premium-card p-8 text-center">
              <p style={{ color: "var(--color-muted)" }}>
                Chargement des tables...
              </p>
            </div>
          )}

          {!isLoading && filteredTables.length === 0 && (
            <div className="premium-card p-10 text-center">
              <p
                className="text-lg font-black"
                style={{ color: "var(--color-text)" }}
              >
                Aucune table trouvée
              </p>
              <p className="mt-2" style={{ color: "var(--color-muted)" }}>
                Créez une table ou modifiez les filtres.
              </p>
            </div>
          )}

          {!isLoading && filteredTables.length > 0 && (
            <div className="grid gap-5 2xl:grid-cols-2">
              {filteredTables.map((table) => (
                <PremiumTableCard
                  key={table.id}
                  table={table}
                  canManage={canManageTables}
                  onEdit={() => startEdit(table)}
                  onToggleActive={() => handleToggleActive(table)}
                  onChangeStatus={handleChangeStatus}
                  isUpdating={
                    updateStatusMutation.isPending ||
                    activateTableMutation.isPending ||
                    deactivateTableMutation.isPending
                  }
                />
              ))}
            </div>
          )}
        </section>
      </section>
    </div>
  );
}

function PremiumTableCard({
  table,
  canManage,
  onEdit,
  onToggleActive,
  onChangeStatus,
  isUpdating,
}: {
  table: TableResponse;
  canManage: boolean;
  onEdit: () => void;
  onToggleActive: () => void;
  onChangeStatus: (tableId: number, status: TableStatus) => void;
  isUpdating: boolean;
}) {
  return (
    <article className="premium-card overflow-hidden">
      <div
        className="border-b p-5"
        style={{
          borderColor: "var(--color-border)",
          background:
            "linear-gradient(135deg, var(--color-card), var(--color-card-soft))",
        }}
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm" style={{ color: "var(--color-muted)" }}>
              Table
            </p>
            <h3
              className="mt-1 text-3xl font-black"
              style={{ color: "var(--color-text)" }}
            >
              {table.tableNumber}
            </h3>
          </div>

          <div className="flex flex-wrap gap-2">
            <TableStatusBadge status={table.status} />

            <StatusPill
              label={table.active ? "Active" : "Inactive"}
              variant={table.active ? "success" : "warning"}
            />
          </div>
        </div>

        <div className="mt-5 grid gap-3 text-sm md:grid-cols-2">
          <InfoLine icon={<Users size={16} />} text={`${table.capacity} places`} />
          <InfoLine icon={<MapPin size={16} />} text={table.zoneName} />

          <InfoLine
            icon={<Server size={16} />}
            text={
              table.assignedServerFullName
                ? `${table.assignedServerFullName} (${table.assignedServerInternalId})`
                : "Aucun serveur affecté"
            }
          />

          <InfoLine
            icon={<QrCode size={16} />}
            text={table.qrCodeUrl ?? `/table/${table.id}`}
          />
        </div>
      </div>

      <div className="p-5">
        <div className="grid gap-2 sm:grid-cols-3">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              disabled={isUpdating || !table.active || table.status === option.value}
              onClick={() => onChangeStatus(table.id, option.value)}
              className="rounded-2xl px-4 py-3 text-sm font-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                background:
                  option.value === "LIBRE"
                    ? "var(--color-success-bg)"
                    : option.value === "EN_ATTENTE"
                    ? "var(--color-warning-bg)"
                    : "var(--color-danger-bg)",
                color:
                  option.value === "LIBRE"
                    ? "var(--color-success)"
                    : option.value === "EN_ATTENTE"
                    ? "var(--color-warning)"
                    : "var(--color-danger)",
              }}
            >
              {option.label}
            </button>
          ))}
        </div>

        {canManage && (
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <button
              onClick={onEdit}
              className="rounded-2xl px-4 py-3 text-sm font-black transition hover:opacity-90"
              style={{
                background: "var(--color-info-bg)",
                color: "var(--color-info)",
              }}
            >
              Modifier
            </button>

            <button
              onClick={onToggleActive}
              disabled={isUpdating}
              className="rounded-2xl px-4 py-3 text-sm font-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                background: table.active
                  ? "var(--color-warning-bg)"
                  : "var(--color-success-bg)",
                color: table.active
                  ? "var(--color-warning)"
                  : "var(--color-success)",
              }}
            >
              {table.active ? "Désactiver" : "Activer"}
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

function InfoLine({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="flex h-9 w-9 items-center justify-center rounded-xl"
        style={{
          background: "var(--color-card-soft)",
          color: "var(--color-primary)",
        }}
      >
        {icon}
      </span>

      <span className="truncate" style={{ color: "var(--color-muted)" }}>
        {text}
      </span>
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
  accent?: "text" | "success" | "warning" | "danger" | "muted";
}) {
  const colorMap = {
    text: "var(--color-text)",
    success: "var(--color-success)",
    warning: "var(--color-warning)",
    danger: "var(--color-danger)",
    muted: "var(--color-muted)",
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