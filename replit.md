# AIStandup - Project Status Tracking Application

## Overview

AIStandup is an enterprise productivity application designed for tracking project status updates with AI-powered features. Built for Visa, it enables teams to manage projects and create standup reports using speech-to-text and AI text refinement capabilities. The application follows a Linear-inspired design system with Material Design principles, emphasizing information density and professional aesthetics suitable for enterprise use.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (November 4, 2025)

### Complete MVP Implementation
- Built full-stack application with React frontend and Express backend
- Implemented all core features: project management, status tracking, speech-to-text, AI refinement
- Integrated Gemini AI for intelligent status update formatting
- Added official Visa branding with blue header and white logo
- Comprehensive end-to-end testing completed successfully

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- Component-first architecture with separation between pages, components, and UI primitives

**UI Component System**
- shadcn/ui component library (New York style variant) with Radix UI primitives
- Tailwind CSS for utility-first styling with custom design tokens
- CSS variables for theming (HSL color system)
- Comprehensive component library including forms, dialogs, cards, buttons, and data display components
- Visa branding: Blue header (#1434CB) with white logo

**State Management**
- TanStack Query (React Query) for server state management
- Query-based data fetching with automatic caching and invalidation
- Custom hooks for UI state (toast notifications, mobile detection)
- Proper cache invalidation for all mutations

**Design System**
- Linear-inspired productivity design with custom typography (Inter primary, JetBrains Mono for code)
- Spacing system based on Tailwind units (2, 4, 6, 8)
- Visa brand colors with custom primary color (#1434CB blue)
- Responsive grid layouts with mobile-first approach
- Professional loading states, error handling, and empty states

**Key Components**
- **Header**: Sticky blue header with Visa logo and application title
- **Dashboard**: Project intake form with comprehensive fields, grid layout of project cards showing metadata and latest status preview
- **ProjectDetail**: Individual project view with metadata bar, status timeline (newest first), and status input form with speech-to-text and AI refine features
- **Status Input**: Textarea with speech-to-text recording and AI refinement capabilities

### Backend Architecture

**Server Framework**
- Express.js for HTTP server and API routing
- ESM module system (type: "module")
- TypeScript for type safety across the stack
- Custom middleware for request logging and JSON parsing

**API Design**
- RESTful API endpoints organized by resource
- `/api/projects` - GET (list all), POST (create)
- `/api/projects/:id` - GET (single project)
- `/api/projects/:id/statuses` - GET (list statuses), POST (create status)
- `/api/all-statuses` - GET (all statuses for dashboard previews)
- `/api/refine-text` - POST (AI text refinement with Gemini)
- Zod schema validation using drizzle-zod for request validation
- Comprehensive error handling with graceful fallbacks

**Data Storage Strategy**
- Abstract storage interface (IStorage) for flexibility
- In-memory storage implementation (MemStorage) for development
- Schema-first design with Drizzle ORM types
- UUID-based primary keys for all entities
- Chronological sorting for status updates (newest first)

**Database Schema**
- `projects` table: Core project information (id, title, jiraLink, dueDate, lead, developer, category, createdAt)
- `statusUpdates` table: Status entries linked to projects (id, projectId, content, commenter, createdAt)
- Foreign key relationship: statusUpdates.projectId → projects.id
- Automatic timestamp management (createdAt)

### AI Integration

**Google Gemini AI**
- Integration via @google/genai SDK
- Text refinement feature for status updates
- Uses gemini-2.5-flash model for fast processing
- System prompt engineering for professional standup report writing
- Focuses on clarity, conciseness, and action-oriented language
- Graceful fallback: Returns original text when API key is missing or API fails
- No runtime errors - always returns usable response

**Speech-to-Text**
- Browser-based Web Speech API integration
- Real-time transcription for status updates
- Manual recording control (start/stop)
- Visual feedback with pulsing textarea border during recording
- Seamless integration with text refinement workflow

### Cache Management

**TanStack Query Caching**
- Automatic cache invalidation on mutations
- When creating a project: Invalidates `/api/projects`
- When creating a status: Invalidates `/api/projects/:id/statuses`, `/api/projects`, AND `/api/all-statuses`
- Ensures dashboard latest status preview updates immediately
- Prevents stale data in UI

## External Dependencies

### Third-Party Services

**AI Services**
- Google Gemini API (Developer API, not Vertex AI)
  - API key required via GEMINI_API_KEY environment variable
  - Used for text refinement and content improvement
  - Graceful degradation when unavailable

**Database**
- Currently using in-memory storage (MemStorage)
- Ready for PostgreSQL migration via Neon serverless
  - Connection via @neondatabase/serverless
  - DATABASE_URL environment variable for production
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

**AI Integration**
- @google/genai: Gemini AI SDK

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
- GEMINI_API_KEY for AI features (optional - graceful fallback)
- SESSION_SECRET for session management
- Production mode via NODE_ENV=production

## Features Implemented

### MVP Features (Complete)
✅ Project intake form accepting Jira Align or Jira links
✅ Active project list with comprehensive metadata display
✅ Project detail pages with full status history
✅ Status timeline with chronological ordering (newest first)
✅ Speech-to-text input using Web Speech API
✅ AI-powered text refinement using Gemini
✅ Visa branding with blue header and official logo
✅ Professional UI with responsive design
✅ In-memory data persistence
✅ Complete error handling and loading states
✅ Toast notifications for user feedback
✅ Cache invalidation for real-time updates

### Testing & Quality
- End-to-end testing completed successfully
- All user journeys verified:
  - Project creation and listing
  - Status update workflow
  - Timeline display and ordering
  - Dashboard preview updates
  - AI refinement (with graceful fallback)
  - Navigation and routing
- No blocking bugs or errors
- Production-ready code quality

## Future Enhancements

The following features are planned for future releases:
- Implement PostgreSQL database for persistent data storage across sessions
- Add actual Jira API integration to auto-populate project metadata from Jira links
- Create project filtering and search functionality by category, lead, or status
- Add project editing capabilities to update metadata (due dates, leads, developers)
- Implement status update notifications and activity tracking dashboard
- Add server-side validation for projectId matching in routes
- Implement automated regression testing
- Document caching expectations in contributor guidelines

## Development Workflow

1. Start development server: `npm run dev`
2. Server runs on port 5000
3. Hot module reloading enabled for rapid development
4. Frontend and backend served on same port via Vite proxy
5. Type checking with TypeScript across full stack

## Notes

- Application uses in-memory storage - data resets on server restart
- Speech-to-text requires browser support (Chrome, Edge, Safari)
- AI refinement gracefully falls back to original text if Gemini API unavailable
- All forms include HTML5 validation for required fields
- Responsive design works across mobile, tablet, and desktop
