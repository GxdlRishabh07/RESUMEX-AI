---
name: ResumeAI Pro
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#434655'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#545f73'
  on-secondary: '#ffffff'
  secondary-container: '#d5e0f8'
  on-secondary-container: '#586377'
  tertiary: '#4d556b'
  on-tertiary: '#ffffff'
  tertiary-container: '#656d84'
  on-tertiary-container: '#eef0ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#d8e3fb'
  secondary-fixed-dim: '#bcc7de'
  on-secondary-fixed: '#111c2d'
  on-secondary-fixed-variant: '#3c475a'
  tertiary-fixed: '#dae2fd'
  tertiary-fixed-dim: '#bec6e0'
  on-tertiary-fixed: '#131b2e'
  on-tertiary-fixed-variant: '#3f465c'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  2xl: 64px
  container-max: 1280px
  gutter: 24px
---

## Brand & Style
The design system is engineered for high-authority professional services, specifically targeting career-driven individuals and executive-level users. The brand personality is rooted in **Corporate Modernism**—a blend of institutional reliability and cutting-edge technological precision.

The aesthetic prioritizes clarity and functional efficiency over decorative flair. It utilizes high-quality typography, generous whitespace, and a rigid structural alignment to evoke a sense of calm confidence. The UI feels like an elite consultant: knowledgeable, unbiased, and exceptionally organized.

## Colors
The palette is built on a foundation of sophisticated cool tones to maintain a serious, high-trust atmosphere.

- **Primary Action (#2563eb):** Reserved for core interactions like "Optimize Resume" or "Download PDF." It is the singular point of high-energy color.
- **Headers & Navigation (#1e293b):** A deep navy used for structural elements and secondary emphasis to provide a professional "anchor."
- **Primary Text (#0f172a):** A deep slate that ensures maximum legibility and feels more modern than pure black.
- **Surface & Backgrounds:** The primary background remains pure white for maximum clarity, while `#f8fafc` is used for large layout sections to reduce glare and differentiate content blocks.

## Typography
This design system utilizes **Inter** exclusively to lean into its systematic, utilitarian heritage. The type scale is optimized for high information density while maintaining breathability. 

Tighten letter spacing on larger headlines to ensure a "locked-in" professional feel. Use `label-sm` for metadata and form headers to create a clear hierarchy between user input and system labels.

## Layout & Spacing
The layout follows a **Fixed Grid** philosophy for dashboard views and a centered narrow-column approach for resume editing tools to minimize horizontal eye travel.

- **Desktop:** 12-column grid, 1280px max-width, 24px gutters, and 40px outer margins.
- **Tablet:** 8-column grid, 24px gutters, 24px margins.
- **Mobile:** 4-column grid, 16px gutters, 16px margins.

Spacing follows a strict 4pt/8pt rhythm. Use `xl` (40px) spacing between major sections and `md` (16px) for internal component padding.

## Elevation & Depth
The system uses **Low-Contrast Outlines** combined with **Ambient Shadows** to create a sense of organized layers without overwhelming the user with heavy gradients.

1.  **Level 0 (Base):** White or `#f8fafc`.
2.  **Level 1 (Cards/Containers):** White background with a 1px border of `#e2e8f0`.
3.  **Level 2 (Interactive/Floating):** Add a subtle shadow (0px 4px 6px -1px rgba(15, 23, 42, 0.1)).
4.  **Level 3 (Modals):** High-diffusion shadow (0px 20px 25px -5px rgba(15, 23, 42, 0.1)).

Depth is primarily communicated via borders; shadows are used sparingly to highlight active states or temporary overlays.

## Shapes
Following the "ROUND_FOUR" directive, the shape language is disciplined and subtle.

- **Standard Elements (Buttons, Inputs, Small Cards):** 4px (0.25rem) radius.
- **Large Containers (Sections, Main Dashboard Cards):** 8px (0.5rem) radius.
- **Extra Large (Modals):** 12px (0.75rem) radius.

This subtle rounding maintains the professional "edge" of a corporate tool while appearing more accessible than harsh 0px corners.

## Components

### Buttons
- **Primary:** Solid `#2563eb` with white text. 4px border radius.
- **Secondary:** Transparent with `#1e293b` border and text.
- **Tertiary:** Ghost style, no border, text only in `#1e293b`.

### Input Fields
- White background, `#e2e8f0` border, 4px radius. 
- On focus: Border changes to `#2563eb` with a subtle 2px glow.
- Labels are always top-aligned using `label-md`.

### Cards
- Used for resume sections and AI suggestions. 
- Crisp `#e2e8f0` borders. 
- Internal padding is 24px (`lg`). 
- Grouped headers inside cards should use a light `#f8fafc` background-fill to separate "Header" from "Content."

### AI-Specific Elements
- **Optimization Chips:** Use a light blue tint (e.g., `rgba(37, 99, 235, 0.1)`) for background and `#2563eb` for text to denote AI-generated improvements.
- **Progress Bars:** Thin 4px bars using the primary blue to show "Optimization Score."

### Lists
- Clean vertical stacks with 1px horizontal separators (`#e2e8f0`). 
- No bullet points; use whitespace and bold subheaders to define items.