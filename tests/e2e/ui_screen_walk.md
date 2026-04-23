# UI screen + button walk-through (Chrome MCP)

Once backend tests pass, this procedure validates every screen, button,
and form in the browser. Use it from any testing subagent when the
parent asks for "UI testing" or "button testing" or "screen coverage".

## Tools

Use the `mcp__Claude_in_Chrome__*` MCP tools:
- `mcp__Claude_in_Chrome__navigate` — open a URL
- `mcp__Claude_in_Chrome__get_page_text` — read the rendered DOM
- `mcp__Claude_in_Chrome__find` — locate an element by text or CSS
- `mcp__Claude_in_Chrome__computer` — click / type / scroll
- `mcp__Claude_in_Chrome__read_console_messages` — pick up JS errors
- `mcp__Claude_in_Chrome__read_network_requests` — verify fetch calls
- `mcp__Claude_in_Chrome__tabs_create_mcp` — open a fresh tab
- `mcp__Claude_in_Chrome__browser_batch` — batch many actions efficiently

## Prerequisites

- User is logged into https://projextpal.com (session cookie present).
- If not, first navigate to `/signin`, fill the form, submit.
- Expected user: `sami@inclufy.com` / `Eprocure2025!`.

## Per-methodology walk

For each methodology in [scrum, kanban, waterfall, prince2, agile,
lss-green, lss-black, hybrid]:

1. **Navigate** to a project of that methodology:
   `https://projextpal.com/projects/<id>/<methodology>/overview`

2. **Enumerate tabs** — read the left-sidebar DOM; each nav link is a tab.

3. **For each tab**:
   a. Click the tab link.
   b. Wait for render (use `browser_batch` with short pauses).
   c. Run `read_console_messages` — collect any red errors.
   d. Run `read_network_requests` — verify `/api/v1/.../` calls returned 200.
   e. Run `get_page_text` — verify the tab actually rendered (not a 404
      "Pagina niet gevonden" page).
   f. If the tab has primary buttons (Create, Edit, Approve, Start,
      Complete), click ONE to open its dialog/form, capture any console
      errors, then cancel/close. Don't submit destructively.

4. **Record** per-tab: rendered OK / console errors / network 4xx-5xx
   / key buttons present-and-clickable.

## Per-screen checklist

For each screen, assert the minimum contract:

- [ ] HTTP 200 on the frontend route (not the 404 SPA fallback)
- [ ] `<h1>` or page-title element is present
- [ ] No console errors of severity >= error
- [ ] All `<button>` elements in the main content area are either
      enabled + clickable, or have a valid `disabled` reason visible
      (tooltip, gray-out, count)
- [ ] Network calls fired during render all returned 2xx or 304

## Button contract

A button that:
- Says "Download Certificate" → must be disabled until eligibility returns
  `eligible: true`. Click → download a PDF (content-length > 10KB).
- Says "Enroll" or "Start Course" → must navigate to the learning player
  on click (for free courses) OR redirect to Stripe (for paid).
- Says "Approve" / "Reject" / "Complete" → must open a confirmation
  dialog or fire a POST to the corresponding backend action endpoint.

Never click destructive buttons (Delete, Revoke, Cancel-Subscription)
during an automated sweep.

## Output format

```
UI SCREEN WALK REPORT
=====================
▶ SCRUM (project 1)
  /projects/1/scrum/overview          rendered-ok  0 console errs  7 net calls
  /projects/1/scrum/backlog           rendered-ok  0 console errs  4 net calls  [+ 5 backlog items]
  /projects/1/scrum/sprint-board      rendered-ok  0 console errs  3 net calls
  ...
  broken tabs: [list]
  console errors: [list]
  buttons missing/wrong: [list]

(repeat per methodology)

=====================
SUMMARY
  tabs walked: N
  tabs rendered: M / N
  console errors: K
  network failures: L
  button contract violations: X
```

## Stale-bundle detection

Before walking any tab, fetch `/` and extract the main JS bundle hash
from `<script src="/assets/index-*.js">`. If the hash matches
`index-B8K2C-Hd.js` (the pre-today build), STOP and tell the parent
the deploy hasn't run — all tabs will 404 until it does. Don't run
the full walk on a stale bundle.
