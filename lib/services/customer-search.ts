import type { Prisma } from "@prisma/client";
import { isEncryptionEnabled } from "@/lib/crypto/pii";
import { hashPhone } from "@/lib/services/pii";

/** Lowercase normalized name for case-insensitive DB search (display name stays encrypted). */
export function normalizeCustomerNameSearch(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Last four digits of a phone for partial phone lookup. */
export function extractPhoneLast4(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return null;
  return digits.slice(-4);
}

export function buildCustomerSearchFields(name: string, phone: string) {
  return {
    customerNameSearch: normalizeCustomerNameSearch(name),
    phoneLast4: extractPhoneLast4(phone),
  };
}

function phoneLast4FromQuery(normalizedPhone: string): string | null {
  if (normalizedPhone.length < 4) return null;
  return normalizedPhone.length === 4
    ? normalizedPhone
    : normalizedPhone.slice(-4);
}

export function buildVisitSearchWhere(search: string): Prisma.VisitWhereInput | null {
  const trimmed = search.trim();
  if (!trimmed) return null;

  const normalizedPhone = trimmed.replace(/\D/g, "");
  const nameTerm = normalizeCustomerNameSearch(trimmed);
  const conditions: Prisma.VisitWhereInput[] = [
    { customerNameSearch: { contains: nameTerm, mode: "insensitive" } },
    { staff: { name: { contains: trimmed, mode: "insensitive" } } },
  ];

  if (normalizedPhone.length === 10) {
    conditions.push({ customerPhoneHash: hashPhone(normalizedPhone) });
  } else {
    const last4 = phoneLast4FromQuery(normalizedPhone);
    if (last4) conditions.push({ phoneLast4: last4 });
  }

  if (!isEncryptionEnabled()) {
    conditions.push({
      customerName: { contains: trimmed, mode: "insensitive" },
    });
  }

  return { OR: conditions };
}

export function buildCustomerSearchWhere(
  search: string,
): Prisma.CustomerWhereInput | null {
  const trimmed = search.trim();
  if (!trimmed) return null;

  const normalizedPhone = trimmed.replace(/\D/g, "");
  const nameTerm = normalizeCustomerNameSearch(trimmed);
  const conditions: Prisma.CustomerWhereInput[] = [
    { nameSearch: { contains: nameTerm, mode: "insensitive" } },
  ];

  if (normalizedPhone.length === 10) {
    conditions.push({ phoneHash: hashPhone(normalizedPhone) });
  } else {
    const last4 = phoneLast4FromQuery(normalizedPhone);
    if (last4) conditions.push({ phoneLast4: last4 });
  }

  if (!isEncryptionEnabled()) {
    conditions.push({ name: { contains: trimmed, mode: "insensitive" } });
  }

  return { OR: conditions };
}

export function buildFieldSaleSearchWhere(
  search: string,
): Prisma.FieldSaleWhereInput | null {
  const trimmed = search.trim();
  if (!trimmed) return null;

  const normalizedPhone = trimmed.replace(/\D/g, "");
  const nameTerm = normalizeCustomerNameSearch(trimmed);
  const conditions: Prisma.FieldSaleWhereInput[] = [
    { customerNameSearch: { contains: nameTerm, mode: "insensitive" } },
    { staff: { name: { contains: trimmed, mode: "insensitive" } } },
  ];

  if (normalizedPhone.length === 10) {
    conditions.push({ customerPhoneHash: hashPhone(normalizedPhone) });
  } else {
    const last4 = phoneLast4FromQuery(normalizedPhone);
    if (last4) conditions.push({ phoneLast4: last4 });
  }

  if (!isEncryptionEnabled()) {
    conditions.push({
      customerName: { contains: trimmed, mode: "insensitive" },
    });
  }

  return { OR: conditions };
}
