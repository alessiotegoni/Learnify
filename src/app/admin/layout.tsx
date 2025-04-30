import type React from "react";
import { Badge } from "@/components/ui/badge";
import { UserButton } from "@clerk/nextjs";
import {
  BarChart3,
  BookOpen,
  Home,
  Menu,
  Package,
  Receipt,
  X,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import NavLink from "@/components/NavLink";
import Footer from "@/components/Footer";

export default function AdminLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />
      <main className="container !pt-14 grow">{children}</main>
      <Footer />
    </div>
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

          {/* Desktop navigation */}
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

          <div className="ml-auto flex items-center gap-4">
            <MobileNav />
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
function MobileNav() {
  return (
    <div className="md:hidden ml-auto">
      <input type="checkbox" id="admin-mobile-menu" className="peer hidden" />

      {/* Toggle Button */}
      <label
        htmlFor="admin-mobile-menu"
        className="flex items-center justify-center rounded-full p-2 hover:bg-accent peer-checked:hidden cursor-pointer"
      >
        <Menu className="size-5" />
        <span className="sr-only">Open menu</span>
      </label>

      {/* Close Button */}
      <label
        htmlFor="admin-mobile-menu"
        className="hidden items-center justify-center rounded-full p-2 hover:bg-accent peer-checked:flex cursor-pointer"
      >
        <X className="size-5" />
        <span className="sr-only">Close menu</span>
      </label>

      {/* Mobile Menu Content */}
      <div className="fixed left-0 top-16 w-full z-50 hidden border-b bg-background peer-checked:block md:hidden">
        <div className="container !py-6 space-y-4">
          <NavLink href="/admin">
            <BarChart3 className="size-5 mr-1" />
            Dashboard
          </NavLink>
          <NavLink href="/admin/courses">
            <BookOpen className="size-5 mr-1" />
            Courses
          </NavLink>
          <NavLink href="/admin/products">
            <Package className="size-5 mr-1" />
            Products
          </NavLink>
          <NavLink href="/admin/sales">
            <Receipt className="size-5 mr-1" />
            Sales
          </NavLink>
        </div>
      </div>
    </div>
  );
}
