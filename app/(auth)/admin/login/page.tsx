import { content } from "@/content/en";
import { LoginForm } from "@/components/forms/LoginForm";

export default function AdminLoginPage() {
  const c = content.auth.admin;

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-primary px-page-x py-12">
      <LoginForm
        providerId="admin"
        title={c.title}
        subtitle={c.subtitle}
        submitLabel={c.submitLabel}
        errorMessage={c.errorInvalid}
        fields={[
          {
            name: "email",
            label: c.idLabel,
            placeholder: c.idPlaceholder,
            type: "email",
          },
          {
            name: "password",
            label: c.passwordLabel,
            placeholder: c.passwordPlaceholder,
            type: "password",
          },
        ]}
      />
    </main>
  );
}
