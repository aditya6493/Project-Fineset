import { z } from "zod";
import { paginationQuerySchema, phoneSchema, sortOrderSchema } from "./common.schema";

const customerTypeSchema = z.enum(["NEW", "REPEAT", "VIP"]);
const visitTypeSchema = z.enum(["WALK_IN", "APPOINTMENT"]);
const purchaseStatusSchema = z.enum(["PURCHASED", "NOT_PURCHASED", "PENDING"]);
const intentTierSchema = z.enum(["HOT", "WARM", "COLD", "BROWSING"]);
const budgetRangeSchema = z.enum([
  "UNDER_15K",
  "K15_50K",
  "K50_1L",
  "ABOVE_1L",
  "NOT_STATED",
]);
const sourceChannelSchema = z.enum([
  "ORGANIC_WALK_IN",
  "REFERRAL",
  "SOCIAL_MEDIA",
  "INTERNET",
  "PHONE",
  "TANISHQ_REF",
  "CARATLANE_REF",
  "OTHER",
]);
const productCategorySchema = z.enum([
  "RINGS",
  "NECKLACES",
  "BANGLES",
  "EARRINGS",
  "CHAINS",
  "PENDANTS",
  "SETS",
  "OTHER",
]);
const genderSchema = z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"]);
const ageGroupSchema = z.enum(["18-25", "26-35", "36-50", "50+"]);
const noPurchaseReasonSchema = z.enum([
  "BUDGET",
  "DESIGN_NOT_LIKED",
  "EXPLORING",
  "COMPETITOR",
  "PAYMENT_ISSUE",
  "WILL_VISIT_AGAIN",
]);
const purchaseOccasionSchema = z.enum([
  "WEDDING",
  "ANNIVERSARY",
  "GIFT",
  "SELF",
  "FESTIVAL",
]);
const metalKtPrefSchema = z.enum([
  "GOLD_18KT",
  "GOLD_22KT",
  "DIAMOND",
  "PLATINUM",
  "SILVER",
]);

export const createVisitSchema = z
  .object({
    customerName: z.string().min(1).max(100),
    customerPhone: phoneSchema,
    customerType: customerTypeSchema,
    visitType: visitTypeSchema,
    inTime: z.coerce.date().optional(),
    sourceChannel: sourceChannelSchema,
    area: z.string().max(100).optional(),
    gender: genderSchema.optional(),
    ageGroup: ageGroupSchema.optional(),
    productsExplored: z.array(productCategorySchema).min(1),
    purchaseStatus: purchaseStatusSchema,
    productsPurchased: z.array(productCategorySchema).default([]),
    transactionAmount: z.coerce.number().positive().optional(),
    intentTier: intentTierSchema.optional(),
    reasonNoPurchase: noPurchaseReasonSchema.optional(),
    competitorMention: z.string().max(200).optional(),
    purchaseOccasion: purchaseOccasionSchema.optional(),
    metalKtPref: metalKtPrefSchema.optional(),
    budgetStated: budgetRangeSchema.optional(),
    schemeEnrolled: z.boolean().default(false),
    ghsPolicy: z.boolean().default(false),
    followUpNeeded: z.boolean().default(false),
    followUpDate: z.coerce.date().optional(),
    staffNotes: z.string().max(500).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.purchaseStatus === "PURCHASED") {
      if (!data.transactionAmount) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Transaction amount is required for purchases",
          path: ["transactionAmount"],
        });
      }
      if (data.productsPurchased.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "At least one purchased product is required",
          path: ["productsPurchased"],
        });
      }
    }

    if (data.purchaseStatus === "NOT_PURCHASED" && !data.reasonNoPurchase) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Reason is required when purchase was not made",
        path: ["reasonNoPurchase"],
      });
    }

    if (data.followUpNeeded && !data.followUpDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Follow-up date is required when follow-up is needed",
        path: ["followUpDate"],
      });
    }
  });

export const getVisitsQuerySchema = paginationQuerySchema.extend({
  search: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  sortBy: z
    .enum(["visitDate", "transactionAmount", "customerName", "purchaseStatus"])
    .default("visitDate"),
  sortOrder: sortOrderSchema,
  storeId: z.string().optional(),
  followUpOnly: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => v === "true"),
});

export type CreateVisitInput = z.infer<typeof createVisitSchema>;
export type GetVisitsQuery = z.infer<typeof getVisitsQuerySchema>;

export {
  customerTypeSchema,
  visitTypeSchema,
  purchaseStatusSchema,
  intentTierSchema,
  budgetRangeSchema,
  sourceChannelSchema,
  productCategorySchema,
};
