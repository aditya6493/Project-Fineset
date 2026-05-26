import type { VisitFormSectionId } from "../VisitForm.types";

export function shouldShowSection(
  sectionId: VisitFormSectionId,
  activeSection: VisitFormSectionId | undefined,
  mode: "wizard" | "full",
): boolean {
  if (mode === "full") return true;
  return sectionId === activeSection;
}
