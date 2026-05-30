import { describe, expect, it } from "vitest";
import { appSessionFromSupabaseUser } from "@/lib/auth/session-from-metadata";
import type { User } from "@supabase/supabase-js";

function makeUser(appMetadata: Record<string, unknown>): User {
  return {
    id: "auth-123",
    email: "staff@example.com",
    app_metadata: appMetadata,
    user_metadata: {},
    aud: "authenticated",
    created_at: new Date().toISOString(),
  } as User;
}

describe("appSessionFromSupabaseUser", () => {
  it("returns staff session when metadata is complete", () => {
    const session = appSessionFromSupabaseUser(
      makeUser({
        role: "STAFF",
        appUserId: "user-1",
        staffId: "staff-1",
        storeId: "store-1",
        name: "Alex",
        employeeId: "E001",
        isActive: true,
      }),
    );

    expect(session).toEqual({
      userId: "user-1",
      email: "staff@example.com",
      role: "STAFF",
      staffId: "staff-1",
      storeId: "store-1",
      name: "Alex",
      employeeId: "E001",
    });
  });

  it("returns null when metadata is incomplete", () => {
    const session = appSessionFromSupabaseUser(
      makeUser({
        role: "STAFF",
        appUserId: "user-1",
        staffId: "staff-1",
      }),
    );

    expect(session).toBeNull();
  });

  it("returns null when user is marked inactive", () => {
    const session = appSessionFromSupabaseUser(
      makeUser({
        role: "MASTER_ADMIN",
        appUserId: "user-1",
        isActive: false,
      }),
    );

    expect(session).toBeNull();
  });
});
