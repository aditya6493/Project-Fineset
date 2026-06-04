import {
  decryptPii,
  encryptPii,
  hashPhone,
} from "@/lib/crypto/pii";
import { buildCustomerSearchFields } from "@/lib/services/customer-search";

export function prepareCustomerPii(name: string, phone: string) {
  const searchFields = buildCustomerSearchFields(name, phone);
  return {
    name: encryptPii(name),
    phone: encryptPii(phone),
    phoneHash: hashPhone(phone),
    nameSearch: searchFields.customerNameSearch,
    phoneLast4: searchFields.phoneLast4,
    customerNameSearch: searchFields.customerNameSearch,
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
