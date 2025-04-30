"use client"

import Link from "next/link";

export default function Footer() {
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
