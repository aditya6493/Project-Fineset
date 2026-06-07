const indianNumberFormatter = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 0,
});

export function parseCurrencyInput(value: string): number | undefined {
  const digits = value.replace(/\D/g, "");
  if (!digits) return undefined;

  const parsed = Number(digits);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return undefined;
  }

  return parsed;
}

export function formatCurrencyInput(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) {
    return "";
  }

  return indianNumberFormatter.format(value);
}
