import Image from "next/image";
import Link from "next/link";
import { APP_LOGO_SRC } from "@/lib/pwa/config";
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
      src={APP_LOGO_SRC}
      alt="FineSet"
      width={size}
      height={size}
      className={cn("shrink-0 rounded-full", className)}
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
