import { NextResponse } from "next/server";
import { Webhook } from "svix";

export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;

  if (!secret) {
    return new NextResponse("Missing Clerk webhook secret", { status: 500 });
  }

  const payload = await req.text();
  const headers = {
    "svix-id": req.headers.get("svix-id") ?? "",
    "svix-timestamp": req.headers.get("svix-timestamp") ?? "",
    "svix-signature": req.headers.get("svix-signature") ?? "",
  };

  const wh = new Webhook(secret);

  let evt: any;

  try {
    evt = wh.verify(payload, headers) as {
      type: string;
      data: { id: string };
    };
  } catch (err) {
    console.error("❌ Clerk webhook signature verification failed:", err);
    return new NextResponse("Invalid signature", { status: 400 });
  }

  const eventType = evt.type;
  const userId = evt.data?.id ?? "unknown";

  console.log(`🔔 Clerk webhook: ${eventType} (user ${userId})`);

  return NextResponse.json({ success: true });
}
