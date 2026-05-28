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
  const [showPassword, setShowPassword] = useState(false);

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

  async function signInWithRecovery(
    email: string,
    password: string,
  ): Promise<{ message: string } | null> {
    const supabase = createClient();

    const firstTry = await supabase.auth.signInWithPassword({ email, password });
    if (!firstTry.error) return null;

    // Stale browser refresh tokens can cause auth API failures.
    if (!/refresh token/i.test(firstTry.error.message)) {
      return { message: firstTry.error.message };
    }

    await supabase.auth.signOut({ scope: "local" });
    const secondTry = await supabase.auth.signInWithPassword({ email, password });
    return secondTry.error ? { message: secondTry.error.message } : null;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "")
      .trim()
      .toLowerCase();
    const password = String(formData.get("password") ?? "");

    let signInError: { message: string; name?: string } | null = null;
    try {
      signInError = await signInWithRecovery(email, password);
    } catch (err) {
      setIsLoading(false);
      const message = err instanceof Error ? err.message : String(err);
      if (/failed to fetch|network|timeout/i.test(message)) {
        setError(
          "Cannot reach Supabase (network timeout). Check internet, VPN/firewall, or try http://localhost:3000/login.",
        );
      } else {
        setError(errorGeneric);
      }
      return;
    }

    if (signInError) {
      setIsLoading(false);
      if (/fetch|network|timeout/i.test(signInError.message)) {
        setError(
          "Cannot reach Supabase (network timeout). Check internet, VPN/firewall, or Supabase project status.",
        );
      } else {
        setError(errorInvalid);
      }
      return;
    }

    // Ensure session cookies are written before the server route runs.
    const supabase = createClient();
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
      setIsLoading(false);
      setError(errorGeneric);
      await supabase.auth.signOut();
      return;
    }

    const completeRes = await fetch("/api/auth/after-login", {
      method: "POST",
      credentials: "same-origin",
    });
    setIsLoading(false);

    if (!completeRes.ok) {
      if (completeRes.status === 403) {
        setError(errorInactive);
      } else if (completeRes.status === 429) {
        setError("Too many attempts. Please wait a few minutes and try again.");
      } else {
        setError(
          "Signed in, but account setup failed. Run auth:bootstrap or contact support.",
        );
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
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="pr-24"
              />
              <Button
                type="button"
                variant="ghost"
                className="absolute right-1 top-1 h-8 px-2 text-xs"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? "Hide" : "Show"}
              </Button>
            </div>
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
