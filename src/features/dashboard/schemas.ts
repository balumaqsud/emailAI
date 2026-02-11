import { z } from "zod";

const dashboardRangeSchema = z.enum(["24h", "7d", "30d"]);
const emailTypeSchema = z.enum([
  "invoice",
  "meeting",
  "support",
  "job_application",
  "general",
]);

const pipelineSchema = z.object({
  processing: z.number(),
  done: z.number(),
  failed: z.number(),
  needsReview: z.number(),
  stuck: z.number(),
  avgExtractionConfidence: z.number().nullable(),
  avgClassificationConfidence: z.number().nullable(),
});

const highlightsInvoicesSchema = z.object({
  count: z.number(),
  unpaidCount: z.number(),
  totalAmountSum: z.number(),
  vendorsTop: z.array(z.string()),
});

const highlightsMeetingsSchema = z.object({
  upcomingCount: z.number(),
  nextMeetingStart: z.string().nullable(),
});

const highlightsSupportSchema = z.object({
  openCount: z.number(),
  urgentCount: z.number(),
});

const highlightsJobsSchema = z.object({
  activeCount: z.number(),
  nextInterviewTime: z.string().nullable(),
});

const highlightsSchema = z.object({
  invoices: highlightsInvoicesSchema,
  meetings: highlightsMeetingsSchema,
  support: highlightsSupportSchema,
  jobs: highlightsJobsSchema,
});

const needsReviewItemSchema = z.object({
  messageId: z.string(),
  type: emailTypeSchema,
  status: z.enum(["processing", "done", "failed"]),
  confidence: z.number().nullable(),
  missingFields: z.array(z.string()),
  warnings: z.array(z.string()),
  updatedAt: z.string(),
});

const metaSchema = z.object({
  range: dashboardRangeSchema,
  from: z.string(),
  to: z.string(),
});

const distributionSchema = z.record(emailTypeSchema, z.number());

export const dashboardOverviewSchema = z.object({
  pipeline: pipelineSchema,
  distribution: distributionSchema,
  highlights: highlightsSchema,
  needsReview: z.array(needsReviewItemSchema),
  meta: metaSchema,
});

export type DashboardOverviewSchema = z.infer<typeof dashboardOverviewSchema>;
