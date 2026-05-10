import type { ProductResponse } from "@/types/product";

export type CartItem = {
  productId: number;
  name: string;
  price: number;
  quantity: number;
};

function getCartKey(tableId: string | number) {
  return `restaurant_cart_table_${tableId}`;
}

export function getCartItems(tableId: string | number): CartItem[] {
  if (typeof window === "undefined") return [];

  const rawCart = localStorage.getItem(getCartKey(tableId));

  if (!rawCart) return [];

  try {
    return JSON.parse(rawCart) as CartItem[];
  } catch {
    clearCart(tableId);
    return [];
  }
}

export function saveCartItems(tableId: string | number, items: CartItem[]) {
  if (typeof window === "undefined") return;

  localStorage.setItem(getCartKey(tableId), JSON.stringify(items));
}

export function addProductToCart(
  tableId: string | number,
  product: ProductResponse
): CartItem[] {
  const items = getCartItems(tableId);

  const existingItem = items.find((item) => item.productId === product.id);

  if (existingItem) {
    const updatedItems = items.map((item) =>
      item.productId === product.id
        ? {
            ...item,
            quantity: item.quantity + 1,
          }
        : item
    );

    saveCartItems(tableId, updatedItems);
    return updatedItems;
  }

  const updatedItems = [
    ...items,
    {
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
    },
  ];

  saveCartItems(tableId, updatedItems);
  return updatedItems;
}

export function updateCartItemQuantity(
  tableId: string | number,
  productId: number,
  quantity: number
): CartItem[] {
  const items = getCartItems(tableId);

  const updatedItems = items
    .map((item) =>
      item.productId === productId
        ? {
            ...item,
            quantity,
          }
        : item
    )
    .filter((item) => item.quantity > 0);

  saveCartItems(tableId, updatedItems);
  return updatedItems;
}

export function clearCart(tableId: string | number) {
  if (typeof window === "undefined") return;

  localStorage.removeItem(getCartKey(tableId));
}

export function getCartTotal(items: CartItem[]) {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}

export function getCartCount(items: CartItem[]) {
  return items.reduce((total, item) => total + item.quantity, 0);
}