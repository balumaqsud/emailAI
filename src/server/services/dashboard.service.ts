import { Types } from "mongoose";
import { dbConnect } from "@/src/server/db";
import { EmailClassification, EmailExtraction, Mailbox } from "@/src/server/models";
import {
  getDateRange,
  isStuck,
  isLowConfidence,
  type DashboardRangeParam,
} from "@/src/server/utils/dashboard";

const EMAIL_TYPES = [
  "invoice",
  "meeting",
  "support",
  "job_application",
  "general",
] as const;

type EmailType = (typeof EMAIL_TYPES)[number];

interface DashboardOverviewDTO {
  pipeline: {
    processing: number;
    done: number;
    failed: number;
    needsReview: number;
    stuck: number;
    avgExtractionConfidence: number | null;
    avgClassificationConfidence: number | null;
  };
  distribution: Record<EmailType, number>;
  highlights: {
    invoices: {
      count: number;
      unpaidCount: number;
      totalAmountSum: number;
      vendorsTop: string[];
    };
    meetings: {
      upcomingCount: number;
      nextMeetingStart: string | null;
    };
    support: { openCount: number; urgentCount: number };
    jobs: { activeCount: number; nextInterviewTime: string | null };
  };
  needsReview: Array<{
    messageId: string;
    type: EmailType;
    status: "processing" | "done" | "failed";
    confidence: number | null;
    missingFields: string[];
    warnings: string[];
    updatedAt: string;
  }>;
  meta: { range: DashboardRangeParam; from: string; to: string };
}

function safeNum(v: unknown): number {
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  return 0;
}

function safeStr(v: unknown): string {
  if (typeof v === "string") return v;
  return "";
}

function safeArrStr(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(safeStr).filter(Boolean);
  return [];
}

export async function buildDashboardOverview(params: {
  userId: string;
  range: DashboardRangeParam;
  /** When true (default), only include messages from mailbox folder inbox. */
  inboxOnly?: boolean;
}): Promise<DashboardOverviewDTO> {
  await dbConnect();

  const userObjectId = new Types.ObjectId(params.userId);
  const { from, to } = getDateRange(params.range);
  const now = new Date();
  const stuckCutoff = new Date(now.getTime() - 5 * 60 * 1000);
  const inboxOnly = params.inboxOnly !== false;

  const zeroDistribution: Record<EmailType, number> = {
    invoice: 0,
    meeting: 0,
    support: 0,
    job_application: 0,
    general: 0,
  };

  const emptyDTO: DashboardOverviewDTO = {
    pipeline: {
      processing: 0,
      done: 0,
      failed: 0,
      needsReview: 0,
      stuck: 0,
      avgExtractionConfidence: null,
      avgClassificationConfidence: null,
    },
    distribution: { ...zeroDistribution },
    highlights: {
      invoices: {
        count: 0,
        unpaidCount: 0,
        totalAmountSum: 0,
        vendorsTop: [],
      },
      meetings: { upcomingCount: 0, nextMeetingStart: null },
      support: { openCount: 0, urgentCount: 0 },
      jobs: { activeCount: 0, nextInterviewTime: null },
    },
    needsReview: [],
    meta: {
      range: params.range,
      from: from.toISOString(),
      to: to.toISOString(),
    },
  };

  let inboxMessageIds: Types.ObjectId[] | null = null;
  if (inboxOnly) {
    const inboxRows = await Mailbox.find({
      userId: userObjectId,
      folder: "inbox",
      createdAt: { $gte: from, $lte: to },
    })
      .select("messageId")
      .lean()
      .exec();
    inboxMessageIds = inboxRows.map((r) => r.messageId as Types.ObjectId).filter(Boolean);
  }

  const extractionMatch: Record<string, unknown> = {
    userId: userObjectId,
    createdAt: { $gte: from, $lte: to },
  };
  if (inboxMessageIds && inboxMessageIds.length > 0) {
    extractionMatch.messageId = { $in: inboxMessageIds };
  } else if (inboxMessageIds && inboxMessageIds.length === 0) {
    return emptyDTO;
  }

  const extractionDocs = await EmailExtraction.find(extractionMatch)
    .lean()
    .exec();

  // #region agent log
  fetch("http://127.0.0.1:7242/ingest/82fb972f-c31b-4021-b252-62d4c5e26664", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      location: "dashboard.service.ts:after extraction find",
      message: "extractionDocs count",
      data: {
        userId: params.userId,
        inboxOnly,
        extractionCount: extractionDocs.length,
        extractionMatch: JSON.stringify(Object.keys(extractionMatch)),
      },
      timestamp: Date.now(),
      hypothesisId: "dashboard_query",
    }),
  }).catch(() => {});
  // #endregion

  const classificationMatch: Record<string, unknown> = {
    userId: userObjectId,
    createdAt: { $gte: from, $lte: to },
  };
  if (inboxMessageIds && inboxMessageIds.length > 0) {
    classificationMatch.messageId = { $in: inboxMessageIds };
  }

  const classificationDocs = await EmailClassification.find(classificationMatch)
    .lean()
    .exec();

  let processing = 0;
  let done = 0;
  let failed = 0;
  let stuck = 0;
  let needsReviewCount = 0;
  let extractionConfidenceSum = 0;
  let extractionConfidenceN = 0;

  const needsReviewCandidates: DashboardOverviewDTO["needsReview"] = [];
  const vendorCounts: Record<string, number> = {};
  let invoicesCount = 0;
  let unpaidCount = 0;
  let totalAmountSum = 0;
  const meetingStarts: string[] = [];
  let upcomingMeetings = 0;
  let supportOpen = 0;
  let supportUrgent = 0;
  let jobsActive = 0;
  const jobInterviewTimes: string[] = [];

  for (const doc of extractionDocs) {
    const status = doc.status as string;
    if (status === "processing") {
      processing++;
      if (doc.createdAt && new Date(doc.createdAt) <= stuckCutoff) stuck++;
    } else if (status === "done") {
      done++;
      const conf = doc.confidence;
      if (typeof conf === "number" && !Number.isNaN(conf)) {
        extractionConfidenceSum += conf;
        extractionConfidenceN++;
      }
      const missing = Array.isArray(doc.missingFields) ? doc.missingFields.length : 0;
      const warn = Array.isArray(doc.warnings) ? doc.warnings.length : 0;
      const lowConf = isLowConfidence(doc.confidence);
      if (missing > 0 || warn > 0 || lowConf) {
        needsReviewCount++;
        needsReviewCandidates.push({
          messageId: String(doc.messageId),
          type: (doc.type as EmailType) ?? "general",
          status: (doc.status as "processing" | "done" | "failed") ?? "done",
          confidence: typeof doc.confidence === "number" ? doc.confidence : null,
          missingFields: Array.isArray(doc.missingFields) ? doc.missingFields : [],
          warnings: Array.isArray(doc.warnings) ? doc.warnings : [],
          updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : "",
        });
      }

      const data = doc.extractedData as Record<string, unknown> | null | undefined;
      if (data && typeof data === "object") {
        const docType = safeStr(doc.type);
        if (docType === "invoice") {
          invoicesCount++;
          const invoiceData = (data.invoice || {}) as Record<string, unknown>;
          totalAmountSum += safeNum(invoiceData.amount);
          const vendor = safeStr(data.company);
          if (vendor) vendorCounts[vendor] = (vendorCounts[vendor] ?? 0) + 1;
        } else if (docType === "meeting") {
          const meetingData = (data.meeting || {}) as Record<string, unknown>;
          const startTime = safeStr(meetingData.proposed_time);
          if (startTime) {
            const start = new Date(startTime);
            if (!Number.isNaN(start.getTime())) {
              meetingStarts.push(startTime);
              if (start > now) upcomingMeetings++;
            }
          }
        } else if (docType === "support") {
          const intent = safeStr(data.intent).toLowerCase();
          if (intent === "create_ticket") {
            supportOpen++;
            const ticket = (data.ticket || {}) as Record<string, unknown>;
            const priority = safeStr(ticket.priority).toLowerCase();
            if (priority === "urgent" || priority === "high") supportUrgent++;
          }
        } else if (docType === "job_application") {
          const stage = safeStr(data.stage).toLowerCase();
          if (stage !== "rejected") jobsActive++;
          const interviewTime = safeStr(data.interviewTime);
          if (interviewTime) {
            const t = new Date(interviewTime);
            if (!Number.isNaN(t.getTime()) && t > now) jobInterviewTimes.push(interviewTime);
          }
        }
      }
    } else if (status === "failed") {
      failed++;
      needsReviewCount++;
      needsReviewCandidates.push({
        messageId: String(doc.messageId),
        type: (doc.type as EmailType) ?? "general",
        status: "failed",
        confidence: typeof doc.confidence === "number" ? doc.confidence : null,
        missingFields: Array.isArray(doc.missingFields) ? doc.missingFields : [],
        warnings: Array.isArray(doc.warnings) ? doc.warnings : [],
        updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : "",
      });
    }
  }

  needsReviewCandidates.sort((a, b) => {
    const ta = new Date(a.updatedAt).getTime();
    const tb = new Date(b.updatedAt).getTime();
    return tb - ta;
  });
  const needsReviewSlice = needsReviewCandidates.slice(0, 20);

  for (const doc of classificationDocs) {
    const t = (doc.type as EmailType) ?? "general";
    if (EMAIL_TYPES.includes(t)) emptyDTO.distribution[t]++;
  }

  let avgClassificationConfidence: number | null = null;
  if (classificationDocs.length > 0) {
    let sum = 0;
    let n = 0;
    for (const doc of classificationDocs) {
      const c = doc.confidence;
      if (typeof c === "number" && !Number.isNaN(c)) {
        sum += c;
        n++;
      }
    }
    if (n > 0) avgClassificationConfidence = sum / n;
  }

  const vendorsTop = Object.entries(vendorCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([name]) => name);

  meetingStarts.sort();
  jobInterviewTimes.sort();

  return {
    pipeline: {
      processing,
      done,
      failed,
      needsReview: needsReviewCount,
      stuck,
      avgExtractionConfidence:
        extractionConfidenceN > 0
          ? extractionConfidenceSum / extractionConfidenceN
          : null,
      avgClassificationConfidence: avgClassificationConfidence,
    },
    distribution: { ...emptyDTO.distribution },
    highlights: {
      invoices: {
        count: invoicesCount,
        unpaidCount,
        totalAmountSum,
        vendorsTop,
      },
      meetings: {
        upcomingCount: upcomingMeetings,
        nextMeetingStart: meetingStarts[0] ?? null,
      },
      support: { openCount: supportOpen, urgentCount: supportUrgent },
      jobs: {
        activeCount: jobsActive,
        nextInterviewTime: jobInterviewTimes[0] ?? null,
      },
    },
    needsReview: needsReviewSlice,
    meta: emptyDTO.meta,
  };
}
