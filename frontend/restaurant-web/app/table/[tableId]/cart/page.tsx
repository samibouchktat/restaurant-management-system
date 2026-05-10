"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Minus, Plus, Send, ShoppingBag, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import {
  clearCart,
  getCartItems,
  getCartTotal,
  updateCartItemQuantity,
  type CartItem,
} from "@/features/cart/cart-storage";
import { useCreateQrOrder } from "@/features/orders/use-orders";
import { getApiErrorMessage } from "@/lib/api";

function formatPrice(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "MAD",
  }).format(value);
}

export default function PublicTableCartPage() {
  const params = useParams<{ tableId: string }>();
  const router = useRouter();

  const tableId = params.tableId;

  const [cartItems, setCartItems] = useState<CartItem[]>(() =>
    getCartItems(tableId)
  );

  const createOrderMutation = useCreateQrOrder();

  const totalAmount = useMemo(() => getCartTotal(cartItems), [cartItems]);

  function handleUpdateQuantity(productId: number, quantity: number) {
    const updatedCart = updateCartItemQuantity(tableId, productId, quantity);
    setCartItems(updatedCart);
  }

  function handleClearCart() {
    clearCart(tableId);
    setCartItems([]);
  }

  function handleSubmitOrder() {
    createOrderMutation.mutate(
      {
        tableId: Number(tableId),
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      },
      {
        onSuccess: () => {
          clearCart(tableId);
          setCartItems([]);
          router.push(`/table/${tableId}/menu?order=success`);
        },
      }
    );
  }

  const errorMessage = createOrderMutation.error
    ? getApiErrorMessage(createOrderMutation.error)
    : null;

  return (
    <main
      className="min-h-screen"
      style={{ background: "var(--color-background)" }}
    >
      <section className="mx-auto max-w-4xl px-4 py-8">
        <Link
          href={`/table/${tableId}/menu`}
          className="text-sm font-black"
          style={{ color: "var(--color-primary)" }}
        >
          ← Retour au menu
        </Link>

        <div className="premium-card mt-6 p-8">
          <div className="flex items-start gap-4">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{
                background: "var(--color-card-soft)",
                color: "var(--color-primary)",
              }}
            >
              <ShoppingBag size={26} />
            </div>

            <div>
              <p
                className="text-xs font-black uppercase tracking-[0.2em]"
                style={{ color: "var(--color-secondary)" }}
              >
                Votre commande
              </p>

              <h1
                className="mt-2 text-4xl font-black"
                style={{ color: "var(--color-text)" }}
              >
                Panier — Table {tableId}
              </h1>

              <p className="mt-2" style={{ color: "var(--color-muted)" }}>
                Vérifiez les quantités avant d’envoyer votre commande.
              </p>
            </div>
          </div>
        </div>

        {cartItems.length === 0 && (
          <div className="premium-card mt-6 p-10 text-center">
            <p
              className="text-lg font-black"
              style={{ color: "var(--color-text)" }}
            >
              Votre panier est vide
            </p>

            <p className="mt-2" style={{ color: "var(--color-muted)" }}>
              Ajoutez des produits depuis le menu.
            </p>

            <Link
              href={`/table/${tableId}/menu`}
              className="premium-button-primary mt-6 inline-flex px-5 py-3"
            >
              Voir le menu
            </Link>
          </div>
        )}

        {cartItems.length > 0 && (
          <div className="mt-6 space-y-4">
            {cartItems.map((item) => (
              <CartItemRow
                key={item.productId}
                item={item}
                onIncrement={() =>
                  handleUpdateQuantity(item.productId, item.quantity + 1)
                }
                onDecrement={() =>
                  handleUpdateQuantity(item.productId, item.quantity - 1)
                }
              />
            ))}

            <div className="premium-card p-6">
              <div className="flex items-center justify-between">
                <p
                  className="text-lg font-black"
                  style={{ color: "var(--color-text)" }}
                >
                  Total
                </p>

                <p
                  className="text-3xl font-black"
                  style={{ color: "var(--color-primary)" }}
                >
                  {formatPrice(totalAmount)}
                </p>
              </div>

              {errorMessage && (
                <div
                  className="mt-5 rounded-2xl border p-4 text-sm font-semibold"
                  style={{
                    background: "var(--color-danger-bg)",
                    borderColor: "var(--color-danger)",
                    color: "var(--color-danger)",
                  }}
                >
                  {errorMessage}
                </div>
              )}

              <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
                <button
                  onClick={handleSubmitOrder}
                  disabled={createOrderMutation.isPending}
                  className="premium-button-primary flex items-center justify-center gap-2 px-5 py-4 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Send size={18} />
                  {createOrderMutation.isPending
                    ? "Envoi en cours..."
                    : "Envoyer la commande"}
                </button>

                <button
                  onClick={handleClearCart}
                  className="flex items-center justify-center gap-2 rounded-2xl px-5 py-4 font-black transition hover:opacity-90"
                  style={{
                    background: "var(--color-danger-bg)",
                    color: "var(--color-danger)",
                  }}
                >
                  <Trash2 size={18} />
                  Vider
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

function CartItemRow({
  item,
  onIncrement,
  onDecrement,
}: {
  item: CartItem;
  onIncrement: () => void;
  onDecrement: () => void;
}) {
  return (
    <div className="premium-card flex items-center justify-between gap-4 p-5">
      <div>
        <p className="font-black" style={{ color: "var(--color-text)" }}>
          {item.name}
        </p>

        <p className="mt-1 text-sm" style={{ color: "var(--color-muted)" }}>
          {formatPrice(item.price)} × {item.quantity}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onDecrement}
          className="flex h-10 w-10 items-center justify-center rounded-xl border"
          style={{
            borderColor: "var(--color-border)",
            background: "var(--color-card-soft)",
            color: "var(--color-text)",
          }}
        >
          <Minus size={16} />
        </button>

        <span
          className="w-8 text-center font-black"
          style={{ color: "var(--color-text)" }}
        >
          {item.quantity}
        </span>

        <button
          onClick={onIncrement}
          className="flex h-10 w-10 items-center justify-center rounded-xl border"
          style={{
            borderColor: "var(--color-border)",
            background: "var(--color-card-soft)",
            color: "var(--color-text)",
          }}
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}