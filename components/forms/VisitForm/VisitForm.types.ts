import type { Content } from "@/content/en";
import type { CreateVisitInput } from "@/lib/validations/visit.schema";

export type VisitFormCopy = Content["visitForm"];
export type CommonCopy = Content["common"];
export type ErrorsCopy = Content["errors"];

export interface VisitFormProps {
  copy: VisitFormCopy;
  common: CommonCopy;
  errors: ErrorsCopy;
}

export type VisitFormValues = CreateVisitInput;

export type VisitFormSectionId =
  | "customer"
  | "visit"
  | "noPurchase"
  | "preferences"
  | "followUp";

export interface VisitFormSection {
  id: VisitFormSectionId;
  title: string;
}

export type VisitDraftFields = Pick<
  VisitFormValues,
  | "customerType"
  | "visitType"
  | "sourceChannel"
  | "area"
  | "gender"
  | "ageGroup"
  | "productsExplored"
  | "purchaseStatus"
  | "productsPurchased"
  | "intentTier"
  | "reasonNoPurchase"
  | "purchaseOccasion"
  | "metalKtPref"
  | "budgetStated"
  | "schemeEnrolled"
  | "ghsPolicy"
  | "followUpNeeded"
>;

export const VISIT_DRAFT_STORAGE_KEY = "fineset-visit-draft-v1";

export function getDefaultVisitValues(
  draft?: Partial<VisitDraftFields>,
): VisitFormValues {
  const now = new Date();

  return {
    customerName: "",
    customerPhone: "",
    customerType: draft?.customerType ?? "NEW",
    visitType: draft?.visitType ?? "WALK_IN",
    inTime: now,
    sourceChannel: draft?.sourceChannel ?? "ORGANIC_WALK_IN",
    area: draft?.area,
    gender: draft?.gender,
    ageGroup: draft?.ageGroup,
    productsExplored: draft?.productsExplored ?? [],
    purchaseStatus: draft?.purchaseStatus ?? "PENDING",
    productsPurchased: draft?.productsPurchased ?? [],
    transactionAmount: undefined,
    intentTier: draft?.intentTier,
    reasonNoPurchase: draft?.reasonNoPurchase,
    competitorMention: undefined,
    purchaseOccasion: draft?.purchaseOccasion,
    metalKtPref: draft?.metalKtPref,
    budgetStated: draft?.budgetStated,
    schemeEnrolled: draft?.schemeEnrolled ?? false,
    ghsPolicy: draft?.ghsPolicy ?? false,
    followUpNeeded: draft?.followUpNeeded ?? false,
    followUpDate: undefined,
    staffNotes: undefined,
  };
}

export function formatTimeForInput(date: Date): string {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function parseTimeInput(time: string, baseDate: Date = new Date()): Date {
  const [hours, minutes] = time.split(":").map(Number);
  const result = new Date(baseDate);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

export function formatDateForInput(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function parseDateInput(value: string): Date {
  const parsed = new Date(`${value}T12:00:00`);
  return parsed;
}

export function extractDraftFields(values: VisitFormValues): VisitDraftFields {
  return {
    customerType: values.customerType,
    visitType: values.visitType,
    sourceChannel: values.sourceChannel,
    area: values.area,
    gender: values.gender,
    ageGroup: values.ageGroup,
    productsExplored: values.productsExplored,
    purchaseStatus: values.purchaseStatus,
    productsPurchased: values.productsPurchased,
    intentTier: values.intentTier,
    reasonNoPurchase: values.reasonNoPurchase,
    purchaseOccasion: values.purchaseOccasion,
    metalKtPref: values.metalKtPref,
    budgetStated: values.budgetStated,
    schemeEnrolled: values.schemeEnrolled,
    ghsPolicy: values.ghsPolicy,
    followUpNeeded: values.followUpNeeded,
  };
}

export function getSectionFieldNames(
  sectionId: VisitFormSectionId,
): (keyof VisitFormValues)[] {
  switch (sectionId) {
    case "customer":
      return [
        "customerName",
        "customerPhone",
        "customerType",
        "visitType",
        "inTime",
        "sourceChannel",
        "area",
        "gender",
        "ageGroup",
      ];
    case "visit":
      return [
        "productsExplored",
        "purchaseStatus",
        "productsPurchased",
        "transactionAmount",
        "intentTier",
      ];
    case "noPurchase":
      return ["reasonNoPurchase", "competitorMention"];
    case "preferences":
      return [
        "purchaseOccasion",
        "metalKtPref",
        "budgetStated",
        "schemeEnrolled",
        "ghsPolicy",
      ];
    case "followUp":
      return ["followUpNeeded", "followUpDate", "staffNotes"];
  }
}

export function buildSections(
  copy: VisitFormCopy,
  purchaseStatus: VisitFormValues["purchaseStatus"],
): VisitFormSection[] {
  const all: VisitFormSection[] = [
    { id: "customer", title: copy.sections.customer },
    { id: "visit", title: copy.sections.visit },
    { id: "noPurchase", title: copy.sections.noPurchase },
    { id: "preferences", title: copy.sections.preferences },
    { id: "followUp", title: copy.sections.followUp },
  ];

  if (purchaseStatus !== "NOT_PURCHASED") {
    return all.filter((section) => section.id !== "noPurchase");
  }

  return all;
}
