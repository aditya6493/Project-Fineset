import { content } from "@/content/en";
import { LoginForm } from "@/components/forms/LoginForm";

interface StoreLoginPageProps {
  searchParams: Promise<{ storeName?: string; pincode?: string }>;
}

export default async function StoreLoginPage({ searchParams }: StoreLoginPageProps) {
  const c = content.auth.store;
  const { storeName, pincode } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-primary px-page-x py-12">
      <LoginForm
        providerId="store"
        title={c.title}
        subtitle={c.subtitle}
        submitLabel={c.submitLabel}
        errorMessage={c.errorInvalid}
        defaultValues={{ storeName, pincode }}
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
