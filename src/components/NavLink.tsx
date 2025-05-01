"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

type Props = {
  href: string;
  className?: string;
  children?: ReactNode;
  matchExact?: boolean;
};

export default function NavLink({
  href,
  className,
  children,
  matchExact = false,
}: Props) {
  const isActive = useMatch(href, matchExact);

  return (
    <Link
      href={href}
      className={cn(
        "text-sm font-medium transition-colors flex items-center gap-1",
        typeof href === "string" && isActive
          ? "text-primary hover:text-primary/80"
          : "hover:text-primary",
        className
      )}
    >
      {children}
    </Link>
  );
}

const useMatch = (href: string, matchExact: boolean) => {
  const pathname = usePathname();

  const isAdmin = href === "/admin";
  const isHome = href === "/";

  return matchExact || isHome || isAdmin
    ? pathname === href
    : pathname.startsWith(href);
};
