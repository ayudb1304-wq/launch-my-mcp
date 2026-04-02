# Theme Revamp Guide

Adapt the design language from **InvoiceCop** into the MCPLaunch project. This document captures the fonts, colors, layout patterns, component styles, and overall vibe to reference during the revamp.

---

## 1. Fonts

| Role | Font Family | Source | CSS Variable |
|------|------------|--------|--------------|
| Primary (sans-serif) | **Manrope** | `next/font/google` | `--font-sans` |
| Monospace | **Geist Mono** | `next/font/google` | `--font-mono` |

- Both use the `latin` subset.
- Applied as CSS variables on the root `<html>` element.
- Monospace is used for tables and numeric/tabular values (`font-variant-numeric: tabular-nums`).

---

## 2. Color Palette (OKLCH)

The design uses the **OKLCH color model** for perceptual consistency and smooth dark-mode adaptation.

### Light Mode (`:root`)

| Token | OKLCH Value | Approx Hex | Usage |
|-------|------------|------------|-------|
| `--background` | `oklch(1 0 0)` | `#FFFFFF` | Page background |
| `--foreground` | `oklch(0.145 0 0)` | `#252525` | Primary text |
| `--primary` | `oklch(0.491 0.27 292.581)` | Purple/Violet | Buttons, links, active states |
| `--primary-foreground` | `oklch(0.969 0.016 293.756)` | Light lavender | Text on primary |
| `--secondary` | `oklch(0.967 0.001 286.375)` | Very light gray | Secondary surfaces |
| `--muted` | `oklch(0.97 0 0)` | `#F7F7F7` | Muted backgrounds |
| `--muted-foreground` | `oklch(0.556 0 0)` | `#8A8A8A` | Secondary text |
| `--accent` | `oklch(0.97 0 0)` | `#F7F7F7` | Accent backgrounds |
| `--destructive` | `oklch(0.577 0.245 27.325)` | Red/Orange | Errors, warnings |
| `--card` | `oklch(1 0 0)` | `#FFFFFF` | Card backgrounds |
| `--border` | `oklch(0.922 0 0)` | `#EAEAEA` | Borders |
| `--input` | `oklch(0.922 0 0)` | `#EAEAEA` | Input borders |
| `--ring` | `oklch(0.708 0 0)` | Medium gray | Focus rings |

### Dark Mode (`.dark`)

| Token | OKLCH Value | Approx Hex | Usage |
|-------|------------|------------|-------|
| `--background` | `oklch(0.145 0 0)` | Near black | Page background |
| `--foreground` | `oklch(0.985 0 0)` | Near white | Primary text |
| `--card` | `oklch(0.205 0 0)` | `#323232` | Card backgrounds |
| `--primary` | `oklch(0.432 0.232 292.759)` | Darker purple | Buttons, links |
| `--secondary` | `oklch(0.274 0.006 286.033)` | Very dark gray | Secondary surfaces |
| `--muted` | `oklch(0.269 0 0)` | Dark gray | Muted backgrounds |
| `--input` / `--border` | 10-15% opacity white overlays | — | Borders & inputs |

### Chart Colors (Both Modes)

| Token | OKLCH Value | Description |
|-------|------------|-------------|
| `--chart-1` | `oklch(0.897 0.196 126.665)` | Green |
| `--chart-2` | `oklch(0.768 0.233 130.85)` | Yellow-green |
| `--chart-3` | `oklch(0.648 0.2 131.684)` | Olive |
| `--chart-4` | `oklch(0.532 0.157 131.589)` | Darker olive |
| `--chart-5` | `oklch(0.453 0.124 130.933)` | Darkest olive |

### Semantic Status Colors (Tailwind Utilities)

| Status | Light Mode | Dark Mode |
|--------|-----------|-----------|
| Blue (info/open) | `text-blue-600 bg-blue-50` | `bg-blue-950 text-blue-400` |
| Red (error/overdue) | `text-red-600 bg-red-50` | `bg-red-950 text-red-400` |
| Green (success/paid) | `text-green-600 bg-green-50` | `bg-green-950 text-green-400` |
| Violet (active) | `text-violet-600 bg-violet-50` | `bg-violet-950 text-violet-400` |
| Amber (warning/due) | `text-amber-600 bg-amber-50` | `bg-amber-950 text-amber-400` |
| Zinc (neutral/cancelled) | `text-zinc-500 bg-zinc-50` | `bg-zinc-900 text-zinc-500` |

---

## 3. Border Radius System

| Token | Value | Pixels |
|-------|-------|--------|
| `--radius` (base) | `0.625rem` | 10px |
| `--radius-sm` | `0.375rem` | 6px |
| `--radius-md` | `0.5rem` | 8px |
| `--radius-lg` | `0.625rem` | 10px |
| `--radius-xl` | `0.875rem` | 14px |
| `--radius-2xl` | `1.125rem` | 18px |
| `--radius-3xl` | `1.375rem` | 22px |
| `--radius-4xl` | `1.625rem` | 26px |

**Usage by component:**
- Badges: `rounded-full` (pill shape)
- Buttons & Inputs: `rounded-md` (8px)
- Cards: `rounded-lg` (10px)
- Dialogs: `rounded-xl` (14px)
- Large sections/stat tiles: `rounded-2xl` (18px)

---

## 4. Typography Hierarchy

| Element | Classes | Notes |
|---------|---------|-------|
| Page title | `text-2xl font-semibold tracking-tight` | Largest heading |
| Card title | `text-sm font-medium` (via `font-heading`) | Section headers |
| Body text | `text-xs/relaxed` | Relaxed line-height (~1.75) |
| Labels | `text-xs font-medium` | Form labels, small headings |
| Captions | `text-xs/relaxed text-muted-foreground` | Subdued descriptive text |

---

## 5. Layout Patterns

### Page Structure

```
<header>  — sticky, top-0, z-40, backdrop-blur-md
<main>    — flex-1
  <div className="space-y-8 p-6">  — main content area
```

### Grid System

- Dashboard stat tiles: `sm:grid-cols-2 lg:grid-cols-3` with `gap-6`
- Sidebar-aware layouts using container queries (`@container/card-header`)
- Consistent spacing: `px-4`, `px-6`, `gap-4`, `gap-6`

### Spacing Philosophy

- Generous whitespace throughout
- Cards: `py-4 gap-4` (default), `py-3 gap-3` (compact)
- Header: `gap-6` between logo and nav, `gap-1` between nav items
- Main content: `space-y-8 p-6`

---

## 6. Component Styles

### Buttons

**Variants:**
| Variant | Style |
|---------|-------|
| Default | Primary bg, hover reduces opacity (`hover:bg-primary/80`) |
| Outline | Border + hover bg |
| Secondary | Secondary color bg |
| Ghost | Transparent, hover muted bg |
| Destructive | Light red bg with hover |
| Link | Text with underline |

**Sizes:**
| Size | Height | Padding | Font |
|------|--------|---------|------|
| xs | h-5 | px-2 | text-[0.625rem] |
| sm | h-6 | px-2 | text-xs |
| default | h-7 | px-2 | — |
| lg | h-8 | px-2.5 | — |
| icon-xs | 5x5 | — | — |
| icon-sm | 6x6 | — | — |
| icon | 7x7 | — | — |
| icon-lg | 8x8 | — | — |

**Interactions:**
- Active press: `active:not-aria-[haspopup]:translate-y-px`
- Default icon size inside buttons: `size-3.5`

### Cards

- Background: `bg-card`
- Border: `ring-1 ring-foreground/10` (subtle ring instead of traditional border)
- Radius: `rounded-lg`
- Padding: `py-4 px-4` with `gap-4`
- Compact variant: `data-[size=sm]` reduces padding/gap

### Inputs

- Height: `h-7`
- Border: `border border-input`
- Background: `bg-input/20` (light), `bg-input/30` (dark)
- Radius: `rounded-md`
- Focus: `focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30`

### Badges

- Shape: `rounded-full` (pill)
- Height: `h-5`
- Font: `text-[0.625rem]`
- Variants: default (primary bg), outline (border + muted bg), ghost (no bg)

---

## 7. Interaction & Animation

### Transitions

- Standard duration: `100ms` (`duration-100`)
- Default easing: cubic-bezier (Tailwind default)
- All interactive elements: `transition-all` or `transition-colors`

### Dialog/Modal Animations

- Entry: `animate-in fade-in-0 zoom-in-95`
- Exit: `animate-out fade-out-0 zoom-out-95`
- Overlay: `supports-backdrop-filter:backdrop-blur-xs`

### Dropdown/Menu Animations

- Direction-aware slide: `data-[side=bottom]:slide-in-from-top-2`
- Zoom: `zoom-in-95` / `zoom-out-95`
- Fade: `fade-in-0` / `fade-out-0`

### Special Effects

- Active indicator pulse: `animate-pulse` on status dots
- Hover backgrounds: subtle muted color transitions

---

## 8. Dark/Light Mode

| Setting | Value |
|---------|-------|
| Library | `next-themes` |
| Strategy | `attribute="class"` (`.dark` class on root) |
| Default | `defaultTheme="system"` |
| System detection | `enableSystem` |
| Transition on change | Disabled (`disableTransitionOnChange`) |

**Keyboard shortcut:** Press `D` to toggle (disabled when typing in inputs/textareas).

**Component strategy:** All components use `dark:` Tailwind prefix for dark mode overrides.

---

## 9. Icons

| Setting | Value |
|---------|-------|
| Library | **Lucide React** (`lucide-react@1.7.0`) |
| Default size | `size-3.5` (14px) inside buttons |
| Common sizes | `h-3 w-3`, `h-3.5 w-3.5`, `h-4 w-4` |

---

## 10. Shadows & Surface Treatment

### Shadows

- Used sparingly — primarily for elevation on dropdowns and tooltips
- Dropdowns/Charts: `shadow-md` or `shadow-xl`
- Tooltips: `shadow-xl`
- Cards: No shadow (rely on subtle ring borders instead)

### Borders

- Standard: `border border-input` or `border border-border`
- Subtle (preferred): `ring-1 ring-foreground/10`
- Always 1px width

### Philosophy

- Flat design with minimal elevation
- Rings over borders for cards/containers (cleaner look)
- Shadows reserved for floating/overlay elements only

---

## 11. Focus, Error & Disabled States

### Focus (Consistent across all interactive elements)

```
focus-visible:border-ring
focus-visible:ring-2
focus-visible:ring-ring/30
```

### Error/Invalid

```
aria-invalid:border-destructive
aria-invalid:ring-2
aria-invalid:ring-destructive/20
dark:aria-invalid:border-destructive/50
dark:aria-invalid:ring-destructive/40
```

### Disabled

```
disabled:pointer-events-none
disabled:opacity-50
```

---

## 12. Tech Stack & Libraries

| Concern | Library |
|---------|---------|
| CSS Framework | Tailwind CSS v4 (`@tailwindcss/postcss@4.2.1`) |
| Component Primitives | Radix UI (via shadcn/ui, Mira theme) |
| Animations | `tw-animate-css` |
| Theme Switching | `next-themes` |
| Icons | `lucide-react` |
| Forms | `react-hook-form` + Zod |
| Data attributes | `data-slot`, `data-variant`, `data-size` for semantic styling |

---

## 13. Overall Vibe Summary

**Modern, professional, and technically sophisticated** — a clean productivity tool aesthetic that balances clarity with personality.

- **Not sterile** — the purple primary and rounded corners add warmth
- **Not playful** — restrained animations, muted palette, no decorative elements
- **Data-focused** — generous whitespace lets metrics and content breathe
- **Technically polished** — OKLCH colors, container queries, Radix primitives
- **Approachable professionalism** — suitable for a B2B SaaS product

Think: **Notion meets Linear** — minimal, functional, with subtle craft in the details.
