import { env } from "@/data/env/server";
import { db } from "@/drizzle/db";
import { addUserCourseAccess } from "@/features/courses/db/userCourseAccess";
import { getProductIdTag } from "@/features/products/db/cache";
import { insertPurchase } from "@/features/purchases/db/purchases";
import { stripeServerClient } from "@/services/stripe/stripeServer";
import { currentUser } from "@clerk/nextjs/server";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function GET(req: NextRequest) {
  const stripeSessionId = req.nextUrl.searchParams.get("stripeSessionId");
  if (!stripeSessionId) redirect("/products/purchase-failure");

  let redirectUrl: string;
  try {
    const checkoutSession = await stripeServerClient.checkout.sessions.retrieve(
      stripeSessionId,
      { expand: ["line_items"] }
    );

    const productId = await processStripeCheckout(checkoutSession);

    redirectUrl = `/products/${productId}/purchase/success`;
  } catch (err) {
    console.error(err);
    redirectUrl = "/products/purchase-failure";
  }

  redirect(redirectUrl);
}

export async function POST(req: Request) {
  const event = await stripeServerClient.webhooks.constructEventAsync(
    await req.text(),
    req.headers.get("stripe-signature") as string,
    env.STRIPE_WEBHOOK_SECRET
  );

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
      try {
        await processStripeCheckout(event.data.object);
      } catch (err) {
        console.error(err);
        NextResponse.json(null, { status: 500 });
      }

      break;

    default:
      break;
  }

  NextResponse.json(null, { status: 200 });
}

async function processStripeCheckout(checkouSession: Stripe.Checkout.Session) {
  const userId = checkouSession.metadata?.userId;
  const productId = checkouSession.metadata?.productId;

  if (!userId || !productId) throw new Error("Missing metadata");

  const [product, user] = await Promise.all([
    getProduct(productId),
    currentUser(),
  ]);

  if (!product) throw new Error("Product not found");
  if (!user) throw new Error("User not found");

  await db.transaction(async (trx) => {
    try {
      await Promise.all([
        addUserCourseAccess(userId, product.id, trx),
        insertPurchase(
          {
            stripeSessionId: checkouSession.id,
            clerkUserId: user.id,
            productId: product.id,
            pricePaidInCents:
              checkouSession.amount_total || product.priceInDollars * 100,
            userDetails: {
              fullName: user.fullName || user.username,
            },
            productDetails: {
              name: product.name,
              description: product.description,
              imageUrl: product.imageUrl,
            },
          },
          trx
        ),
      ]);
    } catch (err) {
      trx.rollback();
      throw err;
    }
  });

  return product.id;
}

async function getProduct(id: string) {
  "use cache";
  cacheTag(getProductIdTag(id));

  return db.query.products.findFirst({
    where: ({ id: productId }, { eq }) => eq(productId, id),
    columns: {
      createdAt: false,
      updatedAt: false,
    },
  });
}
