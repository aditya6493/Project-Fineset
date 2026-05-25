import {
  decryptPii,
  encryptPii,
  hashPhone,
} from "@/lib/crypto/pii";

export function prepareCustomerPii(name: string, phone: string) {
  return {
    name: encryptPii(name),
    phone: encryptPii(phone),
    phoneHash: hashPhone(phone),
  };
}

export function decryptCustomerFields<T extends { name: string; phone: string }>(
  record: T,
): T {
  return {
    ...record,
    name: decryptPii(record.name),
    phone: decryptPii(record.phone),
  };
}

export function decryptVisitPii<T extends { customerName: string; customerPhone: string }>(
  record: T,
): T {
  return {
    ...record,
    customerName: decryptPii(record.customerName),
    customerPhone: decryptPii(record.customerPhone),
  };
}

export { hashPhone };
