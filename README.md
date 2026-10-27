# ApplyTrack — Smart Internship & Job Application Tracker

ApplyTrack is a full-stack, production-minded web application engineered to help college students, new graduates, and job seekers organize and master their job search pipeline from initial discovery to final offer.

Unlike superficial CRUD or mockup apps, ApplyTrack is driven by genuine database persistence, strict cross-user ownership isolation, real-time conversion metric calculations without fabricated statistics, and an explainable, deterministic resume-to-job skill comparison engine.

---

## 1. Problem Statement

College students and active job seekers routinely encounter major tracking issues during recruiting cycles:
- **Scattered Information:** Applications get lost across bookmarks, spreadsheets, and confirmation emails.
- **Lost Resume Versioning:** Forgetting which resume variant was submitted for which role.
- **Missed Deadlines & Interviews:** Take-home assessment cutoffs and recruiter calls slip through the cracks.
- **Lack of Transparency:** Most platforms display arbitrary or fake success predictions instead of true conversion metrics.
- **Skill Alignment Uncertainty:** Candidates struggle to evaluate how closely their resume matches the technical requirements in a job description.

ApplyTrack resolves these pain points with a unified, secure dashboard, responsive Kanban and list views, overdue deadline reminders, authentic conversion analytics, and transparent skill-gap analysis.

---

## 2. Core Features

### 1. Authentication & Isolated Workspaces
- User registration, login, and secure logout.
- Persistent session using HttpOnly cookies with bearer token support.
- Password hashing with `bcryptjs` (salt rounds: 10).
- Password hashes are never returned in queries or API responses.
- Strict authorization and resource ownership verification on all operations.

### 2. Application Lifecycle Management
- Status pipeline: `SAVED`, `APPLIED`, `ASSESSMENT`, `INTERVIEW`, `OFFER`, `REJECTED`, `WITHDRAWN`.
- Multi-field tracking: Company, job title, description, URL, location, work mode (`onsite`, `hybrid`, `remote`), employment type (`internship`, `full-time`, `part-time`, `contract`), salary/stipend, applied date, deadline, recruiter contacts, resume version, and tags.
- Dual-view interface: Toggle between an interactive **Kanban Board** and a sortable, paginated **Table View**.
- Intelligent duplicate detection: Checks normalized company and title combinations to prevent accidental duplicate entries, with an optional deliberate override.
- Full status history and audit activity trail recorded with timestamps and transition notes.

### 3. Events, Deadlines & Follow-up Reminders
- Schedule and manage interviews, technical assessments, application deadlines, and recruiter follow-ups.
- Direct association with parent applications.
- One-click completion toggling with completion timestamps.
- Prominent in-app alert banners for overdue tasks and upcoming interviews.

### 4. Authentic Analytics Dashboard
- Calculated exclusively from actual MongoDB records belonging to the authenticated user.
- **Interview Conversion Rate:** Distinct submitted applications that reached an interview or offer stage divided by total submitted applications.
- **Offer Conversion Rate:** Distinct submitted applications that reached an offer stage divided by total submitted applications.
- Interactive **Recharts** visualizations:
  - Monthly application velocity area chart.
  - Status distribution donut chart.
  - Work mode preference bar chart.
- Safe empty-dataset handling: Zero division protection guarantees no `NaN` or `Infinity` displays.

### 5. Explainable Resume-to-Job Skill Gap Analyzer
- Deterministic keyword extraction engine using a maintained dictionary of 150+ technical skills.
- Handles synonyms and aliases (e.g. `js` -> `JavaScript`, `reactjs` -> `React`, `k8s` -> `Kubernetes`, `cpp` -> `C++`).
- Extracts skills from job descriptions and resumes (via text paste or `.txt`/`.md`/`.json` file upload).
- Computes transparent match percentage: `(matchedCount / totalJdSkills) * 100`.
- Categorizes detected skills into Matched, Missing, and Extra candidate skills.
- Produces prioritized learning roadmaps (High, Medium, Foundational) with targeted study tips.
- Displays realistic disclaimers explaining that unlisted keywords do not necessarily indicate a candidate lacks the skill.

---

## 3. Technology Stack

### Frontend
- **Framework:** React 18 with Vite
- **Routing:** React Router v6
- **Styling:** Custom CSS design system (tokens, responsive flexbox & grid, accessible modals)
- **Charts:** Recharts
- **Icons:** Lucide React
- **HTTP Client:** Axios (configured with interceptors, credentials, and token handling)

### Backend
- **Runtime:** Node.js (v20+ / v25+)
- **Framework:** Express.js (REST API architecture)
- **Database ODM:** Mongoose 8 (MongoDB)
- **Validation:** Zod schemas
- **Security:** Helmet, CORS, Express Rate Limit, Cookie-Parser, Bcryptjs, JsonWebToken
- **Testing:** Jest, Supertest, MongoMemoryServer

---

## 4. Architecture Overview

ApplyTrack follows a clean modular architecture:

```
┌────────────────────────────────────────────────────────┐
│                   React Client (Vite)                  │
│   Components ── Contexts ── Axios Client ── Pages       │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP / JSON / Cookies
┌───────────────────────────▼────────────────────────────┐
│                    Express.js Server                   │
│                                                        │
│  ┌─────────────────┐  ┌─────────────────────────────┐  │
│  │ Rate Limiters   │  │ Centralized Error Handler   │  │
│  │ & Helmet CSP    │  │ & Input Validators (Zod)    │  │
│  └────────┬────────┘  └──────────────┬──────────────┘  │
│           │                          │                 │
│  ┌────────▼──────────────────────────▼──────────────┐  │
│  │ Controllers (Auth, Apps, Events, Analytics, Skill)│  │
│  └────────────────────────┬─────────────────────────┘  │
│                           │                            │
│  ┌────────────────────────▼─────────────────────────┐  │
│  │ Services (Skill Matcher, Analytics, Duplicates)  │  │
│  └────────────────────────┬─────────────────────────┘  │
│                           │                            │
│  ┌────────────────────────▼─────────────────────────┐  │
│  │ Mongoose Models (User, Application, Event)       │  │
│  └────────────────────────┬─────────────────────────┘  │
└───────────────────────────┼────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│         MongoDB Atlas / In-Memory Dev Database         │
└────────────────────────────────────────────────────────┘
```

---

## 5. Directory Structure

```
Job tracker/
├── .env.example              # Root environment template
├── .gitignore                # Git ignore rules for node_modules, build, env
├── package.json              # Monorepo runner scripts
├── render.yaml               # Render Cloud deployment blueprint
├── README.md                 # Complete documentation
├── server/
│   ├── .env.example
│   ├── package.json
│   ├── src/
│   │   ├── app.js            # Express app assembly & route registration
│   │   ├── server.js         # HTTP server entry point & graceful shutdown
│   │   ├── config/
│   │   │   ├── db.js         # MongoDB connection & memory-server fallback
│   │   │   └── env.js        # Environment config loader
│   │   ├── controllers/      # Route controllers
│   │   │   ├── authController.js
│   │   │   ├── applicationController.js
│   │   │   ├── eventController.js
│   │   │   ├── analyticsController.js
│   │   │   └── skillController.js
│   │   ├── middleware/       # Auth guard, Zod validation, error handling
│   │   │   ├── auth.js
│   │   │   ├── errorHandler.js
│   │   │   ├── rateLimiter.js
│   │   │   └── validate.js
│   │   ├── models/           # Mongoose schemas
│   │   │   ├── Application.js
│   │   │   ├── Event.js
│   │   │   └── User.js
│   │   ├── routes/           # REST endpoints
│   │   ├── services/         # Business logic
│   │   │   ├── analyticsService.js
│   │   │   ├── duplicateService.js
│   │   │   └── skillMatcher.js
│   │   └── utils/            # Skill dictionary & JWT tokens
│   │       ├── skillsDictionary.js
│   │       └── tokenUtils.js
│   └── tests/                # Automated test suites
│       ├── analytics.test.js
│       ├── applications.test.js
│       ├── auth.test.js
│       ├── events.test.js
│       ├── setup.js
│       └── skillMatcher.test.js
└── client/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── index.css
        ├── api/              # Axios API clients
        ├── context/          # Auth & Toast providers
        ├── components/       # UI building blocks
        └── pages/            # 11 application views
```

---

## 6. Prerequisites

- **Node.js**: v18.0.0 or later (v20+ / v25+ recommended)
- **npm**: v9.0.0 or later
- **Git**

*(Note: A local MongoDB installation is optional. If `MONGODB_URI` is left unconfigured in local development, the application automatically launches an in-memory database instance for zero-friction setup.)*

---

## 7. Local Installation Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/<your-username>/applytrack.git
   cd "Job tracker"
   ```

2. **Install all dependencies:**
   ```bash
   npm run install-all
   ```

3. **Configure Environment Variables:**
   ```bash
   cp .env.example .env
   cp server/.env.example server/.env
   ```

4. **Start the Development Servers:**
   ```bash
   npm run dev
   ```
   - Client dev server: `http://localhost:5173`
   - Backend API: `http://localhost:5000`

---

## 8. Development & Test Commands

| Command | Action |
|---|---|
| `npm run dev` | Concurrently starts both backend and Vite frontend |
| `npm run dev:server` | Runs the backend with `nodemon` auto-reload |
| `npm run dev:client` | Runs the Vite frontend development server |
| `npm test` | Runs the full backend Jest test suite with MongoDB in-memory |
| `npm run build` | Builds the optimized frontend bundle to `client/dist` |
| `npm start` | Starts the production Express server |

---

## 9. Automated Testing

ApplyTrack includes 21 automated unit and integration tests across 5 test suites:
- `auth.test.js`: Validates registration, duplicate email rejection (409), password hashing, login success, invalid credentials handling, and protected `/api/auth/me`.
- `applications.test.js`: Tests application creation, status history appending, duplicate warnings, duplicate override (`forceDuplicate`), and strict cross-user ownership barriers.
- `events.test.js`: Verifies event creation, application association validation, completion toggling, and cleanup on application deletion.
- `analytics.test.js`: Tests zero-division safety on empty datasets, status counts, and conversion rate calculations.
- `skillMatcher.test.js`: Tests deterministic skill keyword extraction, alias normalization (`js` -> `JavaScript`, `k8s` -> `Kubernetes`), word-boundary false-positive prevention, and priority grouping.

Run tests:
```bash
npm test
```

---

## 10. API Endpoint Reference

### Health
- `GET /api/health` — Service health, database connection state, and uptime.

### Authentication
- `POST /api/auth/register` — Register new user account.
- `POST /api/auth/login` — Sign in and receive HttpOnly cookie / token.
- `POST /api/auth/logout` — Clear session cookies.
- `GET /api/auth/me` — Retrieve current user profile (requires auth).
- `PUT /api/auth/profile` — Update name, headline, target roles, or preferences.

### Applications
- `GET /api/applications` — List applications with search, status/mode filters, sorting, and pagination.
- `POST /api/applications` — Track new application (includes duplicate detection).
- `GET /api/applications/:id` — Get full application details, history, and events.
- `PUT /api/applications/:id` — Update application details.
- `PATCH /api/applications/:id/status` — Quick status transition with history note.
- `DELETE /api/applications/:id` — Delete application and linked events.

### Events & Deadlines
- `GET /api/events` — Retrieve user events (optional filter: upcoming, overdue, application).
- `POST /api/events` — Schedule interview, deadline, or follow-up.
- `PUT /api/events/:id` — Edit event details.
- `PATCH /api/events/:id/toggle` — Toggle completed state.
- `DELETE /api/events/:id` — Delete event.

### Analytics
- `GET /api/analytics?timeRange=all` — Compute pipeline metrics, conversion rates, and time series.

### Skill Gap Analyzer
- `POST /api/skills/compare` — Compare job description against resume text.
- `POST /api/skills/extract` — Extract skills from arbitrary text.
- `GET /api/skills/dictionary` — List all tracked skills and categories.

---

## 11. Database Models

### User
- `name`: String (required)
- `email`: String (unique, indexed, lowercase)
- `passwordHash`: String (bcrypt, select: false)
- `headline`: String
- `targetRoles`: [String]
- `preferences`: { defaultView, emailAlerts, inAppReminders }
- `timestamps`: true

### Application
- `user`: ObjectId -> User (indexed)
- `company`: String (required)
- `normalizedCompany`: String (for duplicate detection)
- `jobTitle`: String (required)
- `normalizedJobTitle`: String (for duplicate detection)
- `jobDescription`: String
- `jobUrl`: String
- `location`: String
- `workMode`: Enum ('onsite', 'hybrid', 'remote')
- `employmentType`: Enum ('internship', 'full-time', 'part-time', 'contract')
- `salary`: String
- `dateSaved`: Date
- `dateApplied`: Date
- `status`: Enum ('SAVED', 'APPLIED', 'ASSESSMENT', 'INTERVIEW', 'OFFER', 'REJECTED', 'WITHDRAWN')
- `deadline`: Date
- `contact`: { name, email, phone, role }
- `resumeVersion`: String
- `notes`: String
- `tags`: [String]
- `statusHistory`: [{ status, changedAt, note }]
- `timestamps`: true

### Event
- `user`: ObjectId -> User (indexed)
- `application`: ObjectId -> Application (indexed)
- `eventType`: Enum ('interview', 'assessment', 'deadline', 'follow-up', 'reminder')
- `title`: String (required)
- `dateTime`: Date (required)
- `locationOrLink`: String
- `notes`: String
- `isCompleted`: Boolean (default: false)
- `completedAt`: Date
- `timestamps`: true

---

## 12. Security Considerations

- **Password Hashing:** Uses `bcryptjs` with salted hashes. Plain text passwords are never stored.
- **Credential Protection:** Password hashes are excluded by default (`select: false`) and stripped via schema JSON transforms.
- **Access Control:** Every database query checks `user: req.user._id`, preventing unauthorized cross-user access via ID alteration.
- **Session Security:** JWT cookies are flagged `HttpOnly`, `SameSite: Lax/None`, and `Secure` in production.
- **Injection & DoS Mitigation:** Strict Zod schema validation strips unknown fields; `express-rate-limit` throttles brute force attempts on authentication endpoints.
- **Log Privacy:** Request logging excludes passwords, tokens, and resume payloads.

---

## 13. Deployment on Render

This repository includes a production-ready `render.yaml` specification.

### One-Click Setup via Render Blueprint:
1. Push your repository to GitHub.
2. In Render, navigate to **Blueprints** -> **New Blueprint Instance**.
3. Connect your repository.
4. Supply your **`MONGODB_URI`** (MongoDB Atlas connection string).
5. Render will automatically execute:
   - Build: `npm install && npm install --prefix server && npm install --prefix client && npm run build --prefix client`
   - Start: `npm start --prefix server`
   - Health Check: `/api/health`

---

## 14. Known Limitations

- **Email Delivery:** In-app reminders and overdue alerts are active. External email/SMS notification requires connecting an external SMTP or SendGrid provider in future releases.
- **Document Parsing:** Resume matching supports direct text paste and `.txt`, `.md`, and `.json` uploads. Binary `.pdf` and `.docx` parsing requires an external optical parser service for complex multi-column formatting.

---

## 15. License

ApplyTrack is open-source software licensed under the [MIT License](LICENSE).
