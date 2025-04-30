import NavLink from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { BookOpen, GraduationCap, History, Menu, X } from "lucide-react";
import Link from "next/link";
import { ReactNode, Suspense } from "react";

export default function ConsumerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container !pt-8 flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span>Learnify</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <NavLink href="/">Home</NavLink>
          <Suspense fallback={null}>
            <SignedIn>
              <NavLink href="/courses">
                <BookOpen className="size-4" />
                My Courses
              </NavLink>
              <NavLink href="/purchases">
                <History className="size-4" />
                Purchase History
              </NavLink>
              <AdminLink />
            </SignedIn>
          </Suspense>
        </nav>

        <Suspense fallback={null}>
          <div className="flex items-center gap-4">
            <SignedIn>
              <MobileNav />
              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox: { width: "32px", height: "32px" },
                  },
                }}
              />
            </SignedIn>
            <SignedOut>
              <Button asChild size="sm" className="rounded-full">
                <SignInButton>Sign in</SignInButton>
              </Button>
            </SignedOut>
          </div>
        </Suspense>
      </div>
    </header>
  );
}

function MobileNav() {
  return (
    <div className="md:hidden">
      <input type="checkbox" id="mobile-menu" className="peer hidden" />
      <label
        htmlFor="mobile-menu"
        className="flex items-center justify-center rounded-full p-2
          hover:bg-accent peer-checked:hidden cursor-pointer"
      >
        <Menu className="size-5" />
        <span className="sr-only">Toggle menu</span>
      </label>
      <label
        htmlFor="mobile-menu"
        className="hidden items-center justify-center rounded-full
          p-2 hover:bg-accent peer-checked:flex cursor-pointer"
      >
        <X className="size-5" />
        <span className="sr-only">Close menu</span>
      </label>
      <div
        className="fixed left-0 top-16 w-full z-50 hidden border-b bg-background
        peer-checked:block md:hidden"
      >
        <div className="container !py-6 !pt-6 space-y-4">
          <Link
            href="/"
            className="flex w-full items-center pb-2 text-lg font-medium"
          >
            Home
          </Link>
          <SignedIn>
            <Link
              href="/courses"
              className="flex w-full items-center gap-2 py-2 text-lg font-medium"
            >
              <BookOpen className="size-5" />
              My Courses
            </Link>
            <Link
              href="/purchases"
              className="flex w-full items-center gap-2 pt-2 text-lg font-medium"
            >
              <History className="size-5" />
              Purchase History
            </Link>
          </SignedIn>
        </div>
      </div>
    </div>
  );
}

async function AdminLink() {
  const { sessionClaims } = await auth();

  if (sessionClaims?.role !== "admin") return null;

  return (
    <Link
      href="/admin"
      className="text-sm font-medium transition-colors hover:text-primary"
    >
      Admin
    </Link>
  );
}

function Footer() {
  return (
    <footer className="border-t">
      <div
        className="container !pt-8 flex flex-col items-center
        justify-between gap-4 md:h-16 md:flex-row"
      >
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Learnify. All rights reserved.
        </p>
        <div className="flex items-center gap-4">
          <Link
            href="/terms"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Terms
          </Link>
          <Link
            href="/privacy"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}
