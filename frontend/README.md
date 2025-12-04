# Sentivox Frontend

Frontend React application for Sentivox - AI-Powered Interview Analysis Platform.

## Features

- React 18 with TypeScript
- Vite for fast development and building
- Tailwind CSS with shadcn/ui components
- TanStack Query for server state management
- Wouter for client-side routing
- Role-based dashboards (Admin, Recruiter, Candidate)
- Real-time processing status updates
- Interactive data visualizations
- PDF report generation

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with the following variables:
```
VITE_API_URL=https://your-backend-url.onrender.com
```

**Note:** For production on Vercel, set `VITE_API_URL` in the Vercel dashboard environment variables.

3. Start the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Deployment on Vercel

### Step-by-Step Deployment:

1. **Connect Repository:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your GitHub repository: `abhilashtyagiii/sentivoxfrontendai`

2. **Configure Environment Variables:**
   - In the project settings, go to "Environment Variables"
   - Add a new variable:
     - **Name:** `VITE_API_URL`
     - **Value:** Your Render backend URL (e.g., `https://sentivox-backend.onrender.com`)
     - **Environment:** Select all (Production, Preview, Development)
   - Click "Save"

3. **Deploy:**
   - Vercel will automatically detect Vite and build the project
   - After deployment, **redeploy** to ensure the environment variable is included in the build
   - The `vercel.json` file is already configured for SPA routing

### ⚠️ Important:
- **You MUST set `VITE_API_URL`** or login will fail
- After setting the environment variable, trigger a new deployment
- Make sure your Render backend URL is correct and includes `https://`
- The backend CORS is already configured to allow Vercel domains

## Backend Integration

The frontend communicates with the backend API using the `VITE_API_URL` environment variable. Make sure your backend is deployed and the CORS is configured to allow requests from your Vercel domain.

**Backend URL:** The backend should be deployed on Render and the URL should be set in `VITE_API_URL`.

## Project Structure

```
frontend/
├── src/
│   ├── components/     # React components
│   ├── pages/          # Route pages
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utilities, API helpers, types
│   └── App.tsx         # Main app component
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
