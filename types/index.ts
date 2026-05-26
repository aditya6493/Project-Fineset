import type {
  BudgetRange,
  CustomerType,
  FollowUpStatus,
  IntentTier,
  PurchaseStatus,
  SourceChannel,
  StaffRole,
  StoreCategory,
  VisitType,
} from "@prisma/client";

export type {
  BudgetRange,
  CustomerType,
  FollowUpStatus,
  IntentTier,
  PurchaseStatus,
  SourceChannel,
  StaffRole,
  StoreCategory,
  VisitType,
};

export type UserRole = "STAFF" | "STORE_MANAGER" | "MASTER_ADMIN";

export interface StaffSession {
  role: "STAFF";
  staffId: string;
  storeId: string;
  name: string;
  employeeId?: string;
}

export interface StoreSession {
  role: "STORE_MANAGER";
  storeId: string;
  storeName: string;
}

export interface AdminSession {
  role: "MASTER_ADMIN";
}

export type AppSession = StaffSession | StoreSession | AdminSession;

export interface SyncState {
  version: string;
  lastChangedAt: string;
  scope: string;
  counts: {
    visits: number;
    fieldSales: number;
    staff: number;
    customers: number;
    followUps: number;
    callLogs: number;
    stores: number;
  };
}

export interface ApiErrorResponse {
  message: string;
  code?: string;
  details?: unknown;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: ApiErrorResponse,
  ) {
    super(body.message);
    this.name = "ApiError";
  }
}

export type AnalyticsPeriodLabel =
  | "today"
  | "week"
  | "month"
  | "last3months"
  | "last6months";

export interface AnalyticsPeriod {
  start: string;
  end: string;
  label: AnalyticsPeriodLabel;
}

export interface StoreKPIs {
  totalVisits: number;
  totalRevenue: number;
  conversionRate: number;
  avgTransaction: number;
  newCustomers: number;
  repeatCustomers: number;
  openFollowUps: number;
}

export interface StoreKPIDeltas {
  totalVisits: number;
  totalRevenue: number;
  conversionRate: number;
  avgTransaction: number;
  newCustomers: number;
  repeatCustomers: number;
}

export interface StorePerformanceDeltas {
  visits: number;
  revenue: number;
  conversionRate: number;
}

export interface StorePerformanceRow {
  storeId: string;
  storeName: string;
  category: StoreCategory;
  city: string;
  state: string;
  isActive: boolean;
  visits: number;
  revenue: number;
  conversionRate: number;
  staffCount: number;
  deltas?: StorePerformanceDeltas;
}

export interface AdminDashboardOverview {
  totalStores: number;
  activeStores: number;
  period: AnalyticsPeriodLabel;
  stores: StorePerformanceRow[];
}

export interface StaffPerformanceRow {
  staffId: string;
  staffName: string;
  storeId: string;
  storeName: string;
  visits: number;
  revenue: number;
  conversionRate: number;
  followUpRate: number;
}

export interface RsoPerformanceRow {
  staffId: string;
  staffName: string;
  customersAttended: number;
  purchased: number;
  notPurchased: number;
  schemesEnrolled: number;
  growthPercent: number;
  growthLabel: string;
  growthTone: "positive" | "negative" | "neutral";
  revenue: number;
  revenueLabel: string;
}

export interface StoreRsoPerformance {
  period: AnalyticsPeriodLabel;
  rows: RsoPerformanceRow[];
  topPerformer: {
    staffId: string;
    staffName: string;
    salesLabel: string;
    revenueLabel: string;
  } | null;
  mostImproved: {
    staffId: string;
    staffName: string;
    growthLabel: string;
    salesProgressLabel: string;
  } | null;
}

export interface VisitListItem {
  id: string;
  visitDate: string;
  inTime: string | null;
  outTime: string | null;
  durationMins: number | null;
  staffName: string;
  customerName: string;
  customerPhone: string;
  customerType: CustomerType;
  visitType: VisitType;
  sourceChannel: SourceChannel;
  area: string | null;
  gender: string | null;
  ageGroup: string | null;
  purchaseStatus: PurchaseStatus;
  productsExplored: string[];
  productsPurchased: string[];
  transactionAmount: number | null;
  intentTier: IntentTier | null;
  reasonNoPurchase: string | null;
  competitorMention: string | null;
  purchaseOccasion: string | null;
  metalKtPref: string | null;
  budgetStated: BudgetRange | null;
  schemeEnrolled: boolean;
  ghsPolicy: boolean;
  followUpNeeded: boolean;
  followUpDate: string | null;
  staffNotes: string | null;
  followUpStatus: FollowUpStatus | null;
}

export interface FollowUpListItem {
  id: string;
  visitId: string | null;
  customerName: string;
  customerPhone: string;
  assignedStaffName: string;
  followUpDate: string;
  reason: string | null;
  callOutcome: string | null;
  status: FollowUpStatus;
}

export type StaffCallSegment =
  | "ALL"
  | "NEW"
  | "RETAINED"
  | "PURCHASED"
  | "NOT_PURCHASED";

export type StaffCallValueTier = "ALL" | "HIGH" | "MID" | "LOW";

export type StaffCallQueue = "ALL" | "RETENTION" | "FOLLOW_UP";

export type CallAnswerStatus = "ANSWERED" | "NOT_ANSWERED";

export interface StaffCallListItem {
  visitId: string;
  followUpId: string | null;
  displayName: string;
  visitDate: string;
  visitDateLabel: string;
  customerType: CustomerType;
  purchaseStatus: PurchaseStatus;
  valueTier: Exclude<StaffCallValueTier, "ALL">;
  visitSummary: string;
  queue: StaffCallQueue;
  followUpDueDate: string | null;
  lastCallStatus: CallAnswerStatus | null;
  notes: string | null;
  canCall: boolean;
}

export interface StaffCallFilterCounts {
  segments: Array<{ key: StaffCallSegment; count: number }>;
  valueTiers: Array<{ key: StaffCallValueTier; count: number }>;
  queues: Array<{ key: StaffCallQueue; count: number }>;
  months: Array<{ month: number; count: number }>;
  availableYears: number[];
}

export interface StaffCallListResponse {
  data: StaffCallListItem[];
  total: number;
  page: number;
  pageSize: number;
  year: number;
  month: number;
  filters: StaffCallFilterCounts;
}

export interface StaffCallDialResult {
  visitId: string;
  displayName: string;
  phone: string;
  dialUrl: string;
}

export interface StaffCallOutcomeResult {
  visitId: string;
  followUpId: string | null;
  queue: StaffCallQueue;
  message: string;
}

export interface GetStaffCallsParams {
  segment?: StaffCallSegment;
  valueTier?: StaffCallValueTier;
  queue?: StaffCallQueue;
  year?: number;
  month?: number;
  page?: number;
  pageSize?: number;
}

export interface PortalCallListItem {
  visitId: string;
  followUpId: string | null;
  customerName: string;
  customerPhone: string;
  staffId: string;
  staffName: string;
  storeId: string;
  storeName: string;
  visitDate: string;
  visitDateLabel: string;
  customerType: CustomerType;
  purchaseStatus: PurchaseStatus;
  valueTier: Exclude<StaffCallValueTier, "ALL">;
  visitSummary: string;
  queue: Exclude<StaffCallQueue, "ALL">;
  followUpDueDate: string | null;
  lastCallStatus: CallAnswerStatus | null;
  notes: string | null;
}

export interface PortalCallListResponse {
  data: PortalCallListItem[];
  total: number;
  page: number;
  pageSize: number;
  year: number;
  month: number;
  filters: StaffCallFilterCounts;
}

export interface GetPortalCallsParams {
  segment?: StaffCallSegment;
  valueTier?: StaffCallValueTier;
  queue?: StaffCallQueue;
  year?: number;
  month?: number;
  page?: number;
  pageSize?: number;
  storeId?: string;
  staffId?: string;
  search?: string;
}

export interface FieldSaleListItem {
  id: string;
  activityDate: string;
  activityDateLabel: string;
  staffId: string;
  staffName: string;
  storeId: string;
  storeName: string;
  customerName: string;
  customerPhone: string;
  customerType: CustomerType;
  activityType: string;
  locationLabel: string | null;
  schemesPitched: string[];
  enrollmentOutcome: string;
  monthlyCommitment: number | null;
  intentTier: string | null;
  reasonNoEnrollment: string | null;
  followUpNeeded: boolean;
  followUpDate: string | null;
  staffNotes: string | null;
}

export interface FieldSaleListFilters {
  months: Array<{ month: number; count: number }>;
  availableYears: number[];
}

export interface FieldSaleListResponse {
  data: FieldSaleListItem[];
  total: number;
  page: number;
  pageSize: number;
  year: number;
  month: number;
  filters: FieldSaleListFilters;
}

export interface GetFieldSalesListParams {
  page?: number;
  pageSize?: number;
  year?: number;
  month?: number;
  storeId?: string;
  staffId?: string;
  search?: string;
  enrollmentOutcome?: string;
}

export interface StoreDetailAnalytics {
  store: {
    id: string;
    name: string;
    category: StoreCategory;
    city: string;
    state: string;
    isActive: boolean;
  };
  kpis: StoreKPIs;
  kpiDeltas: StoreKPIDeltas;
  visitsByDay: Array<{ date: string; visits: number; revenue: number }>;
  sourceBreakdown: Array<{ channel: SourceChannel; count: number }>;
  purchaseStatusBreakdown: Array<{ status: PurchaseStatus; count: number }>;
  noPurchaseReasons: Array<{ reason: string; count: number }>;
}

export interface AnalyticsData {
  kpis: StoreKPIs;
  kpiDeltas?: StoreKPIDeltas;
  visitsByDay?: Array<{ date: string; visits: number; revenue: number }>;
  sourceBreakdown?: Array<{ channel: SourceChannel; count: number }>;
  purchaseStatusBreakdown?: Array<{ status: PurchaseStatus; count: number }>;
  noPurchaseReasons?: Array<{ reason: string; count: number }>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface GetVisitsParams {
  page?: string;
  pageSize?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  followUpOnly?: string;
}

export interface GetAnalyticsParams {
  period?: AnalyticsPeriodLabel;
  storeId?: string;
}

export type ProductCategory =
  | "RINGS"
  | "NECKLACES"
  | "BANGLES"
  | "EARRINGS"
  | "CHAINS"
  | "PENDANTS"
  | "SETS"
  | "OTHER";

export type AgeGroup = "18-25" | "26-35" | "36-50" | "50+";

export type Gender = "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY";

export type NoPurchaseReason =
  | "BUDGET"
  | "DESIGN_NOT_LIKED"
  | "EXPLORING"
  | "COMPETITOR"
  | "PAYMENT_ISSUE"
  | "WILL_VISIT_AGAIN";

export type PurchaseOccasion =
  | "WEDDING"
  | "ANNIVERSARY"
  | "GIFT"
  | "SELF"
  | "FESTIVAL";

export type MetalKtPref =
  | "GOLD_18KT"
  | "GOLD_22KT"
  | "DIAMOND"
  | "PLATINUM"
  | "SILVER";
