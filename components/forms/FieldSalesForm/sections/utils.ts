import type { FieldSalesFormSectionId } from "../FieldSalesForm.types";

export function shouldShowSection(
  sectionId: FieldSalesFormSectionId,
  activeSection: FieldSalesFormSectionId | undefined,
  mode: "wizard" | "full",
): boolean {
  if (mode === "full") return true;
  return sectionId === activeSection;
}
