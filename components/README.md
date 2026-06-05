# Chekin Guest App V3 — shared components

Reusable, framework-free Web Components for the Guest App V3 prototypes.
Drop them into any page (no build step) and they render the navbar and the
Vela assistant panel exactly as designed in the registration forms.

Each component is **self-contained**: it injects its own CSS and the
Montserrat font once, uses literal colors (no dependency on page CSS
variables), and scopes every style under its own tag so it never clashes
with the host page.

There is one source of truth — edit the component, every page updates.

## Files

| File | What it is |
|------|------------|
| `chekin-navbar.js` | `<chekin-navbar>` — fixed left sidebar (288px) |
| `chekin-vela.js`   | `<chekin-vela>` — fixed right assistant panel (345px) |
| `demo.html`        | Live usage example / smoke test |

## Usage

Include the scripts once (adjust the relative path to your page depth) and
drop in the tags. The components are fixed overlays, so reserve room for
them on your main content:

```html
<head>
  <script src="../components/chekin-navbar.js" defer></script>
  <script src="../components/chekin-vela.js" defer></script>
  <style>
    /* leave room for the fixed sidebars */
    .main { margin-left: 288px; margin-right: 380px; }
    @media (max-width:1279px){ .main{ margin-right:0; } } /* Vela hides */
    @media (max-width:767px){  .main{ margin-left:0; } }  /* navbar hides */
  </style>
</head>
<body>
  <chekin-navbar active="registration"></chekin-navbar>

  <main class="main"> … your page … </main>

  <chekin-vela intro="…" reco-title="Vela recommends">
    <script type="application/json"> [ …items… ] </script>
  </chekin-vela>
</body>
```

Relative path from each location to `components/`:
- `landingV1/index.html` → `../components/`
- `landingV1/registro/*.html` → `../../components/`

## `<chekin-navbar>`

Fixed 288px sidebar. Hidden below 767px. The menu items and their badges
live inside the component (single source of truth); pages only pick the
active item and optionally the brand / user.

| Attribute | Default | Notes |
|-----------|---------|-------|
| `active` | — | `home` · `registration` · `payments` · `virtual-keys` · `luggage` · `guidebooks` · `recommendations` · `checkout` |
| `brand` | `Casa del Mar` | name next to the Chekin logo |
| `user-name` | `Carmen Specimen` | user card name (initials auto-derived) |
| `user-email` | `carmen@email.com` | user card email |

```html
<chekin-navbar active="payments" brand="Villa Sol" user-name="Léa Martin"></chekin-navbar>
```

## `<chekin-vela>`

Fixed 345px assistant panel (22px inset). Hidden below 1279px. The chrome
(avatar, title, badge, intro, divider, scrollable list, chat bar) is fixed;
the **list content is configurable**.

| Attribute | Default | Notes |
|-----------|---------|-------|
| `intro` | generic line | paragraph under the title |
| `reco-title` | `Vela recommends` | list header |
| `reco-subtitle` | — | optional sub-line under the header |
| `reco-icon` | `sparkle` | header icon: `sparkle` or `sun` |

### Items

Pass items as a JSON array in a child `<script type="application/json">`
(or set the `.items` property in JS). Each item is flexible:

```jsonc
// Insight card with an embedded action card (stay recommendation):
{ "strong": "Early access may be useful.",
  "text": " Your arrival time fits an early check-in.",
  "action": { "icon": "lock", "title": "Early check-in",
              "subtitle": "Access from 11:00", "price": "€25", "button": "Add" } }

// Insight card with a chip/reason row (no action):
{ "chip": "Tip", "reason": "Faster check-in",
  "strong": "Use your passport", "text": " Pick the same document…" }

// Standalone action card (no strong/text → renders as just the card):
{ "icon": "doc", "title": "What documents work?",
  "subtitle": "Passport, ID or license", "button": "Ask" }
```

Item fields: `chip`, `reason` (optional pill row) · `strong`, `text`
(insight body) · `action` `{icon,title,subtitle,price,button}` (embedded
card) — or a top-level `icon/title/subtitle/price/button` for a standalone
action card.

**Built-in icons:** `book`, `lock`, `car`, `clock`, `doc`, `clock-alt`,
`parking`, `users`, `share`, `sun`, `sparkle`.

```html
<chekin-vela intro="I can help with your stay." reco-title="Vela recommends">
  <script type="application/json">
  [
    {"strong":"Review the property guidebook.","text":" House rules, access and key info.",
     "action":{"icon":"book","title":"Property guidebook","subtitle":"Key information","button":"Open"}}
  ]
  </script>
</chekin-vela>
```

## Notes

- No build step. Modern-browser custom elements (ES2015 classes).
- Want a new menu item or icon? Edit the component — it propagates everywhere.
- The components render in light DOM (so page fonts/tokens still apply) but
  scope all CSS under their own tag, so the host page's classes are safe.
