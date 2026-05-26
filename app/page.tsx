import Link from "next/link";
import { content } from "@/content/en";
import { Logo } from "@/components/shared/Logo";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const portals = [
    {
      href: "/staff/login",
      label: content.home.portals.staff.label,
      description: content.home.portals.staff.description,
    },
    {
      href: "/store/login",
      label: content.home.portals.store.label,
      description: content.home.portals.store.description,
    },
    {
      href: "/admin/login",
      label: content.home.portals.admin.label,
      description: content.home.portals.admin.description,
    },
  ];

  return (
    <main className="min-h-screen bg-surface-primary px-page-x py-12 sm:px-page-md">
      <div className="mx-auto max-w-4xl space-y-10">
        <header className="space-y-3 text-center">
          <div className="flex justify-center">
            <Logo size={56} />
          </div>
          <h1 className="font-display text-3xl font-bold text-text-primary sm:text-4xl">
            {content.home.title}
          </h1>
          <p className="text-text-secondary">{content.home.subtitle}</p>
        </header>

        <div className="grid gap-4 sm:grid-cols-3">
          {portals.map((portal) => (
            <Card key={portal.href} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg">{portal.label}</CardTitle>
                <CardDescription>{portal.description}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <Button asChild className="w-full">
                  <Link href={portal.href}>{content.home.portals.enter}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
