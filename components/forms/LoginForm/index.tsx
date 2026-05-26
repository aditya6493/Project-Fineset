"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Logo } from "@/components/shared/Logo";
import { getRedirectForRole } from "@/lib/auth/routes";
import type { AppSession } from "@/types";

interface LoginField {
  name: string;
  label: string;
  placeholder: string;
  type?: "text" | "password" | "email";
}

interface LoginFormProps {
  providerId: "staff" | "store" | "admin";
  title: string;
  subtitle: string;
  fields: LoginField[];
  submitLabel: string;
  errorMessage: string;
  defaultValues?: Partial<Record<string, string>>;
}

export function LoginForm({
  providerId,
  title,
  subtitle,
  fields,
  submitLabel,
  errorMessage,
  defaultValues = {},
}: LoginFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const credentials: Record<string, string> = {};

    for (const field of fields) {
      const value = formData.get(field.name);
      if (typeof value === "string") {
        credentials[field.name] = value.trim();
      }
    }

    const result = await signIn(providerId, {
      redirect: false,
      ...credentials,
    });

    setIsLoading(false);

    if (result?.error) {
      setError(errorMessage);
      return;
    }

    const roleMap: Record<typeof providerId, AppSession["role"]> = {
      staff: "STAFF",
      store: "STORE_MANAGER",
      admin: "MASTER_ADMIN",
    };

    router.push(getRedirectForRole(roleMap[providerId]));
    router.refresh();
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mb-2 flex justify-center">
          <Logo size={48} linked={false} />
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((field) => (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={field.name}>{field.label}</Label>
              <Input
                id={field.name}
                name={field.name}
                type={field.type ?? "text"}
                placeholder={field.placeholder}
                defaultValue={defaultValues[field.name] ?? ""}
                required
                autoComplete={field.type === "password" ? "current-password" : "username"}
              />
            </div>
          ))}

          {error && (
            <p className="text-sm text-status-error" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "…" : submitLabel}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
