import LoadingSpinner from "@/components/LoadingSpinner";
import PageHeader from "@/components/PageHeader";
import { db } from "@/drizzle/db";
import { getProductIdTag } from "@/features/products/db/cache";
import { userOwnsProduct } from "@/features/products/db/products";
import StripeCheckoutForm from "@/services/stripe/components/StripeCheckoutForm";
import { SignIn, SignUp } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

type Props = {
  params: Promise<{ productId: string }>;
  searchParams: Promise<{ authMode: string }>;
};

export default async function PurchaseProductPage({
  params,
  searchParams,
}: Props) {
  return (
    <Suspense fallback={<LoadingSpinner className="my-6 size-36 mx-auto" />}>
      <SuspendedComponent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function SuspendedComponent({ params, searchParams }: Props) {
  const [{ productId }, user] = await Promise.all([params, currentUser()]);

  const product = await getPublicProduct(productId);
  if (!product) notFound();

  if (user) {
    if (await userOwnsProduct({ clerkUserId: user.id, productId }))
      redirect(`/courses`);

    return (
      <StripeCheckoutForm
        product={product}
        user={{ id: user.id, email: user.primaryEmailAddress?.emailAddress }}
      />
    );
  }

  const { authMode } = await searchParams;
  const isSignUp = authMode === "signUp";

  return (
    <div className="flex flex-col items-center">
      <PageHeader title="You need an account to make a purchase" />
      {isSignUp ? (
        <SignUp
          routing="hash"
          signInUrl={`/products/${productId}/purchase?authMode=signIn`}
          forceRedirectUrl={`/products/${productId}/purchase`}
        />
      ) : (
        <SignIn
          routing="hash"
          signUpUrl={`/products/${productId}/purchase?authMode=signUp`}
          forceRedirectUrl={`/products/${productId}/purchase`}
        />
      )}
    </div>
  );
}

export async function getPublicProduct(productId: string) {
  "use cache";
  cacheTag(getProductIdTag(productId));

  return db.query.products.findFirst({
    columns: {
      id: true,
      name: true,
      imageUrl: true,
      description: true,
      priceInDollars: true,
    },
    where: ({ id, status }, { and, eq }) =>
      and(eq(id, productId), eq(status, "public")),
  });
}
