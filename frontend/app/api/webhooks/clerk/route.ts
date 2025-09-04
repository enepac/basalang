// /workspaces/basalang/frontend/app/api/webhooks/clerk/route.ts
import { NextResponse } from "next/server";
import { Webhook } from "svix";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    return new Response("Missing Clerk webhook secret", { status: 500 });
  }

  const payload = await req.text();
  const headers = Object.fromEntries(req.headers.entries());

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: any;

  try {
    evt = wh.verify(payload, headers);
  } catch (err) {
    return new Response("Webhook signature verification failed", {
      status: 400,
    });
  }

  const { type, data } = evt;

  console.log("🔔 Clerk webhook received:");
  console.log("Event type:", type);
  console.log("Event data:", JSON.stringify(data, null, 2));

  return NextResponse.json({ received: true });
}
