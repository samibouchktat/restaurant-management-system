export type CategoryResponse = {
  id: number;
  name: string;
  description?: string | null;
  active: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type CategoryCreateRequest = {
  name: string;
  description?: string;
  displayOrder?: number;
};

export type CategoryUpdateRequest = {
  name: string;
  description?: string;
  displayOrder?: number;
};