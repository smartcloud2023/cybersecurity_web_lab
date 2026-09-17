# CyberLab — MVP Product & Technical Blueprint (v2)

Web & Network Penetration Testing Training SaaS

## Revision note

This is a revision of the original v1 MVP blueprint. It keeps everything from
v1 that still holds — vertical-slice discipline, the lab session state
machine, controlled Terraform provisioning, upfront cost-consciousness — and
adds six differentiators aimed squarely at the structural weaknesses of
incumbent platforms (TryHackMe, HTB Academy, PortSwigger Web Security
Academy, PentesterLab): static machines that spawn a walkthrough economy,
and binary flag-only scoring that produces no real portfolio evidence.

All six differentiators ship in the MVP itself, AI-driven pieces run on the
Claude API metered per subscription tier, and lab mutation (differentiator A)
is active from the very first lab, WEB001, on day one — these were explicit
product decisions, not defaults.

---

## 1. Executive Summary

CyberLab is a subscription cybersecurity practical-learning SaaS. Students
choose a pathway, launch isolated labs on demand, follow guided exercises,
submit flags and a short findings report, and progress through a structured
curriculum. Unlike static-machine platforms, every lab session is a unique,
procedurally mutated variant with a live AI mentor, a scored attacker
methodology, a lightweight "what did the defender see" feedback loop, and a
verifiable, portable record of what the student actually proved they can do.

First release: web penetration testing, one lab (WEB001), built to prove the
full novel loop — not just the plumbing — before expanding the catalogue.

## 2. MVP Goals

- Validate that learners will pay for guided hands-on practice **that a
  free/cheap incumbent structurally cannot replicate**.
- Prove the mutation engine defeats copy-paste walkthroughs on a single lab.
- Prove the AI mentor, tradecraft scoring, and report grading produce
  believable, defensible signal — not just novelty.
- Provide a working student dashboard, lab catalogue, and admin dashboard.
- Provision an isolated, mutated lab on demand and clean it up automatically.
- Issue a verifiable skills credential on completion.
- Keep LLM and infrastructure cost per session bounded and visible.

## 3. Target Users

Cybersecurity career changers and beginners; university/college cybersecurity
students; junior penetration testers and security practitioners;
certification candidates seeking practical experience; bootcamps and
instructors; corporate security-training teams. The verifiable credential
(§5.F) additionally targets **hiring managers and technical recruiters** as a
secondary consumer of the product — they're who a "verifiable" claim is
actually for.

## 4. Learning Structure

| Stage | Focus | Example Skills | MVP |
|---|---|---|---|
| Foundation | Technical/security basics | Linux, networking, HTTP, DNS, CLI | Include |
| Intermediate Web | Web penetration testing | Recon, auth, SQLi, XSS, APIs | Core |
| Advanced Web | Complex exploitation | SSRF, JWT, business logic, chaining | Later |
| Network | Network penetration testing | Enumeration, services, privesc | Phase 2 |
| AD/Red Team | Enterprise security | AD, Kerberos, lateral movement | Phase 3 |

One change from v1: **the attack → detection feedback loop (§5.E) is a
built-in second half of every web lab in the MVP pathway, not a deferred
Phase 3 track.** Blue-team framing is no longer a separate pathway waiting on
its own build — it's a cheap add-on to a session that's already isolated and
logged.

## 5. Novel Differentiators

These six features are the actual product thesis, not bolt-on extras. All
six ship in the MVP.

**A. Procedurally mutated labs.** Each lab has a template plus a mutation
spec (vulnerable parameter name, injection point, business-logic quirk,
cosmetic app details) that gets re-randomized per session. A unique flag is
generated and injected into the container at provision time — never a static
per-lab flag. WEB001 ships mutated from day one: the mutation engine is core
to the pitch, and far cheaper to build into the first lab than retrofit later.

**B. Tradecraft telemetry scoring.** Traffic between the student and their
lab target is captured at the network boundary of the isolated session (not
a client-side agent — nothing to install, nothing to evade). It's scored for
technique diversity, wasted/noisy requests, and time-to-first-productive
action, producing a methodology score alongside the flag. This is what makes
the score mean "can do the work," not "found the flag once."

**C. AI Socratic mentor.** Replaces the static hint ladder. On a hint
request, the backend sends the mentor service a redacted summary of the
student's recent attempts (request patterns/telemetry, not raw exploit
payloads) plus the current step's rubric, and asks Claude to return a
guiding question or nudge — never the answer, never lab-specific secrets.
Calls are metered per subscription tier (§20) and logged for admin QA/abuse
review.

**D. Graded findings report.** Every lab session ends with a short structured
report (finding description, CVSS estimate, remediation) the student writes
in-app. It's graded against a fixed per-lab rubric via the Claude API, folded
into the session score, and surfaced back to the student with actionable
feedback. This is the skill this space doesn't currently teach at all.

**E. Attack → detection feedback.** After a successful exploit step, the
student is shown the log/alert line their own action generated in a minimal
detection layer running alongside the target (e.g. a WAF/IDS rule firing on
their payload). No separate SOC environment to build — it's a read-only log
view scoped to the student's own session.

**F. Verifiable skills passport.** On lab completion, the platform issues a
cryptographically signed credential (Open Badges 3.0 / W3C Verifiable
Credentials format) encoding: lab completed, mutation seed (proves it wasn't
a shared static answer), tradecraft score, report grade, and issue
timestamp. Third parties (employers) can verify the signature without
trusting CyberLab's UI. This is what makes "portfolio-style evidence" (v1's
positioning) literally true instead of a claim.

## 6. Student Journey

0. **(Optional, no account)** Try the limited no-account demo lab from the
   landing page — no mentor, no grading, no credential (§20).
1. Create account, choose pathway. New accounts get a 7-day free trial of
   Beginner (card required), then auto-convert to $5/mo or lock (§20).
2. Open WEB001, review objectives.
3. Click "Launch Lab" → platform checks auth, entitlement, concurrency.
4. Session created; **mutation engine selects a variant + unique flag**;
   provisioning job queued.
5. Approved lab template + variant provisioned; health checks pass; session
   READY.
6. Student performs guided exercise; **traffic telemetry captured**
   throughout (B).
7. Student can request a hint → **AI mentor** returns a Socratic nudge, not
   an answer (C).
8. On a successful exploit step, student sees the **detection-layer log
   entry** their action produced (E).
9. Student submits the flag → server validates against the session's unique
   value.
10. Student writes a short findings report → **graded against a rubric via
    Claude API** (D).
11. Score combines: base completion + tradecraft score (B) + report grade
    (D) − hint penalties (C).
12. Progress updates; **verifiable credential issued** (F); next lab
    unlocked.
13. Lab expires/stopped; cleanup destroys the environment.

## 7. MVP Screens

- Landing page: value proposition, pathways, pricing, sign-up.
- Authentication: registration, login, password reset.
- Student dashboard: progress, active lab, next lesson.
- Learning-path page: modules, prerequisites, completion.
- Lab page: objectives, difficulty, duration, skills, instructions, hints.
- **Active-lab page**: status, timer, target info, answer submission, plus
  an AI mentor chat panel and a read-only "what the defender saw" log feed.
- **Results page**: score, objectives completed, next recommended lab, plus
  tradecraft score breakdown, report grade + feedback, and a "view/share
  credential" action.
- **Skills passport page** (new): a student's issued credentials, each with
  a verify link/QR code third parties can check independently.
- Billing/profile page: subscription and account information.
- **Admin dashboard**: users, labs, sessions, content, operational status,
  plus lab variant/mutation template management, a mentor/grading
  transcript review queue, and credential issuance/revocation.

## 8. Recommended MVP Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | Next.js + TypeScript | SaaS web application |
| Backend | Python FastAPI | API and business logic |
| Database | PostgreSQL | Users, labs, progress, billing state |
| Queue/cache | Redis | Jobs, rate limits, short-lived state |
| Lab runtime | Docker | Fast, repeatable web labs |
| IaC | Terraform | Cloud provisioning |
| Cloud | Amazon Web Services (AWS) | Lab infrastructure |
| CI/CD | GitHub Actions | Build, test, deployment |
| Storage | Amazon S3 | Learning assets and lab files |
| Monitoring | Amazon CloudWatch | Observability |
| Payments | Stripe or regional provider | Subscriptions |
| **AI mentor & grading** | **Claude API (Sonnet-class)** | **Socratic hints (C), report grading (D)** |
| **Telemetry capture** | **Reverse-proxy/tap per session** | **Tradecraft scoring input (B)** |
| **Detection layer** | **Minimal WAF/IDS rules per lab container** | **Attack→detection feedback (E)** |
| **Credentials** | **Open Badges 3.0 / W3C VC library, signing key in KMS** | **Verifiable skills passport (F)** |

**Cloud choice: AWS over Azure.** Evaluated head-to-head on this workload,
raw unit pricing across Postgres, Redis, object storage, and egress is
within ~10–15% either way — not a deciding factor on its own. AWS wins on
the two levers that actually matter for a platform whose dominant cost line
is thousands of short, bursty lab-container sessions (§21): **Fargate
Spot** can cut ephemeral container compute by up to ~70%, with no Azure
Container Instances equivalent, and CloudWatch log ingestion is
meaningfully cheaper than Azure Monitor at any real scale. Azure Blob edges
out S3 on pure per-GB storage cost, but the platform isn't storage-heavy
enough for that to offset the compute and monitoring gap.

## 9. High-Level Architecture

```
INTERNET
   |
   v
[Next.js Web App]
   |
   v
[FastAPI Backend] ---------------------------+
   |       |        |          |             |
   v       v        v          v             v
Postgres Redis  Billing/Auth  Mentor Svc   Grading Svc
   |                          (Claude API) (Claude API)
   v
[Lab Session Service]
   |
   v
[Job Queue] --> [Mutation Engine] (selects variant + unique flag)
   |
   v
[Provisioning Worker]
   |
   v
[Terraform]
   |
   v
[AWS]
   +--> Isolated Web Lab (Fargate/Fargate Spot + Telemetry Tap, + Detection Layer)
   +--> Network Lab (future)
   +--> Browser Attack Environment (future)

[Credential Issuer] <-- session completion event -- [Lab Session Service]
```

The Mentor and Grading services are separate logical services from day one
(even if deployed as modules within the FastAPI monolith) because their
calls carry LLM cost and need independent rate-limiting/metering per §20 —
mixing that budget logic into general request handling invites cost leaks.

## 10. Automatic "Launch Lab" Workflow

1. Frontend calls `POST /api/labs/{lab_id}/launch`.
2. Backend authenticates the student.
3. Backend verifies subscription/entitlement.
4. Backend checks concurrency limits.
5. Backend creates a `REQUESTED` lab-session record.
6. **Mutation engine picks a variant seed for this session** (injection
   point, parameter names, cosmetic details) **and generates a unique
   flag.**
7. Provisioning job placed on a queue.
8. Worker selects the approved Terraform/lab template and supplies the
   variant + flag as controlled session variables (students never see or
   influence this).
9. Terraform provisions the target **plus its telemetry tap and detection
   layer** as part of the same lab module.
10. Health checks confirm target, tap, and detection layer are all live.
11. Session becomes `READY`; student receives connection info (never the
    flag or variant details).
12. Timer runs; telemetry streams to the tradecraft scoring service for the
    session's duration.
13. Expiry triggers an automatic cleanup job **and finalizes the tradecraft
    score** from whatever telemetry was captured.

## 11. Lab State Machine

```
REQUESTED → PROVISIONING → READY → ACTIVE → EXPIRED → DESTROYING → DESTROYED
                           ↘ FAILED
```

No new states needed — report submission and credential issuance are
side-effects hung off the `ACTIVE` → `EXPIRED` transition and completion,
not new lifecycle states, keeping the state machine's job (infra lifecycle)
separate from the scoring pipeline's job.

## 12. Terraform Strategy

Terraform acts as a controlled infrastructure factory. Users must never
submit arbitrary Terraform code — only approved lab templates are executable
by the provisioning worker. Each lab template takes a `variant_seed` input
variable (consumed to parameterize the vulnerable app's config/env, not to
generate arbitrary code) plus enables a `telemetry_tap` and `detection_layer`
sub-module shared across all web labs.

- `labs/WEB001/terraform` — first web lab template, mutation-aware from day one.
- `modules/container-lab` — reusable container infrastructure.
- `modules/telemetry-tap` — per-session traffic capture sidecar.
- `modules/detection-layer` — per-session WAF/IDS rule set + log feed.
- `modules/network` — reusable isolated network infrastructure.
- `environments/dev, staging, prod` — environment separation.

## 13. Suggested Repository

```
cyberlab/
├── apps/
│   ├── web/                  # Next.js
│   └── api/                  # FastAPI
├── services/
│   ├── lab-orchestrator/     # Provision/cleanup worker
│   ├── scoring/              # Completion + tradecraft scoring (B)
│   ├── mentor/                # AI Socratic hints (C)
│   ├── grading/                # AI report grading (D)
│   └── credentials/            # Open Badges/VC issuance (F)
├── labs/
│   └── WEB001/
│       ├── terraform/
│       └── variants/           # Mutation spec(s) for this lab (A)
├── infra/
│   ├── terraform/
│   └── environments/
├── database/
│   └── migrations/
├── tests/
└── .github/workflows/
```

## 14. Core Database Model

| Table | Key Fields | Purpose |
|---|---|---|
| `users` | id, auth_id, email, role, created_at | Student/instructor/admin accounts |
| `plans` | id, name, price, limits | Subscription plans |
| `subscriptions` | user_id, plan_id, status, period_end | Entitlements |
| `labs` | id, slug, title, level, template | Lab catalogue |
| `lab_steps` | lab_id, sequence, instruction, points | Guided exercises |
| `lab_variants` | lab_id, seed, injection_point, param_names, active | Mutation specs a session can draw from (A) |
| `lab_sessions` | id, user_id, lab_id, variant_id, status, expires_at, resource_ref, flag_hash | Runtime sessions with unique per-session flag |
| `submissions` | session_id, step_id, answer, result, attempts | Validation |
| `telemetry_events` | session_id, ts, method, path_hash, technique_tag | Raw capture feeding tradecraft scoring (B) — hashed/redacted, not full payloads |
| `tradecraft_scores` | session_id, diversity_score, noise_score, time_to_first_success | Computed methodology score (B) |
| `mentor_interactions` | session_id, step_id, prompt_summary, response, ts | Audit trail of AI mentor exchanges (C) for QA/abuse review |
| `reports` | session_id, content, rubric_id, grade, feedback, graded_at | Findings report + grading result (D) |
| `credentials` | user_id, session_id, credential_jwt, issued_at, revoked_at | Issued verifiable credential (F) |
| `progress` | user_id, lab_id, status, score | Learning progress |
| `audit_events` | actor, action, object, timestamp | Security/operations audit |

## 15. MVP API

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/me`
- `GET /api/plans`
- `GET /api/labs`
- `GET /api/labs/{lab_id}`
- `POST /api/labs/{lab_id}/launch`
- `GET /api/lab-sessions/{session_id}`
- `POST /api/lab-sessions/{session_id}/submit`
- `POST /api/lab-sessions/{session_id}/mentor-hint` — AI mentor nudge (C); rate-limited per plan tier
- `GET /api/lab-sessions/{session_id}/detection-log` — read-only detection-layer feed (E)
- `POST /api/lab-sessions/{session_id}/report` — submit findings report for grading (D)
- `POST /api/lab-sessions/{session_id}/stop`
- `GET /api/progress`
- `GET /api/credentials` / `GET /api/credentials/{id}/verify` — list and independently verify issued credentials (F)
- `GET /api/admin/sessions`
- `GET /api/admin/mentor-transcripts`
- `GET /api/admin/lab-variants`

## 16. First Lab: WEB001

WEB001 is a deliberately vulnerable, purpose-built training application
running in an isolated environment, teaching HTTP, reconnaissance,
enumeration, and identification of a planted vulnerability/flag.

- Difficulty: Beginner. Duration: 30–60 minutes. Five or more guided steps.
- **Ships with ≥3 mutation variants at launch** (injection point/parameter
  varies) so the very first lab already proves the mutation engine works,
  not just a demo.
- Hints are served by the AI mentor, not a static text ladder.
- At least one guided step surfaces a detection-layer log entry after a
  successful exploit.
- Final step is a short findings report, graded via the Claude API.
- Server-side flag validation against a unique per-session flag.
- Completion issues a verifiable credential.
- 100-point base completion score.

## 17. Scoring

- Base completion: 100 points.
- **Tradecraft score**: ±20 points based on technique diversity/noise.
- **Report grade**: 0–30 points from rubric-based Claude grading.
- Optional objectives: 10–25 points each.
- Hints reduce the score, via mentor-interaction count rather than a fixed
  reveal count.
- Failed submissions are rate-limited.
- The frontend never contains the authoritative answer, and **the flag is
  unique per session**, not shared across students.

## 18. Security & Isolation

- Separate the application control plane from student lab networks.
- Never place production credentials inside labs.
- Use least-privilege cloud identities.
- **Per-session container hardening**: no privileged containers, per-session
  cgroup resource limits, unique per-session hostname/port so sessions can't
  enumerate or reach each other.
- **Prompt-injection defense for the AI mentor**: lab targets are inherently
  attacker-adjacent content. The mentor service only ever receives a
  server-constructed, redacted summary of student telemetry — never raw
  student input or raw target responses verbatim — to prevent a student (or
  a crafted lab response) from injecting instructions that make the mentor
  leak the flag or rubric.
- **Telemetry privacy**: `telemetry_events` stores hashed paths and
  technique tags, not full request/response bodies, avoiding inadvertent
  capture of credentials a student types into the vulnerable target.
- Restrict lab network egress as appropriate.
- Rate-limit APIs and answer submissions.
- Log provisioning, access, and cleanup operations.
- Automatically destroy expired environments.
- Keep management interfaces inaccessible from student networks.
- Maintain an emergency infrastructure kill switch.

## 19. Browser Attack Environment

For the MVP, students use their own approved security tools against the
controlled target. A browser-based Kali-style attack workstation is Phase 2,
after the lab lifecycle is proven.

- Phase 1: Student computer → isolated target.
- Phase 2: Browser terminal/desktop → isolated target.
- Phase 3: Full browser-based attack workstation with quotas and session
  persistence.

## 20. Subscription Model

No permanent $0 subscription tier — every paying account starts monetizing
from day one. Pricing standardized to USD (was mixed GBP/USD across
revisions).

| Plan | Indicative Price | Access | Mentor hints/mo | Report gradings/mo |
|---|---|---|---|---|
| Beginner | $5/month | Starter labs | 3 | 1 |
| Pro | $19–$29/month | Core pathway | 30 | 10 |
| Professional | $49–$79/month | More hours/advanced labs | Unlimited (soft cap + abuse throttle) | Unlimited (soft cap) |
| Team | Per-seat (~$15/seat/month) | Instructor/team tools | Pooled per seat | Pooled per seat |

AI usage is metered per tier so LLM cost stays predictable and directly tied
to the pricing model, rather than an open-ended cost center.

**"A touch of free" without a free tier.** Two acquisition mechanisms sit
outside the subscription model entirely, so top-of-funnel discoverability
doesn't require reintroducing a $0 plan:
- **No-account demo lab**: one heavily-limited lab (no AI mentor, no report
  grading, no credential) playable from the landing page without signing up.
- **7-day free trial of Beginner** (card required): converts automatically
  to $5/mo, or the account locks — filters low-intent signups better than an
  open-ended free tier while still giving genuine prospects a real taste.

## 21. Cloud & LLM Cost Controls

- Use containers for simple web labs; VMs only when required.
- **Run ephemeral lab containers on Fargate Spot** rather than on-demand —
  the single biggest available lever on the platform's dominant cost line,
  since lab sessions are short and interruption-tolerant (a reclaimed Spot
  task just re-provisions per the launch workflow in §10).
- Limit concurrent sessions per account; set maximum session duration.
- Destroy expired environments automatically.
- Track infra cost per active session and completed lab.
- **Track Claude API spend per session** (mentor + grading calls) alongside
  infra cost, in the same admin cost dashboard.
- **Per-tier hint/report caps are enforced server-side before a mentor or
  grading call is made**, not after — never call the API then reject.
- Cache/redact prompts aggressively; mentor prompts should be short
  (telemetry summary + rubric excerpt), keeping per-call cost small and
  predictable.
- Set cloud budgets and alerts.
- Introduce autoscaling only after usage data is available.

## 22. Admin Features

- Create/edit/publish labs; define levels and prerequisites.
- Create steps, hints, and scoring; define expected answers/flags.
- **Manage lab variant/mutation templates** (create, activate/deactivate).
- **Review mentor transcripts and report-grading outputs** for QA and abuse
  (e.g. prompt-injection attempts against the mentor).
- View active sessions; terminate a lab; view failed provisioning jobs.
- View student progress; manage subscription entitlements.
- **View combined infra + LLM cost per session/per lab.**
- **Issue/revoke credentials.**

## 23. Key Analytics

- Sign-ups, activation, trial-to-paid conversion, monthly active learners.
- Labs launched/completed; average time per lab; drop-off by lesson/step.
- Hint usage; provisioning failure rate; infrastructure cost per lab.
- **Mutation variant distribution/coverage** (is the mutation engine
  actually varying enough to matter?).
- **Tradecraft score distribution** and correlation with completion/retention.
- **Report grade distribution**; time spent on the report step.
- **Mentor hint request rate** and its effect on completion.
- **Credential verification-link click-through** (is the differentiation
  actually landing with employers?).
- **LLM cost per active subscriber.**
- Revenue per active subscriber; churn.

## 24. 12-Week MVP Roadmap

| Period | Area | Deliverable |
|---|---|---|
| Weeks 1–2 | Foundation | Brand, UX, repo, auth (+role field), database, dashboard shell |
| Weeks 3–4 | Lab engine | Catalogue, session model, Docker WEB001 **with ≥3 mutation variants**, unique-flag validation |
| Weeks 5–6 | Provisioning | Queue, worker, mutation engine, controlled Terraform/AWS PoC (+ telemetry tap, detection layer modules) |
| Weeks 7–8 | AI loop | Mentor service wired to hints, tradecraft telemetry capture + scoring, attack→detection log feed |
| Weeks 9–10 | Grading & credentials | Report submission + Claude grading, verifiable credential issuance, steps/progress/achievements |
| Weeks 11–12 | Commercial + beta | Subscriptions with AI usage metering, admin dashboard (incl. mentor/variant/cost views), security hardening, monitoring, pilot |

This runs roughly two weeks longer than a v1-scoped build once the full A–F
set lands in the MVP itself — Weeks 7–10 are new work v1 didn't have. Treat
Weeks 11–12 as a hard beta gate rather than compressing the AI-loop weeks.

## 25. MVP Acceptance Criteria

- Student can register and reach dashboard.
- Entitled student can open WEB001.
- Launch creates a unique session **that draws a randomized variant and a
  unique flag** (verify: two concurrent sessions never share exploit
  details or flag).
- Lab becomes READY without manual intervention.
- Student can access the intended target and complete guided steps.
- **Mentor hint requests return a guiding question, never the flag or exact
  payload, and are capped per the student's plan tier.**
- **Session telemetry produces a non-trivial tradecraft score at
  completion.**
- Flag submission is validated server-side against the session's unique
  value.
- **A submitted report receives a graded score and feedback via the Claude
  API.**
- **Completion issues a credential whose signature independently verifies**
  without trusting the webapp UI.
- Progress persists; student can stop a session.
- Expired sessions are automatically cleaned up.
- Admin can view and terminate active sessions.
- Students cannot access each other's environments (verified against unique
  per-session hostnames/ports).
- **At least one integration test covers the full loop**: launch → mutated
  variant assigned → flag submit → report submit → score → credential
  issued → cleanup.

## 26. Do Not Build Yet

- Hundreds of labs.
- Full Active Directory ranges.
- Complex AI tutor beyond the scoped Socratic mentor.
- Native mobile apps.
- Custom browser operating system.
- Multi-cloud support.
- Enterprise integrations everywhere.
- Persistent/non-expiring personal ranges.
- Real-time multiplayer/pair-hacking on a shared target.
- Compliance-scenario-framed labs (PCI/GDPR-specific engagements).
- Job/hiring-pipeline partnerships built on the credential (the credential
  enables this later; don't build the marketplace now).

## 27. Phase 2 Expansion

- Network penetration-testing labs; Windows and Active Directory ranges.
- Browser-based attack workstation; advanced web labs.
- Instructor/bootcamp classrooms; CTF competitions.
- Certificates and skills transcripts (extending the credential system);
  enterprise SSO/SCIM.
- **Extend tradecraft scoring and detection feedback to network/AD labs**
  once those environments exist.
- **Extend report-grading rubrics** to more advanced scenario types.
- Persistent ranges, multiplayer, and compliance-framed labs become real
  Phase 2 candidates once MVP usage data justifies them.

## 28. Differentiation

The platform does not compete on the number of vulnerable machines. Its
defensible differentiation, ordered by pull-to-subscribe strength rather
than build order:

1. **Proof that travels** — a signature a third party can check beats a
   downloadable certificate image every incumbent already offers. This is
   the strongest conversion hook: it answers the question a prospective
   subscriber is actually asking ("will this get me hired"), not an
   abstract learning-quality claim — lead with it on the landing page and
   pricing page.
2. **The mentor teaches, it doesn't answer** — a genuinely adaptive tutor
   beats a static hint tree or a generic chatbot bolted on top, and directly
   addresses the #1 beginner frustration (stuck with no help). Demo it live
   pre-signup.
3. **Every session is unique** — walkthroughs and shared answers stop
   working, a structural property competitors' static-machine architecture
   can't retrofit without rebuilding their content pipeline. A retention and
   differentiation driver more than an acquisition one — sell it in
   onboarding, not the homepage headline.
4. **The score means something** — methodology and report quality are
   graded, not just "flag found," closer to what a hiring manager actually
   wants to know. Justifies Pro/Professional pricing more than it drives
   initial signup.
5. **Full attacker→defender loop in one lab** — competitors treat offense
   and defense as separate product lines; here it's one lab. An in-product
   delight moment rather than a marketing headline.

## 29. First Build Order

1. Build the Next.js dashboard.
2. Build FastAPI backend + PostgreSQL schema (incl. `role`, `lab_variants`,
   `telemetry_events`, `reports`, `credentials` tables from day one — adding
   them later means a painful migration on live session data).
3. Implement authentication with role field.
4. Create WEB001 Docker lab **with mutation spec(s)** from the start.
5. Implement lab session state machine + unique-flag-per-session validation.
6. Implement Launch Lab endpoint (mutation engine wired in).
7. Implement telemetry tap + tradecraft scoring.
8. Implement AI mentor service, wired to the hint endpoint.
9. Implement detection layer + log feed endpoint.
10. Implement report submission + grading service.
11. Implement credential issuance service.
12. Implement timer/expiry worker + cleanup.
13. Create AWS Terraform proof of concept (target on Fargate + tap +
    detection layer modules).
14. Add subscription entitlement checks + AI usage metering.
15. Add admin dashboard (sessions, variants, mentor/grading QA, cost).
16. Add monitoring and logging.

## 30. Final Product Vision

CyberLab becomes an online practical cybersecurity academy where progress is
provable, not just claimed: fundamentals through web, network, Windows/AD,
and red/blue-team scenarios, where every exercise is uniquely generated,
every score reflects real methodology and communication skill, and every
completion produces a credential that outlives the platform's own UI. The
MVP proves one complete, differentiated vertical slice before expanding:

**Dashboard → Launch Mutated Lab → Isolated Environment → Guided Practice
with AI Mentor → Flag + Report Validation → Tradecraft + Report Score →
Detection Feedback → Verifiable Credential → Automatic Cleanup.**
