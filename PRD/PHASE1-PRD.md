# Finding Gems (Dualangka) - Phase 1 Growth PRD

Date: 2026-02-09
Owner: PM/BE

## 1) Goal

Phase 1 focuses on solving the marketplace chicken-and-egg by creating repeatable demand loops (buyers returning) and supply loops (creators submitting quality tools) with lightweight trust signals.

Primary outcomes:
- Increase repeat visits (weekly habit).
- Increase creator submissions (quality + quantity).
- Increase purchase intent (trust + clarity).

## 2) Scope (Phase 1)

We will ship four mutually reinforcing initiatives:

1) Weekly Drops (curated releases)
2) Request a Tool (demand capture)
3) Vibe Code Challenge (event-driven supply)
4) Trust Signals (conversion)

## 3) Target Users

- Visitor: browse without login
- Buyer: discover tools, bookmark, purchase, request tools, message creators
- Creator: submit listings, respond to requests, participate in events
- Admin: curate weekly drops, moderate requests/submissions, approve creators

## 4) Success Metrics (Phase 1)

Acquisition:
- New user signups per week
- Invite/viral coefficient for events (shares per submission)

Activation:
- % buyers who bookmark at least 1 tool in first session
- % buyers who submit a request within 7 days

Retention:
- Weekly active users (WAU)
- % WAU that opens Weekly Drops section

Supply:
- New listings submitted per week
- Event submissions per challenge

Monetization proxy:
- Click-through to external URL
- Checkout start rate
- Completed transactions

## 5) Non-Goals (Phase 1)

- Full community social network (profiles, feeds, follows)
- Advanced AI recommendation engine
- Automated license provisioning
- Push notifications (browser/app)

## 6) Initiative A: Weekly Drops

### Problem
Buyers need a reason to return regularly. Creators need reliable distribution.

### Solution
Create a weekly curated collection of tools ("Drops") with a clear editorial narrative and consistent schedule.

### Requirements

Data model (BE):
- Drop: id, title, slug, description, coverImage, publishAt, status(draft/published), createdBy, createdAt
- DropItem: id, dropId, websiteId, position, note(optional)

Buyer experience (FE):
- Homepage section: latest published Drop
- Drop detail page: list of DropItems (website cards) + editorial copy
- Optional: subscribe CTA (email capture) for future

Admin experience (FE/BE):
- Admin can create/edit/publish Drops
- Admin can reorder items
- Admin can add short notes per item

### User Stories + Acceptance Criteria

Buyer:
- As a buyer, I want to see a weekly curated collection so I can quickly discover quality tools.
  - Given a published Drop exists, when I open the homepage, then I see the latest Drop with title and at least 3 items.
  - Given I click the Drop, when the page loads, then I see all items in the editorial order.

Admin:
- As an admin, I want to publish a Drop so users see it on the homepage.
  - Given I created a Drop in draft, when I set status to published with publishAt <= now, then it appears as the latest Drop.

## 7) Initiative B: Request a Tool (Demand Capture)

### Problem
Buyers often know the outcome they want, not the tool. We need a way to capture demand and route it to creators.

### Solution
Add a lightweight "Request board" where buyers can post needs and creators can respond.

### Requirements

Data model (BE):
- ToolRequest: id, buyerId, title, description, categoryId(optional), budgetRange(optional), status(open/closed), createdAt
- ToolRequestResponse: id, requestId, responderId, message, websiteId(optional), createdAt

Permissions:
- Buyer can create request
- Creator can respond
- Admin can moderate (hide/remove)

Buyer experience:
- Create request form with guidance prompts
- Request detail: responses list
- Close request

Creator experience:
- Browse open requests (filter by category)
- Respond with message and optional link to an existing website listing

Implementation notes:
- See `docs/request-a-tool.md` for v1 routes, roles, and endpoint list.

### User Stories + Acceptance Criteria

Buyer:
- As a buyer, I want to request a tool so creators can suggest solutions.
  - Given I am logged in as buyer, when I submit a request with title + description, then it appears on the request board with status=open.
- As a buyer, I want to close a request so I stop receiving responses.
  - Given my request is open, when I set status=closed, then creators can no longer respond.

Creator:
- As a creator, I want to respond to requests so I can get leads.
  - Given a request is open, when I post a response, then the buyer sees it on the request detail page.

## 8) Initiative C: Vibe Code Challenge (Event-Driven Supply)

### Problem
We need a reliable mechanism to generate new tool submissions and marketing moments.

### Solution
Run recurring timeboxed challenges. Submissions are routed into the marketplace as listings (or as a "challenge" collection).

### Requirements

Event model (BE):
- Challenge: id, title, slug, theme, rules, startAt, endAt, status(upcoming/active/ended), createdBy
- ChallengeSubmission: id, challengeId, userId, websiteId(optional), title, demoUrl, repoUrl(optional), description, status(submitted/approved/rejected), createdAt

Core workflows:
- Admin creates Challenge
- Creators submit entry
- Admin moderates/approves
- Approved entries get featured placement (homepage section or drop-like page)

### User Stories + Acceptance Criteria

Creator:
- As a creator, I want to submit my tool to a challenge so I can get featured.
  - Given a challenge is active, when I submit a valid entry, then status=submitted and I see confirmation.

Admin:
- As an admin, I want to approve submissions so only quality entries are featured.
  - Given a submission is submitted, when I approve it, then it appears in the challenge page under approved items.

## 9) Initiative D: Trust Signals (Conversion)

### Problem
Discovery without trust does not convert. Buyers need quick credibility cues.

### Solution
Ship lightweight trust signals that do not require heavy verification systems.

### Requirements

Signals (FE):
- Listing badges: Reviewed, New, Popular this week (simple heuristics)
- Creator profile: basic "Reviewed creator application" status
- Checkout clarity: what buyer gets, what happens after purchase (manual approval)

Signals (BE):
- Moderation flags stored on website/creator
- Simple scoring fields (views/clicks) already exist; can be used for Popular heuristics

### User Stories + Acceptance Criteria

Buyer:
- As a buyer, I want clear trust cues so I can decide faster.
  - Given a listing is marked reviewed, when I view its card, then I see a "Reviewed" badge.

Admin:
- As an admin, I want to mark a listing as reviewed so it shows credibility.
  - Given a website is pending review, when I mark reviewed=true, then badge appears for buyers.

## 10) Rollout Plan

Week 1:
- Weekly Drops (v1) + admin tooling minimal
- Trust signals on listing cards (v1)

Week 2:
- Request a Tool (v1) + moderation minimal

Week 3:
- Vibe Code Challenge (v1) + submission + featuring

Week 4:
- Polish + analytics dashboards + iteration based on usage

## 11) Risks + Mitigations

- Low quality submissions: enforce moderation + featured slots are curated
- Spam requests: rate limit + admin hide/remove
- Event fatigue: keep challenges simple, consistent cadence, clear rewards

## 12) Open Questions

- Do we want Requests to be public to visitors or only logged-in?
- Will creators respond via internal messages or via response comments (Phase 1 suggests on-platform responses; messaging can be Phase 1.5)?
- What is the minimal "Reviewed" definition (manual admin toggle vs automated criteria)?
