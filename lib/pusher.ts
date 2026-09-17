import Pusher from "pusher";
export { kelompokChannel, orderChannel, ORDER_UPDATED_EVENT } from "./pusher-shared";

/**
 * Pakai Pusher Channels (bukan Socket.io) karena app ini didesain untuk
 * deploy di Vercel/serverless -- Socket.io butuh server Node yang selalu
 * hidup, sedangkan Pusher jalan lewat HTTP request biasa dari API route.
 *
 * Env yang dibutuhkan (dari dashboard pusher.com, gratis untuk skala kecil):
 *   PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET, PUSHER_CLUSTER
 *
 * File ini HANYA boleh diimpor dari kode server (API routes) -- untuk
 * komponen client, impor dari lib/pusher-shared.ts atau lib/pusher-client.ts.
 */
export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});
