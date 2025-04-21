import { env } from "@/data/env/server";
import { setUserRole } from "@/services/clerk";
import { WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";

export async function POST(req: Request) {
  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json("Error occurred -- no svix headers", {
      status: 400,
    });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(env.CLERK_WEBHOOK_SECRET);
  let event: WebhookEvent;

  try {
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return NextResponse.json("Error occurred", {
      status: 400,
    });
  }

  switch (event.type) {
    case "user.created":
      const userId = event.data.id;
      setUserRole(userId, "user");
      break;

    case "user.updated": {
      //   const email = event.data.email_addresses.find(
      //     (email) => email.id === event.data.primary_email_address_id
      //   )?.email_address;
      //   const name = `${event.data.first_name} ${event.data.last_name}`.trim();
      //   if (!email || !name)
      //     return new Response("No email or No name", { status: 400 });

      //   if (event.type === "user.created") {
      //     const user = await insertUser({
      //       clerkUserId: event.data.id,
      //       email,
      //       name,
      //       imageUrl: event.data.image_url,
      //       role: "user",
      //     });

      //     await syncClerkUserMetadata(user);
      //   } else {
      //     await updateUser(event.data.id, {
      //       email,
      //       name,
      //       imageUrl: event.data.image_url,
      //       role: event.data.public_metadata.role,
      //     });
      //   }
      break;
    }
    case "user.deleted": {
      //   if (event.data.id) await deleteUser(event.data.id);

      break;
    }
  }

  return NextResponse.json(null, { status: 200 });
}
