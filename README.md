# AIStandup - Project Status Tracking Application

AIStandup is an enterprise productivity application designed for tracking project status updates with AI-powered features. Built for Visa, it enables teams to manage projects and create standup reports using speech-to-text and AI text refinement capabilities.

## Features

- **Project Management**: Create and manage projects with active/archived status
- **Status Timeline**: Track detailed status updates for each project
- **Speech-to-Text**: Voice input for status updates using Web Speech API
- **AI Text Refinement**: Spelling and grammar correction using Google Gemini AI
- **Sprint Standup Board**: Kanban-style board with drag-and-drop functionality for VASINNOV- tickets
- **Newsletter Generation**: AI-powered monthly summaries with email integration
- **Jira Integration**: Simulated sync functionality for sprint tickets
- **Email Summaries**: Send sprint standup summaries directly via email

## Tech Stack

### Frontend
- **React** with TypeScript
- **Vite** for build tooling
- **Wouter** for client-side routing
- **TanStack Query** for server state management
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **Radix UI** primitives

### Backend
- **Express.js** with TypeScript
- **Drizzle ORM** for database schema
- **Zod** for validation
- **In-memory storage** (MemStorage)

### AI Integration
- **Google Gemini AI** for text refinement and newsletter generation
- **Web Speech API** for voice input

## Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn package manager
- Google Gemini API key

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd aistandup
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory (or use Replit Secrets) and add the following:

```env
# Required
GEMINI_API_KEY=your_gemini_api_key_here
SESSION_SECRET=your_session_secret_here

# Optional (for OpenAI integration if needed)
OPENAI_API_KEY=your_openai_api_key_here
```

**Getting a Gemini API Key:**
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and add it to your environment variables

### 4. Run the Application

```bash
npm run dev
```

The application will start on port 5000. Open your browser and navigate to:
```
http://localhost:5000
```

## Project Structure

```
aistandup/
├── client/               # Frontend React application
│   └── src/
│       ├── components/   # Reusable UI components
│       ├── pages/        # Page components
│       ├── lib/          # Utilities and helpers
│       └── App.tsx       # Main application component
├── server/               # Backend Express application
│   ├── routes.ts         # API endpoints
│   ├── storage.ts        # Storage interface
│   ├── gemini.ts         # Gemini AI integration
│   └── index.ts          # Server entry point
├── shared/               # Shared types and schemas
│   └── schema.ts         # Database schema and Zod validators
└── package.json
```

## Usage Guide

### Managing Projects

1. **Create a Project**: Click "Add Project" on the Dashboard
2. **Edit Project**: Click on any project card to view/edit details
3. **Add Status Updates**: Use the status update form with optional voice input
4. **Archive Projects**: Change project status to archive completed projects

### Sprint Standup Board

1. Navigate to "Sprint Standup" from the header
2. Drag and drop tickets between columns (To Do, In Progress, Complete)
3. Select a ticket to add status updates
4. Use voice input or type manually
5. Click "Refine with AI" to improve grammar and spelling
6. Click "Sync with Jira" to simulate Jira synchronization (10-second process)
7. Send email summaries with the "Send Summary" button

### Newsletter Generation

1. Click "Generate Newsletter" from the Dashboard
2. Optionally select a specific month/year or use current month
3. Click "Generate with AI" to create an executive summary
4. Review the generated content
5. Click "Send via Email" to open your email client with the newsletter

## Features in Detail

### AI Text Refinement
- Uses Google Gemini AI (gemini-1.5-flash model)
- Corrects spelling and grammar only
- Does not add or remove content
- Preserves the original meaning and tone

### Speech-to-Text
- Browser-based Web Speech API
- Real-time transcription
- Works in Chrome, Edge, and Safari
- Continuous recording with interim results

### Drag-and-Drop Kanban
- HTML5 drag-and-drop API
- Visual feedback during drag operations
- Updates ticket status automatically
- Toast notifications for status changes

### Email Integration
- Uses `mailto:` protocol
- Pre-populated subject and body
- Works with default email client
- Formatted summaries for easy reading

## Development

### Running in Development Mode

```bash
npm run dev
```

This starts both the Express backend and Vite frontend development servers on port 5000.

### Building for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

## Troubleshooting

### Speech Recognition Not Working
- Ensure you're using a supported browser (Chrome, Edge, Safari)
- Grant microphone permissions when prompted
- Check that your microphone is properly configured

### AI Features Not Working
- Verify your `GEMINI_API_KEY` is set correctly
- Check API quotas and limits in Google AI Studio
- Review server logs for error messages

### Database Issues
- The application uses in-memory storage by default
- Data will reset when the server restarts
- For persistent storage, configure PostgreSQL connection

## Browser Support

- Chrome (recommended)
- Edge
- Safari
- Firefox (limited speech recognition support)

## Security Notes

- Never commit API keys to version control
- Use environment variables for all secrets
- The SESSION_SECRET should be a random string in production
- Consider rate limiting for API endpoints in production

## License

Proprietary - Built for Visa

## Support

For issues or questions, please contact the development team.
