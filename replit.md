# AIStandup - Project Status Tracking Application

## Overview

AIStandup is an enterprise productivity application designed for tracking project status updates with AI-powered features. Built for Visa, it enables teams to manage projects and create standup reports using speech-to-text and AI text refinement capabilities. The application follows a Linear-inspired design system with Material Design principles, emphasizing information density and professional aesthetics suitable for enterprise use.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React with TypeScript for type-safe component development
- Vite as the build tool and development server
- Client-side routing using Wouter (lightweight alternative to React Router)
- Component-first architecture with separation between pages, components, and UI primitives

**UI Component System**
- shadcn/ui component library (New York style variant) with Radix UI primitives
- Tailwind CSS for utility-first styling with custom design tokens
- CSS variables for theming (HSL color system)
- Comprehensive component library including forms, dialogs, cards, buttons, and data display components

**State Management**
- TanStack Query (React Query) for server state management
- Query-based data fetching with automatic caching and invalidation
- Custom hooks for UI state (toast notifications, mobile detection)

**Design System**
- Linear-inspired productivity design with custom typography (Inter primary, JetBrains Mono for code)
- Spacing system based on Tailwind units (2, 4, 6, 8)
- Visa brand colors with custom primary color (#1434CB blue)
- Responsive grid layouts with mobile-first approach

### Backend Architecture

**Server Framework**
- Express.js for HTTP server and API routing
- ESM module system (type: "module")
- TypeScript for type safety across the stack
- Custom middleware for request logging and JSON parsing

**API Design**
- RESTful API endpoints organized by resource
- `/api/projects` - Project CRUD operations
- `/api/projects/:id/statuses` - Status update management
- `/api/all-statuses` - Dashboard aggregated view
- Zod schema validation using drizzle-zod for request validation

**Data Storage Strategy**
- Abstract storage interface (IStorage) for flexibility
- In-memory storage implementation (MemStorage) for development
- Schema-first design with Drizzle ORM
- PostgreSQL database support via Neon serverless driver (configured but not yet implemented)
- UUID-based primary keys for all entities

**Database Schema**
- `projects` table: Core project information (title, jiraLink, dueDate, lead, developer, category)
- `status_updates` table: Status entries linked to projects (content, commenter, timestamps)
- Foreign key relationship: statusUpdates.projectId → projects.id
- Automatic timestamp management (createdAt)

### AI Integration

**Google Gemini AI**
- Integration via @google/genai SDK
- Text refinement feature for status updates
- Uses gemini-2.5-flash model for fast processing
- System prompt engineering for professional standup report writing
- Error handling with fallback to original text
- Focuses on clarity, conciseness, and action-oriented language

**Speech-to-Text**
- Browser-based Web Speech API integration
- Real-time transcription for status updates
- Manual recording control (start/stop)
- Seamless integration with text refinement workflow

## External Dependencies

### Third-Party Services

**AI Services**
- Google Gemini API (Developer API, not Vertex AI)
  - API key required via GEMINI_API_KEY environment variable
  - Used for text refinement and content improvement

**Database**
- Neon PostgreSQL (serverless)
  - Connection via @neondatabase/serverless
  - DATABASE_URL environment variable required
  - Drizzle ORM for type-safe database operations
  - Migration support via drizzle-kit

### Key NPM Packages

**Core Framework**
- react, react-dom: UI library
- express: Backend server
- vite: Build tool and dev server
- typescript, tsx: Type system and runtime

**Database & Validation**
- drizzle-orm: Type-safe ORM
- drizzle-zod: Schema validation
- zod: Runtime type validation

**UI Components**
- @radix-ui/*: Accessible component primitives (20+ components)
- tailwind-merge, clsx: CSS class management
- class-variance-authority: Component variant management
- lucide-react: Icon library

**State Management**
- @tanstack/react-query: Server state and caching
- wouter: Client-side routing

**Development Tools**
- @replit/vite-plugin-*: Replit-specific development tooling
- esbuild: Production build bundling

### Build & Deployment Configuration

**Build Process**
- Client: Vite builds React app to `dist/public`
- Server: esbuild bundles Express server to `dist/index.js`
- Path aliasing: @ for client/src, @shared for shared types, @assets for static files

**Environment Requirements**
- Node.js with ESM support
- DATABASE_URL for PostgreSQL connection
- GEMINI_API_KEY for AI features
- Production mode via NODE_ENV=production