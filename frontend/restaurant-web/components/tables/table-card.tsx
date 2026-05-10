"use client";

import { Users, MapPin, QrCode, Server } from "lucide-react";
import type { TableResponse, TableStatus } from "@/types/table";
import { TableStatusBadge } from "./table-status-badge";

type TableCardProps = {
  table: TableResponse;
  onChangeStatus: (tableId: number, status: TableStatus) => void;
  isUpdating?: boolean;
};

const cardStyleByStatus: Record<TableStatus, string> = {
  LIBRE:
    "border-emerald-500/25 bg-gradient-to-br from-slate-900 to-emerald-950/30",
  OCCUPEE:
    "border-red-500/25 bg-gradient-to-br from-slate-900 to-red-950/30",
  EN_ATTENTE:
    "border-amber-500/25 bg-gradient-to-br from-slate-900 to-amber-950/30",
};

export function TableCard({
  table,
  onChangeStatus,
  isUpdating = false,
}: TableCardProps) {
  return (
    <article
      className={`group rounded-3xl border p-5 shadow-lg shadow-black/20 transition hover:-translate-y-1 hover:shadow-2xl ${cardStyleByStatus[table.status]}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">Table</p>
          <h2 className="mt-1 text-3xl font-black tracking-tight text-white">
            {table.tableNumber}
          </h2>
        </div>

        <TableStatusBadge status={table.status} />
      </div>

      <div className="mt-6 grid gap-3 text-sm text-slate-300">
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-slate-800/80 p-2 text-slate-300">
            <Users size={16} />
          </span>
          <span>{table.capacity} places</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-slate-800/80 p-2 text-slate-300">
            <MapPin size={16} />
          </span>
          <span>{table.zoneName}</span>
        </div>

        {table.assignedServerInternalId && (
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-slate-800/80 p-2 text-slate-300">
              <Server size={16} />
            </span>
            <span>
              {table.assignedServerFullName}{" "}
              <span className="text-slate-500">
                ({table.assignedServerInternalId})
              </span>
            </span>
          </div>
        )}

        {table.qrCodeUrl && (
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-slate-800/80 p-2 text-slate-300">
              <QrCode size={16} />
            </span>
            <span className="truncate text-slate-400">{table.qrCodeUrl}</span>
          </div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-3 gap-2">
        <button
          disabled={isUpdating || table.status === "LIBRE"}
          onClick={() => onChangeStatus(table.id, "LIBRE")}
          className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Libre
        </button>

        <button
          disabled={isUpdating || table.status === "EN_ATTENTE"}
          onClick={() => onChangeStatus(table.id, "EN_ATTENTE")}
          className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Attente
        </button>

        <button
          disabled={isUpdating || table.status === "OCCUPEE"}
          onClick={() => onChangeStatus(table.id, "OCCUPEE")}
          className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-300 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Occupée
        </button>
      </div>
    </article>
  );
}