# ProductMind AI

An AI-powered Product Discovery & User Research Intelligence platform that transforms customer interviews, support tickets, surveys, reviews and feature requests into actionable product insights.

## Tech Stack

- **Frontend**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS with dark mode
- **UI Components**: shadcn/ui primitives
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Theme**: next-themes

## Features

- 📊 Dashboard with real-time metrics
- 📤 Multi-source data upload (interviews, tickets, surveys, reviews)
- 💡 AI-powered insight generation
- 💬 Chat interface for data exploration
- 📈 Comprehensive reporting
- ⚙️ Account settings and preferences

## Project Structure

```
productmind-ai/
├── app/
│   ├── layout.tsx              # Root layout with navigation
│   ├── globals.css             # Global styles
│   ├── loading.tsx             # Loading page
│   ├── error.tsx               # Error boundary
│   ├── not-found.tsx           # 404 page
│   └── (routes)/
│       ├── page.tsx            # Landing page
│       ├── dashboard/
│       ├── upload/
│       ├── insights/
│       ├── chat/
│       ├── reports/
│       └── settings/
├── components/
│   ├── layout/
│   │   ├── sidebar.tsx         # Main sidebar navigation
│   │   ├── navbar.tsx          # Top navigation bar
│   │   ├── footer.tsx          # Footer component
│   │   └── theme-provider.tsx  # Theme configuration
│   └── ui/                     # UI components (shadcn/ui)
├── lib/
│   └── utils.ts               # Utility functions
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── postcss.config.js
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
npm start
```

## Available Routes

- `/` - Landing page
- `/dashboard` - Main dashboard with statistics
- `/upload` - Data upload interface
- `/insights` - AI-generated insights
- `/chat` - Chat interface with AI
- `/reports` - Report generation and management
- `/settings` - Account and app settings

## Features Overview

### Dashboard
- Key metrics and statistics
- Quick action buttons
- Recent activity timeline
- Quick links to main features

### Upload
- Support for multiple data sources
- File upload with preview
- Batch processing capability
- Format support: CSV, JSON, TXT, XLSX

### Insights
- AI-powered categorization
- Feature requests tracking
- Pain points identification
- Trend analysis

### Chat
- Interactive chat interface
- Ask questions about data
- Real-time responses
- Conversation history

### Reports
- Multiple report templates
- Executive summaries
- Detailed analysis
- Custom report builder

### Settings
- Account management
- Notification preferences
- Security settings
- API key management

## Design System

The application uses a premium, modern design system inspired by:
- Linear
- Vercel
- Notion
- Apple

### Color Palette

- **Primary**: Vibrant Purple (#8b5cf6)
- **Secondary**: Teal (#14b8a6)
- **Neutral**: Dark backgrounds with light text (dark mode default)
- **Accent colors** for alerts and success states

### Typography

- Clean, modern sans-serif font
- Consistent spacing and sizing
- Responsive typography

## Performance Optimizations

- Code splitting with dynamic imports
- Image optimization
- Font optimization
- CSS-in-JS with Tailwind
- Component-level animations with Framer Motion

## Development

### ESLint

Run linting:
```bash
npm run lint
```

### TypeScript

Full TypeScript support throughout the application.

## License

MIT
