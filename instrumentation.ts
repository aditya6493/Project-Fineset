export async function register() {
  const { validateEnv } = await import("@/lib/env");
  validateEnv();

  if (process.env.NODE_ENV === "production") {
    const { ensureProductionStoreSchema } = await import(
      "@/lib/db/ensure-production-store-schema"
    );
    void ensureProductionStoreSchema().catch((error) => {
      console.error("[instrumentation] store schema ensure failed", error);
    });
  }
}
