import { content } from "@/content/en";
import { LoginForm } from "@/components/forms/LoginForm";

export default function StaffLoginPage() {
  const c = content.auth.staff;

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-primary px-page-x py-12">
      <LoginForm
        providerId="staff"
        title={c.title}
        subtitle={c.subtitle}
        submitLabel={c.submitLabel}
        errorMessage={c.errorInvalid}
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
