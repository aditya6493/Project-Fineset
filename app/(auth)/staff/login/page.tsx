import { content } from "@/content/en";
import { LoginForm } from "@/components/forms/LoginForm";

interface StaffLoginPageProps {
  searchParams: Promise<{ name?: string; employeeId?: string }>;
}

export default async function StaffLoginPage({ searchParams }: StaffLoginPageProps) {
  const c = content.auth.staff;
  const { name, employeeId } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-primary px-page-x py-12">
      <LoginForm
        providerId="staff"
        title={c.title}
        subtitle={c.subtitle}
        submitLabel={c.submitLabel}
        errorMessage={c.errorInvalid}
        defaultValues={{ name, employeeId }}
        fields={[
          {
            name: "name",
            label: c.idLabel,
            placeholder: c.idPlaceholder,
          },
          {
            name: "employeeId",
            label: c.passwordLabel,
            placeholder: c.passwordPlaceholder,
            type: "password",
          },
        ]}
      />
    </main>
  );
}
