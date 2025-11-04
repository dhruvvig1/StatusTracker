# AIStandup - Project Status Tracking Application

## Overview

AIStandup is an enterprise productivity application designed for tracking project status updates with AI-powered features. Built for Visa, it enables teams to manage projects and create standup reports using speech-to-text and AI text refinement capabilities. The application follows a Linear-inspired design system with Material Design principles, emphasizing information density and professional aesthetics suitable for enterprise use.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (November 4, 2025)

### Complete MVP with Enhanced Features
- Built full-stack application with React frontend and Express backend
- Implemented all core features: project management, status tracking, speech-to-text, AI refinement
- Integrated Gemini AI for intelligent status update formatting
- Added official Visa branding with blue header and white logo
- **NEW: Status change functionality** - Project status can be updated via dropdown (In Progress, On Hold, Completed, Archived)
- **NEW: Active/Archived tabs** - Dashboard now has tabs to filter between active and archived projects
- **NEW: Improved UI design** - Modern cards with priority badges, team avatars, metadata icons
- **NEW: Full project editing** - Edit button on project detail page opens dialog with all project fields, complete CRUD operations
- **NEW: Newsletter generation** - AI-powered monthly newsletter summarizing all projects and status updates from last 30 days with email integration
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
- Comprehensive component library including forms, dialogs, cards, buttons, tabs, and data display components
- Visa branding: Blue header (#1434CB) with white logo

**State Management**
- TanStack Query (React Query) for server state management
- Query-based data fetching with automatic caching and invalidation
- Custom hooks for UI state (toast notifications, mobile detection)
- Proper cache invalidation for all mutations

**Design System**
- Linear-inspired productivity design with modern card layouts
- Custom typography (Inter primary, JetBrains Mono for code)
- Spacing system based on Tailwind units (2, 4, 6, 8)
- Visa brand colors with custom primary color (#1434CB blue)
- Priority badges based on project type:
  - Security projects: HIGH priority (red badge)
  - Product Innovation: MEDIUM priority (default badge)
  - Productivity: LOW priority (secondary badge)
  - Visa University: MEDIUM priority (default badge)
- Team member avatars with initials (max 3 displayed + overflow count)
- Responsive grid layouts: 1 column (mobile) → 2 (md) → 3 (lg) → 4 (xl)
- Professional loading states, error handling, and empty states

**Key Components**
- **Header**: Sticky blue header with Visa logo and application title
- **Dashboard**: 
  - Active/Archived tabs with dynamic counts
  - Generate Newsletter button for AI-powered monthly summaries
  - Project intake form with comprehensive fields
  - Grid layout of modern project cards
  - Cards show priority badge, title, latest status preview, team avatars, comment count, modified date
- **ProjectDetail**: 
  - Project title with status dropdown (In Progress, On Hold, Completed, Archived)
  - Edit Project button opens dialog with comprehensive edit form
  - Metadata card showing Solution Architect, Project Lead, Team Members (with avatars), Stakeholders, Links
  - Status timeline (newest first)
  - Status input form with speech-to-text and AI refine features
- **Edit Project Dialog**: Modal with all project fields pre-populated, supports updating title, type, architect, lead, team, stakeholders, and links
- **Newsletter Dialog**: AI-generated newsletter preview with Send Email button for mailto: integration
- **Status Input**: Textarea with speech-to-text recording and AI refinement capabilities

### Backend Architecture

**Server Framework**
- Express.js for HTTP server and API routing
- ESM module system (type: "module")
- TypeScript for type safety across the stack
- Custom middleware for request logging and JSON parsing
- Zod schema validation for all API endpoints

**API Design**
- RESTful API endpoints organized by resource
- `/api/projects` - GET (list all), POST (create)
- `/api/projects/:id` - GET (single project), PATCH (update full project with Zod validation)
- `/api/projects/:id/status` - PATCH (update project status with Zod validation)
- `/api/projects/:id/statuses` - GET (list statuses), POST (create status)
- `/api/all-statuses` - GET (all statuses for dashboard previews)
- `/api/refine-text` - POST (AI text refinement with Gemini)
- `/api/newsletter` - GET (generate AI-powered newsletter from last 30 days of activity)
- Zod schema validation using drizzle-zod for request validation
- Full project update validation: Uses insertProjectSchema to validate all fields
- Status update validation: Only allows "In Progress", "On Hold", "Completed", "Archived"
- Comprehensive error handling with graceful fallbacks

**Data Storage Strategy**
- Abstract storage interface (IStorage) for flexibility
- In-memory storage implementation (MemStorage) for development
- Schema-first design with Drizzle ORM types
- UUID-based primary keys for all entities
- Chronological sorting for status updates (newest first)
- Support for status updates via updateProjectStatus method
- Support for full project updates via updateProject method (all fields except id and createdAt)

**Database Schema**
- `projects` table: Core project information (id, title, projectType, status, solutionArchitect, teamMembers, projectLead, stakeholders, wikiLink, usefulLinks, modified, createdAt)
- `statusUpdates` table: Status entries linked to projects (id, projectId, content, commenter, createdAt)
- Foreign key relationship: statusUpdates.projectId → projects.id
- Automatic timestamp management (createdAt)
- Project status values: "In Progress", "On Hold", "Completed", "Archived"

### AI Integration

**Google Gemini AI**
- Integration via @google/genai SDK
- **Text refinement feature**: Improves status updates for standup reports
- **Newsletter generation**: Creates executive-level monthly summaries with:
  - Executive summary of all active projects
  - Detailed project updates with recent activity
  - Key highlights and achievements
  - Next steps and action items
- Uses gemini-2.5-flash model for fast processing
- System prompt engineering for professional standup report writing and newsletter formatting
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
- When updating project status: Invalidates `/api/projects/:id` and `/api/projects`
- When updating full project: Invalidates `/api/projects/:id` and `/api/projects`
- Ensures dashboard latest status preview updates immediately
- Ensures tab counts update when projects move between active/archived
- Ensures project details and lists reflect changes instantly
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
- @radix-ui/*: Accessible component primitives (20+ components including Tabs, Avatar)
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

### New Features (November 4, 2025)
✅ **Status Change Functionality**
  - Interactive dropdown in project detail page
  - Four status options: In Progress, On Hold, Completed, Archived
  - Server-side Zod validation for status values
  - Immediate UI updates with cache invalidation
  - Success toast notifications

✅ **Active/Archived Tabs**
  - Tab navigation on dashboard
  - Active tab shows projects where status ≠ "Archived"
  - Archived tab shows projects where status = "Archived"
  - Dynamic tab counts (e.g., "Active Projects (16)")
  - Projects automatically move between tabs when status changes

✅ **Full Project Editing**
  - "Edit Project" button on project detail page
  - Modal dialog with comprehensive edit form
  - All project fields editable: title, project type, solution architect, project lead, team members, stakeholders, wiki link, useful links
  - Form pre-populated with current project data
  - Server-side validation using insertProjectSchema
  - Immediate UI updates with cache invalidation
  - Success/error toast notifications
  - Loading states during save operation
  - Changes persist across navigation

✅ **Newsletter Generation & Email Integration**
  - "Generate Newsletter" button on dashboard header
  - AI-powered newsletter generation using Gemini
  - Filters and summarizes status updates from last 30 days
  - Groups updates by project with detailed context
  - Executive-level formatting with multiple sections
  - Newsletter preview dialog with formatted content
  - "Send Email" button opens default email client via mailto: link
  - Pre-filled subject line with current month/year
  - Pre-filled body with complete newsletter content
  - Loading states during AI generation (~15 seconds)
  - Error handling for missing API keys or generation failures

✅ **UI/UX Improvements**
  - Modern card design inspired by Linear/task management apps
  - Priority badges based on project type (HIGH/MEDIUM/LOW)
  - Team member avatars with initials
  - Avatar groups showing max 3 members + overflow count
  - Metadata icons: Comment count, Modified date
  - 4-column grid on xl screens (improved density)
  - Enhanced project detail page with avatar chips
  - Better visual hierarchy and spacing throughout

### Testing & Quality
- End-to-end testing completed successfully for all features
- All user journeys verified:
  - Project creation and listing
  - Status update workflow
  - Timeline display and ordering
  - Dashboard preview updates
  - Status change and tab switching
  - Active/Archived filtering
  - AI refinement (with graceful fallback)
  - Navigation and routing
- No blocking bugs or errors
- Production-ready code quality
- All interactive elements have data-testid attributes

## Future Enhancements

The following features are planned for future releases:
- Implement PostgreSQL database for persistent data storage across sessions
- Add actual Jira API integration to auto-populate project metadata from Jira links
- Create project filtering and search functionality by category, lead, or status
- Implement status update notifications and activity tracking dashboard
- Add bulk actions for projects (bulk archive, bulk status change)
- Implement project sorting (by date, priority, name)
- Add project assignment and ownership features
- Add project deletion functionality with confirmation dialog
- Implement user authentication and role-based permissions
- Add audit trail for project and status changes
- Document caching expectations in contributor guidelines

## Development Workflow

1. Start development server: `npm run dev`
2. Server runs on port 5000
3. Hot module reloading enabled for rapid development
4. Frontend and backend served on same port via Vite proxy
5. Type checking with TypeScript across full stack
6. End-to-end testing via Playwright for quality assurance

## Notes

- Application uses in-memory storage - data resets on server restart
- Speech-to-text requires browser support (Chrome, Edge, Safari)
- AI refinement gracefully falls back to original text if Gemini API unavailable
- All forms include HTML5 validation for required fields
- Responsive design works across mobile, tablet, and desktop
- Status changes are validated server-side to prevent invalid values
- Tab filtering is client-side for instant response
- 17 preloaded Visa projects from CSV with realistic mock data
