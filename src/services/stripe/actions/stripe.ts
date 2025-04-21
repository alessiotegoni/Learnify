"use server";

import { getPublicProduct } from "@/app/(consumer)/products/[productId]/purchase/page";
import { getUserCoupon } from "@/lib/userCountryHeader";
import { stripeServerClient } from "../stripeServer";
import { AwaitedReturn } from "@/lib/utils";
import { env } from "@/data/env/client";
import Stripe from "stripe";

export async function getClientSessionSecret(
  product: AwaitedReturn<typeof getPublicProduct>,
  user: { id: string; email?: string }
) {
  const coupon = await getUserCoupon();
  const discounts: Stripe.Checkout.SessionCreateParams.Discount[] | undefined =
    coupon ? [{ coupon: coupon.stripeCouponId }] : undefined;

  const session = await stripeServerClient.checkout.sessions.create({
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            images: [
              new URL(product.imageUrl, env.NEXT_PUBLIC_SERVER_URL).href,
            ],
            description: product.description,
          },
          unit_amount: product.priceInDollars * 100,
        },
      },
    ],
    ui_mode: "embedded",
    mode: "payment",
    return_url: `${env.NEXT_PUBLIC_SERVER_URL}/api/webhooks/stripe?stripeSessionId={CHECKOUT_SESSION_ID}`,
    customer_email: user.email,
    payment_intent_data: {
      receipt_email: user.email,
    },
    discounts,
    metadata: {
      productId: product.id,
      userId: user.id,
    },
  });

  if (!session.client_secret) throw new Error("Client secret missing");

  return session.client_secret;
}

export async function getPurchaseDetails(
  stripeSessionId: string,
  pricePaidInCents: number,
  isRefunded: boolean
) {
  const { payment_intent, total_details, amount_total, amount_subtotal } =
    await stripeServerClient.checkout.sessions.retrieve(stripeSessionId, {
      expand: [
        "payment_intent.latest_charge",
        "total_details.breakdown.discounts",
      ],
    });

  const refundAmount =
    typeof payment_intent !== "string" &&
    typeof payment_intent?.latest_charge !== "string"
      ? payment_intent?.latest_charge?.amount_refunded
      : isRefunded
      ? pricePaidInCents
      : undefined;

  return {
    receiptUrl: getReceiptUrl(payment_intent),
    pricingRows: getPricingRows(total_details, {
      total: (amount_total ?? pricePaidInCents) - (refundAmount ?? 0),
      subtotal: amount_subtotal ?? pricePaidInCents,
      refund: refundAmount,
    }),
  };
}

function getReceiptUrl(paymentIntent: Stripe.PaymentIntent | string | null) {
  if (
    typeof paymentIntent === "string" ||
    typeof paymentIntent?.latest_charge === "string"
  )
    return;

  return paymentIntent?.latest_charge?.receipt_url;
}

function getPricingRows(
  totalDetails: Stripe.Checkout.Session.TotalDetails | null,
  {
    total,
    subtotal,
    refund,
  }: { total: number; subtotal: number; refund?: number }
) {
  const pricingRows: {
    label: string;
    amountInDollars: number;
    isBold?: boolean;
  }[] = [];

  if (totalDetails?.breakdown) {
    totalDetails.breakdown.discounts.forEach(({ discount, amount }) =>
      pricingRows.push({
        label: `${discount.coupon.name} (${discount.coupon.percent_off}% off)`,
        amountInDollars: amount / -100,
      })
    );
  }

  if (refund)
    pricingRows.push({
      label: "Refund",
      amountInDollars: refund / -100,
    });

  if (!pricingRows.length)
    return [{ label: "Total", amountInDollars: total / 100, isBold: true }];

  return [
    { label: "Subtotal", amountInDollars: subtotal / 100 },
    ...pricingRows,
    { label: "Total", amountInDollars: total / 100, isBold: true },
  ];
}
