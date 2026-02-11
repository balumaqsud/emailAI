/**
 * Frontend dashboard types (mirror of module DTOs for UI).
 */

export type DashboardRange = "24h" | "7d" | "30d";

export type EmailType =
  | "invoice"
  | "meeting"
  | "support"
  | "job_application"
  | "general";

export interface DashboardPipeline {
  processing: number;
  done: number;
  failed: number;
  needsReview: number;
  stuck: number;
  avgExtractionConfidence: number | null;
  avgClassificationConfidence: number | null;
}

export interface DashboardHighlightsInvoices {
  count: number;
  unpaidCount: number;
  totalAmountSum: number;
  vendorsTop: string[];
}

export interface DashboardHighlightsMeetings {
  upcomingCount: number;
  nextMeetingStart: string | null;
}

export interface DashboardHighlightsSupport {
  openCount: number;
  urgentCount: number;
}

export interface DashboardHighlightsJobs {
  activeCount: number;
  nextInterviewTime: string | null;
}

export interface DashboardHighlights {
  invoices: DashboardHighlightsInvoices;
  meetings: DashboardHighlightsMeetings;
  support: DashboardHighlightsSupport;
  jobs: DashboardHighlightsJobs;
}

export interface NeedsReviewItem {
  messageId: string;
  type: EmailType;
  status: "processing" | "done" | "failed";
  confidence: number | null;
  missingFields: string[];
  warnings: string[];
  updatedAt: string;
}

export interface DashboardMeta {
  range: DashboardRange;
  from: string;
  to: string;
}

export interface DashboardOverviewDTO {
  pipeline: DashboardPipeline;
  distribution: Record<EmailType, number>;
  highlights: DashboardHighlights;
  needsReview: NeedsReviewItem[];
  meta: DashboardMeta;
}
