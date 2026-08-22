# Clyra - Design System

## Color Palette

### Primary Colors
- **Purple** - `hsl(262, 80%, 50%)` - Main brand color
  - Used for: Primary buttons, active states, brand elements
  - Palette: 50-950 (light to dark variants)

### Secondary Colors  
- **Teal/Emerald** - `hsl(163, 72%, 38%)` - Supporting brand color
  - Used for: Secondary actions, accents
  - Palette: 50-950 (light to dark variants)

### Accent Colors
- **Blue** - `hsl(217, 91%, 60%)` - Information accent
- **Emerald** - `hsl(163, 72%, 38%)` - Success accent
- **Amber** - `hsl(38, 92%, 50%)` - Warning accent
- **Rose** - `hsl(346, 77%, 50%)` - Danger/Error accent

### Neutral Scale
- **Background**: Light `#FFFFFF` / Dark `#0F0F1E`
- **Foreground**: Light `#0D0D1A` / Dark `#FAFBFC`
- **Muted**: Light `#E8EAF0` / Dark `#2A2D3E`
- **Border**: Light `#E8EAF0` / Dark `#2A2D3E`

## Typography

### Font Families
- **Headings** - Poppins (600, 700, 800 weights)
  - H1: 3rem, font-bold, leading-tight
  - H2: 2.25rem, font-bold, leading-tight
  - H3: 1.875rem, font-bold, leading-snug
  - H4: 1.25rem, font-semibold, leading-snug
  - H5: 1.125rem, font-semibold, leading-snug
  - H6: 1rem, font-semibold, leading-snug

- **Body Text** - Inter (300, 400, 500, 600, 700, 800 weights)
  - Body: 1rem, font-400, leading-relaxed
  - Small: 0.875rem, font-400, leading-relaxed
  - Extra Small: 0.75rem, font-400

### Font Weights
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700
- Extrabold: 800

## Components

### Button
**Variants**: primary, secondary, outline, ghost, destructive, muted, gradient
**Sizes**: xs, sm, md, lg, xl, icon, icon-sm, icon-lg
**Props**: variant, size, fullWidth, disabled

```jsx
<Button variant="primary" size="lg">Action</Button>
<Button variant="outline" size="md">Secondary</Button>
<Button variant="ghost" size="icon"><Icon /></Button>
```

### Card
**Variants**: default, outline, elevated, ghost, subtle
**Props**: variant, interactive

```jsx
<Card variant="default" interactive>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
  <CardFooter>Footer</CardFooter>
</Card>
```

### Badge
**Variants**: default, primary, secondary, destructive, success, warning, info, outline, solid
**Sizes**: sm, md, lg

```jsx
<Badge variant="primary">Tag</Badge>
<Badge variant="success" size="lg">Success</Badge>
```

### Input
**Variants**: default, outline, ghost, underline
**Sizes**: sm, md, lg, xl

```jsx
<Input variant="default" placeholder="Enter..." />
<Input variant="ghost" type="password" />
```

### Section
**Variants**: default, bordered, elevated
**Props**: containerSize, padding

```jsx
<Section>
  <SectionContainer size="lg" padding="xl">
    <SectionHeader title="Title" subtitle="Subtitle" action={<Button />} />
    <SectionContent>Content</SectionContent>
  </SectionContainer>
</Section>
```

## Spacing System

- **xs**: 0.5rem (8px)
- **sm**: 0.75rem (12px)
- **md**: 1rem (16px)
- **lg**: 1.5rem (24px)
- **xl**: 2rem (32px)
- **2xl**: 3rem (48px)
- **3xl**: 4rem (64px)
- **4xl**: 6rem (96px)

## Shadows

- **xs** - Subtle shadow for cards
- **sm** - Small shadow for hover states
- **md** - Medium shadow
- **lg** - Large shadow for elevated content
- **xl** - Extra large shadow
- **2xl** - Maximum shadow depth
- **card** - Default card shadow
- **hover** - Interactive hover shadow
- **elevated** - High elevation shadow

## Border Radius

- **xs**: 0.25rem (4px)
- **sm**: 0.375rem (6px)
- **md**: 0.5rem (8px)
- **lg**: 0.625rem (10px)
- **xl**: 0.75rem (12px)

## Transitions & Animations

### Duration
- **fast**: 150ms
- **base**: 200ms
- **slow**: 300ms

### Easing
- Standard: `cubic-bezier(0.4, 0, 0.2, 1)`

### Animations
- **fade-in**: Opacity transition
- **slide-up**: Upward movement with fade
- **slide-down**: Downward movement with fade

## Dark Mode

Dark mode is enabled by default and can be toggled via the theme provider. Use the `next-themes` library to manage theme state.

```jsx
import { useTheme } from "next-themes";

const { theme, setTheme } = useTheme();
setTheme(theme === "dark" ? "light" : "dark");
```

## CSS Utilities

### Smooth Transitions
- `.transition-smooth` - Smooth 300ms transition
- `.transition-fast` - Fast 150ms transition
- `.transition-slow` - Slow 500ms transition

### Gradients
- `.gradient-primary` - Primary to primary gradient
- `.gradient-accent` - Primary to secondary gradient
- `.gradient-subtle` - Subtle background gradient

### Focus Ring
- `.focus-ring` - Accessible focus states

## Usage Examples

### Button with Icon
```jsx
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

<Button variant="primary" size="lg">
  Get Started
  <ArrowRight className="h-4 w-4" />
</Button>
```

### Card with Badge
```jsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

<Card variant="default">
  <CardHeader>
    <div className="flex items-center justify-between">
      <CardTitle>Feature Name</CardTitle>
      <Badge variant="primary">New</Badge>
    </div>
  </CardHeader>
  <CardContent>Content here</CardContent>
</Card>
```

### Section with Header
```jsx
import { Section, SectionContainer, SectionHeader, SectionContent } from "@/components/ui/section";

<Section variant="bordered">
  <SectionContainer size="lg" padding="xl">
    <SectionHeader 
      title="Features"
      subtitle="Everything you need"
      action={<Button>Add New</Button>}
    />
    <SectionContent>
      {/* Content */}
    </SectionContent>
  </SectionContainer>
</Section>
```

### Input Field
```jsx
import { Input } from "@/components/ui/input";

<Input 
  variant="default" 
  size="md" 
  placeholder="Enter email..." 
  type="email"
/>
```

## Best Practices

1. **Color Usage**: Always use semantic tokens (primary, secondary, destructive) rather than hardcoding colors
2. **Typography**: Use predefined heading and body styles from globals.css
3. **Spacing**: Use the spacing scale (xs, sm, md, lg, xl) for consistency
4. **Shadows**: Use appropriate shadow levels for visual hierarchy
5. **Transitions**: Use smooth transitions for all interactive elements
6. **Dark Mode**: Test all components in both light and dark modes
7. **Accessibility**: Always include focus states and ARIA labels
8. **Responsive**: Design mobile-first with Tailwind's responsive prefixes

## Component Combinations

### Hero Section
```jsx
<Section>
  <SectionContainer size="lg">
    <motion.div className="text-center space-y-6">
      <Badge variant="primary">New Release</Badge>
      <h1>Heading</h1>
      <p className="text-lg text-muted-foreground">Description</p>
      <div className="flex gap-4 justify-center">
        <Button variant="primary">Primary</Button>
        <Button variant="outline">Secondary</Button>
      </div>
    </motion.div>
  </SectionContainer>
</Section>
```

### Feature Grid
```jsx
<div className="grid gap-6 md:grid-cols-3">
  {features.map((feature) => (
    <Card key={feature.id} variant="default" interactive>
      <CardContent className="space-y-4 pt-6">
        <div className="p-3 w-fit rounded-lg bg-primary/10">
          <feature.icon className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold mb-2">{feature.title}</h3>
          <p className="text-sm text-muted-foreground">{feature.description}</p>
        </div>
      </CardContent>
    </Card>
  ))}
</div>
```

---

This design system ensures consistency, maintainability, and a premium feel across Clyra.
