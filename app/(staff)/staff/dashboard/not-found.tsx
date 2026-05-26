import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function StaffNotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <h1 className="font-display text-2xl font-bold text-text-primary">Page not found</h1>
      <p className="text-text-secondary">This staff dashboard page could not be found.</p>
      <Button asChild variant="outline">
        <Link href="/staff/dashboard">Back to home</Link>
      </Button>
    </div>
  );
}
