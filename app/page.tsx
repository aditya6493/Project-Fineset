import { LoginScreen } from "@/components/auth/LoginScreen";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-primary px-page-x py-12">
      <LoginScreen showLogo />
    </main>
  );
}
