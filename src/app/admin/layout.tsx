import { Badge } from "@/components/ui/badge";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { ReactNode } from "react";

export default function PrivateLayout({
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
    <header className="p-4 z-10 container !pb-0 !pt-6">
      <nav className="flex items-center gap-4">
        <div className="mr-auto flex items-center gap-2">
          <Link href="/" className="mr-auto text-lg font-bold hover:underline px-2">
            Course platform
          </Link>
          <Badge>Admin</Badge>
        </div>
        <Link href="/admin/courses">Courses</Link>
        <Link href="/admin/products">Products</Link>
        <Link href="/admin/sales">Sales</Link>
        <div className="size-8 self-center">
          <UserButton
            appearance={{
              elements: {
                userButtonAvatarBox: { width: "30px", height: "30px" },
              },
            }}
          />
        </div>
      </nav>
    </header>
  );
}
