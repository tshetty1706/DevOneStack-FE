# DevOneStack — Frontend (Project1)

A modern, animated developer platform built with **React 19**, **Vite 8**, and **Ant Design 6**. Features smooth scroll, motion animations, dark/light theme toggle, full JWT-based authentication (email/password + Google OAuth + GitHub OAuth), and protected routing.

---

## Tech Stack

| Layer            | Technology                         |
| ---------------- | ---------------------------------- |
| Framework        | React 19                           |
| Bundler          | Vite 8                             |
| UI Library       | Ant Design (antd) 6                |
| Animations       | Motion (Framer Motion) 12          |
| Routing          | React Router DOM 7                 |
| Icons            | React Icons 5                      |
| Smooth Scroll    | Lenis 1                            |
| Carousel         | Swiper 14                          |
| HTTP Client      | Axios 1 (with 401 refresh interceptor) |
| Linter           | Oxlint                             |

---

## Project Structure

```
Project1/
├── public/                         # Static assets
├── src/
│   ├── api/
│   │   ├── auth.js                 # signup, login, logout, getCurrentUser, OAuth URLs
│   │   └── axios.js                # Axios instance (withCredentials + 401 interceptor)
│   ├── components/
│   │   ├── auth/
│   │   │   └── ProtectedRoute.jsx  # Redirects to /login if not authenticated
│   │   ├── dashboard/              # Dashboard-specific subcomponents
│   │   │   ├── CommandPalette.jsx  # Floating quick navigation palette
│   │   │   ├── DashboardNavbar.jsx # Navbar specific to dashboard views
│   │   │   ├── PinnedBoilerplates.jsx # Quick link access for pinned boilerplates
│   │   │   ├── ProfileDropdown.jsx # User actions & settings popup
│   │   │   ├── QuickInbox.jsx      # Sticky notes/inbox feed scanner
│   │   │   ├── RecentActivity.jsx  # List feed of latest logs and user actions
│   │   │   ├── StackHealthScanner.jsx # Simulated microservice health monitor
│   │   │   ├── StatsCards.jsx      # Key metrics visualization
│   │   │   ├── TodaysFocus.jsx     # User focus tasks checklist
│   │   │   ├── ToolSpaceCard.jsx   # Individual active space tile
│   │   │   └── ToolSpacesGrid.jsx  # Spaces grid shell layout
│   │   ├── home/
│   │   │   ├── DashboardMockup.jsx
│   │   │   ├── FeaturesSection.jsx
│   │   │   ├── FloatingIcons.jsx
│   │   │   ├── GlowCenterpiece.jsx
│   │   │   ├── Hero.jsx
│   │   │   ├── LogoStrip.jsx
│   │   │   ├── StartBuildingCTA.jsx
│   │   │   ├── StatCounter.jsx
│   │   │   ├── StatsSection.jsx
│   │   │   ├── StepsSection.jsx
│   │   │   └── Testimonial.jsx
│   │   └── layout/
│   │       ├── Footer.jsx
│   │       ├── Navbar.jsx
│   │       └── ThemeToggle.jsx
│   ├── context/
│   │   ├── AuthContext.jsx          # Auth state (user, setUser, loading, logout)
│   │   └── ThemeContext.jsx         # Dark/Light theme provider
│   ├── hooks/                       # Custom React hooks
│   │   ├── useSpaces.js            # Active toolspaces fetching hook
│   │   └── useStats.js             # User statistics fetching hook
│   ├── mock/                        # Mock utility datasets
│   │   └── data.js                 # Dummy data for UI building
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Login.jsx                # Email/password + OAuth login
│   │   ├── Signup.jsx               # Email/password + OAuth signup
│   │   ├── Dashboard.jsx            # Developer dashboard layout
│   │   ├── ForgotPassword.jsx       # Password reset request page
│   │   ├── OAuthCallback.jsx        # Catch-all callback handler
│   │   ├── Profile.jsx              # Detailed account settings & profile page
│   │   ├── ResetPassword.jsx        # Secure password reset entry
│   │   ├── VerifyEmail.jsx          # Instant email token validation page
│   │   └── auth.css
│   ├── App.jsx                      # Root — ThemeProvider > AuthProvider > Router
│   ├── App.css
│   ├── index.css                    # Global styles
│   └── main.jsx                     # Entry point
├── .env                             # VITE_SERVER_URL (gitignored)
├── .env.example                     # Template — safe to commit
├── index.html
├── vite.config.js
├── package.json
└── .oxlintrc.json
```

---

## Prerequisites

- **Node.js** v18 or above
- Backend server running at `http://localhost:9000` (see `../Backend/README.md`)

---

## Setup

### 1. Clone and install

```bash
cd Frontend/Project1
npm install
```

### 2. Configure environment

Create a `.env` file (already created — just verify):

```env
VITE_SERVER_URL=http://localhost:9000
```

This points the Axios client to the backend. All auth API calls and OAuth redirect URLs are built from this.

### 3. Start the development server

```bash
npm run dev
```

App runs at `http://localhost:5173`.

---

## Available Scripts

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start Vite dev server with HMR       |
| `npm run build`   | Build production bundle to `dist/`   |
| `npm run preview` | Preview the production build locally |
| `npm run lint`    | Run Oxlint for code linting          |

---

## Auth Architecture

All auth state lives in `AuthContext` — no localStorage, no token exposure to JavaScript.

```
App startup
  └── AuthContext mounts
        └── GET /api/auth/me (reads httpOnly accessToken cookie)
              ├── 200 → setUser(data.user)   [stays logged in across refresh]
              └── 401 → setUser(null)         [not logged in]

Login / Signup
  └── POST /api/auth/login or /signup
        └── server sets accessToken (15m) + refreshToken (7d) as httpOnly cookies
              └── setUser(data.user) → navigate('/dashboard')

OAuth (Google / GitHub)
  └── <a href={googleAuthUrl}> — full page redirect (not fetch, not popup)
        └── backend handles flow → sets cookies → redirects to /dashboard

Token Refresh (automatic)
  └── axios interceptor catches 401
        └── POST /api/auth/refresh → new accessToken cookie
              └── retry original request transparently

Logout
  └── POST /api/auth/logout → server clears DB token + cookies
        └── setUser(null)
```

---

## Protecting Routes

```jsx
import ProtectedRoute from './components/auth/ProtectedRoute';

// In App.jsx:
<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />
```

`ProtectedRoute` shows a spinner while auth loads, then redirects to `/login` if there's no user.

## Routes

| Path | Page | Protected | Description |
| :--- | :--- | :--- | :--- |
| `/` | Home | No | Landing page with key sections and animations |
| `/login` | Login | No | Email/password + OAuth login form |
| `/signup` | Signup | No | Email/password + OAuth signup form |
| `/oauth/callback`| OAuthCallback| No | Post-login redirect hook parsing JWT from URL hash |
| `/verify-email/:token`| VerifyEmail| No | Instant account activation page |
| `/forgot-password`| ForgotPassword| No | Trigger password recovery email flow |
| `/reset-password/:token`| ResetPassword| No | Enter and save new password |
| `/dashboard` | Dashboard | **Yes** | Main dashboard with scanner, focus tasks, quick inbox & activity feed |
| `/profile` | Profile | **Yes** | User profile settings, space details, and theme toggling |

---

## Dependencies

### Production

```bash
npm install antd axios lenis motion react react-dom react-icons react-router-dom swiper react-hook-form @hookform/resolvers @tanstack/react-query zod
```

| Package | Version | Purpose |
| :--- | :--- | :--- |
| `react` | ^19.2.7 | Core UI library |
| `react-dom` | ^19.2.7 | React DOM renderer |
| `antd` | ^6.5.0 | UI components (Button, Card, ConfigProvider + theming) |
| `react-router-dom` | ^7.18.0 | Client-side routing, ProtectedRoute navigation |
| `motion` | ^12.42.0 | Scroll-triggered animations (motion, useInView) |
| `react-icons` | ^5.7.0 | Icon packs — Google, GitHub, tech stack icons |
| `axios` | ^1.18.1 | HTTP client with `withCredentials` + 401 interceptor |
| `lenis` | ^1.3.25 | Smooth scroll engine |
| `swiper` | ^14.0.0 | Autoplay carousel for LogoStrip |
| `react-hook-form` | ^7.80.0 | Performant, flexible forms with validation |
| `@hookform/resolvers`| ^5.4.0 | Validation resolvers (connects react-hook-form to zod) |
| `@tanstack/react-query`| ^5.101.2 | Async state management and data fetching |
| `zod` | ^4.4.3 | TypeScript-first schema validation |

### Dev

```bash
npm install -D @types/react @types/react-dom @vitejs/plugin-react oxlint vite
```

| Package | Version | Purpose |
| :--- | :--- | :--- |
| `vite` | ^8.1.0 | Build tool and dev server |
| `@vitejs/plugin-react` | ^6.0.2 | React support (JSX transform, HMR) |
| `oxlint` | ^1.69.0 | Fast linter |
| `@types/react` | ^19.2.17 | TypeScript types for React |
| `@types/react-dom` | ^19.2.3 | TypeScript types for ReactDOM |

---


