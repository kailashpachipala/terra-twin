---
name: AgriVision AI
colors:
  surface: '#e8fff0'
  surface-dim: '#b8e4cc'
  surface-bright: '#e8fff0'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#d1fee5'
  surface-container: '#ccf8df'
  surface-container-high: '#c6f2da'
  surface-container-highest: '#c1ecd4'
  on-surface: '#002114'
  on-surface-variant: '#40493d'
  inverse-surface: '#0e3727'
  inverse-on-surface: '#cffbe2'
  outline: '#707a6c'
  outline-variant: '#bfcaba'
  surface-tint: '#1b6d24'
  primary: '#0d631b'
  on-primary: '#ffffff'
  primary-container: '#2e7d32'
  on-primary-container: '#cbffc2'
  inverse-primary: '#88d982'
  secondary: '#006e1c'
  on-secondary: '#ffffff'
  secondary-container: '#91f78e'
  on-secondary-container: '#00731e'
  tertiary: '#6e5100'
  on-tertiary: '#ffffff'
  tertiary-container: '#8c6800'
  on-tertiary-container: '#ffefd7'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#a3f69c'
  primary-fixed-dim: '#88d982'
  on-primary-fixed: '#002204'
  on-primary-fixed-variant: '#005312'
  secondary-fixed: '#94f990'
  secondary-fixed-dim: '#78dc77'
  on-secondary-fixed: '#002204'
  on-secondary-fixed-variant: '#005313'
  tertiary-fixed: '#ffdfa0'
  tertiary-fixed-dim: '#f8bd2a'
  on-tertiary-fixed: '#261a00'
  on-tertiary-fixed-variant: '#5c4300'
  background: '#e8fff0'
  on-background: '#002114'
  surface-variant: '#c1ecd4'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 57px
    fontWeight: '700'
    lineHeight: 64px
    letterSpacing: -0.25px
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  title-lg:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '500'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0.5px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0.25px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.1px
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.5px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
---

## Brand & Style
The brand personality is authoritative yet nurturing, blending high-tech artificial intelligence with the organic reliability of modern agriculture. The design system follows a **Minimalist-Material** approach, utilizing the structural integrity of Google Material Design 3 while infusing it with a nature-inspired warmth.

The target audience—agronomists, farm managers, and enterprise stakeholders—requires a high level of information density delivered through a clean, spacious interface. The emotional response is one of "Technical Serenity": a professional, data-driven environment that feels as fresh and sustainable as the fields it monitors.

## Colors
The palette is rooted in a "Deep Forest" foundation to establish trust and maturity.
- **Primary (Forest Green):** Used for key actions, active states, and brand-critical iconography.
- **Secondary (Fresh Green):** Reserved for growth indicators, positive trends, and success states.
- **Tertiary (Golden Yellow):** Applied sparingly for highlights, warnings, or significant data points that require attention without alarm.
- **Surface & Background:** A combination of Warm Cream and a very pale "Organic White" creates a soft, paper-like reading experience that reduces eye strain compared to pure white.
- **Text:** The Primary Text color is a deep, desaturated green-black to maintain high contrast while staying within the organic family.

## Typography
This design system utilizes **Inter** exclusively to achieve a systematic, utilitarian aesthetic that remains highly legible across data-dense dashboards. 
- **Headlines:** Use tighter letter spacing and medium-to-bold weights to create a strong visual anchor.
- **Body:** Standardized at 16px for optimal readability in reports, with a generous 1.5x line height.
- **Labels:** Used for micro-copy, status tags, and chart legends. These often use medium weights to ensure clarity at small scales.

## Layout & Spacing
The layout follows a **Fluid Grid** model with high-margin "breathing room" to maintain the premium, spacious feel.
- **Desktop:** 12-column grid with 24px gutters. Main content containers should ideally not exceed 1440px width to ensure readability.
- **Tablet:** 8-column grid with 16px gutters.
- **Mobile:** 4-column grid with 16px margins. 
Vertical rhythm is strictly maintained on an 8px baseline grid. Components utilize "Safe Zones"—internal padding that is never less than 16px—to prevent visual clutter.

## Elevation & Depth
In alignment with Material 3, depth is communicated through **Tonal Elevation** rather than aggressive shadows. 
- **Surface Layers:** The background (#F8FAF5) serves as Level 0. Cards and containers sit at Level 1, using the Warm Cream (#FFF8E1) or pure white with a subtle 1px border (#E0E5DD).
- **Shadows:** Use extremely soft, ambient shadows. A Level 1 shadow should be `0px 2px 8px rgba(27, 67, 50, 0.04)`.
- **Interactions:** On hover, elements slightly increase their shadow spread and lift, using a secondary shadow layer `0px 12px 24px rgba(27, 67, 50, 0.08)` to simulate physical movement.

## Shapes
The shape language is defined by the **16px (1rem)** corner radius, creating a soft, approachable, and modern look.
- **Small Components:** Checkboxes and small tags use a reduced radius of 4px.
- **Standard Components:** Buttons, Input Fields, and Selection Chips use the 8px radius.
- **Large Containers:** Dashboard cards and modal overlays use the signature 16px radius.
- **Circular Elements:** Avatars and icon backdrops remain fully round (pill-shaped).

## Components
- **Buttons:** Primary buttons are Forest Green with white text and 8px corners. Secondary buttons use a Fresh Green outline with a transparent background.
- **Cards:** Elevated with 16px corners, a subtle 1px border in a pale neutral green, and Level 1 soft shadows.
- **Input Fields:** Filled style (Material 3) using the Warm Cream background and a Forest Green bottom indicator (2px) on focus.
- **Chips:** Used for "Crop Type" or "Status" filters. These should have a pill shape (fully rounded) and use light tonal fills (e.g., a 10% opacity version of the Forest Green).
- **Data Visualization:** Charts should use a harmonious blend of Forest Green, Fresh Green, and Golden Yellow. Avoid standard red for "bad" data where possible, opting for a burnt orange to keep the palette organic.
- **Navigation:** A side rail or navigation drawer with a subtle "Glassmorphism" blur over the background image or solid color to maintain focus on the map or data content.