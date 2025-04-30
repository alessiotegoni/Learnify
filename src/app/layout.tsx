import { ClerkProvider } from "@clerk/nextjs";
import { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s - Learnify",
    default: "Learnify - Modern Learning Platform",
  },
  description: "Expand your knowledge with our premium courses",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ClerkProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
