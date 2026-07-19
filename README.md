# DevOneStack — Frontend

A developer productivity platform built with **React + Vite**. Features dark/light theme, smooth animations, JWT auth (email/password + Google OAuth), and a full space dashboard for organizing dev tools.

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
│   └── spaces/     # SpaceDashboard sections (Docs, Notes, Snippets, etc.)
├── context/        # AuthContext, ThemeContext
├── hooks/          # useSpaces, useStats
├── pages/          # All page components
└── index.css       # Global styles + CSS variables
```

---

## Key Features

- **Spaces** — Create and manage tool workspaces (React, Node.js, Docker, etc.)
  - **Dynamic Branding**: Custom brand icon auto-detection based on space name (e.g. naming it "React" automatically displays the React logo).
  - **Ellipsis Actions**: Inline Pin/Unpin, Edit/Rename, and Delete options inside cards.
  - **Real-time Activity Ticking**: Relatve update times tick dynamically in real-time.
- **Space Dashboard** — Workspace with sidebar sections: Docs, Notes, Snippets, Repos, Prompts, Communities, Tags. 
  - **Dynamic Sidebar Overlay**: MongoDB Atlas-style hover-expand sidebar utilizing absolute overlays and smooth slide/fade animations without causing layout reflows on the right.
  - **Universal Pinning**: Pin notes, snippets, docs, repos, prompts, and communities directly.
  - **Deep-linking & Highlighting**: URL parameter query selection (`?section=notes&noteId=ID`) to navigate and highlight specific resources.
  - **PDF & Image Previews**: View uploaded PDFs inline in a new tab, and raw images in popup previews.
- **Unified Profile Aesthetic** — Clean single-container layout for avatar, details, edit triggers, and dynamic stats counters (aggregating total spaces, notes, snippets, and documents via queries).
- **Searchable Pinned Resources** — Dashboard pinned widget supporting copy-to-clipboard, previews, and instant local text filtering with scrollable layout.
- **Scroll & Layout Improvements** — Custom scroll bars, modal vertical overflow settings, and `data-lenis-prevent` smooth scroll boundary configuration.
- **Tags Cloud** — Dynamic tag cloud with frequency-based sizing and click navigation.
- **Isolated Space Activity Feed** — Recent activity under the space view shows actions related to that specific space only.
- **Theme** — Dark/light mode toggle persisted across sessions, with refined tag colors in dark mode.
- **Auth** — httpOnly cookie-based JWT, auto token refresh, Google OAuth.

---

## Environment Variables

```env
VITE_SERVER_URL=http://localhost:9000
```

Never commit `.env` — it's in `.gitignore`. Use `.env.example` as the template.
