import { z } from "zod";

export const CRM_SUPPORT_SCHEMA_VERSION = "support_v1";
export const CRM_SUPPORT_PROMPT_VERSION = "support_v1";

export const CRM_INVOICE_SCHEMA_VERSION = "invoice_v1";
export const CRM_INVOICE_PROMPT_VERSION = "invoice_v1";

export const CRM_MEETING_SCHEMA_VERSION = "meeting_v1";
export const CRM_MEETING_PROMPT_VERSION = "meeting_v1";

export const SupportTicketExtractionSchema = z
  .object({
    intent: z.literal("create_ticket"),
    contact: z
      .object({
        name: z.string().optional(),
        email: z.string().optional(),
      })
      .optional(),
    company: z.string().optional(),
    ticket: z
      .object({
        issue: z.string().optional(),
        priority: z
          .enum(["low", "medium", "high", "urgent"])
          .optional(),
        urgency_reason: z.string().optional(),
      })
      .optional(),
  })
  .strict();

export const DealExtractionSchema = z
  .object({
    intent: z.enum(["create_deal", "create_lead"]),
    contact: z
      .object({
        name: z.string().optional(),
        email: z.string().optional(),
      })
      .optional(),
    company: z.string().optional(),
    deal: z
      .object({
        product: z.string().optional(),
        users_requested: z.number().optional(),
        stage: z.string().optional(),
      })
      .optional(),
    task: z
      .object({
        action: z.string().optional(),
      })
      .optional(),
  })
  .strict();

export const InvoiceExtractionSchema = z
  .object({
    intent: z.literal("create_invoice"),
    company: z.string().optional(),
    invoice: z
      .object({
        invoice_number: z.string().optional(),
        amount: z.number().optional(),
        currency: z.string().optional(),
        due_date: z.string().optional(),
      })
      .optional(),
  })
  .strict();

export const MeetingExtractionSchema = z
  .object({
    intent: z.literal("schedule_meeting"),
    contact: z
      .object({
        name: z.string().optional(),
        email: z.string().optional(),
      })
      .optional(),
    meeting: z
      .object({
        proposed_time: z.string().optional(),
        topic: z.string().optional(),
      })
      .optional(),
  })
  .strict();

export const CrmSupportOrDealSchema = z.union([
  SupportTicketExtractionSchema,
  DealExtractionSchema,
]);

export type SupportTicketExtraction = z.infer<
  typeof SupportTicketExtractionSchema
>;
export type DealExtraction = z.infer<typeof DealExtractionSchema>;
export type InvoiceExtraction = z.infer<typeof InvoiceExtractionSchema>;
export type MeetingExtraction = z.infer<typeof MeetingExtractionSchema>;
export type CrmSupportOrDealExtraction = z.infer<
  typeof CrmSupportOrDealSchema
>;

