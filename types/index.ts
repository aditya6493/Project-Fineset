import type {
  BudgetRange,
  CustomerType,
  FollowUpStatus,
  IntentTier,
  PurchaseStatus,
  SourceChannel,
  StaffRole,
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
  VisitType,
};

export type UserRole = "STAFF" | "STORE_MANAGER" | "MASTER_ADMIN";

export interface StaffSession {
  role: "STAFF";
  staffId: string;
  storeId: string;
  name: string;
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

export interface InsightCard {
  id: string;
  title: string;
  body: string;
  metric?: { label: string; value: string; delta?: number };
  severity: "info" | "success" | "warning" | "alert";
  action?: { label: string; href: string };
}

export interface AnalyticsPeriod {
  start: string;
  end: string;
  label: "today" | "week" | "month";
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

export interface AdminKPIs {
  totalRevenue: number;
  totalVisits: number;
  conversionRate: number;
  activeStores: number;
  totalStaff: number;
}

export interface AdminKPIDeltas {
  totalRevenue: number;
  totalVisits: number;
  conversionRate: number;
}

export interface StorePerformanceRow {
  storeId: string;
  storeName: string;
  city: string;
  visits: number;
  revenue: number;
  conversionRate: number;
  staffCount: number;
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

export interface VisitListItem {
  id: string;
  visitDate: string;
  staffName: string;
  customerName: string;
  customerPhone: string;
  customerType: CustomerType;
  visitType: VisitType;
  purchaseStatus: PurchaseStatus;
  transactionAmount: number | null;
  productsPurchased: string[];
  productsExplored: string[];
  followUpNeeded: boolean;
  staffNotes: string | null;
}

export interface FollowUpListItem {
  id: string;
  visitId: string;
  customerName: string;
  customerPhone: string;
  assignedStaffName: string;
  followUpDate: string;
  reason: string | null;
  callOutcome: string | null;
  status: FollowUpStatus;
}

export interface AdminFollowUpOverview {
  summary: {
    open: number;
    overdue: number;
    converted: number;
  };
  overdueItems: Array<FollowUpListItem & { storeName: string }>;
}

export interface AnalyticsData {
  kpis: StoreKPIs | AdminKPIs;
  kpiDeltas?: StoreKPIDeltas | AdminKPIDeltas;
  visitsByDay: Array<{ date: string; visits: number; revenue: number }>;
  sourceBreakdown: Array<{ channel: SourceChannel; count: number }>;
  purchaseStatusBreakdown: Array<{ status: PurchaseStatus; count: number }>;
  noPurchaseReasons: Array<{ reason: string; count: number }>;
  storeRankings?: StorePerformanceRow[];
}

export type InsightContext = "store" | "admin";

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
}

export interface GetAnalyticsParams {
  period?: "today" | "week" | "month";
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
