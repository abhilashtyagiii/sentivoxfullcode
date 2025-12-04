# Sentivox - AI-Powered Interview Analysis Platform

## Overview

Sentivox is a full-stack web application that processes audio recordings of recruiter-candidate interviews to provide comprehensive sentiment and flow analysis. The platform leverages AI services (OpenAI and Google Gemini) to transcribe interviews, analyze conversation quality, match responses against job descriptions, and generate detailed reports for both recruiters and candidates. It includes role-based authentication (Admin, Recruiter, Candidate) and provides advanced features like PII detection, multi-modal sentiment analysis, and recruiter performance benchmarking.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React with TypeScript for component-based UI
- Vite as the build tool and development server
- Tailwind CSS for styling with shadcn/ui component library
- Wouter for client-side routing
- TanStack Query (React Query) for server state management

**Design Patterns:**
- Component composition with shadcn/ui primitives
- Custom hooks for reusable logic (e.g., `use-toast`, `use-mobile`)
- Context-based authentication management
- Query-based data fetching with optimistic updates

**Key Features:**
- Dashboard views for different user roles (Admin, Recruiter, Candidate)
- Real-time processing status updates with step-by-step progress
- Interactive data visualizations (charts for sentiment, relevance, flow)
- PDF report generation and download
- Audio and resume file upload with drag-and-drop

### Backend Architecture

**Technology Stack:**
- Express.js as the web server framework
- TypeScript for type safety
- MongoDB with Mongoose for data persistence
- Serverless deployment support (Vercel)

**Design Patterns:**
- RESTful API design with resource-based routes
- Middleware-based request processing (authentication, file upload)
- Service layer pattern for business logic separation
- Lazy initialization for AI clients to avoid environment variable issues

**Core Services:**

1. **Analysis Pipeline (`enhancedAnalysis.ts`):**
   - Parallel processing of independent analysis steps
   - Optimized for speed with 60-70% reduction in processing time
   - Stages: transcription → parallel analysis (PII, content, sentiment) → encryption → embedding generation → advanced analysis → explainability

2. **AI Services:**
   - Google Gemini: Audio transcription, sentiment analysis, JD relevance, PII detection
   - OpenAI: Voice tone extraction, semantic embeddings (optional)
   - Multi-modal sentiment combining text and voice analysis

3. **Security Services:**
   - Encryption service for sensitive transcript data (AES-256-GCM)
   - PII detection and redaction using AI-powered contextual understanding
   - JWT-based authentication with bcrypt password hashing

4. **Document Processing:**
   - PDF and Word document parsing for resumes and job descriptions
   - Resume-transcript alignment analysis

5. **Report Generation:**
   - PDF report generation with jsPDF
   - Separate reports for candidates and recruiters
   - Detailed metrics, recommendations, and visual breakdowns

### Data Storage

**MongoDB Schema (Mongoose Models):**

1. **User Model:** Authentication and role management (admin, recruiter, candidate)
2. **Candidate Model:** Candidate profiles with performance tracking
3. **Interview Model:** Interview records with audio files, transcripts, and processing status
4. **AnalysisReport Model:** Comprehensive analysis results linked to interviews
5. **RecruiterMetrics Model:** Performance metrics for individual recruiters
6. **PipelineMonitoring Model:** Processing pipeline monitoring and metrics

**Data Flow:**
- Connection pooling with cached connections for serverless environments
- Automatic reconnection handling
- Document references between models (recruiterId, candidateId, interviewId)

**Migration Strategy:**
- Drizzle configuration present but currently using MongoDB
- PostgreSQL support configured for future migration (drizzle.config.ts uses PostgreSQL dialect)
- Schema definitions in TypeScript for type safety (each folder has its own copy)

## Project Structure (Self-Contained for Deployment)

The project is organized into independent, self-contained folders for separate deployment:

```
├── frontend/           # React frontend (deploy to Vercel)
│   ├── src/
│   │   ├── components/ # UI components
│   │   ├── pages/      # Route pages
│   │   ├── hooks/      # Custom hooks
│   │   ├── lib/        # Utilities, API helpers, schema types
│   │   └── App.tsx     # Main app component
│   ├── package.json    # Frontend dependencies
│   ├── vite.config.ts  # Vite configuration
│   └── tsconfig.json   # TypeScript config
│
├── backend/            # Express backend (deploy to Render)
│   ├── models/         # Mongoose models
│   ├── routes/         # API route handlers
│   ├── services/       # Business logic (AI, analysis, reports)
│   ├── utils/          # Utility functions
│   ├── schema.ts       # TypeScript types (local copy)
│   ├── package.json    # Backend dependencies
│   └── tsconfig.json   # TypeScript config
│
└── attached_assets/    # Uploaded assets and images
```

Each folder has its own `package.json` and can be deployed independently.

### Authentication & Authorization

**Mechanism:**
- JWT tokens with 7-day expiration
- HTTP-only cookies for secure token storage (server-side)
- LocalStorage backup for instant client-side auth state
- Role-based access control (RBAC) with middleware guards

**Email Domain Restrictions:**
- Allowed domains: @esolglobal.com, @esol.com, @otomashen.com
- Email verification and password reset via nodemailer

**Security Features:**
- Bcrypt password hashing (10 rounds)
- Default password system with forced password change on first login
- CORS protection
- Input validation with Zod schemas

### File Upload & Processing

**Upload Handling:**
- Multer middleware for multipart/form-data
- Local file storage in `uploads/` directory
- File type validation (audio: MP3, WAV, M4A; documents: PDF, DOCX)
- Size limits: 100MB for audio, 10MB for documents

**Processing Pipeline:**
1. File upload → Interview record creation
2. Async processing with status updates
3. AI analysis stages (transcription, sentiment, JD matching, flow)
4. Optional resume analysis if resume provided
5. Report generation and storage

## External Dependencies

### Third-Party APIs

1. **Google Gemini AI:**
   - Model: gemini-2.5-flash (configurable to gemini-2.5-pro)
   - Uses: Audio transcription, sentiment analysis, JD relevance, PII detection, explainability generation
   - API Key: `GEMINI_API_KEY` environment variable

2. **OpenAI:**
   - Model: GPT-5 for chat completions, Whisper-1 for audio, text-embedding-3-large for embeddings
   - Uses: Voice tone extraction, semantic embeddings (optional - disabled by default to save costs)
   - API Key: `OPENAI_API_KEY` environment variable
   - Cost Optimization: Embeddings disabled by default (`USE_OPENAI_EMBEDDINGS=false`)

### Database

**MongoDB:**
- Connection URI: `MONGODB_URI` or `DATABASE_URL` environment variable
- Fallback: `mongodb://localhost:27017/sentivox`
- Production: MongoDB Atlas recommended
- Connection pooling: maxPoolSize of 10 with 5s server selection timeout

### Email Service

**Nodemailer:**
- SMTP Configuration: Auto-detects based on email provider (Gmail, Outlook)
- Environment Variables:
  - `EMAIL_USER`: SMTP username
  - `EMAIL_PASSWORD`: App-specific password
  - `EMAIL_HOST`: Optional SMTP host override
  - `EMAIL_PORT`: Optional port (default: 587)
  - `EMAIL_FROM`: From email address
- Graceful degradation: Simulates email sending if credentials not set

### Build & Deployment Tools

1. **Vite:** Frontend build tool with React plugin
2. **esbuild:** Server-side bundling for production
3. **Vercel:** Frontend deployment (static site hosting)
4. **Render:** Backend deployment (Node.js web service)
5. **TypeScript:** Type checking across frontend and backend

## Deployment Configuration

### Separate Frontend/Backend Deployments

The application supports deployment with separate frontend (Vercel) and backend (Render) services for production:

**Frontend (Vercel):**
- Build command: `npm run build`
- Output directory: `dist/public`
- Environment variable: `VITE_API_URL` - Set to the backend URL (e.g., `https://sentivox-api.onrender.com`)

**Backend (Render):**
- Build command: `npm install && npm run build`
- Start command: `npm start`
- Environment variables required:
  - `MONGODB_URI`: MongoDB connection string
  - `JWT_SECRET`: Secret key for JWT tokens
  - `GEMINI_API_KEY`: Google Gemini API key
  - `OPENAI_API_KEY`: OpenAI API key (optional)
  - `FRONTEND_URL`: Frontend URL for CORS (e.g., `https://sentivox.vercel.app`)
  - `NODE_ENV`: Set to `production`

### Cross-Domain API Support

**API Helper (`client/src/lib/api.ts`):**
- `apiFetch()`: Wrapper for fetch that automatically prepends the API base URL
- `getApiUrl()`: Returns full API URL from environment variable
- Includes `credentials: 'include'` for cross-domain cookie support

**Cookie Configuration:**
- In production: `sameSite: 'none'`, `secure: true` for cross-domain cookies
- In development: `sameSite: 'lax'` for local testing

**CORS Configuration:**
- Allows Vercel and Render domains dynamically
- Credentials enabled for cookie-based authentication
- Exposed headers include `Set-Cookie` for auth responses

### UI Component Library

**shadcn/ui:**
- Radix UI primitives for accessible components
- Customized with Tailwind CSS
- Components: Accordion, Alert, Avatar, Badge, Button, Card, Checkbox, Dialog, Dropdown, Form controls, Progress, Table, Toast, Tooltip, etc.

### Utility Libraries

- **Zod:** Schema validation for API inputs
- **bcryptjs:** Password hashing
- **jsonwebtoken:** JWT token generation and verification
- **multer:** File upload handling
- **jsPDF:** PDF generation
- **mammoth:** Word document parsing
- **pdf-parse:** PDF text extraction
- **nanoid:** Unique ID generation
- **Recharts:** Data visualization charts