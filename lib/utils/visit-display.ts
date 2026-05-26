export function labelFor(
  options: Record<string, string> | undefined,
  value: string | null | undefined,
): string {
  if (!value) return "—";
  return options?.[value] ?? value;
}

export function formatProducts(
  items: string[],
  options: Record<string, string>,
): string {
  if (items.length === 0) return "—";
  return items.map((item) => options[item] ?? item).join(", ");
}

export function boolLabel(
  value: boolean,
  yesLabel: string,
  noLabel: string,
): string {
  return value ? yesLabel : noLabel;
}
