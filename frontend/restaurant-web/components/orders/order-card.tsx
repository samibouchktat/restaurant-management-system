"use client";

import {
  Clock,
  ReceiptText,
  Server,
  ShoppingBasket,
  Utensils,
} from "lucide-react";
import type { OrderResponse, OrderStatus } from "@/types/order";
import { OrderStatusBadge } from "./order-status-badge";

type OrderCardProps = {
  order: OrderResponse;
  onChangeStatus: (orderId: number, status: OrderStatus) => void;
  isUpdating?: boolean;
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "MAD",
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(value));
}

function getNextStatuses(status: OrderStatus): OrderStatus[] {
  switch (status) {
    case "EN_ATTENTE":
      return ["EN_PREPARATION", "SERVIE"];
    case "EN_PREPARATION":
      return ["SERVIE"];
    default:
      return [];
  }
}

const nextStatusLabel: Record<OrderStatus, string> = {
  EN_ATTENTE: "En attente",
  EN_PREPARATION: "Préparer",
  SERVIE: "Servir",
  FACTUREE: "Facturée",
  ANNULEE: "Annulée",
};

export function OrderCard({
  order,
  onChangeStatus,
  isUpdating = false,
}: OrderCardProps) {
  const nextStatuses = getNextStatuses(order.status);

  return (
    <article className="premium-card overflow-hidden">
      <div
        className="border-b p-6"
        style={{
          borderColor: "var(--color-border)",
          background:
            "linear-gradient(135deg, var(--color-card), var(--color-card-soft))",
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm" style={{ color: "var(--color-muted)" }}>
              Commande
            </p>

            <h2
              className="mt-1 text-3xl font-black"
              style={{ color: "var(--color-text)" }}
            >
              #{order.id}
            </h2>
          </div>

          <OrderStatusBadge status={order.status} />
        </div>

        <div className="mt-5 grid gap-3 text-sm">
          <InfoLine icon={<Utensils size={16} />} text={`Table ${order.tableNumber}`} />

          <InfoLine
            icon={<Server size={16} />}
            text={`${order.serverFullName ?? "Serveur non assigné"} ${
              order.serverInternalId ? `(${order.serverInternalId})` : ""
            }`}
          />

          <InfoLine icon={<Clock size={16} />} text={formatDate(order.orderedAt)} />
        </div>
      </div>

      <div className="p-6">
        <div
          className="mb-4 flex items-center gap-2 text-sm font-black"
          style={{ color: "var(--color-text)" }}
        >
          <ShoppingBasket size={16} />
          Produits commandés
        </div>

        <div className="space-y-3">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-2xl border p-4"
              style={{
                borderColor: "var(--color-border)",
                background: "var(--color-card-soft)",
              }}
            >
              <div>
                <p
                  className="font-black"
                  style={{ color: "var(--color-text)" }}
                >
                  {item.productName}
                </p>

                <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                  {item.quantity} × {formatPrice(item.unitPrice)}
                </p>
              </div>

              <p
                className="font-black"
                style={{ color: "var(--color-accent)" }}
              >
                {formatPrice(item.lineTotal)}
              </p>
            </div>
          ))}
        </div>

        <div
          className="mt-5 flex items-center justify-between rounded-2xl border p-4"
          style={{
            borderColor: "var(--color-success)",
            background: "var(--color-success-bg)",
          }}
        >
          <div
            className="flex items-center gap-2 font-black"
            style={{ color: "var(--color-success)" }}
          >
            <ReceiptText size={18} />
            Total
          </div>

          <p
            className="text-xl font-black"
            style={{ color: "var(--color-success)" }}
          >
            {formatPrice(order.totalAmount)}
          </p>
        </div>

        {nextStatuses.length > 0 && (
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {nextStatuses.map((status) => (
              <button
                key={status}
                type="button"
                disabled={isUpdating}
                onClick={() => onChangeStatus(order.id, status)}
                className="premium-button-primary px-4 py-3 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Passer à : {nextStatusLabel[status]}
              </button>
            ))}
          </div>
        )}

        {nextStatuses.length === 0 && (
          <div
            className="mt-5 rounded-2xl border p-4 text-center text-sm"
            style={{
              borderColor: "var(--color-border)",
              background: "var(--color-card-soft)",
              color: "var(--color-muted)",
            }}
          >
            Aucune action disponible pour ce statut.
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
        className="rounded-xl p-2"
        style={{
          background: "var(--color-card-soft)",
          color: "var(--color-primary)",
        }}
      >
        {icon}
      </span>

      <span style={{ color: "var(--color-muted)" }}>{text}</span>
    </div>
  );
}