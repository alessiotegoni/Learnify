import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { userOwnsProduct } from "@/features/products/db/products";
import StripeCheckoutForm from "@/services/stripe/components/StripeCheckoutForm";
import { SignIn, SignUp } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import Image from "next/image";
import PageHeader from "@/components/PageHeader";
import { getPublicProduct } from "@/features/products/queries/products";

type Props = {
  params: Promise<{ productId: string }>;
  searchParams: Promise<{ authMode: string }>;
};

export default function PurchaseProductPage({
  params,
  searchParams,
}: Props) {
  return (
    <div className="container">
      <Suspense fallback={<PurchaseSkeleton />}>
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

function PurchaseSkeleton() {
  return (
    <div className="container">
      <div className="mb-8">
        <Skeleton className="h-9 w-64 mb-2" />
        <Skeleton className="h-5 w-96" />
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Product card */}
        <Card className="overflow-hidden">
          <div className="aspect-video relative bg-muted animate-pulse" />
          <CardHeader>
            <Skeleton className="h-6 w-3/4 mb-1" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardHeader>
        </Card>

        {/* Checkout form */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40 mb-1" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>

            <div className="space-y-4 pt-4">
              <div className="flex justify-between">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-20" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-6 w-32 font-bold" />
                <Skeleton className="h-6 w-24 font-bold" />
              </div>
            </div>

            <Skeleton className="h-12 w-full rounded-full mt-4" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
