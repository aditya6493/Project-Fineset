export function maskCustomerDisplayName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Customer";
  if (parts.length === 1) {
    const part = parts[0];
    return part.length <= 2 ? `${part.charAt(0)}*` : `${part.slice(0, 2)}***`;
  }

  return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
}

export function maskCustomerPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return "***";
  return `***-***-${digits.slice(-4)}`;
}
