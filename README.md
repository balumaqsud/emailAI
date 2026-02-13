# Email App — Project Overview

## Project Summary

Next.js email application with AI-powered classification and extraction. Supports both internal email (user-to-user) and Gmail OAuth sync. Uses MongoDB (Mongoose), JWT auth, OpenAI for email analysis, and Tailwind CSS for UI.

---

## File & Folder Structure

### Root

| File / Folder | Purpose |
|---------------|---------|
| `.env` | Environment variables (not committed) |
| `.env.example` | Example env vars for setup |
| `package.json` | Dependencies and scripts |
| `next.config.ts` | Next.js configuration |
| `tsconfig.json` | TypeScript config |
| `tailwind.config.js` | Tailwind CSS config |
| `postcss.config.js` | PostCSS config |
| `next-env.d.ts` | Next.js TypeScript declarations |

---

### Pages (`pages/`)

**App Pages**

| Route | File | Description |
|-------|------|-------------|
| `/` | `index.tsx` | Landing / home |
| `/dashboard` | `dashboard/index.tsx` | Dashboard with AI insights |
| `/inbox` | `inbox/index.tsx` | Inbox list |
| `/inbox/[id]` | `inbox/[id].tsx` | Single email detail |
| `/app/compose` | `app/compose.tsx` | Compose new email |
| `/auth/login` | `auth/login.tsx` | Login |
| `/auth/register` | `auth/register.tsx` | Register |
| `/auth/google-callback` | `auth/google-callback.tsx` | Google OAuth callback |
| `/auth/google-calendar-callback` | `auth/google-calendar-callback.tsx` | Google Calendar OAuth callback |
| `/auth/gmail-callback` | `auth/gmail-callback.tsx` | Gmail OAuth callback |
| `/meetings` | `meetings/index.tsx` | Meetings list |
| `/meetings/[id]` | `meetings/[id].tsx` | Meeting detail with transcript |

**API Routes**

| Route | File | Description |
|-------|------|-------------|
| `/api/hello` | `api/hello.ts` | Test endpoint |
| `/api/auth/login` | `api/auth/login.ts` | Login |
| `/api/auth/register` | `api/auth/register.ts` | Register |
| `/api/auth/me` | `api/auth/me.ts` | Current user |
| `/api/auth/google/url` | `api/auth/google/url.ts` | Google OAuth URL |
| `/api/auth/google/callback` | `api/auth/google/callback.ts` | Google OAuth callback |
| `/api/auth/gmail/url` | `api/auth/gmail/url.ts` | Gmail OAuth URL |
| `/api/auth/gmail/callback` | `api/auth/gmail/callback.ts` | Gmail OAuth callback |
| `/api/mail` | `api/mail/index.ts` | List mail |
| `/api/mail/send` | `api/mail/send.ts` | Send mail |
| `/api/mail/[messageId]` | `api/mail/[messageId]/index.ts` | Get message |
| `/api/mail/[messageId]/read` | `api/mail/[messageId]/read.ts` | Mark read |
| `/api/mail/[messageId]/move` | `api/mail/[messageId]/move.ts` | Move to folder |
| `/api/gmail/sync` | `api/gmail/sync.ts` | Sync Gmail inbox |
| `/api/ai/email/[messageId]` | `api/ai/email/[messageId].ts` | AI classify / extract |
| `/api/ai/email/details/[messageId]` | `api/ai/email/details/[messageId].ts` | AI details for message |
| `/api/ai/insights` | `api/ai/insights.ts` | Dashboard AI insights |
| `/api/dashboard/overview` | `api/dashboard/overview.ts` | Dashboard overview data |
| `/api/meetings` | `api/meetings/index.ts` | List / schedule meetings |
| `/api/meetings/[id]` | `api/meetings/[id]/index.ts` | Meeting detail |
| `/api/meetings/[id]/transcript` | `api/meetings/[id]/transcript.ts` | Transcript chunks |
| `/api/meetings/[id]/finalize` | `api/meetings/[id]/finalize.ts` | Finalize meeting |
| `/api/recall/webhook` | `api/recall/webhook.ts` | Recall.ai webhook receiver |

**Layout**

| File | Purpose |
|------|---------|
| `_app.tsx` | App wrapper, providers |
| `_document.tsx` | HTML document structure |

---

### Components (`components/`)

**Dashboard**

- `AiPipelineCard.tsx` — AI pipeline stats
- `IdentifiedHighlights.tsx` — Highlighted items
- `NeedsReviewTable.tsx` — Items needing review
- `TypeDistributionChart.tsx` — Email type distribution

**Header**

- `ActionsBar.tsx` — Header actions
- `SearchBox.tsx` — Search
- `Topbar.tsx` — Top bar
- `UserMenu.tsx` — User dropdown

**Inbox**

- `InboxAiDetailsModal.tsx` — AI analysis modal
- `InboxAiRow.tsx` — Row with AI info

**Layout**

- `AppLayout.tsx` — Main app layout
- `PageContainer.tsx` — Page wrapper

**Meetings**

- `ScheduleMeetingModal.tsx` — Schedule meeting form
- `MeetingsTable.tsx` — Meetings list table
- `TranscriptFeed.tsx` — Live transcript display
- `MeetingSummaryCard.tsx` — Summary and action items

**Mail**

- `ComposeForm.tsx` — Compose form
- `Labels.tsx` — Folder labels
- `MailList.tsx` — Mail list
- `MailListItem.tsx` — Single mail row

**Navigation**

- `Sidebar.tsx` — Side navigation
- `SidebarItem.tsx` — Sidebar item
- `SidebarSection.tsx` — Sidebar section

**UI**

- `Badge.tsx`, `Button.tsx`, `Card.tsx`, `Dropdown.tsx`, `Input.tsx`, `Modal.tsx`, `Spinner.tsx`

---

### Styles (`styles/`)

| File | Scope |
|------|-------|
| `globals.css` | Global styles |
| `AppLayout.module.css` | App layout |
| `Auth.module.css` | Auth pages |
| `Compose.module.css` | Compose |
| `Mail.module.css` | Mail views |

---

### Source (`src/`)

**Features (client-side)**

- `features/dashboard/dashboardClient.ts` — Dashboard API client
- `features/dashboard/schemas.ts` — Zod schemas
- `features/dashboard/types.ts` — Types
- `features/dashboard/useDashboardOverview.ts` — SWR hook for overview

**Lib (shared / client)**

- `lib/auth/api.ts` — Auth API helpers
- `lib/auth/context.tsx` — Auth context
- `lib/auth/routeGuard.tsx` — Route protection
- `lib/auth/storage.ts` — Token storage
- `lib/auth/types.ts` — Auth types
- `lib/constants/folders.ts` — Mail folders constant
- `lib/mail/api.ts` — Mail API client
- `lib/mail/types.ts` — Mail types

**Modules (alternative / legacy)**

- `modules/dashboard/dashboard.service.ts` — Dashboard service
- `modules/dashboard/types.ts` — Dashboard types

**Server**

- `server/ai/` — AI services and config
- `server/auth/` — Auth services
- `server/db/` — DB connection
- `server/dtos/` — DTOs
- `server/middleware/` — API middleware
- `server/models/` — Mongoose models
- `server/services/` — Business logic
- `server/utils/` — Utilities

---

### Server (`src/server/`)

**AI**

- `ai/client/openai.client.ts` — OpenAI client
- `ai/index.ts` — AI exports
- `ai/prompts/classify.prompt.ts` — Classification prompt
- `ai/schemas/crm.schema.ts` — CRM extraction schema
- `ai/schemas/general.schema.ts` — General extraction schema
- `ai/services/classifyEmail.service.ts` — Email classification
- `ai/services/extractCrmSupport.service.ts` — CRM/support extraction
- `ai/services/extractEmail.service.ts` — Email extraction
- `ai/services/extractGeneral.service.ts` — General extraction
- `ai/services/extractInvoice.service.ts` — Invoice extraction
- `ai/services/extractMeeting.service.ts` — Meeting extraction

**Auth**

- `auth/auth.service.ts` — Auth logic
- `auth/cookies.ts` — Cookie helpers
- `auth/gmail.service.ts` — Gmail OAuth
- `auth/google.service.ts` — Google OAuth
- `auth/password.ts` — Password hashing
- `auth/tokens.ts` — JWT tokens

**Database**

- `db/connect.ts` — MongoDB connection
- `db/index.ts` — DB exports

**DTOs**

- `dtos/conversation.dto.ts`
- `dtos/mailbox.dto.ts`
- `dtos/message.dto.ts`
- `dtos/session.dto.ts`
- `dtos/user.dto.ts`

**Middleware**

- `middleware/requireAuth.ts` — Require authenticated user

**Models**

- `models/user.model.ts`
- `models/session.model.ts`
- `models/conversation.model.ts`
- `models/message.model.ts`
- `models/mailbox.model.ts`
- `models/emailClassification.model.ts`
- `models/emailExtraction.model.ts`

**Services**

- `services/conversation.service.ts` — Conversations
- `services/dashboard.service.ts` — Dashboard data
- `services/gmailSync.service.ts` — Gmail sync
- `services/mail.service.ts` — Mail CRUD + AI

**Utils**

- `utils/api.ts` — API helpers
- `utils/dashboard.ts` — Dashboard helpers
- `utils/httpErrors.ts` — HTTP errors
- `utils/pagination.ts` — Cursor pagination
- `utils/zod.ts` — Zod helpers

---

## Database Structure (MongoDB)

**Connection:** Mongoose with `MONGODB_URI`. Single cached connection (handles Next.js hot reload).

---

### Collections & Schemas

**User**

- `nickname` (string, required, unique)
- `email` (string, optional, unique, sparse)
- `passwordHash` (string, optional)
- `status` (enum: `active`, `blocked`, default `active`)
- `lastLoginAt` (date)
- `provider`, `providerId` (OAuth)
- `name`, `pictureUrl` (OAuth profile)
- `gmailEmail`, `gmailAccessToken`, `gmailRefreshToken`, `gmailTokenExpiresAt`, `gmailHistoryId` (Gmail sync)
- `createdAt`, `updatedAt` (timestamps)

**Session**

- `userId` (ObjectId → User)
- `refreshTokenHash`
- `deviceName`, `ip`, `userAgent`
- `expiresAt`, `revokedAt`
- `createdAt`, `updatedAt`
- TTL index on `expiresAt` for auto-cleanup

**Conversation**

- `type` (enum: `direct`, `group`)
- `memberIds` (ObjectId[] → User)
- `memberKey` (string, unique) — sorted member IDs for membership uniqueness
- `lastMessageAt`, `lastMessageId` (ObjectId → Message)

**Message**

- `conversationId` (ObjectId → Conversation)
- `senderId` (ObjectId → User)
- `toUserIds` (ObjectId[] → User)
- `subject`, `snippet`
- `body`: `{ text, html? }`
- `delivery` (enum: `sent`, `delivered`, `failed`)
- `readBy`: `[{ userId, readAt }]`
- `attachments`: `[{ filename, mimeType, size, storageKey }]`
- `deletedFor` (ObjectId[] → User)

**Mailbox**

- `userId` (ObjectId → User)
- `messageId` (ObjectId → Message)
- `folder` (enum: `inbox`, `sent`, `archive`, `trash`)
- `isRead`, `flagged`
- Unique index: `userId` + `messageId`

**EmailClassification**

- `userId`, `messageId`
- `type` (enum: `invoice`, `meeting`, `support`, `job_application`, `general`)
- `confidence` (0–1)
- `modelName`, `promptVersion`
- Unique index: `userId` + `messageId`

**EmailExtraction**

- `userId`, `messageId`
- `type` (same as classification)
- `schemaVersion`, `status` (enum: `processing`, `done`, `failed`)
- `extractedData` (JSON)
- `confidence`, `missingFields`, `warnings`
- `modelName`, `promptVersion`
- Unique index: `userId` + `messageId` + `type` + `schemaVersion`

---

### Relationships

- **User** ↔ **Session** (1:N)
- **User** ↔ **Conversation** (N:M via `memberIds`)
- **Conversation** ↔ **Message** (1:N)
- **User** ↔ **Message** (sender / recipient)
- **User** + **Message** ↔ **Mailbox** (N:M, per folder)
- **User** + **Message** ↔ **EmailClassification** (1:1)
- **User** + **Message** ↔ **EmailExtraction** (1:N per type/schema)

---

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_ACCESS_SECRET` | JWT access token secret | — |
| `JWT_REFRESH_SECRET` | JWT refresh token secret | — |
| `JWT_ACCESS_TTL_MIN` | Access token TTL (minutes) | `15` |
| `JWT_REFRESH_TTL_DAYS` | Refresh token TTL (days) | `30` |
| `COOKIE_NAME_REFRESH` | Refresh token cookie name | `refresh_token` |
| `COOKIE_SECURE` | Use secure cookies | `false` / `true` |
| `COOKIE_DOMAIN` | Cookie domain | — |
| `APP_ENV` | Environment | `development` |
| `OPENAI_API_KEY` | OpenAI API key | — |
| `OPENAI_MODEL` | OpenAI model | `gpt-4.1-mini` |
| `GMAIL_CLIENT_ID` | Gmail OAuth client ID | — |
| `GMAIL_CLIENT_SECRET` | Gmail OAuth client secret | — |
| `GMAIL_REDIRECT_URI` | Gmail OAuth redirect URI | — |
| `GOOGLE_CLIENT_ID` / `GOOGLE_API_KEY` | Google OAuth client ID | — |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | — |
| `GOOGLE_REDIRECT_URI` | Google OAuth redirect URI | — |
| `NEXT_PUBLIC_APP_URL` | App base URL (client) | `http://localhost:3000` |
| `RECALL_API_KEY` | Recall.ai API key | — |
| `RECALL_REGION` | Recall region (us-west-2, us-east-1, eu-central-1, ap-northeast-1). Default: us-west-2 | `us-west-2` |
| `RECALL_WEBHOOK_SECRET` | Recall webhook signature verification (optional) | — |
| `RECALL_WEBHOOK_URL` | Full webhook URL (e.g. `https://your-app.com/api/recall/webhook`) | — |
| `GOOGLE_CALENDAR_SCOPES` | Optional; Calendar OAuth scope (for future integration) | `https://www.googleapis.com/auth/calendar.events` |
| `GOOGLE_CALENDAR_REDIRECT_URI` | Optional; Calendar OAuth redirect URI | `http://localhost:3000/auth/google-calendar-callback` |

---

## Tech Stack

- **Framework:** Next.js 16 (Pages Router)
- **Language:** TypeScript
- **UI:** React 19, Tailwind CSS, CSS Modules
- **Database:** MongoDB via Mongoose 8
- **Auth:** JWT (access + refresh), bcrypt, OAuth (Google / Gmail)
- **AI:** OpenAI API (classification, extraction)
- **Data fetching:** SWR
- **Validation:** Zod

---

## Scripts

- `npm run dev` — Development server
- `npm run build` — Production build
- `npm run start` — Production server
- `npm run lint` — ESLint

---

## Meetings (Recall.ai)

For meeting scheduling and transcription, configure `RECALL_API_KEY` and `RECALL_WEBHOOK_URL`. During local development, use [ngrok](https://ngrok.com/) to expose your local server so Recall can POST webhook events (e.g. `RECALL_WEBHOOK_URL=https://your-ngrok-url.ngrok.io/api/recall/webhook`).

---

## Main Flows

1. **Auth:** Login/register → JWT access/refresh → session in DB; optional Google/Gmail OAuth.
2. **Mail:** Internal mail via Conversations + Messages + Mailbox; Gmail sync via Gmail API → same models.
3. **AI:** Classify emails → extract per type (invoice, meeting, support, etc.) → store in EmailClassification and EmailExtraction.
4. **Dashboard:** Aggregates classifications, extractions, and insights from mail.
