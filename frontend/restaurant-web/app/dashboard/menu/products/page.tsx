"use client";

import { FormEvent, useMemo, useState } from "react";
import { PackagePlus, Pencil, RefreshCcw, Search, Utensils, X } from "lucide-react";
import { StatusPill } from "@/components/ui/status-pill";
import { getApiErrorMessage } from "@/lib/api";
import { useCategories } from "@/features/categories/use-categories";
import type { ProductResponse } from "@/types/product";
import {
  useActivateProduct,
  useCreateProduct,
  useDeactivateProduct,
  useMarkProductAsAvailable,
  useMarkProductAsUnavailable,
  useProducts,
  useUpdateProduct,
} from "@/features/products/use-products";

function formatPrice(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "MAD",
  }).format(value);
}

export default function ProductsDashboardPage() {
  const productsQuery = useProducts();
  const categoriesQuery = useCategories();

  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const activateProductMutation = useActivateProduct();
  const deactivateProductMutation = useDeactivateProduct();
  const markAvailableMutation = useMarkProductAsAvailable();
  const markUnavailableMutation = useMarkProductAsUnavailable();

  const [editingProduct, setEditingProduct] = useState<ProductResponse | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [available, setAvailable] = useState(true);

  const [search, setSearch] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState<
    "ALL" | "AVAILABLE" | "UNAVAILABLE" | "INACTIVE"
  >("ALL");

  const products = productsQuery.data ?? [];
  const activeCategories = (categoriesQuery.data ?? []).filter(
    (category) => category.active
  );

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const normalizedSearch = search.trim().toLowerCase();

      const matchesSearch =
        !normalizedSearch ||
        product.name.toLowerCase().includes(normalizedSearch) ||
        product.categoryName.toLowerCase().includes(normalizedSearch);

      const matchesAvailability =
        availabilityFilter === "ALL" ||
        (availabilityFilter === "AVAILABLE" &&
          product.active &&
          product.available) ||
        (availabilityFilter === "UNAVAILABLE" &&
          product.active &&
          !product.available) ||
        (availabilityFilter === "INACTIVE" && !product.active);

      return matchesSearch && matchesAvailability;
    });
  }, [products, search, availabilityFilter]);

  const stats = useMemo(() => {
    return {
      total: products.length,
      available: products.filter((product) => product.active && product.available).length,
      unavailable: products.filter((product) => product.active && !product.available).length,
      inactive: products.filter((product) => !product.active).length,
    };
  }, [products]);

  function resetProductForm() {
    setEditingProduct(null);
    setName("");
    setDescription("");
    setPrice("");
    setImageUrl("");
    setCategoryId("");
    setAvailable(true);
  }

  function startEditProduct(product: ProductResponse) {
    setEditingProduct(product);
    setName(product.name);
    setDescription(product.description ?? "");
    setPrice(String(product.price));
    setImageUrl(product.imageUrl ?? "");
    setCategoryId(String(product.categoryId));
    setAvailable(product.available);
  }

  function handleSubmitProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = {
      name: name.trim(),
      description: description.trim() || undefined,
      price: Number(price),
      imageUrl: imageUrl.trim() || undefined,
      categoryId: Number(categoryId),
      available,
    };

    if (editingProduct) {
      updateProductMutation.mutate(
        {
          productId: editingProduct.id,
          request: payload,
        },
        {
          onSuccess: resetProductForm,
        }
      );
      return;
    }

    createProductMutation.mutate(payload, {
      onSuccess: resetProductForm,
    });
  }

  function handleToggleActive(productId: number, active: boolean) {
    if (active) {
      deactivateProductMutation.mutate(productId);
      return;
    }

    activateProductMutation.mutate(productId);
  }

  function handleToggleAvailable(
    productId: number,
    active: boolean,
    isAvailable: boolean
  ) {
    if (!active) return;

    if (isAvailable) {
      markUnavailableMutation.mutate(productId);
      return;
    }

    markAvailableMutation.mutate(productId);
  }

  const mutationError =
    createProductMutation.error ||
    updateProductMutation.error ||
    activateProductMutation.error ||
    deactivateProductMutation.error ||
    markAvailableMutation.error ||
    markUnavailableMutation.error;

  const isSubmitting =
    createProductMutation.isPending || updateProductMutation.isPending;

  return (
    <div className="space-y-8">
      <section className="premium-card p-8">
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
              <Utensils size={16} />
              Produits
            </div>

            <h1
              className="mt-5 text-4xl font-black tracking-tight"
              style={{ color: "var(--color-text)" }}
            >
              Produits du menu
            </h1>

            <p className="mt-3 max-w-2xl" style={{ color: "var(--color-muted)" }}>
              Créez, modifiez et contrôlez les produits visibles dans le menu
              public QR.
            </p>
          </div>

          <button
            onClick={() => productsQuery.refetch()}
            className="premium-button-secondary inline-flex items-center justify-center gap-2 px-5 py-3 text-sm"
          >
            <RefreshCcw size={16} />
            Actualiser
          </button>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <StatCard label="Total produits" value={stats.total} />
          <StatCard label="Disponibles" value={stats.available} accent="success" />
          <StatCard label="Indisponibles" value={stats.unavailable} accent="warning" />
          <StatCard label="Inactifs" value={stats.inactive} accent="danger" />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[440px_1fr]">
        <form onSubmit={handleSubmitProduct} className="premium-card p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-2xl"
                style={{
                  background: "var(--color-card-soft)",
                  color: "var(--color-primary)",
                }}
              >
                {editingProduct ? <Pencil size={20} /> : <PackagePlus size={20} />}
              </div>

              <div>
                <h2 className="text-xl font-black" style={{ color: "var(--color-text)" }}>
                  {editingProduct ? "Modifier produit" : "Nouveau produit"}
                </h2>
                <p className="text-sm" style={{ color: "var(--color-muted)" }}>
                  {editingProduct
                    ? `Modification de ${editingProduct.name}`
                    : "Ajoutez un produit au menu."}
                </p>
              </div>
            </div>

            {editingProduct && (
              <button
                type="button"
                onClick={resetProductForm}
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
                Nom du produit
              </label>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="premium-input mt-2 w-full px-4 py-3"
                placeholder="Ex: Tagine Poulet"
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
                placeholder="Description courte du produit"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-black" style={{ color: "var(--color-text)" }}>
                  Prix
                </label>
                <input
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  type="number"
                  min="0.01"
                  step="0.01"
                  className="premium-input mt-2 w-full px-4 py-3"
                  placeholder="85.00"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-black" style={{ color: "var(--color-text)" }}>
                  Catégorie
                </label>
                <select
                  value={categoryId}
                  onChange={(event) => setCategoryId(event.target.value)}
                  className="premium-input mt-2 w-full px-4 py-3"
                  required
                >
                  <option value="">Choisir</option>
                  {activeCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}

                  {editingProduct &&
                    !activeCategories.some(
                      (category) => category.id === editingProduct.categoryId
                    ) && (
                      <option value={editingProduct.categoryId}>
                        {editingProduct.categoryName} — inactive
                      </option>
                    )}
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-black" style={{ color: "var(--color-text)" }}>
                Image URL
              </label>
              <input
                value={imageUrl}
                onChange={(event) => setImageUrl(event.target.value)}
                className="premium-input mt-2 w-full px-4 py-3"
                placeholder="/images/products/tagine-poulet.jpg"
              />
            </div>

            <label
              className="flex items-center justify-between rounded-2xl border p-4"
              style={{
                borderColor: "var(--color-border)",
                background: "var(--color-card-soft)",
              }}
            >
              <span>
                <span className="block text-sm font-black" style={{ color: "var(--color-text)" }}>
                  Disponible
                </span>
                <span className="text-xs" style={{ color: "var(--color-muted)" }}>
                  Visible dans le menu client QR.
                </span>
              </span>

              <input
                type="checkbox"
                checked={available}
                onChange={(event) => setAvailable(event.target.checked)}
                className="h-5 w-5"
              />
            </label>

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
              disabled={isSubmitting || activeCategories.length === 0}
              className="premium-button-primary w-full px-5 py-3 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? "Enregistrement..."
                : editingProduct
                ? "Enregistrer les modifications"
                : "Créer le produit"}
            </button>
          </div>
        </form>

        <section className="space-y-5">
          <div className="premium-card p-5">
            <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--color-muted)" }}
                />

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Rechercher un produit ou une catégorie..."
                  className="premium-input w-full px-12 py-3"
                />
              </div>

              <select
                value={availabilityFilter}
                onChange={(event) =>
                  setAvailabilityFilter(
                    event.target.value as
                      | "ALL"
                      | "AVAILABLE"
                      | "UNAVAILABLE"
                      | "INACTIVE"
                  )
                }
                className="premium-input w-full px-4 py-3"
              >
                <option value="ALL">Tous les produits</option>
                <option value="AVAILABLE">Disponibles</option>
                <option value="UNAVAILABLE">Indisponibles</option>
                <option value="INACTIVE">Inactifs</option>
              </select>
            </div>
          </div>

          {productsQuery.isLoading && (
            <div className="premium-card p-8 text-center">
              <p style={{ color: "var(--color-muted)" }}>Chargement des produits...</p>
            </div>
          )}

          {!productsQuery.isLoading && filteredProducts.length === 0 && (
            <div className="premium-card p-10 text-center">
              <p className="text-lg font-black" style={{ color: "var(--color-text)" }}>
                Aucun produit trouvé
              </p>
              <p className="mt-2" style={{ color: "var(--color-muted)" }}>
                Créez un produit ou modifiez les filtres.
              </p>
            </div>
          )}

          {!productsQuery.isLoading && filteredProducts.length > 0 && (
            <div className="space-y-5">
              {filteredProducts.map((product) => (
                <article key={product.id} className="premium-card overflow-hidden">
                  <div className="grid gap-0 md:grid-cols-[160px_1fr]">
                    <div
                      className="flex min-h-40 items-center justify-center"
                      style={{
                        background:
                          "linear-gradient(135deg, var(--color-card-soft), rgba(200,155,99,0.16))",
                      }}
                    >
                      <Utensils size={42} style={{ color: "var(--color-secondary)" }} />
                    </div>

                    <div className="p-5">
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                          <h3 className="text-xl font-black" style={{ color: "var(--color-text)" }}>
                            {product.name}
                          </h3>

                          <p
                            className="mt-1 text-sm font-bold"
                            style={{ color: "var(--color-primary)" }}
                          >
                            {formatPrice(product.price)}
                          </p>

                          <p className="mt-2 text-sm" style={{ color: "var(--color-muted)" }}>
                            {product.categoryName}
                          </p>

                          {product.description && (
                            <p className="mt-3 text-sm" style={{ color: "var(--color-muted)" }}>
                              {product.description}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <StatusPill
                            label={product.active ? "Actif" : "Inactif"}
                            variant={product.active ? "success" : "danger"}
                          />

                          <StatusPill
                            label={product.available ? "Disponible" : "Indisponible"}
                            variant={product.available ? "info" : "warning"}
                          />
                        </div>
                      </div>

                      <div className="mt-5 grid gap-3 sm:grid-cols-3">
                        <button
                          onClick={() => startEditProduct(product)}
                          className="rounded-2xl px-4 py-3 text-sm font-black transition hover:opacity-90"
                          style={{
                            background: "var(--color-info-bg)",
                            color: "var(--color-info)",
                          }}
                        >
                          Modifier
                        </button>

                        <button
                          onClick={() =>
                            handleToggleAvailable(
                              product.id,
                              product.active,
                              product.available
                            )
                          }
                          disabled={!product.active}
                          className="rounded-2xl px-4 py-3 text-sm font-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                          style={{
                            background: product.available
                              ? "var(--color-warning-bg)"
                              : "var(--color-info-bg)",
                            color: product.available
                              ? "var(--color-warning)"
                              : "var(--color-info)",
                          }}
                        >
                          {product.available ? "Indisponible" : "Disponible"}
                        </button>

                        <button
                          onClick={() => handleToggleActive(product.id, product.active)}
                          className="rounded-2xl px-4 py-3 text-sm font-black transition hover:opacity-90"
                          style={{
                            background: product.active
                              ? "var(--color-danger-bg)"
                              : "var(--color-success-bg)",
                            color: product.active
                              ? "var(--color-danger)"
                              : "var(--color-success)",
                          }}
                        >
                          {product.active ? "Désactiver" : "Activer"}
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
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
  accent?: "text" | "success" | "warning" | "danger";
}) {
  const colorMap = {
    text: "var(--color-text)",
    success: "var(--color-success)",
    warning: "var(--color-warning)",
    danger: "var(--color-danger)",
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