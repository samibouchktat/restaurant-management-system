export type ProductResponse = {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
  available: boolean;
  active: boolean;
  categoryId: number;
  categoryName: string;
  createdAt: string;
  updatedAt: string;
};

export type ProductCreateRequest = {
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  categoryId: number;
  available?: boolean;
};

export type ProductUpdateRequest = {
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  categoryId: number;
  available: boolean;
};

export type PublicMenuCategoryResponse = {
  id: number;
  name: string;
  description?: string | null;
  displayOrder: number;
  products: ProductResponse[];
};