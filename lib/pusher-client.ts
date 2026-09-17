"use client";

import PusherClient from "pusher-js";

let client: PusherClient | null = null;

/**
 * Env publik yang dibutuhkan di browser:
 *   NEXT_PUBLIC_PUSHER_KEY, NEXT_PUBLIC_PUSHER_CLUSTER
 * (nilainya sama dengan PUSHER_KEY/PUSHER_CLUSTER di sisi server)
 */
export function getPusherClient() {
  if (!client) {
    client = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });
  }
  return client;
}
