# JeevRaksha — Mobile-First UX Specification

**Scope:** UX/product design only. No backend logic, no implementation.
**Audience:** users under stress during or after an animal encounter, plus responders and admins.

---

## 1. Design Principles (drive every screen below)

| Principle | What it means in practice |
|---|---|
| Emergency actions are obvious | One thumb-reachable primary action per screen during a live encounter; no menus to dig through. |
| Avoid dense forms | Multi-step, single-question-per-screen forms; optional fields are truly optional and deferred. |
| Large buttons, plain language | Minimum 48×48dp tap targets; no jargon ("Stay away," not "Maintain safe perimeter"). |
| English first, localizable | All copy lives in a string table; no text baked into images/icons; layouts tolerate 30–40% text expansion. |
| No public sensitive coordinates | Exact GPS is never shown to the public or to other regular users — only to the reporter (their own report) and authorized responders/admins. Public-facing views show a fuzzed area (e.g. locality/grid cell), never a pin. |
| Show AI uncertainty | Every AI identification includes a confidence level and a "not certain" path — never presented as fact. |
| Danger-first guidance | For any elevated-risk situation, the guidance screen always leads with distancing/shelter/contact-authorities actions before anything else (info, education, etc.). |

---

## 2. Information Architecture & Global Navigation

**Nav model:** Bottom tab bar (5 slots max), persistent except during the Emergency/Report flow (which is full-screen, modal-style, with only an exit/cancel control — no bottom nav, to avoid accidental exits and to keep focus).

```
Bottom Tabs (regular user):
[ Home ]  [ Report ]  [ Alerts ]  [ History ]  [ Profile ]

Role-based additional entry points (not in bottom nav):
- Responder Dashboard  → separate app mode / role-gated entry, own nav shell
- Admin Dashboard      → separate web-first surface, own nav shell
```

- **Report** tab always launches the Emergency/Report flow directly — it is never a screen with sub-menus first.
- Role is detected at login; a user with responder or admin privileges sees an additional switcher, not merged navigation, so the emergency-first design isn't diluted for regular users.

---

## 3. Screen Specifications

### 3.1 Home Screen

**Purpose:** Orient the user in under 2 seconds; make "I need help now" impossible to miss.

**Layout (top to bottom):**
1. Status bar / app header — app name, small profile icon (top right), no clutter.
2. **Primary Emergency Button** — full-width, large, high-contrast (e.g. red/orange), fixed near top: **"Report Animal Encounter"**. Always visible without scrolling.
3. Secondary row — two medium buttons side by side: **"Identify an Animal"** and **"Safety Tips"**.
4. **Nearby Alerts** preview card — shows count only ("3 recent alerts near you") with a "View all" link, not raw data on the home screen.
5. Recent activity strip — last 1–2 incidents from the user's own history, tap to view status.

**Primary actions:** Report (emergency), Identify, Safety Tips, view alerts, view own recent incident.

**States:**
- *Default:* as above.
- *Location permission not granted:* a slim inline banner ("Enable location for faster help") above the fold, non-blocking — emergency button still works without location (see Report flow).
- *Offline:* Home still loads from cache; emergency button remains active and queues the report (see 3.2 error states).
- *First-time user:* one-time 3-card intro overlay (skip always visible), never blocks the emergency button which stays tappable underneath/behind a dismiss-first pattern only if truly necessary — safer to skip onboarding entirely and let Home teach through the button labels themselves.

**Error states:** none blocking; all degrade to cached/offline behavior.

**Accessibility:**
- Emergency button: min 56dp height, label read by screen reader as "Report Animal Encounter, button" — not decorative icon-only.
- Color contrast ≥ 4.5:1 for all text; the emergency button's color is never the *only* signal — it also has an icon + label.
- Full screen reachable via screen reader in a single linear swipe order matching visual order.

---

### 3.2 Emergency / Report Flow

**Purpose:** Capture what's needed to dispatch help and warn others, in the fewest steps possible, usable one-handed, under stress.

**Flow (one question per screen, large "Next" button, back always available):**

1. **Step 1 — Are you safe right now?**
   - Two large buttons: **"I'm safe"** / **"I need help now"**
   - Choosing "I need help now" surfaces a persistent top banner for the rest of the flow: **"If you are in immediate danger, move to safety first."** with a tappable **"Call local emergency number"** action (uses device dialer, number is configured per region — not hardcoded here).
2. **Step 2 — What's happening?** Large icon-buttons, single tap, single select: *Animal sighting / Animal in distress or injured / Animal blocking a path / Aggressive behavior / Other.*
3. **Step 3 — Location.** Auto-captured GPS shown as a simple confirmation ("Using your current location ✓") with a **"That's not right"** fallback to manual pin-drop on a map. No coordinates displayed as raw numbers to the user — a friendly place description instead.
4. **Step 4 — Add a photo or video (optional).** One big camera button + one big gallery button. Explicit **"Skip"** always visible and equally prominent — never guilt the user into uploading.
5. **Step 5 — Anything else? (optional, one open text field, optional voice note).**
6. **Review & Submit.** A single summary card, big **"Submit Report"** button, and a smaller **"Edit"** link per field (not a full re-navigation).

**States:**
- *Submitting:* full-width progress indicator with text "Sending your report…", cannot be double-tapped (button disables).
- *Offline at submit time:* report is saved locally and clearly marked **"Saved — will send when you're back online"**, with a persistent, dismissible banner reminding the user it's queued; user is not blocked from continuing to use the app.
- *Low GPS accuracy:* inline note "Location may be approximate" rather than blocking submission.
- *Submitted successfully:* confirmation screen with the incident ID, a **"View Status"** button, and safety guidance surfaced immediately underneath (see 3.4) if the situation category indicates elevated risk.

**Error states:**
- *Submission failed (server/network):* clear retry button + reassurance the data isn't lost ("Your report is saved on this device").
- *No location available and manual pin also fails:* allow submission with a text location description instead of blocking the whole report — never let a missing GPS pin prevent someone from reporting.
- *Camera/gallery permission denied:* non-blocking notice, flow continues without media.

**Accessibility:**
- Each step is a single, focused question — screen reader announces the question as a heading on screen entry.
- "I need help now" and "Call local emergency number" controls meet a minimum 56dp target and are first in reading order.
- Voice note option supports users who cannot type easily under stress or have low literacy/vision constraints.
- Progress indicator ("Step 2 of 6") announced for screen reader users so they know flow length.

---

### 3.3 Animal Identification Flow

**Purpose:** Help a user understand what they're looking at — clearly framed as assistive, not authoritative.

**Flow:**
1. **Capture/upload screen.** Big camera button, big gallery button. Short helper text: "A clear, well-lit photo works best."
2. **Processing state.** Simple progress animation, text: "Analyzing photo…" (kept short; no fake specificity like fabricated processing steps).
3. **Result screen:**
   - Top: identified species name **with a visible confidence indicator** (e.g. a labeled bar or "High / Medium / Low confidence" chip — never a bare percentage with no context).
   - If confidence is Medium/Low: a prominent, plainly worded note: **"We're not fully sure — this is a guess, not a confirmed ID."** plus up to 2–3 alternative possibilities, each with its own confidence.
   - Directly beneath the result (always, regardless of confidence): a **"See Safety Guidance"** button, styled as prominently as the ID result itself — identification is never presented as the end of the interaction when safety may be relevant.
   - A **"Report this encounter"** secondary button, so ID naturally funnels into reporting when relevant.

**States:**
- *No animal detected in photo:* plain message "We couldn't identify an animal in this photo" + retry/upload-different-photo actions — never a hard error page.
- *Very low confidence (below a usable threshold):* result screen still shows, but leads with "We couldn't confidently identify this animal" and skips straight to general safety guidance + report option, rather than presenting a shaky top guess as if it were meaningful.
- *Species is a protected/sensitive one:* result screen omits any location display beyond what the user already knows, and adds a note that sighting details help conservation efforts when reported responsibly.

**Error states:**
- *Upload failed:* retry button, photo preserved locally so it isn't lost.
- *Model/service unavailable:* clear message ("Identification isn't available right now") with a direct path to safety guidance and reporting anyway — identification is never a gate in front of getting help.

**Accessibility:**
- Confidence communicated in text, not color alone.
- Species name and confidence both read together as one screen-reader announcement, so the uncertainty can't be missed.
- Alt text auto-generated is never treated as a substitute for the disclosed confidence level.

---

### 3.4 Safety Guidance Screen

**Purpose:** Give clear, non-confrontational, action-first guidance — this screen is reachable from Home, from Report submission, and from Identification results.

**Layout:**
1. **Top banner, largest text on screen:** the single most important action for the situation (e.g. **"Move away calmly. Do not approach."** or **"Stay indoors until this passes."**), style visually distinct (bordered card, icon), always the very first thing shown.
2. **Ordered do's** (max 4–5 short bullet items, plain language, one idea per line): e.g. "Keep a safe distance," "Bring children and pets inside," "Avoid loud noises or sudden movement."
3. **Ordered don'ts**, same short format: "Do not chase or corner the animal," "Do not attempt to feed, capture, or move it," "Do not approach even if it looks injured or calm."
4. **Contact authorized responders** — large button, always present, never buried: **"Contact Wildlife Responder"** (routes into/alongside the Report flow if not already reported).
5. Optional "Learn more" expandable section for background info — visually de-emphasized and below the fold, since education is secondary to immediate safety.

**States:**
- *Species-specific guidance available:* content above is tailored (e.g. specific distance recommendations).
- *Species unknown / generic:* falls back to universal guidance (distance, no approach, no feeding, contact responders) — never left blank.
- *High-risk category (e.g. large predator, venomous species flagged in taxonomy):* the top banner escalates visually (stronger color, larger text) and the "Contact Wildlife Responder" button is duplicated at both top and bottom of the screen.

**Error states:** if guidance content fails to load, a hardcoded minimal fallback set of universal safety bullets ships client-side so the screen is never empty in a real emergency.

**Accessibility:**
- Top banner uses both icon and text, contrast-checked, and is the first item in reading order.
- Do's/don'ts as true list markup (not paragraph text) for screen reader list navigation.
- No guidance instructs any physical interaction with the animal, under any wording — this is enforced as a content rule, not just a UI rule.

---

### 3.5 Incident Status Screen

**Purpose:** Let the reporting user track what's happening with their own report, reducing anxious follow-up contact.

**Layout:**
1. Header: incident ID + short category label + timestamp.
2. **Status tracker** (simple horizontal or vertical stepper): *Submitted → Under Review → Responder Assigned → Resolved* (or *Closed — No Action Needed*).
3. Current-step detail card: plain-language explanation of what's happening now ("A responder has been notified and is reviewing your report").
4. Read-only summary of what was submitted (photo thumbnail, category, approximate location description — not raw coordinates).
5. **"Add more information"** button (lets user append details/photos without re-submitting a whole new report).
6. If resolved: a short closure note if available, and an optional lightweight feedback prompt ("Was this helpful?" thumbs up/down) — not a long survey.

**States:**
- *Pending sync (submitted offline, not yet sent):* status shown as "Waiting to send" instead of a fabricated server status.
- *No responder yet assigned:* explicit reassurance copy ("This can take a little time — you'll be notified of any updates") rather than a silent/ambiguous stepper.
- *Multiple incidents:* this screen is reached per-incident from History; History itself is the list view.

**Error states:**
- *Status fetch fails:* shows last-known cached status with a "last updated" timestamp and a manual refresh button, rather than an error page.

**Accessibility:**
- Stepper announces current step and total steps ("Step 2 of 4: Under Review") for screen readers, not just visual progress.
- Status changes trigger a non-intrusive local notification, not just a silent UI update, so users don't have to keep re-checking under stress.

---

### 3.6 Nearby Alerts Screen

**Purpose:** Situational awareness for the user's area without exposing precise wildlife locations to the public.

**Layout:**
1. List (default) of recent nearby alerts, each card showing: category icon, plain description ("Elephant sighting reported nearby"), **relative recency** ("2 hours ago"), and a **fuzzed area label** ("Near Sector 4") — never an exact address or pin for anyone other than the original reporter/responders.
2. Optional map view toggle showing **generalized zones/heat areas**, not individual precise pins, for sensitive or protected species; non-sensitive, already-public infrastructure-type alerts (e.g. road hazard warnings) may show a slightly tighter area but still not exact coordinates.
3. Filter control (simple chips): by distance, by recency, by category — kept to a single row, no dense filter form.

**States:**
- *No nearby alerts:* friendly empty state ("No recent alerts in your area") rather than a blank screen.
- *Location unavailable:* prompts to enable location, but still allows browsing alerts for a manually chosen area/region.

**Error states:**
- *Alerts fail to load:* retry button + cached last-seen alerts if available, timestamped as such.

**Accessibility:**
- List view is the accessible default; map view includes an equivalent text list toggle for screen reader users, since maps are inherently hard to navigate non-visually.
- Each alert card is a single focusable element with a full descriptive label (not separate fragmented text nodes).

---

### 3.7 User History Screen

**Purpose:** A simple, scannable record of the user's own past reports and identifications.

**Layout:**
1. Two-tab or filter toggle: **"My Reports"** / **"My Identifications."**
2. Each item as a compact card: date, category/species, thumbnail if present, status chip (Submitted/Resolved/etc.), tap to open full Incident Status (3.5) or ID result (3.3).
3. Simple search/filter by date range or category — presented as a single row of chips, not a form.

**States:**
- *Empty (no history yet):* friendly empty state with a direct shortcut into Report or Identify.
- *Long list:* paginated/infinite scroll, not a giant single load.

**Error states:**
- *Load failure:* retry affordance, cached data shown if available.

**Accessibility:**
- Cards are single accessible elements with full context in the label ("Report, Snake sighting, submitted 3 days ago, status: Resolved").
- Tab/filter controls are reachable and clearly labeled for screen readers, with the active state announced.

---

### 3.8 Responder Dashboard

**Purpose:** Fast, reliable triage and dispatch view for authorized field responders — optimized for quick scanning, not casual browsing. Mobile-first but tolerant of tablet/desktop use in the field vehicle or office.

**Layout:**
1. **Incoming queue** — list sorted by urgency then recency by default. Each row: category icon, urgency badge (e.g. High/Medium/Low, text + color), short description, time since reported, distance from responder (if location shared).
2. Tap into an incident → **Incident Detail** view: full report content, photos/video, **precise location and map** (full coordinates are appropriate here since the viewer is an authorized responder), reporter's optional contact info if provided, and action buttons: **"Accept"**, **"Reassign"**, **"Mark Resolved"**, **"Escalate"**.
3. **My Assigned** tab — incidents currently owned by this responder, with the same status stepper concept as the user-facing screen but with responder-specific controls.
4. Simple map overview mode (toggle) showing all open incidents in the responder's coverage area as precise pins — this view is role-gated and never shown to end users.

**States:**
- *New incident arrives:* queue updates with a visible "New" badge and, ideally, a device notification (implementation detail, out of scope here).
- *No open incidents:* calm empty state, not treated as an error.
- *Poor connectivity in field:* last-synced data shown with a clear timestamp; actions taken offline queue for sync, mirroring the same "Saved — will send" pattern used in the Report flow, since responders are also likely to be in low-signal areas.

**Error states:**
- *Action fails to save (e.g. "Mark Resolved" doesn't sync):* explicit failure state on that specific row, retry control, does not silently fail.

**Accessibility:**
- Urgency is conveyed with both color and text/badge, never color alone.
- Full keyboard/tab navigation supported for desktop/tablet use in an office setting.
- Table/list views have proper row semantics for assistive tech, since responders may include users with access needs too.

---

### 3.9 Admin Dashboard

**Purpose:** Oversight, data quality, user/responder management, and platform-level visibility. Desktop-first (admins are less likely to be in the field), but built from the same component set.

**Layout:**
1. **Overview panel:** high-level counters (open incidents, active responders, reports today, avg. response time) — glanceable cards, not raw tables as the first thing seen.
2. **Incident management table:** filterable/sortable list of all incidents with status, category, region (generalized for list view; precise on drill-in, same access-control logic as Responder Dashboard), assigned responder, and an audit trail of status changes.
3. **User & responder management:** list with role badges, ability to view (not silently guess) verification status of responders, and role-assignment controls behind a confirmation step (role changes are consequential, so no single-tap role edits).
4. **Model/version panel:** shows which animal-ID and risk-assessment model versions are currently active (surfacing the versioning principle from the platform architecture) — read-only reference, not a place to deploy models from this UI.
5. **Data sensitivity controls:** a visible setting/reference showing which species/categories are currently flagged as sensitive (and thus location-fuzzed for public views) — so admins can audit that protection is active, not just assume it.

**States:**
- *Large datasets:* server-side pagination/sorting on tables, never a full unbounded table dump.
- *No data yet (new deployment):* onboarding-style empty states per panel rather than blank tables.

**Error states:**
- *Table/panel fails to load:* isolated per-panel error + retry, so one failing panel doesn't take down the whole dashboard view.
- *Role-change confirmation fails to save:* explicit error, no silent failure on a security-relevant action.

**Accessibility:**
- All tables have proper header/row semantics; sortable columns announce sort state.
- Charts/counters include a text-equivalent summary, not visual-only data.
- Full keyboard operability required (admin tooling is a desktop, often keyboard-heavy context).

---

## 4. Shared Component Library

| Component | Used in | Key spec notes |
|---|---|---|
| Primary Emergency Button | Home, Report flow | ≥56dp height, icon+label, single instance per screen, never disabled without explanation |
| Step Question Card | Report flow | One question, large tap targets, visible step progress |
| Confidence Chip/Bar | Identification | Text-labeled (High/Medium/Low), never color-only |
| Status Stepper | Incident Status, Responder queue | Announces current/total step for screen readers |
| Alert Card | Nearby Alerts, History | Fuzzed-location variant (public) vs. precise variant (responder/admin only) — visually distinct so it's clear which mode is active |
| Guidance Banner | Safety Guidance | Highest-contrast, top-of-screen, icon+text, escalates styling for high-risk categories |
| Empty State | All list screens | Friendly copy + one clear next action, never a bare "No data" |
| Inline Retry Banner | All screens with network dependency | Non-blocking where possible, explicit where the action is safety-critical (e.g. submission) |
| Role-gated Map View | Responder/Admin only | Precise pins; not reachable from any regular-user surface |
| Public Map/Area View | Nearby Alerts | Zone/heat-area rendering only, no precise pins |
| Confirmation Dialog | Admin role changes, destructive actions | Required before any irreversible or security-relevant action |

---

## 5. Localization Approach

- All UI strings externalized to a resource/string table keyed by ID (e.g. `report.step1.title`), English as the default/fallback locale.
- No text embedded in icons or images; icons are paired with text labels, not relied on alone (also an accessibility requirement).
- Layouts use flexible/wrapping containers, not fixed-width text containers, to tolerate longer translated strings.
- Date/time and units (distance) formatted per locale, not hardcoded to one region's convention.
- Right-to-left layout mirroring is a layout-level concern to validate once a RTL locale is added — component specs above avoid left/right-anchored one-off logic that would break mirroring.

---

## 6. Data Sensitivity & Privacy (UX-level rules)

- **Public/regular-user surfaces** (Home, Alerts, History, Identification): location is always shown as a generalized description or zone — never exact coordinates, never a precise pin.
- **Responder/Admin surfaces**: precise location is appropriate and necessary, and is visually/structurally distinct so it's never confused with the public view pattern.
- **Reporter's own report**: the reporter may see their own submitted approximate location for confirmation purposes in the Report flow itself (Step 3), but the *stored/displayed-back* history and status views also default to the fuzzed description, not raw numbers, to reduce incidental exposure risk if a device is shared or viewed over someone's shoulder.
- **Sensitive/protected species**: an additional fuzz/delay may apply (handled at data layer, referenced here only as a UX visibility rule) — the UI never contains a toggle for a regular user to reveal a precise location.

---

## 7. Accessibility Summary (cross-cutting)

- Minimum tap target: 48×48dp general, 56dp for emergency-critical actions.
- Color is never the sole carrier of meaning (status, urgency, confidence all pair color with text/icon).
- Full screen-reader linear navigation order matches visual order on every screen.
- All interactive elements have descriptive accessible labels (no bare icon buttons).
- Text scaling: layouts tested to remain usable at 200% system font size without clipping critical actions.
- Motion: any progress/loading animation has a reduced-motion-safe fallback (static indicator).
- Contrast: minimum 4.5:1 for body text, 3:1 for large text/icons, per WCAG AA.

---

## 8. Open Questions for Next Iteration

- Exact urgency-classification thresholds that drive escalated styling on Safety Guidance and Responder queue (product/ML decision, not a UX one).
- Regional emergency-number configuration source for the "Call local emergency number" action.
- Whether responders need a dedicated offline-first data cache strategy beyond the queued-action pattern described here (technical feasibility question).
- Consent/visibility model for optional reporter contact info shared with responders.

