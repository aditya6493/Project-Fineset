"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
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
import { getRedirectForRole } from "@/lib/auth/routes";
import type { UserRole } from "@/types";

interface SupabaseLoginFormProps {
  title: string;
  subtitle: string;
  submitLabel: string;
  errorInvalid: string;
  errorInactive: string;
  errorGeneric: string;
  forgotPasswordLabel: string;
}

export function SupabaseLoginForm({
  title,
  subtitle,
  submitLabel,
  errorInvalid,
  errorInactive,
  errorGeneric,
  forgotPasswordLabel,
}: SupabaseLoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callbackUrl = searchParams.get("callbackUrl");
  const urlError = searchParams.get("error");

  const initialError =
    urlError === "account_inactive"
      ? errorInactive
      : urlError === "wrong_portal"
        ? errorGeneric
        : urlError
          ? errorInvalid
          : null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "")
      .trim()
      .toLowerCase();
    const password = String(formData.get("password") ?? "");

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setIsLoading(false);
      setError(errorInvalid);
      return;
    }

    const completeRes = await fetch("/api/auth/after-login", { method: "POST" });
    setIsLoading(false);

    if (!completeRes.ok) {
      if (completeRes.status === 403) {
        setError(errorInactive);
      } else {
        setError(errorInvalid);
      }
      await supabase.auth.signOut();
      return;
    }

    const body = (await completeRes.json()) as { role: UserRole };
    const destination =
      callbackUrl && callbackUrl.startsWith("/")
        ? callbackUrl
        : getRedirectForRole(body.role);

    router.push(destination);
    router.refresh();
  }

  async function handleForgotPassword() {
    const emailInput = document.getElementById("email") as HTMLInputElement | null;
    const email = emailInput?.value?.trim().toLowerCase();
    if (!email) {
      setError("Enter your email first, then click forgot password.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=/login`;
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    setIsLoading(false);

    if (resetError) {
      setError(errorGeneric);
      return;
    }

    setError(null);
    alert("If an account exists, a reset link has been sent to your email.");
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              autoComplete="username"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          {(error || initialError) && (
            <p className="text-sm text-status-error" role="alert">
              {error ?? initialError}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "…" : submitLabel}
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="w-full text-sm"
            disabled={isLoading}
            onClick={handleForgotPassword}
          >
            {forgotPasswordLabel}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
