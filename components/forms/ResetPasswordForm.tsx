"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { clearPasswordRecoveryFlowAction } from "@/lib/auth/clear-password-recovery-flow";
import { createClient } from "@/lib/supabase/client";
import { isInvalidRefreshTokenError } from "@/lib/supabase/auth-errors";
import { validatePassword } from "@/lib/auth/password-policy";
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

interface ResetPasswordFormProps {
  title: string;
  subtitle: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  confirmPasswordLabel: string;
  confirmPasswordPlaceholder: string;
  submitLabel: string;
  backToSignInLabel: string;
  errorGeneric: string;
  errorMismatch: string;
  errorNoSession: string;
  errorAuthCallback: string;
}

export function ResetPasswordForm({
  title,
  subtitle,
  passwordLabel,
  passwordPlaceholder,
  confirmPasswordLabel,
  confirmPasswordPlaceholder,
  submitLabel,
  backToSignInLabel,
  errorGeneric,
  errorMismatch,
  errorNoSession,
  errorAuthCallback,
}: ResetPasswordFormProps) {
  const searchParams = useSearchParams();
  const callbackError = searchParams.get("error");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const submitGuardRef = useRef(false);

  useEffect(() => {
    const supabase = createClient();

    async function syncSession() {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error && isInvalidRefreshTokenError(error)) {
        await supabase.auth.signOut();
        setHasSession(false);
      } else {
        setHasSession(Boolean(user));
      }
      setSessionChecked(true);
    }

    void syncSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN" || session) {
        setHasSession(Boolean(session));
        setSessionChecked(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitGuardRef.current || isPending || !hasSession) {
      return;
    }

    submitGuardRef.current = true;
    setError(null);

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (password !== confirmPassword) {
      submitGuardRef.current = false;
      setError(errorMismatch);
      return;
    }

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.success) {
      submitGuardRef.current = false;
      setError(passwordCheck.error ?? errorGeneric);
      return;
    }

    startTransition(async () => {
      try {
        const supabase = createClient();
        const { error: updateError } = await supabase.auth.updateUser({ password });

        if (updateError) {
          submitGuardRef.current = false;
          setError(errorGeneric);
          return;
        }

        await clearPasswordRecoveryFlowAction();
        await supabase.auth.signOut();
        window.location.assign("/?reset=success");
      } catch {
        submitGuardRef.current = false;
        setError(errorGeneric);
      }
    });
  }

  const isLoading = isPending || !sessionChecked;

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        {sessionChecked && !hasSession ? (
          <div className="space-y-4">
            <p className="text-sm text-status-error" role="alert">
              {callbackError === "auth_callback" ? errorAuthCallback : errorNoSession}
            </p>
            <Button asChild className="w-full">
              <Link href="/">{backToSignInLabel}</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">{passwordLabel}</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={passwordPlaceholder}
                  required
                  autoComplete="new-password"
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{confirmPasswordLabel}</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder={confirmPasswordPlaceholder}
                  required
                  autoComplete="new-password"
                  className="pr-24"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  className="absolute right-1 top-1 h-8 px-2 text-xs"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </Button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-status-error" role="alert">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isPending ? "Updating…" : submitLabel}
            </Button>

            <Button asChild type="button" variant="ghost" className="w-full text-sm">
              <Link href="/">{backToSignInLabel}</Link>
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
