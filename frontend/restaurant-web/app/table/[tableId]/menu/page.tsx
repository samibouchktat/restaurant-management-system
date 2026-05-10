"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Minus, Plus, ShoppingCart, Utensils } from "lucide-react";
import { useMemo, useState } from "react";
import { usePublicMenu } from "@/features/public-menu/use-public-menu";
import {
  addProductToCart,
  getCartCount,
  getCartItems,
  type CartItem,
} from "@/features/cart/cart-storage";
import type { ProductResponse } from "@/types/product";
import { getApiErrorMessage } from "@/lib/api";

function formatPrice(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "MAD",
  }).format(value);
}

export default function PublicTableMenuPage() {
  const params = useParams<{ tableId: string }>();
  const tableId = params.tableId;

  const publicMenuQuery = usePublicMenu();

  const [cartItems, setCartItems] = useState<CartItem[]>(() =>
    getCartItems(tableId)
  );

  const cartCount = useMemo(() => getCartCount(cartItems), [cartItems]);

  function handleAddProduct(product: ProductResponse) {
    const updatedCart = addProductToCart(tableId, product);
    setCartItems(updatedCart);
  }

  return (
    <main
      className="min-h-screen pb-28"
      style={{ background: "var(--color-background)" }}
    >
      <header className="sticky top-0 z-20 border-b backdrop-blur-xl"
        style={{
          background: "rgba(248, 245, 240, 0.88)",
          borderColor: "var(--color-border)",
        }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <p
              className="text-xs font-black uppercase tracking-[0.2em]"
              style={{ color: "var(--color-secondary)" }}
            >
              Menu digital
            </p>

            <h1
              className="mt-1 text-2xl font-black"
              style={{ color: "var(--color-text)" }}
            >
              Table {tableId}
            </h1>
          </div>

          <Link
            href={`/table/${tableId}/cart`}
            className="relative premium-button-primary flex items-center gap-2 px-4 py-3"
          >
            <ShoppingCart size={18} />
            Panier

            {cartCount > 0 && (
              <span
                className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full text-xs font-black"
                style={{
                  background: "var(--color-danger)",
                  color: "white",
                }}
              >
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="premium-card overflow-hidden p-8">
          <div className="flex items-start gap-4">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{
                background: "var(--color-card-soft)",
                color: "var(--color-primary)",
              }}
            >
              <Utensils size={26} />
            </div>

            <div>
              <h2
                className="text-4xl font-black tracking-tight"
                style={{ color: "var(--color-text)" }}
              >
                Découvrez notre menu
              </h2>

              <p className="mt-3 max-w-2xl" style={{ color: "var(--color-muted)" }}>
                Choisissez vos plats, ajoutez-les au panier et envoyez votre
                commande directement à l’équipe du restaurant.
              </p>
            </div>
          </div>
        </div>

        {publicMenuQuery.isLoading && (
          <div className="premium-card mt-6 p-8 text-center">
            <p style={{ color: "var(--color-muted)" }}>
              Chargement du menu...
            </p>
          </div>
        )}

        {publicMenuQuery.error && (
          <div
            className="mt-6 rounded-3xl border p-6"
            style={{
              background: "var(--color-danger-bg)",
              borderColor: "var(--color-danger)",
              color: "var(--color-danger)",
            }}
          >
            {getApiErrorMessage(publicMenuQuery.error)}
          </div>
        )}

        <div className="mt-8 space-y-10">
          {publicMenuQuery.data?.map((category) => (
            <section key={category.id}>
              <div className="mb-4">
                <h3
                  className="text-2xl font-black"
                  style={{ color: "var(--color-text)" }}
                >
                  {category.name}
                </h3>

                {category.description && (
                  <p className="mt-1" style={{ color: "var(--color-muted)" }}>
                    {category.description}
                  </p>
                )}
              </div>

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {category.products.map((product) => (
                  <ProductMenuCard
                    key={product.id}
                    product={product}
                    onAdd={() => handleAddProduct(product)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}

function ProductMenuCard({
  product,
  onAdd,
}: {
  product: ProductResponse;
  onAdd: () => void;
}) {
  return (
    <article className="premium-card overflow-hidden transition hover:-translate-y-1">
      <div
        className="flex h-40 items-center justify-center"
        style={{
          background:
            "linear-gradient(135deg, var(--color-card-soft), rgba(200,155,99,0.16))",
        }}
      >
        <Utensils size={42} style={{ color: "var(--color-secondary)" }} />
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h4
              className="text-lg font-black"
              style={{ color: "var(--color-text)" }}
            >
              {product.name}
            </h4>

            {product.description && (
              <p
                className="mt-2 line-clamp-2 text-sm"
                style={{ color: "var(--color-muted)" }}
              >
                {product.description}
              </p>
            )}
          </div>

          <p
            className="shrink-0 text-lg font-black"
            style={{ color: "var(--color-primary)" }}
          >
            {formatPrice(product.price)}
          </p>
        </div>

        <button
          onClick={onAdd}
          className="premium-button-primary mt-5 flex w-full items-center justify-center gap-2 px-4 py-3"
        >
          <Plus size={18} />
          Ajouter
        </button>
      </div>
    </article>
  );
}