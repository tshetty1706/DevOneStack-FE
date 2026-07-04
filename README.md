# DevOneStack — Frontend

A developer productivity platform built with **React + Vite**. Features dark/light theme, smooth animations, JWT auth (email/password + Google + GitHub OAuth), and a full space dashboard for organizing dev tools.

---

## Tech Stack

| | |
|---|---|
| Framework | React 19 + Vite 8 |
| UI | Ant Design 6 |
| Animations | Motion (Framer Motion) 12 |
| Routing | React Router DOM 7 |
| Data Fetching | TanStack Query 5 |
| HTTP Client | Axios (with auto token refresh) |
| Icons | React Icons 5 |
| Smooth Scroll | Lenis |
| Email | EmailJS Browser |

---

## Setup

```bash
# 1. Install
cd Frontend/Project1
npm install

# 2. Create .env
VITE_SERVER_URL=http://localhost:9000

# 3. Run
npm run dev
```

App runs at `http://localhost:5173`

---

## Pages & Routes

| Route | Page | Auth Required |
|---|---|---|
| `/` | Home (landing) | No |
| `/login` | Login | No |
| `/signup` | Sign Up | No |
| `/verify-email/:token` | Email Verification | No |
| `/forgot-password` | Forgot Password | No |
| `/reset-password/:token` | Reset Password | No |
| `/oauth/callback` | OAuth Callback | No |
| `/dashboard` | Main Dashboard | **Yes** |
| `/profile` | Profile & Spaces | **Yes** |
| `/spaces/:spaceId` | Space Dashboard | **Yes** |

---

## Project Structure

```
src/
├── api/            # Axios instance + auth API helpers
├── components/
│   ├── auth/       # ProtectedRoute
│   ├── dashboard/  # Navbar, SpaceCards, NewSpaceModal, RecentActivity, etc.
│   ├── home/       # Landing page sections
│   └── layout/     # Navbar, Footer, ThemeToggle, Logo
├── context/        # AuthContext, ThemeContext
├── hooks/          # useSpaces, useStats
├── pages/          # All page components
└── index.css       # Global styles + CSS variables
```

---

## Key Features

- **Spaces** — Create and manage tool workspaces (React, Node.js, Docker, etc.)
- **Space Dashboard** — Full-page workspace with sidebar: Docs, Notes, Snippets, Repos, Prompts, Communities, Tags
- **Profile** — Edit profile, manage spaces, view overview
- **Recent Activity** — Live history feed from backend
- **Theme** — Dark/light mode toggle persisted across sessions
- **Auth** — httpOnly cookie-based JWT, auto token refresh, Google + GitHub OAuth

---

## Environment Variables

```env
VITE_SERVER_URL=http://localhost:9000
```

Never commit `.env` — it's in `.gitignore`. Use `.env.example` as the template.
