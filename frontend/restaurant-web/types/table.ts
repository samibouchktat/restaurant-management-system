export type TableStatus = "LIBRE" | "OCCUPEE" | "EN_ATTENTE";

export type TableResponse = {
  id: number;
  tableNumber: string;
  capacity: number;
  status: TableStatus;
  active: boolean;
  qrCodeUrl?: string | null;

  zoneId: number;
  zoneName: string;

  assignedServerId?: number | null;
  assignedServerInternalId?: string | null;
  assignedServerFullName?: string | null;

  createdAt: string;
  updatedAt: string;
};

export type TableCreateRequest = {
  tableNumber: string;
  capacity: number;
  zoneId: number;
};

export type TableUpdateRequest = {
  tableNumber: string;
  capacity: number;
  zoneId: number;
};

export type TableStatusUpdateRequest = {
  status: TableStatus;
};