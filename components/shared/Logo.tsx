import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: number;
  className?: string;
  linked?: boolean;
  href?: string;
}

export function Logo({
  size = 32,
  className,
  linked = true,
  href = "/",
}: LogoProps) {
  const image = (
    <Image
      src="/logo.png"
      alt="FineSet"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      priority
      unoptimized
    />
  );

  if (!linked) {
    return image;
  }

  return (
    <Link href={href} className="inline-flex items-center">
      {image}
    </Link>
  );
}
