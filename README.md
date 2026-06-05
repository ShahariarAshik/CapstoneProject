# Sports Analytics & Report Generation Platform

A comprehensive web application for sports analytics and AI-powered report generation. This platform enables users to analyze leagues, matches, and generate detailed reports in multiple tones.

## 🎯 Features

### Dashboard
- **Real-time Statistics**: View at-a-glance metrics for reports, matches, leagues, and jobs
- **Quick Navigation**: Easy access to all major sections of the platform

### Reports
- **Multiple Report Types**:
  - Pre Match Reports
  - Post Match Reports
  - Pre Round League Summary Reports
  - Post Round League Summary Reports
- **Customizable Tones**: Professional, Serious, or Funny
- **Report Management**: View, download (as text), and edit generated reports
- **Search & Filter**: Quickly find reports by name, type, or tone

### Matches
- **Match Details**: Browse and view detailed information about matches
- **Match Analytics**: Analyze team performance and match outcomes
- **Search Functionality**: Find specific matches with advanced filtering

### Leagues
- **League Overview**: View all available leagues with competition details
- **Season Information**: Track leagues by season and round
- **Round Management**: Access available rounds for analysis

### Jobs
- **Job Tracking**: Monitor report generation jobs in real-time
- **Status Overview**: Track completed and pending report generation tasks
- **Job Details**: View job name, report type, tone, and status

### Authentication
- **User Registration**: Create new accounts with email and password
- **Secure Login**: JWT-based authentication
- **Role-Based Access Control**: Secure API endpoints with role management

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js](https://nextjs.org/) 16.2.6 (React 19.2.4)
- **Language**: [TypeScript](https://www.typescriptlang.org/) 5
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) 4 with PostCSS
- **Icons**: [Lucide React](https://lucide.dev/) 1.14.0
- **Code Quality**: ESLint 9 + Prettier 3.8.3

### Backend
- FastAPI (Python-based API server)
- Default endpoint: `http://localhost:8000`
- Configurable via `NEXT_PUBLIC_API_URL` environment variable

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- FastAPI backend running on port 8000

### Setup Steps

1. **Clone and install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`

## 🚀 Available Scripts

- **`npm run dev`** - Start development server with hot reload
- **`npm run build`** - Build optimized production bundle
- **`npm start`** - Start production server
- **`npm run lint`** - Run ESLint for code quality
- **`npm run format`** - Format code with Prettier
- **`npm run format:check`** - Check code formatting without changes

## 🔐 Authentication

The platform uses JWT (JSON Web Token) authentication:

- **Login**: Users authenticate with email and password
- **Token Storage**: Access tokens stored in local storage
- **Protected Routes**: Dashboard routes are protected by `AuthGuard` component
- **Token Expiration**: Tokens include expiration information

### API Authentication
Authentication is handled through the backend FastAPI server. The frontend sends credentials and receives JWT tokens for subsequent requests.

## 🎨 UI Components

### Key Components
- **AuthGuard**: Wraps protected routes and redirects unauthenticated users to login
- **Modal**: Reusable modal component for dialogs and forms
- **Badge**: Status and type indicator badges with color-coding
- **SearchBar**: Advanced search with column-based filtering
- **Pagination**: Table pagination with configurable page size
- **Toast**: Notification system for user feedback

## 🔌 API Integration

All API requests are made to the FastAPI backend configured in `lib/config.ts`:

### Key Endpoints (Inferred)
- `/api/auth/login` - User login
- `/api/auth/register` - User registration
- `/api/stats/get-stats` - Dashboard statistics
- `/api/report-requests/get-report-requests` - Fetch jobs
- `/api/reports/*` - Report operations
- `/api/matches/*` - Match data
- `/api/leagues/*` - League data

## 🌙 Theme & Styling

- **Tailwind CSS**: Utility-first CSS framework
- **PostCSS**: CSS preprocessing with Tailwind plugins
- **Dark Mode**: Theme provider component supports theme customization
- **Responsive Design**: Mobile-first responsive layout

## 📝 Report Types

### Match Reports
- **Pre Match Report**: Analysis before match starts
- **Post Match Report**: Analysis after match completion

### League Reports  
- **Pre Round League Summary**: Summary before round starts
- **Post Round League Summary**: Summary after round completion

### Report Tones
- **Professional**: Formal, business-appropriate tone
- **Serious**: Serious analytical tone
- **Funny**: Humorous, entertaining tone

## 🔄 Data Flow

1. User logs in → JWT token issued
2. Token stored in local storage
3. Protected routes verified with AuthGuard
4. API requests include authentication headers
5. Data fetched and displayed in corresponding pages
6. Reports can be generated, viewed, edited, or downloaded

## ⚙️ Configuration

### Environment Variables
```env
NEXT_PUBLIC_API_URL    # Backend API URL (default: http://localhost:8000)
```

### TypeScript Configuration
- Strict type checking enabled
- JSX preset configured for React 19
- Module resolution: ESNext with Node compatibility

## 🚀 Development Tips

1. **Hot Reload**: Changes to files automatically refresh the dev server
2. **Type Safety**: Full TypeScript support prevents runtime errors
3. **Code Formatting**: Run `npm run format` before committing
4. **Linting**: Check code quality with `npm run lint`
