"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  BadgePercent,
  Banknote,
  CreditCard,
  FileText,
  RefreshCcw,
  ReceiptText,
  Search,
  WalletCards,
} from "lucide-react";
import { getApiErrorMessage } from "@/lib/api";
import { StatusPill } from "@/components/ui/status-pill";
import { InvoiceStatusBadge } from "@/components/invoices/invoice-status-badge";
import { useActiveOrders } from "@/features/orders/use-orders";
import {
  useApplyInvoiceDiscount,
  useGenerateInvoiceFromOrder,
  useInvoices,
  useValidateInvoicePayment,
} from "@/features/invoices/use-invoices";
import type { OrderResponse } from "@/types/order";
import type {
  DiscountType,
  InvoiceResponse,
  InvoiceStatus,
  PaymentMode,
} from "@/types/invoice";

function formatPrice(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "MAD",
  }).format(value);
}

function formatDate(value?: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function CashierInvoicesPage() {
  const activeOrdersQuery = useActiveOrders();
  const invoicesQuery = useInvoices();

  const generateInvoiceMutation = useGenerateInvoiceFromOrder();
  const applyDiscountMutation = useApplyInvoiceDiscount();
  const validatePaymentMutation = useValidateInvoicePayment();

  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<
    "ALL" | InvoiceStatus
  >("ALL");
  const [search, setSearch] = useState("");

  const [selectedInvoice, setSelectedInvoice] =
    useState<InvoiceResponse | null>(null);

  const [discountType, setDiscountType] = useState<DiscountType>("NONE");
  const [discountValue, setDiscountValue] = useState("0");
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("ESPECES");

  const activeOrders = activeOrdersQuery.data ?? [];
  const invoices = invoicesQuery.data ?? [];

  const servedOrders = activeOrders.filter((order) => order.status === "SERVIE");

  const invoiceOrderIds = new Set(invoices.map((invoice) => invoice.orderId));
  const servedOrdersWithoutInvoice = servedOrders.filter(
    (order) => !invoiceOrderIds.has(order.id)
  );

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const normalizedSearch = search.trim().toLowerCase();

      const matchesSearch =
        !normalizedSearch ||
        invoice.invoiceNumber.toLowerCase().includes(normalizedSearch) ||
        invoice.tableNumber.toLowerCase().includes(normalizedSearch) ||
        invoice.serverInternalId?.toLowerCase().includes(normalizedSearch) ||
        invoice.serverFullName?.toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        invoiceStatusFilter === "ALL" || invoice.status === invoiceStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [invoices, search, invoiceStatusFilter]);

  const stats = useMemo(() => {
    return {
      servedWithoutInvoice: servedOrdersWithoutInvoice.length,
      totalInvoices: invoices.length,
      draftInvoices: invoices.filter((invoice) => invoice.status === "DRAFT")
        .length,
      paidInvoices: invoices.filter((invoice) => invoice.status === "PAID")
        .length,
      paidAmount: invoices
        .filter((invoice) => invoice.status === "PAID")
        .reduce((sum, invoice) => sum + invoice.totalAmount, 0),
    };
  }, [servedOrdersWithoutInvoice.length, invoices]);

  function handleRefresh() {
    activeOrdersQuery.refetch();
    invoicesQuery.refetch();
  }

  function handleGenerateInvoice(orderId: number) {
    generateInvoiceMutation.mutate(orderId, {
      onSuccess: (invoice) => {
        setSelectedInvoice(invoice);
        setDiscountType(invoice.discountType);
        setDiscountValue(String(invoice.discountValue));
      },
    });
  }

  function openInvoice(invoice: InvoiceResponse) {
    setSelectedInvoice(invoice);
    setDiscountType(invoice.discountType);
    setDiscountValue(String(invoice.discountValue));
    setPaymentMode(invoice.paymentMode ?? "ESPECES");
  }

  function handleApplyDiscount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedInvoice) return;

    applyDiscountMutation.mutate(
      {
        invoiceId: selectedInvoice.id,
        request: {
          discountType,
          discountValue: Number(discountValue || 0),
        },
      },
      {
        onSuccess: (invoice) => {
          setSelectedInvoice(invoice);
          setDiscountType(invoice.discountType);
          setDiscountValue(String(invoice.discountValue));
        },
      }
    );
  }

  function handleValidatePayment() {
    if (!selectedInvoice) return;

    validatePaymentMutation.mutate(
      {
        invoiceId: selectedInvoice.id,
        request: {
          paymentMode,
        },
      },
      {
        onSuccess: (invoice) => {
          setSelectedInvoice(invoice);
        },
      }
    );
  }

  const mutationError =
    generateInvoiceMutation.error ||
    applyDiscountMutation.error ||
    validatePaymentMutation.error;

  return (
    <main className="space-y-8">
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
              <WalletCards size={16} />
              Caisse
            </div>

            <h1
              className="mt-5 text-4xl font-black tracking-tight"
              style={{ color: "var(--color-text)" }}
            >
              Facturation & paiements
            </h1>

            <p className="mt-3 max-w-2xl" style={{ color: "var(--color-muted)" }}>
              Générez les factures depuis les commandes servies, appliquez les
              remises et validez les paiements.
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
          <StatCard
            label="À facturer"
            value={stats.servedWithoutInvoice}
            accent="warning"
          />
          <StatCard label="Factures" value={stats.totalInvoices} />
          <StatCard label="Brouillons" value={stats.draftInvoices} accent="info" />
          <StatCard label="Payées" value={stats.paidInvoices} accent="success" />
          <StatAmount
            label="Montant encaissé"
            value={stats.paidAmount}
            accent="success"
          />
        </div>
      </section>

      {mutationError && (
        <div
          className="rounded-3xl border p-6 text-sm font-semibold"
          style={{
            background: "var(--color-danger-bg)",
            borderColor: "var(--color-danger)",
            color: "var(--color-danger)",
          }}
        >
          {getApiErrorMessage(mutationError)}
        </div>
      )}

      <section className="grid gap-6 2xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <section className="premium-card p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2
                  className="text-2xl font-black"
                  style={{ color: "var(--color-text)" }}
                >
                  Commandes servies
                </h2>
                <p className="mt-2 text-sm" style={{ color: "var(--color-muted)" }}>
                  Commandes prêtes à être facturées.
                </p>
              </div>

              <StatusPill
                label={`${servedOrdersWithoutInvoice.length} en attente`}
                variant="warning"
              />
            </div>

            <div className="mt-6 space-y-4">
              {activeOrdersQuery.isLoading && (
                <p style={{ color: "var(--color-muted)" }}>
                  Chargement des commandes...
                </p>
              )}

              {!activeOrdersQuery.isLoading &&
                servedOrdersWithoutInvoice.length === 0 && (
                  <EmptyState text="Aucune commande servie à facturer." />
                )}

              {servedOrdersWithoutInvoice.map((order) => (
                <ServedOrderCard
                  key={order.id}
                  order={order}
                  onGenerate={() => handleGenerateInvoice(order.id)}
                  isGenerating={generateInvoiceMutation.isPending}
                />
              ))}
            </div>
          </section>

          <section className="premium-card p-6">
            <h2
              className="text-2xl font-black"
              style={{ color: "var(--color-text)" }}
            >
              Liste des factures
            </h2>

            <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_180px]">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--color-muted)" }}
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Rechercher facture, table ou serveur..."
                  className="premium-input w-full px-12 py-3"
                />
              </div>

              <select
                value={invoiceStatusFilter}
                onChange={(event) =>
                  setInvoiceStatusFilter(event.target.value as "ALL" | InvoiceStatus)
                }
                className="premium-input w-full px-4 py-3"
              >
                <option value="ALL">Toutes</option>
                <option value="DRAFT">Brouillons</option>
                <option value="PAID">Payées</option>
                <option value="CANCELLED">Annulées</option>
              </select>
            </div>

            <div className="mt-6 space-y-4">
              {invoicesQuery.isLoading && (
                <p style={{ color: "var(--color-muted)" }}>
                  Chargement des factures...
                </p>
              )}

              {!invoicesQuery.isLoading && filteredInvoices.length === 0 && (
                <EmptyState text="Aucune facture trouvée." />
              )}

              {filteredInvoices.map((invoice) => (
                <InvoiceListCard
                  key={invoice.id}
                  invoice={invoice}
                  isSelected={selectedInvoice?.id === invoice.id}
                  onClick={() => openInvoice(invoice)}
                />
              ))}
            </div>
          </section>
        </div>

        <section className="premium-card p-6">
          {!selectedInvoice && (
            <div className="flex min-h-[520px] items-center justify-center">
              <div className="text-center">
                <div
                  className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl"
                  style={{
                    background: "var(--color-card-soft)",
                    color: "var(--color-primary)",
                  }}
                >
                  <ReceiptText size={30} />
                </div>

                <h2
                  className="mt-6 text-2xl font-black"
                  style={{ color: "var(--color-text)" }}
                >
                  Sélectionnez une facture
                </h2>

                <p className="mt-2 max-w-sm" style={{ color: "var(--color-muted)" }}>
                  Générez ou sélectionnez une facture pour appliquer une remise
                  ou valider le paiement.
                </p>
              </div>
            </div>
          )}

          {selectedInvoice && (
            <InvoiceDetailsPanel
              invoice={selectedInvoice}
              discountType={discountType}
              discountValue={discountValue}
              paymentMode={paymentMode}
              onDiscountTypeChange={setDiscountType}
              onDiscountValueChange={setDiscountValue}
              onPaymentModeChange={setPaymentMode}
              onApplyDiscount={handleApplyDiscount}
              onValidatePayment={handleValidatePayment}
              isDiscountPending={applyDiscountMutation.isPending}
              isPaymentPending={validatePaymentMutation.isPending}
            />
          )}
        </section>
      </section>
    </main>
  );
}

function ServedOrderCard({
  order,
  onGenerate,
  isGenerating,
}: {
  order: OrderResponse;
  onGenerate: () => void;
  isGenerating: boolean;
}) {
  return (
    <article className="premium-card-soft p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-xl font-black" style={{ color: "var(--color-text)" }}>
              Commande #{order.id}
            </h3>
            <StatusPill label="Servie" variant="success" />
          </div>

          <p className="mt-2 text-sm" style={{ color: "var(--color-muted)" }}>
            Table {order.tableNumber} · {order.serverFullName ?? "Serveur non assigné"}
          </p>

          <p className="mt-1 text-sm font-black" style={{ color: "var(--color-primary)" }}>
            {formatPrice(order.totalAmount)}
          </p>
        </div>

        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className="premium-button-primary inline-flex items-center justify-center gap-2 px-5 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FileText size={16} />
          {isGenerating ? "Génération..." : "Générer facture"}
        </button>
      </div>
    </article>
  );
}

function InvoiceListCard({
  invoice,
  isSelected,
  onClick,
}: {
  invoice: InvoiceResponse;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-3xl border p-5 text-left transition hover:-translate-y-0.5"
      style={{
        background: isSelected ? "var(--color-card-soft)" : "var(--color-card)",
        borderColor: isSelected ? "var(--color-primary)" : "var(--color-border)",
      }}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="font-black" style={{ color: "var(--color-text)" }}>
              {invoice.invoiceNumber}
            </h3>
            <InvoiceStatusBadge status={invoice.status} />
          </div>

          <p className="mt-2 text-sm" style={{ color: "var(--color-muted)" }}>
            Table {invoice.tableNumber} · Commande #{invoice.orderId}
          </p>

          <p className="mt-1 text-xs" style={{ color: "var(--color-muted)" }}>
            Générée le {formatDate(invoice.generatedAt)}
          </p>
        </div>

        <p className="text-xl font-black" style={{ color: "var(--color-primary)" }}>
          {formatPrice(invoice.totalAmount)}
        </p>
      </div>
    </button>
  );
}

function InvoiceDetailsPanel({
  invoice,
  discountType,
  discountValue,
  paymentMode,
  onDiscountTypeChange,
  onDiscountValueChange,
  onPaymentModeChange,
  onApplyDiscount,
  onValidatePayment,
  isDiscountPending,
  isPaymentPending,
}: {
  invoice: InvoiceResponse;
  discountType: DiscountType;
  discountValue: string;
  paymentMode: PaymentMode;
  onDiscountTypeChange: (value: DiscountType) => void;
  onDiscountValueChange: (value: string) => void;
  onPaymentModeChange: (value: PaymentMode) => void;
  onApplyDiscount: (event: FormEvent<HTMLFormElement>) => void;
  onValidatePayment: () => void;
  isDiscountPending: boolean;
  isPaymentPending: boolean;
}) {
  const isPaid = invoice.status === "PAID";

  return (
    <div>
      <div className="flex flex-col gap-4 border-b pb-6 md:flex-row md:items-start md:justify-between"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2
              className="text-2xl font-black"
              style={{ color: "var(--color-text)" }}
            >
              {invoice.invoiceNumber}
            </h2>
            <InvoiceStatusBadge status={invoice.status} />
          </div>

          <p className="mt-2 text-sm" style={{ color: "var(--color-muted)" }}>
            Commande #{invoice.orderId} · Table {invoice.tableNumber}
          </p>

          <p className="mt-1 text-sm" style={{ color: "var(--color-muted)" }}>
            Serveur : {invoice.serverFullName ?? "—"}{" "}
            {invoice.serverInternalId ? `(${invoice.serverInternalId})` : ""}
          </p>
        </div>

        <div className="text-left md:text-right">
          <p className="text-sm" style={{ color: "var(--color-muted)" }}>
            Total à payer
          </p>
          <p className="text-3xl font-black" style={{ color: "var(--color-primary)" }}>
            {formatPrice(invoice.totalAmount)}
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <InvoiceAmountLine label="Sous-total" value={invoice.subtotalAmount} />
        <InvoiceAmountLine
          label={`Remise ${
            invoice.discountType === "PERCENTAGE"
              ? `(${invoice.discountValue}%)`
              : invoice.discountType === "FIXED_AMOUNT"
              ? "(montant fixe)"
              : ""
          }`}
          value={-invoice.discountAmount}
          muted
        />
        <InvoiceAmountLine
          label={`TVA (${invoice.taxRate}%)`}
          value={invoice.taxAmount}
        />

        <div
          className="mt-4 flex items-center justify-between rounded-2xl border p-4"
          style={{
            background: "var(--color-success-bg)",
            borderColor: "var(--color-success)",
          }}
        >
          <p className="font-black" style={{ color: "var(--color-success)" }}>
            Total
          </p>
          <p className="text-2xl font-black" style={{ color: "var(--color-success)" }}>
            {formatPrice(invoice.totalAmount)}
          </p>
        </div>
      </div>

      <form onSubmit={onApplyDiscount} className="mt-8 rounded-3xl border p-5"
        style={{
          borderColor: "var(--color-border)",
          background: "var(--color-card-soft)",
        }}
      >
        <div className="flex items-center gap-3">
          <BadgePercent size={20} style={{ color: "var(--color-primary)" }} />
          <h3 className="font-black" style={{ color: "var(--color-text)" }}>
            Remise
          </h3>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_140px]">
          <select
            value={discountType}
            onChange={(event) =>
              onDiscountTypeChange(event.target.value as DiscountType)
            }
            disabled={isPaid}
            className="premium-input w-full px-4 py-3 disabled:opacity-60"
          >
            <option value="NONE">Aucune remise</option>
            <option value="PERCENTAGE">Pourcentage</option>
            <option value="FIXED_AMOUNT">Montant fixe</option>
          </select>

          <input
            type="number"
            min="0"
            step="0.01"
            value={discountValue}
            onChange={(event) => onDiscountValueChange(event.target.value)}
            disabled={isPaid || discountType === "NONE"}
            className="premium-input w-full px-4 py-3 disabled:opacity-60"
          />
        </div>

        <button
          disabled={isPaid || isDiscountPending}
          className="premium-button-secondary mt-4 w-full px-5 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isDiscountPending ? "Application..." : "Appliquer la remise"}
        </button>
      </form>

      <div className="mt-6 rounded-3xl border p-5"
        style={{
          borderColor: "var(--color-border)",
          background: "var(--color-card-soft)",
        }}
      >
        <div className="flex items-center gap-3">
          <Banknote size={20} style={{ color: "var(--color-primary)" }} />
          <h3 className="font-black" style={{ color: "var(--color-text)" }}>
            Paiement
          </h3>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <PaymentModeButton
            label="Espèces"
            icon={<Banknote size={18} />}
            active={paymentMode === "ESPECES"}
            disabled={isPaid}
            onClick={() => onPaymentModeChange("ESPECES")}
          />

          <PaymentModeButton
            label="Carte"
            icon={<CreditCard size={18} />}
            active={paymentMode === "CARTE"}
            disabled={isPaid}
            onClick={() => onPaymentModeChange("CARTE")}
          />

          <PaymentModeButton
            label="Virement"
            icon={<WalletCards size={18} />}
            active={paymentMode === "VIREMENT"}
            disabled={isPaid}
            onClick={() => onPaymentModeChange("VIREMENT")}
          />
        </div>

        <button
          onClick={onValidatePayment}
          disabled={isPaid || isPaymentPending}
          className="premium-button-primary mt-5 w-full px-5 py-4 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPaid
            ? "Paiement déjà validé"
            : isPaymentPending
            ? "Validation..."
            : "Valider le paiement"}
        </button>

        {isPaid && (
          <p className="mt-3 text-center text-sm" style={{ color: "var(--color-muted)" }}>
            Payée le {formatDate(invoice.paidAt)} via {invoice.paymentMode}
          </p>
        )}
      </div>
    </div>
  );
}

function PaymentModeButton({
  label,
  icon,
  active,
  disabled,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-60"
      style={{
        background: active ? "var(--color-info-bg)" : "var(--color-card)",
        color: active ? "var(--color-info)" : "var(--color-muted)",
        borderColor: active ? "var(--color-info)" : "var(--color-border)",
      }}
    >
      {icon}
      {label}
    </button>
  );
}

function InvoiceAmountLine({
  label,
  value,
  muted = false,
}: {
  label: string;
  value: number;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm" style={{ color: "var(--color-muted)" }}>
        {label}
      </p>

      <p
        className="font-black"
        style={{
          color: muted ? "var(--color-warning)" : "var(--color-text)",
        }}
      >
        {value < 0 ? "-" : ""}
        {formatPrice(Math.abs(value))}
      </p>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-3xl border p-8 text-center"
      style={{
        background: "var(--color-card-soft)",
        borderColor: "var(--color-border)",
        color: "var(--color-muted)",
      }}
    >
      {text}
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

      <p className="mt-2 text-4xl font-black" style={{ color: colorMap[accent] }}>
        {value}
      </p>
    </div>
  );
}

function StatAmount({
  label,
  value,
  accent = "text",
}: {
  label: string;
  value: number;
  accent?: "text" | "success";
}) {
  const colorMap = {
    text: "var(--color-text)",
    success: "var(--color-success)",
  };

  return (
    <div className="premium-card-soft p-5">
      <p className="text-sm" style={{ color: "var(--color-muted)" }}>
        {label}
      </p>

      <p className="mt-2 text-2xl font-black" style={{ color: colorMap[accent] }}>
        {formatPrice(value)}
      </p>
    </div>
  );
}