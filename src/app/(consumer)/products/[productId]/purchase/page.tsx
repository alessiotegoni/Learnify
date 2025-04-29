import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/drizzle/db";
import { getProductIdTag } from "@/features/products/db/cache";
import { userOwnsProduct } from "@/features/products/db/products";
import StripeCheckoutForm from "@/services/stripe/components/StripeCheckoutForm";
import { SignIn, SignUp } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import PageHeader from "@/components/PageHeader";

type Props = {
  params: Promise<{ productId: string }>;
  searchParams: Promise<{ authMode: string }>;
};

export default async function PurchaseProductPage({
  params,
  searchParams,
}: Props) {
  return (
    <div className="container">
      <Suspense
        fallback={
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        }
      >
        <SuspendedComponent params={params} searchParams={searchParams} />
      </Suspense>
    </div>
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
      <>
        <PageHeader
          title="Complete Your Purchase"
          description="You're just one step away from accessing this course"
        />

        <div className="grid lg:grid-cols-[400px_1fr] gap-4 xl:gap-0">
          <div className="flex justify-center h-fit lg:sticky top-20 lg:max-w-md">
            <Card className="overflow-hidden pt-0 w-full">
              <div className="aspect-video relative">
                <Image
                  src={product.imageUrl || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle>{product.name}</CardTitle>
                <CardDescription>{product.description}</CardDescription>
              </CardHeader>
            </Card>
          </div>

          <StripeCheckoutForm
            product={product}
            user={{
              id: user.id,
              email: user.primaryEmailAddress?.emailAddress,
            }}
          />
        </div>
      </>
    );
  }

  const { authMode } = await searchParams;
  const isSignUp = authMode === "signUp";

  return (
    <>
      <PageHeader
        title="Create an Account"
        description="You need an account to purchase this course"
      />

      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>{isSignUp ? "Sign Up" : "Sign In"}</CardTitle>
          <CardDescription>
            {isSignUp
              ? "Create an account to continue with your purchase"
              : "Sign in to your account to continue with your purchase"}
          </CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </>
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
