export type ZoneResponse = {
  id: number;
  name: string;
  description?: string | null;
  active: boolean;
  assignedServerId?: number | null;
  assignedServerInternalId?: string | null;
  assignedServerFullName?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ZoneCreateRequest = {
  name: string;
  description?: string;
};

export type ZoneUpdateRequest = {
  name: string;
  description?: string;
};

export type AssignServerRequest = {
  serverId: number;
};