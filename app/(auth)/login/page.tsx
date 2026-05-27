import { Suspense } from "react";
import { content } from "@/content/en";
import { SupabaseLoginForm } from "@/components/forms/SupabaseLoginForm";

export default function LoginPage() {
  const c = content.auth.login;

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-primary px-page-x py-12">
      <Suspense fallback={<div className="text-text-secondary">{content.common.loading}</div>}>
        <SupabaseLoginForm
          title={c.title}
          subtitle={c.subtitle}
          submitLabel={c.submitLabel}
          errorInvalid={c.errorInvalid}
          errorInactive={c.errorInactive}
          errorGeneric={c.errorGeneric}
          forgotPasswordLabel={c.forgotPassword}
        />
      </Suspense>
    </main>
  );
}
