# Quick Start Guide - Clyra Design System

## Installation & Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Key Files

- **Design System**: `DESIGN_SYSTEM.md` - Complete design tokens and patterns
- **Component Library**: `components/README.md` - All available components
- **Styles**: `app/globals.css` - Global styles and CSS variables
- **Config**: `tailwind.config.ts` - Tailwind configuration
- **Theme**: `components/layout/theme-provider.tsx` - Dark mode provider

## Building Your First Page

### Step 1: Import Components
```tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Section, SectionContainer } from "@/components/ui/section";
```

### Step 2: Create Layout
```tsx
export default function MyPage() {
  return (
    <Section>
      <SectionContainer size="lg" padding="xl">
        <h1>Welcome</h1>
        <p className="text-muted-foreground">Your content here</p>
      </SectionContainer>
    </Section>
  );
}
```

### Step 3: Add Components
```tsx
<Card variant="default">
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    <Badge variant="primary">New</Badge>
    <p>Description</p>
    <Button variant="primary">Action</Button>
  </CardContent>
</Card>
```

## Common Patterns

### Hero Section
```tsx
<Section>
  <SectionContainer size="lg" padding="xl" className="py-20">
    <motion.div className="text-center space-y-6">
      <Badge variant="primary">Announcement</Badge>
      <h1>Main Heading</h1>
      <p className="text-lg text-muted-foreground">Subheading</p>
      <div className="flex gap-4 justify-center">
        <Button variant="primary">Primary</Button>
        <Button variant="outline">Secondary</Button>
      </div>
    </motion.div>
  </SectionContainer>
</Section>
```

### Feature Grid
```tsx
<div className="grid gap-6 md:grid-cols-3">
  {features.map((feature) => (
    <Card key={feature.id} interactive>
      <CardContent className="space-y-4 pt-6">
        <feature.icon className="h-6 w-6 text-primary" />
        <div>
          <h3 className="font-semibold">{feature.title}</h3>
          <p className="text-sm text-muted-foreground">{feature.desc}</p>
        </div>
      </CardContent>
    </Card>
  ))}
</div>
```

### Action Card
```tsx
<Card variant="default">
  <CardHeader>
    <CardTitle className="flex items-center justify-between">
      Title
      <Badge variant="success">Active</Badge>
    </CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    <p className="text-muted-foreground">Description</p>
    <div className="flex gap-2">
      <Button variant="primary" size="sm">Save</Button>
      <Button variant="ghost" size="sm">Cancel</Button>
    </div>
  </CardContent>
</Card>
```

## Color Usage

### Backgrounds
- `bg-background` - Page background
- `bg-card` - Card background
- `bg-muted` - Muted/secondary background

### Text
- `text-foreground` - Primary text
- `text-muted-foreground` - Secondary text

### Interactive
- `text-primary` - Interactive elements
- `text-secondary` - Secondary interactive elements
- `text-destructive` - Error/warning states

### Functional
- `border-border` - Borders
- `bg-primary` - Primary actions
- `bg-secondary` - Secondary actions

## Variant Quick Reference

### Button Variants
- `primary` - Main call-to-action
- `secondary` - Alternative action
- `outline` - Bordered button
- `ghost` - Minimal button
- `destructive` - Delete/error actions
- `gradient` - Premium gradient button

### Card Variants
- `default` - Standard card with shadow
- `outline` - Bordered card
- `elevated` - High shadow elevation
- `ghost` - Transparent background
- `subtle` - Muted background

### Badge Variants
- `primary` - Blue badge
- `secondary` - Teal badge
- `success` - Green badge
- `warning` - Amber badge
- `destructive` - Red badge
- `info` - Blue info badge

### Input Variants
- `default` - Standard input field
- `outline` - Bordered input
- `ghost` - Minimal input
- `underline` - Bottom border only

## Sizing Guide

### Button Sizes
- `xs` - 32px height, small text
- `sm` - 36px height
- `md` - 40px height (default)
- `lg` - 44px height, large text
- `xl` - 48px height, largest
- `icon` - 40x40px square
- `icon-sm` - 32x32px square
- `icon-lg` - 48x48px square

### Input Sizes
- `sm` - 32px height
- `md` - 40px height (default)
- `lg` - 48px height
- `xl` - 56px height

### Spacing Scale
- `gap-xs` - 4px gap
- `gap-sm` - 8px gap
- `gap-md` - 16px gap
- `gap-lg` - 24px gap
- `gap-xl` - 32px gap
- `gap-2xl` - 48px gap

## Dark Mode

Dark mode is enabled by default. To toggle:

```tsx
import { useTheme } from "next-themes";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  return (
    <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      Toggle Theme
    </button>
  );
}
```

## Animations

Use Framer Motion for animations:

```tsx
import { motion } from "framer-motion";

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3, ease: "easeOut" }}
>
  Content
</motion.div>
```

### Preset Animations
- `animate-fade-in` - Fade in
- `animate-slide-up` - Slide up with fade
- `animate-slide-down` - Slide down with fade

## Responsive Design

### Breakpoints
- `sm` - 640px
- `md` - 768px
- `lg` - 1024px
- `xl` - 1280px
- `2xl` - 1536px

### Example
```tsx
<div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
  {items.map((item) => (
    <Card key={item.id}>
      <CardContent>{item.content}</CardContent>
    </Card>
  ))}
</div>
```

## Tips & Best Practices

1. ✅ Use semantic color tokens (primary, secondary, destructive)
2. ✅ Leverage the spacing scale for consistency
3. ✅ Apply transitions to all interactive elements
4. ✅ Test in both light and dark modes
5. ✅ Use Framer Motion for smooth animations
6. ✅ Keep component tree shallow for performance
7. ✅ Use TypeScript for better IDE support
8. ✅ Follow mobile-first responsive design

## Troubleshooting

### Components Not Importing?
- Check file path: `@/components/ui/button`
- Verify export in `components/ui/index.ts`
- Run `npm install` to ensure dependencies

### Styles Not Applied?
- Clear `.next` cache: `rm -rf .next`
- Verify Tailwind config content paths
- Check CSS variables in `app/globals.css`

### Dark Mode Not Working?
- Ensure `ThemeProvider` wraps app in `app/layout.tsx`
- Check `next-themes` is installed: `npm install next-themes`
- Verify HTML element has `suppressHydrationWarning`

## Next Steps

1. Explore `DESIGN_SYSTEM.md` for complete design tokens
2. Review `components/README.md` for all component options
3. Check existing pages in `app/(routes)/` for examples
4. Build your own pages using the component library
5. Customize theme colors in `app/globals.css` as needed

---

Ready to build? Start creating amazing UIs with Clyra's design system! 🚀
