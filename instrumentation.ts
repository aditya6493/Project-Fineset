export async function register() {
  const { validateEnv } = await import("@/lib/env");
  validateEnv();

  if (process.env.NODE_ENV === "production") {
    const { ensureProductionStoreSchema } = await import(
      "@/lib/db/ensure-production-store-schema"
    );
    const { ensureProductionCustomerSchema } = await import(
      "@/lib/db/ensure-production-customer-schema"
    );
    void ensureProductionStoreSchema().catch((error) => {
      console.error("[instrumentation] store schema ensure failed", error);
    });
    void ensureProductionCustomerSchema().catch((error) => {
      console.error("[instrumentation] customer schema ensure failed", error);
    });
  }
}
