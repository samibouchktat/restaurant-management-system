"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  KeyRound,
  Pencil,
  RefreshCcw,
  Search,
  ShieldCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { StatusPill } from "@/components/ui/status-pill";
import { UserRoleBadge } from "@/components/users/user-role-badge";
import { getApiErrorMessage } from "@/lib/api";
import { getAuthUser } from "@/lib/auth";
import type { UserRole } from "@/types/auth";
import type { UserResponse } from "@/types/user";
import {
  useActivateUser,
  useCreateUser,
  useDeactivateUser,
  useResetUserPassword,
  useUpdateUser,
  useUsers,
} from "@/features/users/use-users";

const roleOptions: { label: string; value: UserRole }[] = [
  { label: "Gérant", value: "GERANT" },
  { label: "Serveur", value: "SERVEUR" },
  { label: "Caissier", value: "CAISSIER" },
  { label: "Admin", value: "ADMIN" },
];

export default function UsersDashboardPage() {
  const currentUser = typeof window !== "undefined" ? getAuthUser() : null;

  const usersQuery = useUsers();
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const activateUserMutation = useActivateUser();
  const deactivateUserMutation = useDeactivateUser();
  const resetPasswordMutation = useResetUserPassword();

  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);
  const [resetTargetUser, setResetTargetUser] = useState<UserResponse | null>(
    null
  );

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState<UserRole>("SERVEUR");
  const [password, setPassword] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | UserRole>("ALL");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "ACTIVE" | "INACTIVE"
  >("ALL");

  const users = usersQuery.data ?? [];

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const normalizedSearch = search.trim().toLowerCase();

      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();

      const matchesSearch =
        !normalizedSearch ||
        fullName.includes(normalizedSearch) ||
        user.internalId.toLowerCase().includes(normalizedSearch) ||
        user.role.toLowerCase().includes(normalizedSearch);

      const matchesRole = roleFilter === "ALL" || user.role === roleFilter;

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && user.active) ||
        (statusFilter === "INACTIVE" && !user.active);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: users.length,
      active: users.filter((user) => user.active).length,
      inactive: users.filter((user) => !user.active).length,
      servers: users.filter((user) => user.role === "SERVEUR").length,
    };
  }, [users]);

  const isAllowed =
    currentUser?.role === "ADMIN" || currentUser?.role === "GERANT";

  function resetForm() {
    setEditingUser(null);
    setFirstName("");
    setLastName("");
    setRole("SERVEUR");
    setPassword("");
  }

  function startEdit(user: UserResponse) {
    setEditingUser(user);
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setRole(user.role);
    setPassword("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (editingUser) {
      updateUserMutation.mutate(
        {
          userId: editingUser.id,
          request: {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            role,
          },
        },
        {
          onSuccess: resetForm,
        }
      );
      return;
    }

    createUserMutation.mutate(
      {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        role,
        password,
      },
      {
        onSuccess: resetForm,
      }
    );
  }

  function handleToggleActive(user: UserResponse) {
    if (user.active) {
      deactivateUserMutation.mutate(user.id);
      return;
    }

    activateUserMutation.mutate(user.id);
  }

  function handleResetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!resetTargetUser) return;

    resetPasswordMutation.mutate(
      {
        userId: resetTargetUser.id,
        request: {
          newPassword,
        },
      },
      {
        onSuccess: () => {
          setResetTargetUser(null);
          setNewPassword("");
        },
      }
    );
  }

  const mutationError =
    createUserMutation.error ||
    updateUserMutation.error ||
    activateUserMutation.error ||
    deactivateUserMutation.error ||
    resetPasswordMutation.error;

  const isSubmitting =
    createUserMutation.isPending || updateUserMutation.isPending;

  if (!isAllowed) {
    return (
      <div className="premium-card p-10 text-center">
        <div
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl"
          style={{
            background: "var(--color-danger-bg)",
            color: "var(--color-danger)",
          }}
        >
          <ShieldCheck size={28} />
        </div>

        <h1
          className="mt-6 text-3xl font-black"
          style={{ color: "var(--color-text)" }}
        >
          Accès réservé
        </h1>

        <p className="mt-3" style={{ color: "var(--color-muted)" }}>
          Cette page est réservée aux comptes ADMIN et GERANT.
        </p>
      </div>
    );
  }

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
              <Users size={16} />
              Comptes internes
            </div>

            <h1
              className="mt-5 text-4xl font-black tracking-tight"
              style={{ color: "var(--color-text)" }}
            >
              Utilisateurs internes
            </h1>

            <p
              className="mt-3 max-w-2xl"
              style={{ color: "var(--color-muted)" }}
            >
              Gérez les comptes gérant, serveur, caissier et admin avec des
              identifiants internes courts.
            </p>
          </div>

          <button
            onClick={() => usersQuery.refetch()}
            className="premium-button-secondary inline-flex items-center justify-center gap-2 px-5 py-3 text-sm"
          >
            <RefreshCcw size={16} />
            Actualiser
          </button>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <StatCard label="Total comptes" value={stats.total} />
          <StatCard label="Actifs" value={stats.active} accent="success" />
          <StatCard label="Inactifs" value={stats.inactive} accent="warning" />
          <StatCard label="Serveurs" value={stats.servers} accent="info" />
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
                {editingUser ? <Pencil size={20} /> : <UserPlus size={20} />}
              </div>

              <div>
                <h2
                  className="text-xl font-black"
                  style={{ color: "var(--color-text)" }}
                >
                  {editingUser ? "Modifier utilisateur" : "Nouvel utilisateur"}
                </h2>

                <p className="text-sm" style={{ color: "var(--color-muted)" }}>
                  {editingUser
                    ? `Modification de ${editingUser.internalId}`
                    : "Créer un compte interne."}
                </p>
              </div>
            </div>

            {editingUser && (
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
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  className="text-sm font-black"
                  style={{ color: "var(--color-text)" }}
                >
                  Prénom
                </label>
                <input
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  className="premium-input mt-2 w-full px-4 py-3"
                  placeholder="Ahmed"
                  required
                />
              </div>

              <div>
                <label
                  className="text-sm font-black"
                  style={{ color: "var(--color-text)" }}
                >
                  Nom
                </label>
                <input
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  className="premium-input mt-2 w-full px-4 py-3"
                  placeholder="Benali"
                  required
                />
              </div>
            </div>

            <div>
              <label
                className="text-sm font-black"
                style={{ color: "var(--color-text)" }}
              >
                Rôle
              </label>
              <select
                value={role}
                onChange={(event) => setRole(event.target.value as UserRole)}
                className="premium-input mt-2 w-full px-4 py-3"
                required
              >
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {!editingUser && (
              <div>
                <label
                  className="text-sm font-black"
                  style={{ color: "var(--color-text)" }}
                >
                  Mot de passe initial
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="premium-input mt-2 w-full px-4 py-3"
                  placeholder="123456"
                  required
                />
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
              disabled={isSubmitting}
              className="premium-button-primary w-full px-5 py-3 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? "Enregistrement..."
                : editingUser
                ? "Enregistrer les modifications"
                : "Créer l’utilisateur"}
            </button>
          </div>
        </form>

        <section className="space-y-5">
          <div className="premium-card p-5">
            <div className="grid gap-4 lg:grid-cols-[1fr_190px_190px]">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--color-muted)" }}
                />

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Rechercher par nom, identifiant ou rôle..."
                  className="premium-input w-full px-12 py-3"
                />
              </div>

              <select
                value={roleFilter}
                onChange={(event) =>
                  setRoleFilter(event.target.value as "ALL" | UserRole)
                }
                className="premium-input w-full px-4 py-3"
              >
                <option value="ALL">Tous les rôles</option>
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value as "ALL" | "ACTIVE" | "INACTIVE"
                  )
                }
                className="premium-input w-full px-4 py-3"
              >
                <option value="ALL">Tous les statuts</option>
                <option value="ACTIVE">Actifs</option>
                <option value="INACTIVE">Inactifs</option>
              </select>
            </div>
          </div>

          {usersQuery.isLoading && (
            <div className="premium-card p-8 text-center">
              <p style={{ color: "var(--color-muted)" }}>
                Chargement des utilisateurs...
              </p>
            </div>
          )}

          {!usersQuery.isLoading && filteredUsers.length === 0 && (
            <div className="premium-card p-10 text-center">
              <p
                className="text-lg font-black"
                style={{ color: "var(--color-text)" }}
              >
                Aucun utilisateur trouvé
              </p>
              <p className="mt-2" style={{ color: "var(--color-muted)" }}>
                Créez un utilisateur ou modifiez les filtres.
              </p>
            </div>
          )}

          {!usersQuery.isLoading && filteredUsers.length > 0 && (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <article key={user.id} className="premium-card p-5">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3
                          className="text-xl font-black"
                          style={{ color: "var(--color-text)" }}
                        >
                          {user.firstName} {user.lastName}
                        </h3>

                        <UserRoleBadge role={user.role} />

                        <StatusPill
                          label={user.active ? "Actif" : "Inactif"}
                          variant={user.active ? "success" : "warning"}
                        />
                      </div>

                      <p
                        className="mt-2 text-sm font-bold"
                        style={{ color: "var(--color-primary)" }}
                      >
                        {user.internalId}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => startEdit(user)}
                        className="rounded-2xl px-4 py-3 text-sm font-black transition hover:opacity-90"
                        style={{
                          background: "var(--color-info-bg)",
                          color: "var(--color-info)",
                        }}
                      >
                        Modifier
                      </button>

                      <button
                        onClick={() => {
                          setResetTargetUser(user);
                          setNewPassword("");
                        }}
                        className="inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-black transition hover:opacity-90"
                        style={{
                          background: "var(--color-card-soft)",
                          color: "var(--color-primary)",
                        }}
                      >
                        <KeyRound size={16} />
                        Reset
                      </button>

                      <button
                        onClick={() => handleToggleActive(user)}
                        className="rounded-2xl px-4 py-3 text-sm font-black transition hover:opacity-90"
                        style={{
                          background: user.active
                            ? "var(--color-warning-bg)"
                            : "var(--color-success-bg)",
                          color: user.active
                            ? "var(--color-warning)"
                            : "var(--color-success)",
                        }}
                      >
                        {user.active ? "Désactiver" : "Activer"}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>

      {resetTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 backdrop-blur-sm">
          <form onSubmit={handleResetPassword} className="premium-card w-full max-w-md p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  className="text-2xl font-black"
                  style={{ color: "var(--color-text)" }}
                >
                  Réinitialiser mot de passe
                </h2>
                <p className="mt-2 text-sm" style={{ color: "var(--color-muted)" }}>
                  Compte : {resetTargetUser.internalId}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setResetTargetUser(null)}
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
                Nouveau mot de passe
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="premium-input mt-2 w-full px-4 py-3"
                placeholder="Nouveau mot de passe"
                required
              />
            </div>

            {resetPasswordMutation.error && (
              <div
                className="mt-4 rounded-2xl border p-4 text-sm font-semibold"
                style={{
                  background: "var(--color-danger-bg)",
                  color: "var(--color-danger)",
                  borderColor: "var(--color-danger)",
                }}
              >
                {getApiErrorMessage(resetPasswordMutation.error)}
              </div>
            )}

            <button
              disabled={resetPasswordMutation.isPending}
              className="premium-button-primary mt-6 w-full px-5 py-3 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {resetPasswordMutation.isPending
                ? "Réinitialisation..."
                : "Réinitialiser"}
            </button>
          </form>
        </div>
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