// Nilai murni (tanpa dependency Node-only) supaya aman diimpor dari
// komponen client maupun server.

export function kelompokChannel(kelompokId: string) {
  return `kelompok-${kelompokId}`;
}

export function orderChannel(orderId: string) {
  return `order-${orderId}`;
}

export const ORDER_UPDATED_EVENT = "order-updated";
