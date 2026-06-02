"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { signInAction } from "@/lib/auth/sign-in-action";
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

interface SupabaseLoginFormProps {
  title: string;
  subtitle: string;
  submitLabel: string;
  errorInvalid: string;
  errorInactive: string;
  errorGeneric: string;
  errorWrongPortal: string;
  forgotPasswordLabel: string;
  forgotPasswordEmailRequired: string;
  resetEmailSent: string;
  resetEmailError: string;
  resetEmailRateLimited: string;
  resetSuccessMessage: string;
}

export function SupabaseLoginForm({
  title,
  subtitle,
  submitLabel,
  errorInvalid,
  errorInactive,
  errorGeneric,
  errorWrongPortal,
  forgotPasswordLabel,
  forgotPasswordEmailRequired,
  resetEmailSent,
  resetEmailError,
  resetEmailRateLimited,
  resetSuccessMessage,
}: SupabaseLoginFormProps) {
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const submitGuardRef = useRef(false);

  const callbackUrl = searchParams.get("callbackUrl");
  const urlError = searchParams.get("error");
  const resetStatus = searchParams.get("reset");

  const initialMessage =
    resetStatus === "success"
      ? resetSuccessMessage
      : null;

  const [urlBootstrapError, setUrlBootstrapError] = useState<string | null>(null);

  useEffect(() => {
    if (!urlError) return;

    const message =
      urlError === "account_inactive"
        ? errorInactive
        : urlError === "wrong_portal"
          ? errorWrongPortal
          : errorInvalid;
    setUrlBootstrapError(message);

    const url = new URL(window.location.href);
    if (!url.searchParams.has("error")) return;
    url.searchParams.delete("error");
    const next = `${url.pathname}${url.search}`;
    window.history.replaceState(null, "", next);
  }, [urlError, errorInactive, errorWrongPortal, errorInvalid]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitGuardRef.current || isPending) {
      return;
    }

    submitGuardRef.current = true;
    setError(null);
    setUrlBootstrapError(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "")
      .trim()
      .toLowerCase();
    const password = String(formData.get("password") ?? "");

    startTransition(async () => {
      try {
        const result = await signInAction(email, password, callbackUrl);

        if (!result.ok) {
          submitGuardRef.current = false;
          switch (result.code) {
            case "invalid_credentials":
              setError(errorInvalid);
              break;
            case "inactive":
              setError(errorInactive);
              break;
            case "rate_limited":
              setError("Too many attempts. Please wait a few minutes and try again.");
              break;
            default:
              setError(errorGeneric);
          }
          return;
        }

        // Full navigation keeps loading state until redirect completes.
        window.location.assign(result.redirectTo);
      } catch (err) {
        submitGuardRef.current = false;
        const message = err instanceof Error ? err.message : String(err);
        if (/failed to fetch|network|timeout/i.test(message)) {
          setError(
            "Cannot reach the server (network timeout). Check your connection and try again.",
          );
        } else {
          setError(errorGeneric);
        }
      }
    });
  }

  async function handleForgotPassword() {
    const emailInput = document.getElementById("email") as HTMLInputElement | null;
    const email = emailInput?.value?.trim().toLowerCase();
    if (!email) {
      setError(forgotPasswordEmailRequired);
      return;
    }

    setError(null);

    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=/login`;
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (resetError) {
      if (resetError.status === 429) {
        setError(resetEmailRateLimited);
      } else {
        setError(resetEmailError);
      }
      return;
    }

    alert(resetEmailSent);
  }

  const isLoading = isPending;

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
              disabled={isLoading}
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
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                className="absolute right-1 top-1 h-8 px-2 text-xs"
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={isLoading}
              >
                {showPassword ? "Hide" : "Show"}
              </Button>
            </div>
          </div>

          {initialMessage && (
            <p className="text-sm text-status-success" role="status">
              {initialMessage}
            </p>
          )}

          {!isLoading && (error || urlBootstrapError) && (
            <p className="text-sm text-status-error" role="alert">
              {error ?? urlBootstrapError}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in…" : submitLabel}
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
