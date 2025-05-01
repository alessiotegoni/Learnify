"use client"

import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";
import { stripeClientPromise } from "../stripeClient";
import { AwaitedReturn } from "@/lib/utils";
import { getClientSessionSecret } from "../actions/stripe";
import { getPublicProduct } from "@/features/products/queries/products";

type Props = {
  product: AwaitedReturn<typeof getPublicProduct>;
  user: { id: string, email?: string }
};

export default function StripeCheckoutForm({ product, user }: Props) {
  return (
    <EmbeddedCheckoutProvider
      stripe={stripeClientPromise}
      options={{
        fetchClientSecret: getClientSessionSecret.bind(null, product, user),
      }}
    >
      <EmbeddedCheckout />
    </EmbeddedCheckoutProvider>
  );
}
