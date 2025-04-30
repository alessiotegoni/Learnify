"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ComponentProps } from "react";

type NavLinkProps = ComponentProps<typeof Link> & {
  matchExact?: boolean;
};

export default function NavLink({
  href,
  className,
  children,
  matchExact = false,
  ...props
}: NavLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "text-sm font-medium transition-colors flex items-center gap-1",
        typeof href === "string" && isActive(href, matchExact)
          ? "text-primary hover:text-primary/80"
          : "hover:text-primary",
        className
      )}
      {...props}
    >
      {children}
    </Link>
  );
}

const isActive = (href: string, matchExact: boolean) => {
  const pathname = usePathname();

  const isAdmin = href === "/admin";
  const isHome = href === "/";

  return matchExact || isHome || isAdmin
    ? pathname === href
    : pathname.startsWith(href);
};
