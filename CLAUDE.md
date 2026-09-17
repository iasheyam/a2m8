# a2m8 ai

An AI assistant for small business owners who run their business out of their inbox. It
ingests their documents, files them against the things they own, answers questions with
sources, watches the dates that matter, and keeps a contact record that builds itself —
plus outbound AI voice calling as a bundled feature for teams that need to reach people,
not just track them.

**This is a multi-tenant SaaS product from day one.** Any team can sign up, create an
org, invite teammates, connect their own mail account, and bring their own Anthropic
key. There is no hand-inserted row anywhere in the system — signup, org creation and
invitations are real flows, not a favor done once for one customer.

---

## The rule that governs every decision

**Keep the shape. Skip the machinery.**

Some things are cheap now and brutally expensive to retrofit — a column on every table,
a policy in every migration, which package a file lives in, a self-serve signup path
instead of a row someone inserts by hand. Those we do now, in full, because this ships
as a real product for many tenants from the start.

Everything else — enterprise auth, granular per-module plan gating, an internal admin
console, a second integration or model provider — is work that serves scale that
doesn't exist yet. It waits.

When a choice comes up, ask: **would adding this later require touching data, or just
adding code?** If it's data, do it now. If it's code, defer it.

| Do now | Defer |
|---|---|
| `org_id` on every table | Enterprise SSO / SAML |
| RLS policy in every migration | Per-table isolation test suite |
| All access through `withOrg` | Lint rules enforcing it |
| Module folders with owned tables | Subset builds, cross-module import checks |
| `org_anthropic_keys` table + self-serve entry/verify UI | Key rotation, multiple keys per org |
| `telegram_links` table + shared-bot pairing flow | — pairing has to work from day one; no one is hand-inserting this per org |
| `memberships` table + invitation flow | Custom roles beyond `owner` / `admin` / `member` |
| Contact fact/override split | — this one is contractual, build it properly |
| Append-only extractions | Extraction history UI |
| Org creation + signup flow | Self-serve plan changes, usage-based billing |
| A single active-subscription gate | Per-module / per-plan entitlement checks |
| `voice.call` capability + `calling` module | A second telephony provider |

---

## What ships first

Everything below is real, shippable product — not a demo for one customer.

**Ingestion.** Documents, photos and screenshots sent from a phone via Telegram.
Attachments pulled from Outlook as mail arrives, plus a back-catalogue load. Handles
scans and photographs, not just clean PDFs.

**Filing.** Every document lands under the right entity — a property, a legal entity, a
client, whatever the org calls the things it tracks — matched against the org's own
names for them. Tagged by type. Nothing is moved, renamed or deleted.

**Answers.** Plain-English questions, across one entity or the whole portfolio. Every
answer carries a link to its source document. No answer without a source, and it says
when it is unsure.

**Deadlines.** Policy expiries, loan maturities, notice windows, tax dates. One view of
the next 90 days, each date linked to its document. A Monday morning digest. A report
naming what is missing — no policy in force, a loan maturing with nothing on file.

**Capture.** Speak an appointment or screenshot a listing; it lands on the calendar,
linked to the right entity, editable and undoable in one tap. Never dated in the past,
never silently dropped.

**Contacts.** Records built automatically from mail, typed, deduplicated across
addresses, linked to entities and documents. Manual add, edit, notes, reminders, tags,
segments, CSV export. Manual edits always win.

**Voice calling.** Outbound AI phone calls, run as campaigns against a calling-specific
contact list (leads/prospects — distinct from the mail-derived contacts above). Placed
through Vapi behind a `voice.call` capability, with per-call status, transcript and
duration, and a call log per contact.

**Billing.** Self-serve signup with a subscription — Stripe Checkout to start, Stripe
Customer Portal to manage payment method and cancel. One flat plan at launch; no
usage-based pricing yet.

### Build order

Ordered by dependency, not by calendar.

1. Schema, migrations, `withOrg`, RLS. Self-serve signup: org creation, Cognito auth,
   invitations.
2. Billing: Stripe subscription, a boolean active/inactive gate at the app boundary.
3. Calling module: leads, campaigns, Vapi behind `voice.call`. This is the simplest
   feature end-to-end and proves the whole stack — tenancy, RLS, modules, an
   integration behind a capability — before the heavier ingestion pipeline is built on
   top of it.
4. Graph auth, delta sync, message header index. Telegram intake (shared bot,
   self-serve pairing).
5. Extraction pipeline — schemas, validation, PII stripping, append-only history.
6. Filing and alias matching.
7. Q&A with citations.
8. Deadlines, the 90-day view, missing-documents report, Monday digest.
9. Calendar capture.
10. Mail-derived contacts and the full web UI.

Contacts near the end is deliberate. The extraction plumbing from step 5 is reused for
signature parsing — building contacts earlier means building it twice. The contact
*skeleton* needs no extraction at all; it is a `GROUP BY` over mail headers, available
from step 4.

---

## Later — triggered by growth, not a hunch

Do not build these until real usage demands them. If a task seems to need one, stop and
ask.

- SSO / SAML for larger teams
- Custom roles beyond `owner` / `admin` / `member`
- Usage-based or per-module pricing tiers
- Per-module / per-plan entitlement gating at runtime
- A full internal admin console for support
- A second integration provider (Google Workspace, etc.)
- A second model provider, or any model-provider abstraction layer
- Module extraction and handover tooling, subset builds in CI
- Key rotation UI, multiple Anthropic keys per org
- A document browser

### Don't work ahead

If a task starts sounding like "while we're here, let's make this configurable," it
belongs to the list above. The only exception is anything on the "do now" table
earlier, where deferring costs a data migration instead of an afternoon.

---

## Architecture that must be right now

### Tenancy

Shared schema, `org_id` on every row, many orgs from day one.

- `orgs` — the tenant, created through self-serve signup
- `users` — a person, keyed by Cognito `sub`. Global, not org-scoped
- `memberships` — `(user_id, org_id, role)` with roles `owner`, `admin`, `member`.
  Created at signup (`owner`) and through invitations (`admin` / `member`) — never
  inserted by hand

**Never put `org_id` on a user.** Accountants and assistants belong to more than one
org, and invitations mean this happens from day one, not eventually — the joins go
through `memberships`.

The active org lives in the URL: `/app/[orgSlug]/...`. Not a cookie, not a token claim.
Resolve membership from the path on every request. A user in more than one org gets an
org switcher.

### Row-level security

Enabled from the first migration, on every tenant-scoped table.

The app connects as `app_user`: no `BYPASSRLS`, no table ownership. Migrations run as
`app_migrator`.

```sql
alter table <t> enable row level security;
alter table <t> force row level security;

create policy tenant_isolation on <t>
  using (org_id = current_setting('app.current_org_id', true)::uuid)
  with check (org_id = current_setting('app.current_org_id', true)::uuid);
```

`force row level security` matters — without it the owner silently bypasses policies.
`with check` matters — without it a tenant can write into another org. Unset variable
means null means deny: **no tenant context, no rows.**

### The connection wrapper

All database access goes through `withOrg(orgId, fn)` in `packages/db`, which checks out
a connection, runs `set local app.current_org_id`, executes in a transaction and
releases. Nothing opens a raw pool connection.

No lint rule enforcing this yet — just don't do it. One smoke test asserts that a query
outside `withOrg` returns zero rows.

### Modules as folders

Each feature lives in `packages/modules/<id>` and owns its tables. Dependencies are
one-directional and written down, but nothing enforces them mechanically yet.

| Module | Owns |
|---|---|
| `core` | orgs, users, memberships, audit |
| `billing` | subscriptions |
| `calling` | campaigns, calling_contacts, calls |
| `ingest.telegram` | — (writes documents via `filing`) |
| `ingest.outlook` | messages |
| `filing` | entities, documents |
| `extraction` | document_extractions |
| `docqa` | — |
| `deadlines` | date_items, deadline_digests |
| `capture.calendar` | captures |
| `contacts` | contacts, contact_facts, contact_overrides, contact_events |

Two conventions worth keeping even without tooling:

- **A module's migrations live in its own package.** Cheap now, and it's what makes a
  future extraction or per-client handover possible at all.
- **Don't query another module's tables from inside a module.** Call its exported
  function. When this gets violated it's usually because a helper belongs in
  `packages/core` — move it there rather than reaching across.

### One Anthropic client

Every model call goes through `packages/core/model`. **No module imports the Anthropic
SDK directly.** That wrapper owns key resolution, retries, `model_calls` logging and PII
stripping, so those cannot be forgotten at a call site.

Anthropic is the only provider. Citations is what makes "no answer without a source"
true and has no equivalent elsewhere. Do not add an abstraction layer for a second
provider.

Model ids are configuration, not literals. A model is chosen per task — extraction,
answering, signature parsing — so they can be tuned independently.

---

## Anthropic keys — bring-your-own, per org

Every org supplies its own Anthropic key. The a2m8 subscription is for the platform;
model spend sits on the org's own Anthropic account and is billed to them directly by
Anthropic. This was true when there was one customer and stays true at any scale — a2m8
never carries model cost risk on its own books.

`org_anthropic_keys`: `(org_id, encrypted_key, label, status, last_verified_at)`

- Encrypted with KMS, decrypted in memory at call time. **Never logged, never returned
  to the client, never written to disk.** No reveal endpoint.
- **Entered self-serve in Integrations** (not Settings — see Web app scope) and
  verified on save with a minimal live call — no hand insertion, this has to work
  for every org from the first day it exists.
- One active key per org for now. Rotation and multiple keys are deferred.

When an org's key fails — invalid, rate limited, spend cap — that org's ingestion
pauses and jobs stay queued. Nothing is lost, and it never affects any other org. Store
error codes and status, **never response bodies**; those contain document content.

**Cost control is a feature, not an optimisation**, because the bill is the org's:

- **Prompt caching on the stable prefix** of extraction prompts — schema and
  instructions cached, document content varying.
- **Never re-extract an unchanged document.** Hash the content; skip on match.
- **Batch where latency doesn't matter.** Backfill can; live ingestion cannot.
- `model_calls` records tokens, cache reads and writes, and estimated cost per org, so
  the saving is visible to them.

---

## Billing

`subscriptions`: `(org_id, stripe_customer_id, stripe_subscription_id, plan, status,
current_period_end)`.

- Stripe Checkout for signup, Stripe Customer Portal for self-serve plan/payment
  management. A webhook keeps `status` in sync.
- **One flat plan at launch.** No usage-based pricing, no per-module pricing tiers.
- Access is a single boolean gate — `requireActiveSubscription(orgId)` at the app
  boundary — not a per-feature entitlement system. Everything in "What ships first" is
  available on the one plan.
- Model spend is never part of this. The subscription pays for the platform; the org's
  own Anthropic key pays for the model calls.

---

## Stack

| Layer | Choice |
|---|---|
| Language | TypeScript, strict |
| Database | AWS RDS Postgres |
| Auth | AWS Cognito user pool |
| Billing | Stripe (Checkout + Customer Portal) |
| File storage | S3, private, SSE-KMS, org-prefixed keys |
| Secrets | Secrets Manager; KMS for org Anthropic keys and Graph tokens |
| Web | Next.js App Router |
| Styling | Tailwind CSS only, no custom CSS. Tokens in `apps/web/src/app/globals.css` (`@theme`), shared components in `packages/ui` (`@a2m8/ui`). See the `design-system` skill |
| Worker | Node, always-on |
| Queue | pg-boss on the same RDS instance |
| Integrations | Microsoft Graph via a multi-tenant Azure app; Vapi for voice.
  Capability-based, more later |
| Model | Anthropic, org-supplied key |
| Chat | Telegram via Telegraf, one shared bot |
| Errors | Sentry, `org_id` and `module` on every scope |

### Open decision — where web and worker run

RDS sits in a VPC. Either everything in AWS (ECS Fargate or App Runner, private RDS,
cleanest posture, more infra work), or Vercel plus Railway with RDS publicly reachable
behind TLS, a locked security group and RDS Proxy. Pick one and record it here.

### Deliberately not used

- **No vector database, no embeddings.** Retrieval is SQL-narrow-then-cite.
- **No OCR service.** The model reads scans and photos natively through vision.
- **No Redis, no SQS.** pg-boss keeps jobs next to the data they touch.
- **No agent or orchestration framework.** Plain typed functions.
- **No DynamoDB.** The data is relational and the queries are joins.

---

## Auth

One Cognito user pool, shared across every org.

- **Email/password, plus Microsoft and Google as social sign-in options.**
  Authentication is deliberately separate from the Microsoft Graph mail/calendar
  consent — signing in doesn't require granting mailbox access, and granting mailbox
  access happens later, per org, from Settings.
- First sign-in upserts a `users` row keyed by Cognito `sub`.
- **Signup creates an org.** The first user in a new org becomes its `owner`, which
  inserts the `orgs` row and the owner's `memberships` row in one transaction — no hand
  insertion anywhere in this path.
- **Invitations.** An `owner` or `admin` invites a teammate by email; accepting creates
  their `memberships` row with the assigned role. Pending invitations are visible and
  revocable in Settings.
- Verify the JWT against the pool JWKS on every request. **Never trust claims for
  authorization** — resolve membership from the database.

---

## File storage

Private bucket, block-public-access on.

- Keys: `orgs/{org_id}/documents/{document_id}/{filename}`
- SSE-KMS with a customer-managed key
- Nothing touches the bucket directly — short-lived presigned URLs, issued only after
  membership is checked. Minutes, not hours. Never logged, never stored
- Key construction lives in **one helper** in `packages/core`. Nothing builds a key by
  hand; that is how cross-tenant reads happen
- Versioning on
- **Originals stay in the org's own mail/file store.** S3 holds working copies only

---

## Integrations

An integration is a connection to a customer's own external account, or to a service
a2m8 calls on the org's behalf. Each one is a package under `packages/integrations/<id>`
and is the only place that provider's SDK or HTTP calls appear.

### Capabilities, not providers

This is the decision that keeps the rest additive. Integrations **provide
capabilities**; feature modules **require capabilities**. No feature module ever names
a provider.

| Capability | Meaning | Provided by |
|---|---|---|
| `mail.read` | Read messages and attachments, incrementally | `microsoft` — later `google` |
| `calendar.write` | Create, update and delete events | `microsoft` — later `google` |
| `voice.call` | Place an outbound AI phone call and retrieve its status/transcript | `vapi` |
| `files.read` | Read and watch a document store | later — `onedrive`, `gdrive`, `dropbox` |

So `ingest.mail` asks the org for a connection providing `mail.read` and works with
whatever answers. If `if (provider === 'microsoft')` appears anywhere outside
`packages/integrations/microsoft`, the abstraction has already failed.

### The sync contract (mail, calendar, files)

Each integration exports a manifest and a client:

```ts
export const manifest = {
  id: 'microsoft',
  name: 'Microsoft 365',
  provides: ['mail.read', 'calendar.write'],
  auth: 'oauth2',
  scopes: ['Mail.Read', 'Calendars.ReadWrite', 'offline_access'],
  sync: 'delta+webhook',   // 'delta+webhook' | 'delta+poll' | 'poll'
} satisfies IntegrationManifest;
```

- `connect` / `refresh` / `revoke`
- `listChanges(cursor)` → normalized items plus a new cursor
- `fetchItem(id)` and `fetchAttachment(id)` → bytes plus metadata
- `renewSubscription()` where the provider has one, a no-op where it doesn't

This shape is for pulling data in — it does not fit an outbound action like placing a
call, which is why `voice.call` gets its own contract below rather than being forced
into this one.

### The action contract (voice)

`voice.call` is an outbound action, not a sync source, so its client is deliberately
smaller:

```ts
export const manifest = {
  id: 'vapi',
  name: 'Vapi',
  provides: ['voice.call'],
  auth: 'api_key',
} satisfies IntegrationManifest;
```

- `placeCall(input)` → provider call id
- `getCallStatus(callId)` → status, transcript, ended reason, duration

Anything provider-specific (assistant configuration, phone number provisioning) stays
inside `packages/integrations/vapi`.

### Normalization

Providers return different shapes. Each integration maps to `NormalizedMessage` and
`NormalizedFile` in `packages/core`, and everything downstream consumes only those.

Be honest that normalization is where the real cost sits. Graph uses delta tokens and
change subscriptions; Gmail uses history IDs and Pub/Sub watches with a hard renewal
window; threading, labels versus folders, and attachment retrieval all differ. The
interface hides the mechanics, not the differences in guarantees — so each integration
owns its own reliability story rather than pretending they're the same.

### Connections

`integration_connections`: `(org_id, integration_id, external_account_id, label,
capabilities, encrypted_tokens, cursor, subscription_id, subscription_expires_at,
status, last_synced_at)`

- Tokens **KMS-encrypted**, never logged, never returned to the client
- `capabilities` is stored on the row, granted at consent — an org may approve mail but
  not calendar, and the UI must reflect what was actually granted, not what was asked
- Multiple connections per org is allowed by the schema from day one. Two mailboxes, or
  mail from one provider and files from another, needs no migration later
- Status: `connected`, `expired`, `revoked`, `error`, each visible in the UI

### Sync reliability

- **Subscriptions expire.** A renewal job runs continuously per connection. A lapse is
  silent data loss — the org won't notice missing mail until a deadline is missed.
  Sentry alert plus a visible banner in the app.
- Cursors are stored per connection and advanced only after items are durably written.
- Refresh failure marks the connection `expired` and surfaces it. It does not retry
  forever.
- Every integration must survive a full re-sync from an empty cursor without creating
  duplicates. Deduplicate on the provider's own message or file id.

### Microsoft — build one

Only `microsoft` exists now, providing `mail.read` and `calendar.write`. One
multi-tenant Azure app, registered once, used by every org. Each org's owner consents
themselves from Settings.

Two scopes only: `Mail.Read` and `Calendars.ReadWrite`. If a feature seems to need a
third, stop and ask.

Before committing to Google later, price the OAuth work: `gmail.readonly` is a
restricted scope requiring verification and an annual third-party security assessment.
That is a real cost and lead time, and it is a business decision rather than a
technical one.

### Telegram

**One shared bot**, one token, used by every org. Pairing is self-serve: a user
generates a one-time code in Settings and sends it to the bot; the bot resolves the
code and inserts the `telegram_links` row automatically. No row is ever inserted by
hand.

`telegram_links`: `(telegram_user_id, user_id, org_id)`. Every update resolves through
this table rather than comparing against a constant. **An unresolved id gets no
response beyond a generic decline.**

### Vapi

Provides `voice.call`. One a2m8-owned Vapi account and API key for now — not
per-org-supplied, since voice minutes are metered platform infrastructure, not a model
call the org pays Anthropic for directly. Assistant configuration (voice, script
variables) is passed per call from the campaign, not hardcoded per org.

---

## Domain model

Every table carries `org_id`.

**core** — `orgs`, `users`, `memberships`, `model_calls`, `audit_log`

**billing** — `subscriptions`

**integrations** — `integration_connections`, `org_anthropic_keys`

**calling** — `campaigns`, `calling_contacts`, `calls`

**filing** — `entities` (name, **type**, **aliases**, optional `parent_entity_id` for
hierarchy, `metadata` jsonb), `documents`

**extraction** — `document_extractions`

**deadlines** — `date_items`, `deadline_digests`

**contacts** — `contacts`, `contact_facts`, `contact_overrides`, `contact_events`

**ingest.outlook** — `messages`

**capture.calendar** — `captures`

`entities` is deliberately generic — not `properties` and `legal_entities`. An org
configures its own type vocabulary (a property manager sees "property" and "legal
entity"; a consultancy sees "client"), and `parent_entity_id` covers the common case of
one entity nesting under another (a property under the legal entity that owns it)
without a fixed schema per domain.

`calling_contacts` is a separate list from `contacts` on purpose: `contacts` is built
from an org's own mail and represents people they actually correspond with; calling
targets are leads/prospects entered for outbound campaigns. They may refer to the same
person, but they are populated differently and serve different jobs — don't merge them
into one table to avoid a join.

### Two rules that are not deferrable

**Extracted and manual data are separate layers, merged at read time.** `contacts` is a
read-time merge over `contact_facts` and `contact_overrides`; manual wins on any field
where it has a value. Never write a manual edit into a column extraction writes to, and
never use a per-column "locked" flag. Re-extraction must be safe to run at any time
without knowing what a human touched. This is a core product guarantee — a hand edit
survives the next extraction run — and this structure makes it true by construction
rather than by careful coding.

**Extractions are append-only.** A new run inserts; it does not update. A user will ask
why a document was filed where it was, and the answer has to be readable.

---

## How the pieces work

**Ingestion.** Graph delta for backfill, subscriptions for new mail; Telegram for files,
photos and screenshots. Both write a `documents` row as `pending` and enqueue
extraction. Ingestion never calls a model.

**Filing.** Match by alias first, then name. Aliases matter more than exact names —
people call things by nicknames, not registered names. Low confidence files as
unmatched rather than guessing. An unmatched document is recoverable; a confidently
misfiled one is not.

**Extraction.** One call per document, fixed schema, validated with Zod before it
touches the database. Violation retries once, then marks for review. Never partially
write malformed output. **Strip account numbers, tax IDs and wire instructions before
any text reaches the model** — one function in `packages/core`, every path through it.

**Answering.** No vector search; the corpus partitions by entity. Parse the question
into filters, narrow with SQL inside the tenant transaction, send those files with
Citations enabled, return with real source links. **No answer without a source.** If
retrieval finds nothing, say so.

**Contacts.** The skeleton comes from **mail headers, not the model** — group
`messages` by address for name, email, first seen, last contact, volume. Only firm,
phone and type need signature extraction. Dedupe on display-name similarity, shared
threads and matching signatures, with a confidence score and a manual override.

**Voice calling.** A campaign targets a list of `calling_contacts` with a prompt/script.
Placing a call goes through `voice.call`; status, transcript and duration are polled
back through the same capability and logged per contact.

**Calendar capture.** Writes via Graph, stores the event id so undo is one tap. Never
date an event in the past. Every capture gets a reply, including "I could not read
this" — silent drops are what make people stop trusting it.

---

## Jobs

- **Every payload carries `org_id`.** Handlers open `withOrg` before anything else.
- **No global loops that assume one tenant.** Scheduled work fans out per org.
- Backfill runs below live ingestion in priority, always.
- Digests are scheduled per org, in the org's timezone, at the org's hour.
- Backfill must be resumable. It will fail partway through; that is normal.

---

## Product principles (non-negotiable)

- **The system never sends a customer's data to any third party outside their own
  org.** No outbound path beyond account/invite emails, and those never include
  document content.
- **Two Graph permissions only**, revocable by the org independently.
- **Originals are never moved, renamed or deleted.**
- **Account numbers, tax IDs and wire instructions stripped** before any text reaches
  the model, for every org.
- **No document content stored outside encrypted, org-isolated storage.** Nothing is
  ever provisioned or stored anywhere it could be read across tenants.
- **Full CSV export of contacts and entities**, self-serve, no support request needed.
- **No component that another developer could not pick up.** This is why there is no
  orchestration framework and no clever infrastructure.

---

## Per-org configuration

Customer-specific things are data on the org, never constants and never branches on
customer name.

- Entity type vocabulary, contact-type vocabulary, timezone, digest day and hour, alias
  lists, document types: all org data.
- Labels follow the vocabulary — a customer who says "GC" never sees "vendor," a
  customer who says "unit" never sees "property."

If you write `if (org.name === ...)` or `if (org.id === ...)`, the thing you're
branching on belongs in the database.

---

## Conventions

- TypeScript strict. No `any`. External data is `unknown`, narrowed with Zod at the edge
- Validate everything crossing a boundary — Graph, Telegram, Cognito, Stripe, Vapi,
  model output
- Errors fail loudly to Sentry with `org_id` and `module` attached, degrade quietly to
  the user. Never surface a stack trace in Telegram
- **Never log document content, mail bodies, API keys, tokens, presigned URLs or PII.**
  Log ids
- Migrations are numbered SQL files, forward-only, run as `app_migrator`, living in the
  owning module. **Every new table gets `org_id`, RLS enabled and a policy in the same
  migration.** No exceptions — this is the one piece of ceremony that stays
- `timestamptz` in UTC, rendered in the org's timezone at the edge
- Every mutation writes to `audit_log` with actor, org, module and action
- **Tailwind CSS only. No hand-written CSS, no CSS-in-JS, no component stylesheets, no
  inline `style=`.** `globals.css` holds exactly the Tailwind import, the design
  system's tokens as a Tailwind `@theme` block, and `@source` scan paths for the module
  packages — nothing that emits a CSS rule outside of that. Base styling (background,
  text color, font) is applied as Tailwind utility classes directly on `<body>` in
  `apps/web/src/app/layout.tsx`, not as a CSS rule. Every new package that ships UI
  needs both a `@source` line in `globals.css` (Tailwind's content scan does not cross
  a package boundary on its own — a class that's used but not scanned fails silently,
  rendering unstyled with no build error) and, where it's touching an existing pattern,
  a component from `@a2m8/ui` (`packages/ui`) rather than a hand-rolled equivalent. The
  full design system — tokens, typography, components, do-nots — is documented in the
  `design-system` skill (`.claude/skills/design-system/SKILL.md`); load it before any UI
  work

---

## Web app scope

1. Contact list — table, search, filters, tags
2. Contact detail — inline edit, notes timeline, reminders, linked entities and
   documents
3. Deadline view — next 90 days, each row linked to its source document
4. Missing-documents report
5. Entities — list, edit, aliases, type
6. Calling — campaigns, leads, call logs
7. Connections — OAuth accounts a2m8 brokers on the org's behalf (Microsoft today)
8. Integrations — bring-your-own-key credentials for third-party services (Vapi,
   Anthropic) — a separate menu from Connections since the trust model differs:
   a2m8 never sees an OAuth password, but a pasted API key passes through its hands
9. Settings — team & invitations, plan/billing, usage visibility, export. Nothing
   lives here until one of those exists

Documents, Q&A and capture live in Telegram. **Do not build a document browser.**

---

## When to stop and ask

- Anything on the "Later" list
- Any new AWS service or third-party dependency
- Any third Graph scope, or any new integration provider
- Any outbound communication path beyond account/invite email
- Any table without `org_id`, RLS enabled and a policy
- Any database access outside `withOrg`
- Any S3 key built outside the path helper
- Any code path that reads an org's Anthropic key outside `packages/core/model`
- Any second model provider
- Any schema change that drops or rewrites extraction history
- Any pricing or plan change beyond the single flat plan
- Any further generalization of the `entities` domain model beyond type + alias +
  parent
