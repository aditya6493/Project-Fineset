import { content } from "@/content/en";
import { LoginForm } from "@/components/forms/LoginForm";

export default function StoreLoginPage() {
  const c = content.auth.store;

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-primary px-page-x py-12">
      <LoginForm
        providerId="store"
        title={c.title}
        subtitle={c.subtitle}
        submitLabel={c.submitLabel}
        errorMessage={c.errorInvalid}
        fields={[
          {
            name: "storeName",
            label: c.idLabel,
            placeholder: c.idPlaceholder,
          },
          {
            name: "pincode",
            label: c.passwordLabel,
            placeholder: c.passwordPlaceholder,
            type: "password",
          },
        ]}
      />
    </main>
  );
}
