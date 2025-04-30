import type React from "react";
import { Badge } from "@/components/ui/badge";
import { UserButton } from "@clerk/nextjs";
import { BarChart3, BookOpen, Home, Package, Receipt } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export default function AdminLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <Navbar />
      <main className="container !pt-14 grow">{children}</main>
    </>
  );
}

function Navbar() {
  return (
    <header className="border-b bg-background/80 backdrop-blur sticky top-0 z-50">
      <div className="container !py-4">
        <nav className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-semibold"
          >
            <Home className="h-5 w-5" />
            <span>Learnify</span>
            <Badge variant="secondary" className="ml-1">
              Admin
            </Badge>
          </Link>

          <div className="hidden md:flex items-center gap-6 ml-6">
            <NavLink href="/admin">
              <BarChart3 className="h-4 w-4 mr-1.5" />
              Dashboard
            </NavLink>
            <NavLink href="/admin/courses">
              <BookOpen className="h-4 w-4 mr-1.5" />
              Courses
            </NavLink>
            <NavLink href="/admin/products">
              <Package className="h-4 w-4 mr-1.5" />
              Products
            </NavLink>
            <NavLink href="/admin/sales">
              <Receipt className="h-4 w-4 mr-1.5" />
              Sales
            </NavLink>
          </div>

          <div className="ml-auto">
            <UserButton
              appearance={{
                elements: {
                  userButtonAvatarBox: { width: "36px", height: "36px" },
                },
              }}
            />
          </div>
        </nav>
      </div>
    </header>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center text-sm font-medium transition-colors hover:text-primary"
    >
      {children}
    </Link>
  );
}
