"use client";

import { FormEvent, useMemo, useState } from "react";
import { FolderPlus, Layers3, Pencil, RefreshCcw, X } from "lucide-react";
import { getApiErrorMessage } from "@/lib/api";
import { StatusPill } from "@/components/ui/status-pill";
import type { CategoryResponse } from "@/types/categories";
import {
  useActivateCategory,
  useCategories,
  useCreateCategory,
  useDeactivateCategory,
  useUpdateCategory,
} from "@/features/categories/use-categories";

export default function CategoriesDashboardPage() {
  const categoriesQuery = useCategories();
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const activateCategoryMutation = useActivateCategory();
  const deactivateCategoryMutation = useDeactivateCategory();

  const [editingCategory, setEditingCategory] =
    useState<CategoryResponse | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [displayOrder, setDisplayOrder] = useState("0");

  const categories = categoriesQuery.data ?? [];

  const stats = useMemo(() => {
    return {
      total: categories.length,
      active: categories.filter((category) => category.active).length,
      inactive: categories.filter((category) => !category.active).length,
    };
  }, [categories]);

  function resetForm() {
    setEditingCategory(null);
    setName("");
    setDescription("");
    setDisplayOrder("0");
  }

  function startEdit(category: CategoryResponse) {
    setEditingCategory(category);
    setName(category.name);
    setDescription(category.description ?? "");
    setDisplayOrder(String(category.displayOrder ?? 0));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = {
      name: name.trim(),
      description: description.trim() || undefined,
      displayOrder: Number(displayOrder || 0),
    };

    if (editingCategory) {
      updateCategoryMutation.mutate(
        {
          categoryId: editingCategory.id,
          request: payload,
        },
        {
          onSuccess: resetForm,
        }
      );
      return;
    }

    createCategoryMutation.mutate(payload, {
      onSuccess: resetForm,
    });
  }

  function handleToggleCategory(categoryId: number, active: boolean) {
    if (active) {
      deactivateCategoryMutation.mutate(categoryId);
      return;
    }

    activateCategoryMutation.mutate(categoryId);
  }

  const mutationError =
    createCategoryMutation.error ||
    updateCategoryMutation.error ||
    activateCategoryMutation.error ||
    deactivateCategoryMutation.error;

  const isSubmitting =
    createCategoryMutation.isPending || updateCategoryMutation.isPending;

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
              <Layers3 size={16} />
              Menu
            </div>

            <h1
              className="mt-5 text-4xl font-black tracking-tight"
              style={{ color: "var(--color-text)" }}
            >
              Catégories du menu
            </h1>

            <p className="mt-3 max-w-2xl" style={{ color: "var(--color-muted)" }}>
              Créez, modifiez et organisez les catégories visibles dans le menu
              du restaurant.
            </p>
          </div>

          <button
            onClick={() => categoriesQuery.refetch()}
            className="premium-button-secondary inline-flex items-center justify-center gap-2 px-5 py-3 text-sm"
          >
            <RefreshCcw size={16} />
            Actualiser
          </button>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <StatCard label="Total catégories" value={stats.total} />
          <StatCard label="Actives" value={stats.active} accent="success" />
          <StatCard label="Inactives" value={stats.inactive} accent="warning" />
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
                {editingCategory ? <Pencil size={20} /> : <FolderPlus size={20} />}
              </div>

              <div>
                <h2
                  className="text-xl font-black"
                  style={{ color: "var(--color-text)" }}
                >
                  {editingCategory ? "Modifier catégorie" : "Nouvelle catégorie"}
                </h2>
                <p className="text-sm" style={{ color: "var(--color-muted)" }}>
                  {editingCategory
                    ? `Modification de ${editingCategory.name}`
                    : "Ajoutez une section au menu."}
                </p>
              </div>
            </div>

            {editingCategory && (
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
              <label className="text-sm font-black" style={{ color: "var(--color-text)" }}>
                Nom
              </label>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="premium-input mt-2 w-full px-4 py-3"
                placeholder="Ex: Plats"
                required
              />
            </div>

            <div>
              <label className="text-sm font-black" style={{ color: "var(--color-text)" }}>
                Description
              </label>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="premium-input mt-2 min-h-24 w-full px-4 py-3"
                placeholder="Description courte"
              />
            </div>

            <div>
              <label className="text-sm font-black" style={{ color: "var(--color-text)" }}>
                Ordre d’affichage
              </label>
              <input
                value={displayOrder}
                onChange={(event) => setDisplayOrder(event.target.value)}
                type="number"
                min={0}
                className="premium-input mt-2 w-full px-4 py-3"
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
                : editingCategory
                ? "Enregistrer les modifications"
                : "Créer la catégorie"}
            </button>
          </div>
        </form>

        <section className="premium-card p-6">
          <h2 className="text-xl font-black" style={{ color: "var(--color-text)" }}>
            Liste des catégories
          </h2>

          {categoriesQuery.isLoading && (
            <p className="mt-6" style={{ color: "var(--color-muted)" }}>
              Chargement des catégories...
            </p>
          )}

          {!categoriesQuery.isLoading && categories.length === 0 && (
            <p className="mt-6" style={{ color: "var(--color-muted)" }}>
              Aucune catégorie trouvée.
            </p>
          )}

          <div className="mt-6 space-y-3">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex flex-col gap-4 rounded-3xl border p-5 md:flex-row md:items-center md:justify-between"
                style={{
                  borderColor: "var(--color-border)",
                  background: "var(--color-card-soft)",
                }}
              >
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-black" style={{ color: "var(--color-text)" }}>
                      {category.name}
                    </h3>

                    <StatusPill
                      label={category.active ? "Active" : "Inactive"}
                      variant={category.active ? "success" : "warning"}
                    />

                    <StatusPill label={`Ordre ${category.displayOrder}`} variant="muted" />
                  </div>

                  {category.description && (
                    <p className="mt-2 text-sm" style={{ color: "var(--color-muted)" }}>
                      {category.description}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => startEdit(category)}
                    className="rounded-2xl px-4 py-3 text-sm font-black transition hover:opacity-90"
                    style={{
                      background: "var(--color-info-bg)",
                      color: "var(--color-info)",
                    }}
                  >
                    Modifier
                  </button>

                  <button
                    onClick={() => handleToggleCategory(category.id, category.active)}
                    className="rounded-2xl px-4 py-3 text-sm font-black transition hover:opacity-90"
                    style={{
                      background: category.active
                        ? "var(--color-warning-bg)"
                        : "var(--color-success-bg)",
                      color: category.active
                        ? "var(--color-warning)"
                        : "var(--color-success)",
                    }}
                  >
                    {category.active ? "Désactiver" : "Activer"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </section>
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
  accent?: "text" | "success" | "warning";
}) {
  const colorMap = {
    text: "var(--color-text)",
    success: "var(--color-success)",
    warning: "var(--color-warning)",
  };

  return (
    <div className="premium-card-soft p-5">
      <p className="text-sm" style={{ color: "var(--color-muted)" }}>
        {label}
      </p>
      <p className="mt-2 text-4xl font-black" style={{ color: colorMap[accent] }}>
        {value}
      </p>
    </div>
  );
}