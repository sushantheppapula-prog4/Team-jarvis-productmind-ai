// PRODUCTMIND AI - COMPONENT SHOWCASE & USAGE EXAMPLES
// This file demonstrates all available components and their variants

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Section, SectionContainer, SectionHeader, SectionContent } from "@/components/ui/section";
import { ArrowRight, CheckCircle2, AlertCircle, Info } from "lucide-react";

// ============================================================================
// BUTTON EXAMPLES
// ============================================================================

function ButtonShowcase() {
  return (
    <Section>
      <SectionContainer>
        <SectionHeader title="Buttons" subtitle="All button variants and sizes" />
        
        <SectionContent>
          {/* Variants */}
          <div className="space-y-6">
            <div>
              <h3 className="mb-3 text-sm font-semibold">Variants</h3>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="muted">Muted</Button>
                <Button variant="gradient">Gradient</Button>
              </div>
            </div>

            {/* Sizes */}
            <div>
              <h3 className="mb-3 text-sm font-semibold">Sizes</h3>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary" size="xs">XS</Button>
                <Button variant="primary" size="sm">Small</Button>
                <Button variant="primary" size="md">Medium</Button>
                <Button variant="primary" size="lg">Large</Button>
                <Button variant="primary" size="xl">XL</Button>
              </div>
            </div>

            {/* With Icons */}
            <div>
              <h3 className="mb-3 text-sm font-semibold">With Icons</h3>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button variant="outline">
                  Learn More
                  <Info className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Icon Buttons */}
            <div>
              <h3 className="mb-3 text-sm font-semibold">Icon Buttons</h3>
              <div className="flex gap-3">
                <Button variant="primary" size="icon">
                  <CheckCircle2 className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="icon">
                  <AlertCircle className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Full Width */}
            <div>
              <h3 className="mb-3 text-sm font-semibold">Full Width</h3>
              <Button variant="primary" fullWidth>Full Width Button</Button>
            </div>

            {/* States */}
            <div>
              <h3 className="mb-3 text-sm font-semibold">States</h3>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary">Normal</Button>
                <Button variant="primary" disabled>Disabled</Button>
              </div>
            </div>
          </div>
        </SectionContent>
      </SectionContainer>
    </Section>
  );
}

// ============================================================================
// CARD EXAMPLES
// ============================================================================

function CardShowcase() {
  return (
    <Section variant="bordered">
      <SectionContainer>
        <SectionHeader title="Cards" subtitle="All card variants and compositions" />
        
        <SectionContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Default Card */}
            <Card variant="default">
              <CardHeader>
                <CardTitle>Default Card</CardTitle>
                <CardDescription>Standard card with shadow</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Card content goes here</p>
              </CardContent>
            </Card>

            {/* Outline Card */}
            <Card variant="outline">
              <CardHeader>
                <CardTitle>Outline Card</CardTitle>
                <CardDescription>Bordered without shadow</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Card content goes here</p>
              </CardContent>
            </Card>

            {/* Elevated Card */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Elevated Card</CardTitle>
                <CardDescription>High elevation shadow</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Card content goes here</p>
              </CardContent>
            </Card>

            {/* Interactive Card */}
            <Card variant="default" interactive className="cursor-pointer">
              <CardHeader>
                <CardTitle>Interactive Card</CardTitle>
                <CardDescription>Hover for effect</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Click me!</p>
              </CardContent>
            </Card>

            {/* Card with Footer */}
            <Card variant="default">
              <CardHeader>
                <CardTitle>Card with Footer</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Content here</p>
              </CardContent>
              <CardFooter className="gap-3">
                <Button variant="primary" size="sm">Save</Button>
                <Button variant="ghost" size="sm">Cancel</Button>
              </CardFooter>
            </Card>

            {/* Subtle Card */}
            <Card variant="subtle">
              <CardHeader>
                <CardTitle>Subtle Card</CardTitle>
                <CardDescription>Muted background</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Card content goes here</p>
              </CardContent>
            </Card>
          </div>
        </SectionContent>
      </SectionContainer>
    </Section>
  );
}

// ============================================================================
// BADGE EXAMPLES
// ============================================================================

function BadgeShowcase() {
  return (
    <Section>
      <SectionContainer>
        <SectionHeader title="Badges" subtitle="All badge variants and sizes" />
        
        <SectionContent>
          <div className="space-y-6">
            {/* Variants */}
            <div>
              <h3 className="mb-3 text-sm font-semibold">Variants</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="default">Default</Badge>
                <Badge variant="primary">Primary</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="destructive">Error</Badge>
                <Badge variant="info">Info</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="solid">Solid</Badge>
              </div>
            </div>

            {/* Sizes */}
            <div>
              <h3 className="mb-3 text-sm font-semibold">Sizes</h3>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="primary" size="sm">Small</Badge>
                <Badge variant="primary" size="md">Medium</Badge>
                <Badge variant="primary" size="lg">Large</Badge>
              </div>
            </div>

            {/* In Cards */}
            <div>
              <h3 className="mb-3 text-sm font-semibold">In Cards</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Feature</CardTitle>
                      <Badge variant="success">Active</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Feature description</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Feature</CardTitle>
                      <Badge variant="warning">Beta</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Feature description</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </SectionContent>
      </SectionContainer>
    </Section>
  );
}

// ============================================================================
// INPUT EXAMPLES
// ============================================================================

function InputShowcase() {
  return (
    <Section variant="bordered">
      <SectionContainer>
        <SectionHeader title="Inputs" subtitle="All input variants and sizes" />
        
        <SectionContent>
          <div className="space-y-6">
            {/* Variants */}
            <div>
              <h3 className="mb-3 text-sm font-semibold">Variants</h3>
              <div className="grid gap-3 md:grid-cols-2">
                <Input variant="default" placeholder="Default variant" />
                <Input variant="outline" placeholder="Outline variant" />
                <Input variant="ghost" placeholder="Ghost variant" />
                <Input variant="underline" placeholder="Underline variant" />
              </div>
            </div>

            {/* Sizes */}
            <div>
              <h3 className="mb-3 text-sm font-semibold">Sizes</h3>
              <div className="grid gap-3">
                <Input variant="default" size="sm" placeholder="Small input" />
                <Input variant="default" size="md" placeholder="Medium input" />
                <Input variant="default" size="lg" placeholder="Large input" />
                <Input variant="default" size="xl" placeholder="XL input" />
              </div>
            </div>

            {/* Types */}
            <div>
              <h3 className="mb-3 text-sm font-semibold">Types</h3>
              <div className="grid gap-3 md:grid-cols-2">
                <Input type="email" placeholder="Email" />
                <Input type="password" placeholder="Password" />
                <Input type="number" placeholder="Number" />
                <Input type="search" placeholder="Search..." />
              </div>
            </div>

            {/* States */}
            <div>
              <h3 className="mb-3 text-sm font-semibold">States</h3>
              <div className="grid gap-3">
                <Input placeholder="Normal state" />
                <Input placeholder="Disabled state" disabled />
              </div>
            </div>
          </div>
        </SectionContent>
      </SectionContainer>
    </Section>
  );
}

// ============================================================================
// SECTION EXAMPLES
// ============================================================================

function SectionShowcase() {
  return (
    <Section>
      <SectionContainer size="lg">
        <SectionHeader 
          title="Sections" 
          subtitle="Layout wrapper with container and header"
          action={<Button size="sm">Add New</Button>}
        />
      </SectionContainer>
    </Section>
  );
}

// ============================================================================
// MAIN SHOWCASE
// ============================================================================

export default function ComponentShowcase() {
  return (
    <div className="min-h-screen bg-background space-y-12">
      <ButtonShowcase />
      <CardShowcase />
      <BadgeShowcase />
      <InputShowcase />
      <SectionShowcase />
    </div>
  );
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

// Hero Section with all components:
export function HeroExample() {
  return (
    <Section>
      <SectionContainer size="lg" padding="xl" className="py-20">
        <div className="text-center space-y-6">
          <Badge variant="primary">✨ New Feature</Badge>
          
          <div className="space-y-4">
            <h1>Transform Your Workflow</h1>
            <p className="text-lg text-muted-foreground">
              Powerful tools for modern teams
            </p>
          </div>

          <div className="flex gap-4 justify-center flex-wrap">
            <Button variant="primary" size="lg">
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </div>
        </div>
      </SectionContainer>
    </Section>
  );
}

// Feature Grid with interactive cards:
export function FeatureGridExample() {
  const features = [
    { icon: CheckCircle2, title: "Feature 1", desc: "Description" },
    { icon: AlertCircle, title: "Feature 2", desc: "Description" },
    { icon: Info, title: "Feature 3", desc: "Description" },
  ];

  return (
    <Section variant="bordered">
      <SectionContainer size="lg" padding="xl" className="py-16">
        <SectionHeader 
          title="Features" 
          subtitle="Everything you need"
        />
        
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} interactive>
                <CardContent className="space-y-4 pt-6">
                  <div className="p-3 w-fit rounded-lg bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.desc}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </SectionContainer>
    </Section>
  );
}

// Form Example:
export function FormExample() {
  return (
    <Section>
      <SectionContainer size="md" padding="lg">
        <Card>
          <CardHeader>
            <CardTitle>Contact Us</CardTitle>
            <CardDescription>Get in touch with our team</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Your name" />
            <Input type="email" placeholder="Your email" />
            <Input placeholder="Message" />
          </CardContent>
          <CardFooter className="gap-3">
            <Button variant="primary">Send</Button>
            <Button variant="ghost">Cancel</Button>
          </CardFooter>
        </Card>
      </SectionContainer>
    </Section>
  );
}
