import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function PurchaseFailurePage() {
  return (
    <div className="container !max-w-md text-center py-16 space-y-6">
      <div className="rounded-full bg-red-100 p-4 w-20 h-20 mx-auto flex items-center justify-center">
        <AlertCircle className="h-10 w-10 text-red-600" />
      </div>

      <h1 className="text-3xl font-bold">Purchase Failed</h1>

      <p className="text-xl text-muted-foreground">
        There was a problem processing your payment. Please try again or contact
        support if the issue persists.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
        <Button asChild size="lg" className="rounded-full">
          <Link href="/#courses">Browse Courses</Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="rounded-full">
          <Link href="/support">Contact Support</Link>
        </Button>
      </div>
    </div>
  );
}
