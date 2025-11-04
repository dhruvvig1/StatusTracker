# AIStandup Design Guidelines

## Design Approach
**Selected System:** Linear-inspired productivity design with Material Design principles for enterprise project management.

**Justification:** AIStandup is a utility-focused productivity tool requiring efficient data display, clear hierarchy, and professional appearance suitable for enterprise use with Visa branding.

**Key Principles:**
- Information density over visual flair
- Clear action hierarchy
- Instant feedback for AI/speech features
- Professional, trustworthy aesthetic

## Typography System

**Font Stack:**
- Primary: Inter (Google Fonts) - clean, highly legible for data-heavy interfaces
- Monospace: JetBrains Mono - for Jira links and technical identifiers

**Hierarchy:**
- Page Titles: text-2xl font-semibold (32px)
- Section Headers: text-xl font-semibold (24px)
- Card Titles: text-lg font-medium (20px)
- Body Text: text-base font-normal (16px)
- Metadata/Labels: text-sm font-medium (14px)
- Timestamps/Secondary: text-xs (12px)

## Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, and 8 for consistency
- Component padding: p-6
- Section gaps: gap-4 or gap-6
- Card spacing: p-4 inside, mb-4 between
- Form fields: mb-4 between inputs
- Page margins: px-6 py-8

**Grid Structure:**
- Container: max-w-7xl mx-auto
- Project list: Grid layout on desktop (grid-cols-1 lg:grid-cols-2 xl:grid-cols-3)
- Detail page: Single column max-w-4xl for optimal reading
- Form: max-w-2xl for focused input

## Component Library

### 1. Header/Navigation
- Fixed top header with Visa logo (left-aligned, h-8)
- Application name "AIStandup" next to logo (text-xl font-bold)
- Minimal navigation: Active Projects count badge, User profile icon (right-aligned)
- Height: h-16 with shadow-sm
- Padding: px-6

### 2. Project Intake Form
**Layout:** Centered card (max-w-2xl), prominent on dashboard
- Card with rounded-lg, shadow-md, p-6
- Single input field with label "Jira Link or Jira Align Link"
- Input: Large (h-12), rounded-md border with focus ring
- Helper text below: text-sm showing example format
- Submit button: Full-width, h-12, rounded-md, font-medium
- Success feedback: Toast notification (top-right)

### 3. Project List Cards
**Card Structure:**
- Rounded-lg border, p-4, hover:shadow-lg transition
- Title: text-lg font-semibold, truncate
- Metadata grid (2 columns on mobile, 3 on desktop):
  - Due Date with calendar icon
  - Lead with user icon
  - Developer with code icon
  - Category with tag icon
- Latest Status: Truncated preview (text-sm, 2 lines max) with "Read more" affordance
- Status indicator badge: Small rounded-full badge (top-right) showing project health

### 4. Project Detail Page
**Header Section:**
- Breadcrumb: Back to Projects link
- Project title: text-2xl font-bold
- Metadata bar: Flex row with Due Date, Lead, Developer, Category (each with icons)
- Horizontal divider (border-b)

**Status Timeline:**
- Chronological feed (newest first)
- Each status entry:
  - Avatar or initial circle (left)
  - Commenter name (font-medium) + timestamp (text-xs)
  - Status content in card: rounded-md border, p-4, mb-4
  - Connecting line between entries (subtle border-l)

**New Status Input:**
- Sticky bottom section (or prominent at top)
- Card with rounded-lg, p-4
- Textarea: min-h-24, rounded-md border
- Action row below textarea:
  - Speech-to-text button (icon: microphone, rounded-md border, px-4 py-2)
  - AI Refine button (icon: sparkles, rounded-md border, px-4 py-2)
  - Submit button (primary, rounded-md, px-6 py-2, font-medium)
- Buttons with hover:shadow-md
- Active recording state: Pulsing border on textarea + microphone icon animation

### 5. Empty States
- Project list empty: Centered illustration placeholder, helpful text, CTA to add first project
- Status timeline empty: "No status updates yet" with prompt to add first update

### 6. Interactive States
**Speech-to-Text Active:**
- Textarea border becomes animated (pulse effect)
- Microphone button shows recording indicator
- Transcription appears in real-time in textarea

**AI Refining:**
- Loading spinner in AI Refine button
- Textarea content animates to refined version (subtle fade transition)
- Brief success checkmark in button

**Form Validation:**
- Invalid Jira link: Red border with error message below input
- Required fields: Asterisk in label, inline validation

### 7. Buttons & CTAs
**Primary Actions:**
- Rounded-md, px-6 py-2, font-medium
- Add Project, Submit Status: Prominent sizing (h-11)

**Secondary Actions:**
- Rounded-md border, px-4 py-2
- Speech-to-text, AI Refine: Icon + text

**Tertiary/Text:**
- Back links, timestamps: Underline on hover

### 8. Icons
**Library:** Heroicons (via CDN)
- Use outline style for most UI elements
- Use solid style for active states and badges
- Consistent sizing: h-5 w-5 for inline, h-6 w-6 for buttons

## Responsive Behavior

**Mobile (base):**
- Single column layouts
- Stack metadata vertically
- Full-width buttons
- Simplified header (logo + menu icon)

**Tablet (md:):**
- 2-column project grid
- Side-by-side metadata

**Desktop (lg:+):**
- 3-column project grid
- Horizontal metadata bar
- Sticky navigation

## Accessibility
- Focus rings on all interactive elements (ring-2 ring-offset-2)
- ARIA labels for icon-only buttons
- Proper heading hierarchy (h1 → h2 → h3)
- Keyboard navigation: Tab through forms, Enter to submit
- Screen reader announcements for AI/speech states

## Images
**No hero images** - This is a productivity tool focused on efficiency. Use only functional imagery:
- Empty state illustrations (simple line art)
- User avatars (circle crops, 40px diameter)
- Visa logo (placed in header, official brand asset)

## Animations
**Minimal, purposeful only:**
- Card hover: Subtle shadow transition (200ms)
- Form submission: Success checkmark fade-in
- Speech recording: Microphone pulse animation
- AI refining: Gentle content swap transition
- No decorative animations