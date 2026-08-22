# Clyra - Component Library

## Available Components

### UI Components (`components/ui/`)

#### Button
Flexible button component with multiple variants and sizes.

```tsx
import { Button } from "@/components/ui/button";

// Variants: primary, secondary, outline, ghost, destructive, muted, gradient
// Sizes: xs, sm, md, lg, xl, icon, icon-sm, icon-lg

<Button variant="primary" size="lg">Click me</Button>
<Button variant="ghost" size="icon"><Icon /></Button>
<Button fullWidth>Full width button</Button>
```

#### Card
Container component for content with multiple display options.

```tsx
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardContent, 
  CardFooter 
} from "@/components/ui/card";

// Variants: default, outline, elevated, ghost, subtle
// Props: interactive (boolean)

<Card variant="default" interactive>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Subtitle</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Main content */}
  </CardContent>
  <CardFooter>
    {/* Footer actions */}
  </CardFooter>
</Card>
```

#### Badge
Compact label component for tags and status indicators.

```tsx
import { Badge } from "@/components/ui/badge";

// Variants: default, primary, secondary, destructive, success, warning, info, outline, solid
// Sizes: sm, md, lg

<Badge variant="primary">New</Badge>
<Badge variant="success" size="lg">Approved</Badge>
<Badge variant="warning">In Progress</Badge>
```

#### Input
Text input field with multiple style options.

```tsx
import { Input } from "@/components/ui/input";

// Variants: default, outline, ghost, underline
// Sizes: sm, md, lg, xl

<Input 
  variant="default" 
  size="md" 
  placeholder="Enter text..." 
  type="email"
/>
<Input variant="ghost" placeholder="Search..." />
```

#### Section
Layout wrapper for page sections with containers.

```tsx
import { 
  Section, 
  SectionContainer, 
  SectionHeader,
  SectionContent 
} from "@/components/ui/section";

// Section Variants: default, bordered, elevated
// Container Sizes: sm, md, lg, xl, 2xl, full
// Padding: none, sm, md, lg, xl

<Section variant="bordered">
  <SectionContainer size="lg" padding="xl">
    <SectionHeader 
      title="Section Title"
      subtitle="Optional subtitle"
      action={<Button>Action</Button>}
    />
    <SectionContent>
      {/* Page content */}
    </SectionContent>
  </SectionContainer>
</Section>
```

### Layout Components (`components/layout/`)

#### Sidebar
Main navigation sidebar component.

- Sticky positioning
- Active state highlighting
- Icon + label navigation
- Logout button

```tsx
import { Sidebar } from "@/components/layout/sidebar";

<Sidebar />
```

#### Navbar
Top navigation bar component.

- Theme toggle (light/dark)
- Notifications button
- User profile button
- Sticky positioning

```tsx
import { Navbar } from "@/components/layout/navbar";

<Navbar />
```

#### Footer
Footer component with links and copyright.

- Multi-column link layout
- Company, product, resources, legal sections
- Copyright notice

```tsx
import { Footer } from "@/components/layout/footer";

<Footer />
```

#### ThemeProvider
Theme context provider for dark mode support.

```tsx
import { ThemeProvider } from "@/components/layout/theme-provider";

<ThemeProvider>
  {children}
</ThemeProvider>
```

## Component Patterns

### Pattern 1: Icon Badge
```tsx
<div className="p-3 w-fit rounded-lg bg-primary/10">
  <Icon className="h-6 w-6 text-primary" />
</div>
```

### Pattern 2: Feature Card
```tsx
<Card variant="default" interactive>
  <CardContent className="space-y-4 pt-6">
    <div className="p-3 w-fit rounded-lg bg-primary/10">
      <Icon className="h-6 w-6 text-primary" />
    </div>
    <div className="space-y-2">
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  </CardContent>
</Card>
```

### Pattern 3: Button Group
```tsx
<div className="flex gap-3 flex-wrap">
  <Button variant="primary" size="lg">
    Primary Action
  </Button>
  <Button variant="outline" size="lg">
    Secondary Action
  </Button>
</div>
```

### Pattern 4: Status Badge with Count
```tsx
<div className="flex items-center gap-2">
  <Badge variant="success">Active</Badge>
  <span className="text-sm text-muted-foreground">(15 items)</span>
</div>
```

## Importing Components

### Single Import
```tsx
import { Button } from "@/components/ui/button";
```

### Batch Import
```tsx
import { 
  Button, 
  Card, 
  CardContent, 
  Badge, 
  Input 
} from "@/components/ui";
```

### Full UI Library
```tsx
import * as UI from "@/components/ui";

<UI.Button>Click</UI.Button>
<UI.Card>Card</UI.Card>
```

## Component Props Reference

### Button Props
- `variant`: "primary" | "secondary" | "outline" | "ghost" | "destructive" | "muted" | "gradient"
- `size`: "xs" | "sm" | "md" | "lg" | "xl" | "icon" | "icon-sm" | "icon-lg"
- `fullWidth`: boolean
- `disabled`: boolean
- `className`: string
- All standard HTMLButtonElement attributes

### Card Props
- `variant`: "default" | "outline" | "elevated" | "ghost" | "subtle"
- `interactive`: boolean
- `className`: string
- All standard HTMLDivElement attributes

### Badge Props
- `variant`: "default" | "primary" | "secondary" | "destructive" | "success" | "warning" | "info" | "outline" | "solid"
- `size`: "sm" | "md" | "lg"
- `className`: string
- All standard HTMLDivElement attributes

### Input Props
- `variant`: "default" | "outline" | "ghost" | "underline"
- `size`: "sm" | "md" | "lg" | "xl"
- `type`: string (email, password, text, number, etc.)
- `className`: string
- All standard HTMLInputElement attributes

### Section Props
- `variant`: "default" | "bordered" | "elevated"
- `containerSize`: "sm" | "md" | "lg" | "xl" | "2xl" | "full"
- `className`: string
- All standard HTMLElement attributes

## Styling & Customization

All components use Tailwind CSS with CSS variables for theming. To customize:

### Global Theme
Edit `app/globals.css` CSS variables:
```css
:root {
  --primary: 262 80% 50%;
  --secondary: 163 72% 38%;
  /* etc. */
}
```

### Component Styles
Each component is built with CVA (class-variance-authority) for flexible styling:
```tsx
<Button 
  variant="primary" 
  size="lg"
  className="custom-class" // Custom overrides
>
  Button
</Button>
```

## Accessibility

All components include:
- Proper semantic HTML
- ARIA labels where needed
- Focus states (`.focus-ring`)
- Keyboard navigation support
- High contrast colors
- Sufficient touch targets (min 44x44px)

## Animation & Motion

Use Framer Motion for animations:
```tsx
import { motion } from "framer-motion";

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  <Card>Content</Card>
</motion.div>
```

## Performance Tips

1. Use `React.forwardRef` for component refs
2. Memoize components with `React.memo` if needed
3. Use dynamic imports for large components
4. Leverage Tailwind's JIT compilation
5. Minimize className strings with the `cn()` utility

## Contributing

When adding new components:
1. Create in `components/ui/`
2. Export from `components/ui/index.ts`
3. Use CVA for variants
4. Include TypeScript interfaces
5. Add to this README
6. Test in light & dark modes
7. Ensure accessibility

---

All components are production-ready and follow premium design standards.
