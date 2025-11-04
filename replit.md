# AIStandup - Project Status Tracking Application

## Overview

AIStandup is an enterprise productivity application designed for tracking project status updates with AI-powered features. Built for Visa, it enables teams to manage projects and create standup reports using speech-to-text and AI text refinement capabilities. The application follows a Linear-inspired design system with Material Design principles, emphasizing information density and professional aesthetics suitable for enterprise use. Key capabilities include project management, status tracking, speech-to-text, AI refinement (spelling/grammar only), status change functionality, AI-powered newsletter generation with email integration, and a Sprint Standup board with mock VASINNOV- tickets in a kanban layout.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is built with React and TypeScript, using Vite as the build tool and Wouter for client-side routing. It follows a component-first architecture. The UI is based on shadcn/ui (New York style variant) with Radix UI primitives and styled using Tailwind CSS, adhering to Visa branding guidelines (blue header, white logo). State management is handled by TanStack Query for server state, with custom hooks for UI state. The design system is Linear-inspired, featuring modern card layouts, custom typography, and a responsive grid. Key components include:
- **Header**: Sticky navigation with Visa branding and two main navigation links on the right (Project Status, Sprint Standup) with active state highlighting
- **Dashboard**: Active/Archived tabs, project cards, and newsletter generation button with dialog
- **Project Detail**: Status updates and editing capabilities
- **Newsletter**: Dedicated page for generating and emailing monthly summaries (also accessible via Dashboard button)
- **Sprint Standup**: Kanban board with mock VASINNOV- tickets, speech-to-text, AI refinement, and countdown timer

### Backend Architecture
The backend uses Express.js with TypeScript and ESM modules. API endpoints are RESTful, organized by resource, and include comprehensive CRUD operations for projects and status updates. Zod schema validation is used for all API requests. Data storage currently uses an in-memory implementation (MemStorage) with a schema-first design using Drizzle ORM, ready for PostgreSQL migration. The database schema defines `projects` and `statusUpdates` tables with UUID-based primary keys and a foreign key relationship.

### AI Integration
Google Gemini AI is integrated via the `@google/genai` SDK for two main features:
1.  **Text refinement**: Improves the quality of status updates.
2.  **Newsletter generation**: Creates executive-level monthly summaries of project activities, leveraging prompt engineering for professional formatting.
Speech-to-Text functionality is provided by the browser's Web Speech API, offering real-time transcription for status updates.

### Cache Management
TanStack Query provides automatic cache invalidation for mutations (e.g., creating projects or status updates, changing project status), ensuring the UI reflects real-time data and preventing stale information.

## External Dependencies

### Third-Party Services
-   **Google Gemini API**: Used for AI text refinement and newsletter generation. Requires `GEMINI_API_KEY`.
-   **Neon serverless (PostgreSQL)**: Planned for persistent data storage, integrated via `@neondatabase/serverless` and Drizzle ORM.

### Key NPM Packages
-   **Core Framework**: `react`, `react-dom`, `express`, `vite`, `typescript`, `tsx`.
-   **Database & Validation**: `drizzle-orm`, `drizzle-zod`, `zod`.
-   **AI Integration**: `@google/genai`.
-   **UI Components**: `@radix-ui/*`, `tailwind-merge`, `clsx`, `class-variance-authority`, `lucide-react`.
-   **State Management**: `@tanstack/react-query`, `wouter`.