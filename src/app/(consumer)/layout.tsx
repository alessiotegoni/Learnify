import Footer from "@/components/Footer";
import NavLink from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import {
  BookOpen,
  Gauge,
  GraduationCap,
  History,
  Home,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";

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
          {/* <Suspense> */}
            <NavLink href="/">
              <Home className="size-4" /> Home
            </NavLink>
            <SignedIn>
              <NavLink href="/courses" matchExact>
                <BookOpen className="size-4" />
                My Courses
              </NavLink>
              <NavLink href="/purchases">
                <History className="size-4" />
                Purchase History
              </NavLink>
              <AdminLink />
            </SignedIn>
          {/* </Suspense> */}
        </nav>

        <div className="flex items-center gap-4">
          {/* <Suspense> */}
            <MobileNav />
            <SignedIn>
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
          {/* </Suspense> */}
        </div>
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
        <div className="container !py-6 space-y-4">
          {/* <Suspense> */}
            <NavLink href="/">
              <Home className="size-5 mr-1" /> Home
            </NavLink>
            <SignedIn>
              <NavLink href="/courses" matchExact>
                <BookOpen className="size-5 mr-1" />
                My Courses
              </NavLink>
              <NavLink href="/purchases">
                <History className="size-5 mr-1" />
                Purchase History
              </NavLink>
              <AdminLink classNames={{ icon: "size-5 mr-1" }} />
            </SignedIn>
          {/* </Suspense> */}
        </div>
      </div>
    </div>
  );
}

async function AdminLink({
  classNames,
}: {
  classNames?: { link?: string; icon?: string };
}) {
  const { sessionClaims } = await auth();

  if (sessionClaims?.role !== "admin") return null;

  return (
    <NavLink href="/admin" className={classNames?.link}>
      <Gauge className={cn("size-4", classNames?.icon)} /> Admin
    </NavLink>
  );
}
