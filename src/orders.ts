// Lapisan data pesanan & ulasan. Saat ini memakai localStorage;
// ganti isi load*/save* dengan query Supabase (tabel `orders`, `reviews`) nanti.
export type OrderStatus = "Diproses" | "Dalam Pengiriman" | "Siap Diambil" | "Selesai";

export type OrderItem = {
  productId: string;
  name: string;
  brand: string;
  price: number;
  qty: number;
};

export type Order = {
  id: string;
  createdAt: string;
  customer: string;
  branch?: string;
  delivery: "Kirim ke alamat" | "Ambil di toko";
  payment: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  completedAt?: string;
  courier?: string;
  trackingNumber?: string;
  shippedAt?: string;
};

export type Review = {
  id: string;
  orderId: string;
  productId: string;
  customer: string;
  rating: number;
  comment: string;
  createdAt: string;
  adminReply?: string;
  hidden?: boolean;
};

const ORDERS_KEY = "hartini.orders";
const REVIEWS_KEY = "hartini.reviews";

function read<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]") as T[];
  } catch {
    return [];
  }
}

export const loadOrders = () => read<Order>(ORDERS_KEY);
export const saveOrders = (orders: Order[]) =>
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
export const loadReviews = () => read<Review>(REVIEWS_KEY);
export const saveReviews = (reviews: Review[]) =>
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));

/** Status berikutnya sesuai cara penerimaan barang. */
export function nextStatus(order: Order): OrderStatus | null {
  if (order.status === "Selesai") return null;
  if (order.status === "Diproses")
    return order.delivery === "Kirim ke alamat" ? "Dalam Pengiriman" : "Siap Diambil";
  return "Selesai";
}

export function newOrderId() {
  return `HTN-${Date.now().toString(36).toUpperCase()}`;
}
