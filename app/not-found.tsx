import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface-primary px-4 text-center">
      <h1 className="font-display text-3xl font-bold text-text-primary">Page not found</h1>
      <p className="max-w-md text-text-secondary">
        The page you are looking for does not exist or may have been moved.
      </p>
      <Button asChild>
        <Link href="/">Return home</Link>
      </Button>
    </div>
  );
}
