import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { auth, currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { ReactNode, Suspense } from "react";

export default function ConsumerLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <Navbar />
      <main className="container">{children}</main>
    </>
  );
}

function Navbar() {
  return (
    <header className="p-4 z-10 container !pt-6">
      <nav className="flex items-center gap-4">
        <Link href="/" className="mr-auto text-lg hover:underline px-2">
          Course platform
        </Link>
        <Suspense fallback="loading...">
          <SignedIn>
            <AdminLink />
            <Link href="/courses">My courses</Link>
            <Link href="/purchases">Purchase hystory</Link>
            <UserButton
              appearance={{
                elements: {
                  userButtonAvatarBox: { width: "30px", height: "30px" },
                },
              }}
            />
          </SignedIn>
        </Suspense>
        <Suspense fallback="loading...">
          <SignedOut>
            <Button asChild>
              <SignInButton>Sign in</SignInButton>
            </Button>
          </SignedOut>
        </Suspense>
      </nav>
    </header>
  );
}

async function AdminLink() {
  const { sessionClaims } = await auth()

  if (sessionClaims?.role !== "admin") return null;

  return <Link href="/admin">Admin</Link>;
}
