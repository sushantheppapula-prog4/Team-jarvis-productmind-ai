# Clyra - Premium Design System ✨

## Overview

A comprehensive, production-ready design system built with:
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** with custom CSS variables
- **Class Variance Authority (CVA)** for component variants
- **Framer Motion** for smooth animations
- **next-themes** for dark mode support

## What's Included

### 🎨 Design Tokens

#### Color Palette
- **Primary**: Purple (`262° 80% 50%`) - Brand color with 11-shade palette
- **Secondary**: Teal (`163° 72% 38%`) - Supporting color with 11-shade palette
- **Accent Colors**: Blue, Emerald, Amber, Rose
- **Neutral Scale**: Carefully crafted light/dark backgrounds and borders
- **Semantic Colors**: Destructive, Success, Warning, Info

#### Typography System
- **Headings**: Poppins (600-800 weights) - Premium serif feel
- **Body**: Inter (300-800 weights) - Readable, modern
- **Sizes**: H1-H6, Body, Small, XS with precise line heights
- **Font Features**: Kerning, ligatures enabled

#### Spacing System
- **8px Scale**: xs (4px) → 4xl (96px)
- **Consistent**: All margins, padding, gaps use the same scale
- **Responsive**: Easily scalable for different screen sizes

#### Shadow System
- **5 Levels**: xs → 2xl
- **Purpose-Built**: Card, hover, elevated shadows
- **Dark Mode**: Optimized for both themes

#### Border Radius
- **5 Options**: xs (4px) → xl (12px)
- **Consistent**: All rounded corners use defined radius
- **Flexible**: Apply as needed for cards, buttons, inputs

### 🧩 Component Library

#### 5 Core Components

**1. Button** (7 variants × 8 sizes)
```
Variants: primary, secondary, outline, ghost, destructive, muted, gradient
Sizes: xs, sm, md, lg, xl, icon, icon-sm, icon-lg
```

**2. Card** (5 variants)
```
Variants: default, outline, elevated, ghost, subtle
Features: Header, Title, Description, Content, Footer subcomponents
```

**3. Badge** (9 variants × 3 sizes)
```
Variants: default, primary, secondary, destructive, success, warning, info, outline, solid
Sizes: sm, md, lg
```

**4. Input** (4 variants × 4 sizes)
```
Variants: default, outline, ghost, underline
Sizes: sm, md, lg, xl
```

**5. Section** (Layout wrapper)
```
Variants: default, bordered, elevated
Container Sizes: sm, md, lg, xl, 2xl, full
Padding: none, sm, md, lg, xl
```

### 🎯 Layout Components

**Sidebar**
- Sticky positioning
- Navigation with active states
- Icon + label combinations
- Logout button with elevated styling

**Navbar**
- Sticky top navigation
- Theme toggle (light/dark)
- Notification button
- User profile access
- Smooth transitions

**Footer**
- Multi-column link layout
- Four content sections
- Copyright information
- Premium footer design

**Theme Provider**
- Next-themes integration
- Dark/light mode toggle
- Persistent theme preference
- System preference detection

### 🎬 Animation & Motion

**Transitions**
- Fast: 150ms
- Base: 200ms (default)
- Slow: 300ms

**Animations**
- Fade in/out
- Slide up with fade
- Slide down with fade
- Smooth CSS transitions on all interactive elements

**Framer Motion Ready**
- Pre-configured for motion components
- Container & item animation variants
- Viewport-triggered animations

## File Structure

```
clyra-ai/
├── app/
│   ├── globals.css              # Design tokens + base styles
│   ├── layout.tsx               # Root layout with providers
│   ├── loading.tsx              # Loading state
│   ├── error.tsx                # Error boundary
│   ├── not-found.tsx            # 404 page
│   └── (routes)/
│       ├── page.tsx             # Landing page (using new components)
│       ├── dashboard/page.tsx
│       ├── upload/page.tsx
│       ├── insights/page.tsx
│       ├── chat/page.tsx
│       ├── reports/page.tsx
│       └── settings/page.tsx
├── components/
│   ├── ui/
│   │   ├── button.tsx           # Button component
│   │   ├── card.tsx             # Card component
│   │   ├── badge.tsx            # Badge component
│   │   ├── input.tsx            # Input component
│   │   ├── section.tsx          # Section component
│   │   ├── index.ts             # Barrel export
│   │   └── README.md            # Component docs
│   └── layout/
│       ├── sidebar.tsx
│       ├── navbar.tsx
│       ├── footer.tsx
│       └── theme-provider.tsx
├── lib/
│   └── utils.ts                 # Utility functions
├── tailwind.config.ts           # Tailwind configuration
├── app/globals.css              # Global styles
├── DESIGN_SYSTEM.md             # Complete design guide
├── QUICK_START.md               # Getting started
└── package.json                 # Dependencies

```

## Key Features

### ✨ Premium Design
- Inspired by Linear, Vercel, Notion, Apple
- Cohesive color palette with 11-shade variants
- Professional typography hierarchy
- Consistent spacing & shadows
- Smooth animations throughout

### 🌓 Dark Mode
- Default dark theme
- Light theme available
- System preference detection
- Persistent user preference
- Optimized colors for both themes

### ♿ Accessibility
- Semantic HTML structure
- ARIA labels where needed
- Focus ring states
- Keyboard navigation support
- High contrast ratios (WCAG AA+)
- Sufficient touch targets (44×44px minimum)

### 📱 Responsive
- Mobile-first design
- Tailwind breakpoints
- Flexible components
- Touch-friendly interactions

### ⚡ Performance
- Code splitting ready
- Optimized CSS
- Framer Motion performance
- Image optimization compatible
- Next.js built-in optimizations

### 🔧 Developer Experience
- TypeScript throughout
- CVA for type-safe variants
- Easy component composition
- Clear naming conventions
- Comprehensive documentation
- Copy-paste ready examples

## Usage Examples

### Simple Button
```tsx
import { Button } from "@/components/ui/button";

<Button variant="primary" size="lg">
  Get Started
</Button>
```

### Feature Card
```tsx
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

<Card interactive>
  <CardContent className="space-y-4 pt-6">
    <Badge variant="primary">New</Badge>
    <h3>Feature Title</h3>
    <p>Feature description</p>
  </CardContent>
</Card>
```

### Hero Section
```tsx
import { Section, SectionContainer } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

<Section>
  <SectionContainer size="lg" padding="xl" className="py-20">
    <motion.div className="text-center space-y-6">
      <h1>Hero Heading</h1>
      <p className="text-lg text-muted-foreground">Subheading</p>
      <div className="flex gap-4 justify-center">
        <Button variant="primary">Primary</Button>
        <Button variant="outline">Secondary</Button>
      </div>
    </motion.div>
  </SectionContainer>
</Section>
```

## CSS Variables

All colors use CSS variables for easy theming:

```css
/* Light Mode (Default) */
:root {
  --background: 0 0% 100%;
  --foreground: 12 8% 8%;
  --primary: 262 80% 50%;
  --secondary: 163 72% 38%;
  /* ... more variables */
}

/* Dark Mode */
.dark {
  --background: 222 84% 5%;
  --foreground: 210 40% 98%;
  --primary: 262 80% 50%;
  --secondary: 163 72% 38%;
  /* ... more variables */
}
```

## Dependencies Added

### Production
- `next-themes` - Theme management
- `framer-motion` - Animations
- `class-variance-authority` - Component variants
- `clsx` + `tailwind-merge` - ClassName utilities
- `lucide-react` - Icon library
- `tailwindcss-animate` - Animation utilities

### Development
- `typescript` - Type safety
- `tailwindcss` - CSS framework
- `postcss` + `autoprefixer` - CSS processing
- `@types/*` - Type definitions

All dependencies compatible with Next.js 15, React 19, and Node 18+.

## How to Extend

### Add New Component
1. Create `components/ui/newcomponent.tsx`
2. Use CVA for variants
3. Export from `components/ui/index.ts`
4. Add TypeScript interfaces
5. Test in light & dark modes

### Customize Colors
Edit `app/globals.css` CSS variables or `tailwind.config.ts` color palette.

### Add New Animation
Add to `app/globals.css` `@keyframes` and `tailwind.config.ts` `animation`.

### Extend Spacing
Add to `tailwind.config.ts` under `theme.extend.spacing`.

## Testing Checklist

- ✅ All components render without errors
- ✅ Dark mode toggle works
- ✅ Responsive design on mobile/tablet/desktop
- ✅ Animations smooth in production
- ✅ Keyboard navigation works
- ✅ Focus states visible
- ✅ Colors accessible (WCAG AA+)
- ✅ TypeScript compilation clean
- ✅ No console warnings

## Production Ready

This design system is:
- ✅ Type-safe with TypeScript
- ✅ Fully responsive
- ✅ Accessibility compliant
- ✅ Performance optimized
- ✅ Dark mode enabled
- ✅ Animation ready
- ✅ Well-documented
- ✅ Copy-paste ready
- ✅ Enterprise-grade code quality

## Next Steps

1. Read `QUICK_START.md` for immediate setup
2. Explore `DESIGN_SYSTEM.md` for complete design tokens
3. Check `components/README.md` for component details
4. Start building pages using the component library
5. Customize colors/typography as needed for your brand

---

**Clyra - Premium Design System is production-ready and waiting for you to build something amazing!** 🚀
