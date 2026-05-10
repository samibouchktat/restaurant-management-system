"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  MapPinned,
  MapPin,
  Pencil,
  RefreshCcw,
  Search,
  Server,
  X,
} from "lucide-react";
import { StatusPill } from "@/components/ui/status-pill";
import { getApiErrorMessage } from "@/lib/api";
import type { ZoneResponse } from "@/types/zone";
import type { UserResponse } from "@/types/user";
import {
  useActivateZone,
  useAssignServerToZone,
  useCreateZone,
  useDeactivateZone,
  useRemoveAssignedServer,
  useUpdateZone,
  useZones,
} from "@/features/zones/use-zones";
import { useUsers } from "@/features/users/use-users";

export default function ZonesDashboardPage() {
  const zonesQuery = useZones();
  const usersQuery = useUsers();

  const createZoneMutation = useCreateZone();
  const updateZoneMutation = useUpdateZone();
  const activateZoneMutation = useActivateZone();
  const deactivateZoneMutation = useDeactivateZone();
  const assignServerMutation = useAssignServerToZone();
  const removeServerMutation = useRemoveAssignedServer();

  const [editingZone, setEditingZone] = useState<ZoneResponse | null>(null);
  const [assigningZone, setAssigningZone] = useState<ZoneResponse | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [selectedServerId, setSelectedServerId] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "ACTIVE" | "INACTIVE"
  >("ALL");

  const zones = zonesQuery.data ?? [];
  const users = usersQuery.data ?? [];

  const activeServers = users.filter(
    (user) => user.role === "SERVEUR" && user.active
  );

  const filteredZones = useMemo(() => {
    return zones.filter((zone) => {
      const normalizedSearch = search.trim().toLowerCase();

      const matchesSearch =
        !normalizedSearch ||
        zone.name.toLowerCase().includes(normalizedSearch) ||
        zone.description?.toLowerCase().includes(normalizedSearch) ||
        zone.assignedServerInternalId?.toLowerCase().includes(normalizedSearch) ||
        zone.assignedServerFullName?.toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && zone.active) ||
        (statusFilter === "INACTIVE" && !zone.active);

      return matchesSearch && matchesStatus;
    });
  }, [zones, search, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: zones.length,
      active: zones.filter((zone) => zone.active).length,
      inactive: zones.filter((zone) => !zone.active).length,
      assigned: zones.filter((zone) => zone.assignedServerId).length,
    };
  }, [zones]);

  function resetForm() {
    setEditingZone(null);
    setName("");
    setDescription("");
  }

  function startEdit(zone: ZoneResponse) {
    setEditingZone(zone);
    setName(zone.name);
    setDescription(zone.description ?? "");
  }

  function startAssign(zone: ZoneResponse) {
    setAssigningZone(zone);
    setSelectedServerId(zone.assignedServerId ? String(zone.assignedServerId) : "");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = {
      name: name.trim(),
      description: description.trim() || undefined,
    };

    if (editingZone) {
      updateZoneMutation.mutate(
        {
          zoneId: editingZone.id,
          request: payload,
        },
        {
          onSuccess: resetForm,
        }
      );
      return;
    }

    createZoneMutation.mutate(payload, {
      onSuccess: resetForm,
    });
  }

  function handleToggleZone(zone: ZoneResponse) {
    if (zone.active) {
      deactivateZoneMutation.mutate(zone.id);
      return;
    }

    activateZoneMutation.mutate(zone.id);
  }

  function handleAssignServer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!assigningZone || !selectedServerId) return;

    assignServerMutation.mutate(
      {
        zoneId: assigningZone.id,
        request: {
          serverId: Number(selectedServerId),
        },
      },
      {
        onSuccess: () => {
          setAssigningZone(null);
          setSelectedServerId("");
        },
      }
    );
  }

  function handleRemoveServer(zoneId: number) {
    removeServerMutation.mutate(zoneId);
  }

  const mutationError =
    createZoneMutation.error ||
    updateZoneMutation.error ||
    activateZoneMutation.error ||
    deactivateZoneMutation.error ||
    assignServerMutation.error ||
    removeServerMutation.error;

  const isSubmitting =
    createZoneMutation.isPending || updateZoneMutation.isPending;

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
              <MapPinned size={16} />
              Plan de salle
            </div>

            <h1
              className="mt-5 text-4xl font-black tracking-tight"
              style={{ color: "var(--color-text)" }}
            >
              Zones du restaurant
            </h1>

            <p
              className="mt-3 max-w-2xl"
              style={{ color: "var(--color-muted)" }}
            >
              Créez les zones de salle, affectez les serveurs et organisez le
              plan opérationnel du restaurant.
            </p>
          </div>

          <button
            onClick={() => zonesQuery.refetch()}
            className="premium-button-secondary inline-flex items-center justify-center gap-2 px-5 py-3 text-sm"
          >
            <RefreshCcw size={16} />
            Actualiser
          </button>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <StatCard label="Total zones" value={stats.total} />
          <StatCard label="Actives" value={stats.active} accent="success" />
          <StatCard label="Inactives" value={stats.inactive} accent="warning" />
          <StatCard label="Affectées" value={stats.assigned} accent="info" />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[420px_1fr]">
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
                {editingZone ? <Pencil size={20} /> : <MapPin size={20} />}
              </div>

              <div>
                <h2
                  className="text-xl font-black"
                  style={{ color: "var(--color-text)" }}
                >
                  {editingZone ? "Modifier zone" : "Nouvelle zone"}
                </h2>

                <p className="text-sm" style={{ color: "var(--color-muted)" }}>
                  {editingZone
                    ? `Modification de ${editingZone.name}`
                    : "Ajoutez une zone de salle."}
                </p>
              </div>
            </div>

            {editingZone && (
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
                Nom de la zone
              </label>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="premium-input mt-2 w-full px-4 py-3"
                placeholder="Ex: Terrasse"
                required
              />
            </div>

            <div>
              <label
                className="text-sm font-black"
                style={{ color: "var(--color-text)" }}
              >
                Description
              </label>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="premium-input mt-2 min-h-24 w-full px-4 py-3"
                placeholder="Ex: Zone extérieure du restaurant"
              />
            </div>

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
              disabled={isSubmitting}
              className="premium-button-primary w-full px-5 py-3 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? "Enregistrement..."
                : editingZone
                ? "Enregistrer les modifications"
                : "Créer la zone"}
            </button>
          </div>
        </form>

        <section className="space-y-5">
          <div className="premium-card p-5">
            <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--color-muted)" }}
                />

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Rechercher une zone ou un serveur..."
                  className="premium-input w-full px-12 py-3"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value as "ALL" | "ACTIVE" | "INACTIVE"
                  )
                }
                className="premium-input w-full px-4 py-3"
              >
                <option value="ALL">Toutes les zones</option>
                <option value="ACTIVE">Actives</option>
                <option value="INACTIVE">Inactives</option>
              </select>
            </div>
          </div>

          {zonesQuery.isLoading && (
            <div className="premium-card p-8 text-center">
              <p style={{ color: "var(--color-muted)" }}>
                Chargement des zones...
              </p>
            </div>
          )}

          {!zonesQuery.isLoading && filteredZones.length === 0 && (
            <div className="premium-card p-10 text-center">
              <p
                className="text-lg font-black"
                style={{ color: "var(--color-text)" }}
              >
                Aucune zone trouvée
              </p>
              <p className="mt-2" style={{ color: "var(--color-muted)" }}>
                Créez une zone ou modifiez les filtres.
              </p>
            </div>
          )}

          {!zonesQuery.isLoading && filteredZones.length > 0 && (
            <div className="space-y-5">
              {filteredZones.map((zone) => (
                <ZoneCard
                  key={zone.id}
                  zone={zone}
                  onEdit={() => startEdit(zone)}
                  onAssign={() => startAssign(zone)}
                  onRemoveServer={() => handleRemoveServer(zone.id)}
                  onToggle={() => handleToggleZone(zone)}
                  isRemovingServer={removeServerMutation.isPending}
                />
              ))}
            </div>
          )}
        </section>
      </section>

      {assigningZone && (
        <AssignServerModal
          zone={assigningZone}
          servers={activeServers}
          selectedServerId={selectedServerId}
          onSelectedServerChange={setSelectedServerId}
          onClose={() => {
            setAssigningZone(null);
            setSelectedServerId("");
          }}
          onSubmit={handleAssignServer}
          isSubmitting={assignServerMutation.isPending}
          error={assignServerMutation.error}
        />
      )}
    </div>
  );
}

function ZoneCard({
  zone,
  onEdit,
  onAssign,
  onRemoveServer,
  onToggle,
  isRemovingServer,
}: {
  zone: ZoneResponse;
  onEdit: () => void;
  onAssign: () => void;
  onRemoveServer: () => void;
  onToggle: () => void;
  isRemovingServer: boolean;
}) {
  return (
    <article className="premium-card p-5">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h3
              className="text-xl font-black"
              style={{ color: "var(--color-text)" }}
            >
              {zone.name}
            </h3>

            <StatusPill
              label={zone.active ? "Active" : "Inactive"}
              variant={zone.active ? "success" : "warning"}
            />

            <StatusPill
              label={zone.assignedServerId ? "Serveur affecté" : "Sans serveur"}
              variant={zone.assignedServerId ? "info" : "muted"}
            />
          </div>

          {zone.description && (
            <p className="mt-2 text-sm" style={{ color: "var(--color-muted)" }}>
              {zone.description}
            </p>
          )}

          <div className="mt-4 flex items-center gap-3 text-sm">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{
                background: "var(--color-card-soft)",
                color: "var(--color-primary)",
              }}
            >
              <Server size={16} />
            </span>

            <span style={{ color: "var(--color-muted)" }}>
              {zone.assignedServerFullName
                ? `${zone.assignedServerFullName} (${zone.assignedServerInternalId})`
                : "Aucun serveur affecté"}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
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
            onClick={onAssign}
            disabled={!zone.active}
            className="rounded-2xl px-4 py-3 text-sm font-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              background: "var(--color-card-soft)",
              color: "var(--color-primary)",
            }}
          >
            Affecter
          </button>

          {zone.assignedServerId && (
            <button
              onClick={onRemoveServer}
              disabled={isRemovingServer}
              className="rounded-2xl px-4 py-3 text-sm font-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                background: "var(--color-warning-bg)",
                color: "var(--color-warning)",
              }}
            >
              Retirer
            </button>
          )}

          <button
            onClick={onToggle}
            className="rounded-2xl px-4 py-3 text-sm font-black transition hover:opacity-90"
            style={{
              background: zone.active
                ? "var(--color-warning-bg)"
                : "var(--color-success-bg)",
              color: zone.active
                ? "var(--color-warning)"
                : "var(--color-success)",
            }}
          >
            {zone.active ? "Désactiver" : "Activer"}
          </button>
        </div>
      </div>
    </article>
  );
}

function AssignServerModal({
  zone,
  servers,
  selectedServerId,
  onSelectedServerChange,
  onClose,
  onSubmit,
  isSubmitting,
  error,
}: {
  zone: ZoneResponse;
  servers: UserResponse[];
  selectedServerId: string;
  onSelectedServerChange: (value: string) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isSubmitting: boolean;
  error: unknown;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 backdrop-blur-sm">
      <form onSubmit={onSubmit} className="premium-card w-full max-w-md p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              className="text-2xl font-black"
              style={{ color: "var(--color-text)" }}
            >
              Affecter un serveur
            </h2>

            <p className="mt-2 text-sm" style={{ color: "var(--color-muted)" }}>
              Zone : {zone.name}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 transition hover:opacity-80"
            style={{
              background: "var(--color-card-soft)",
              color: "var(--color-muted)",
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-6">
          <label
            className="text-sm font-black"
            style={{ color: "var(--color-text)" }}
          >
            Serveur actif
          </label>

          <select
            value={selectedServerId}
            onChange={(event) => onSelectedServerChange(event.target.value)}
            className="premium-input mt-2 w-full px-4 py-3"
            required
          >
            <option value="">Choisir un serveur</option>
            {servers.map((server) => (
              <option key={server.id} value={server.id}>
                {server.firstName} {server.lastName} — {server.internalId}
              </option>
            ))}
          </select>
        </div>

        {servers.length === 0 && (
          <div
            className="mt-4 rounded-2xl border p-4 text-sm font-semibold"
            style={{
              background: "var(--color-warning-bg)",
              color: "var(--color-warning)",
              borderColor: "var(--color-warning)",
            }}
          >
            Aucun serveur actif disponible. Créez ou activez un serveur dans la
            page Utilisateurs.
          </div>
        )}

        {error != null && (
          <div
            className="mt-4 rounded-2xl border p-4 text-sm font-semibold"
            style={{
              background: "var(--color-danger-bg)",
              color: "var(--color-danger)",
              borderColor: "var(--color-danger)",
            }}
          >
            {getApiErrorMessage(error)}
          </div>
        )}

        <button
          disabled={isSubmitting || servers.length === 0}
          className="premium-button-primary mt-6 w-full px-5 py-3 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Affectation..." : "Affecter le serveur"}
        </button>
      </form>
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
  accent?: "text" | "success" | "warning" | "info";
}) {
  const colorMap = {
    text: "var(--color-text)",
    success: "var(--color-success)",
    warning: "var(--color-warning)",
    info: "var(--color-info)",
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