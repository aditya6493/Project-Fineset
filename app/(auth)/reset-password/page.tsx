import { Suspense } from "react";
import { content } from "@/content/en";
import { ResetPasswordForm } from "@/components/forms/ResetPasswordForm";
import { isDevAuthBypassEnabled } from "@/lib/auth/dev-bypass";

export default function ResetPasswordPage() {
  const c = content.auth.resetPassword;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const devBypass = isDevAuthBypassEnabled();

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-primary px-page-x py-12">
      {supabaseUrl ? (
        <>
          <link rel="preconnect" href={supabaseUrl} />
          <link rel="dns-prefetch" href={supabaseUrl} />
        </>
      ) : null}
      <div className="flex w-full max-w-md flex-col gap-4">
        {devBypass ? (
          <p className="rounded-input border border-status-warning/30 bg-status-warning/10 px-4 py-3 text-sm text-text-secondary">
            Dev mode: password reset requires a Supabase recovery link. Use forgot
            password on the sign-in page with Supabase auth enabled.
          </p>
        ) : null}
        <Suspense fallback={<div className="text-text-secondary">{content.common.loading}</div>}>
          <ResetPasswordForm
            title={c.title}
            subtitle={c.subtitle}
            passwordLabel={c.passwordLabel}
            passwordPlaceholder={c.passwordPlaceholder}
            confirmPasswordLabel={c.confirmPasswordLabel}
            confirmPasswordPlaceholder={c.confirmPasswordPlaceholder}
            submitLabel={c.submitLabel}
            backToSignInLabel={c.backToSignIn}
            errorGeneric={c.errorGeneric}
            errorMismatch={c.errorMismatch}
            errorNoSession={c.errorNoSession}
          />
        </Suspense>
      </div>
    </main>
  );
}
