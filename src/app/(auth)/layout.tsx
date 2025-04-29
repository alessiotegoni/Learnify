import { ReactNode } from "react";

export default function AuthLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <div className="absolute inset-0 flex justify-center items-center">
      {children}
    </div>
  );
}
