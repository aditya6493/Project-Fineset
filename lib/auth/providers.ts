import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import type { NextAuthConfig } from "next-auth";
import { checkLoginRateLimit, getRequestIdentifier } from "@/lib/rate-limit";
import { getAdminPasswordHash } from "@/lib/auth/admin-credentials";

async function enforceLoginRateLimit(): Promise<boolean> {
  const identifier = await getRequestIdentifier();
  const result = await checkLoginRateLimit(identifier);
  return result.success;
}

export const authProviders: NextAuthConfig["providers"] = [
  Credentials({
    id: "staff",
    name: "Staff",
    credentials: {
      name: { label: "Employee Name", type: "text" },
      employeeId: { label: "Employee ID", type: "password" },
    },
    async authorize(credentials) {
      if (!(await enforceLoginRateLimit())) return null;

      const name = credentials?.name?.trim();
      const employeeId = credentials?.employeeId?.trim();

      if (typeof name !== "string" || typeof employeeId !== "string") {
        return null;
      }

      const staff = await prisma.staff.findFirst({
        where: {
          name: { equals: name, mode: "insensitive" },
          employeeId,
          isActive: true,
          role: "STAFF",
        },
      });

      if (!staff) return null;

      return {
        id: staff.id,
        role: "STAFF" as const,
        staffId: staff.id,
        storeId: staff.storeId,
        name: staff.name,
      };
    },
  }),
  Credentials({
    id: "store",
    name: "Store",
    credentials: {
      storeName: { label: "Store Name", type: "text" },
      pincode: { label: "Pincode", type: "password" },
    },
    async authorize(credentials) {
      if (!(await enforceLoginRateLimit())) return null;

      const storeName = credentials?.storeName;
      const pincode = credentials?.pincode;

      if (typeof storeName !== "string" || typeof pincode !== "string") {
        return null;
      }

      const store = await prisma.store.findFirst({
        where: {
          name: { equals: storeName, mode: "insensitive" },
          pincode,
          isActive: true,
        },
      });

      if (!store) return null;

      return {
        id: store.id,
        role: "STORE_MANAGER" as const,
        storeId: store.id,
        storeName: store.name,
      };
    },
  }),
  Credentials({
    id: "admin",
    name: "Admin",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!(await enforceLoginRateLimit())) return null;

      const email = credentials?.email;
      const password = credentials?.password;

      if (typeof email !== "string" || typeof password !== "string") {
        return null;
      }

      const adminEmail = process.env.ADMIN_EMAIL;
      const adminPasswordHash = getAdminPasswordHash();

      if (!adminEmail || !adminPasswordHash) return null;
      if (email.toLowerCase() !== adminEmail.toLowerCase()) return null;

      const valid = await bcrypt.compare(password, adminPasswordHash);
      if (!valid) return null;

      return {
        id: "master-admin",
        role: "MASTER_ADMIN" as const,
      };
    },
  }),
];
