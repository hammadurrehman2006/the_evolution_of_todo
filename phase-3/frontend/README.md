# Task Hive UI (Phase 3 Frontend)

A modern, highly interactive task management dashboard built with Next.js, React 19, and Tailwind CSS.

## Features

- **AI Assistant Integration**: Integrated ChatKit for AI-powered task management.
- **"Glassmorphism" Design**: A beautiful, modern aesthetic with blurred backgrounds and vibrant gradients.
- **Real-time Productivity**: Instant task updates, filtering, and completion toggles.
- **Analytics Dashboard**: Visual representation of task completion rates and productivity trends using Recharts.
- **Multi-Provider Auth**:
  - Email & Password
  - Google Social Login
  - GitHub Social Login
- **Themes**: Full support for System, Light, and Dark modes.
- **Mobile First**: Fully responsive design with optimized touch interactions.

## Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Components**: [Radix UI](https://www.radix-ui.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **Animations**: [GSAP](https://greensock.com/gsap/) & [Framer Motion](https://www.framer.com/motion/)
- **Auth**: [Better Auth Client](https://www.better-auth.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **AI**: [OpenAI ChatKit](https://chatkit.openai.com/)

## Getting Started

### 1. Installation
```bash
npm install
```

### 2. Environment Setup
Create a `.env.local`:
```env
NEXT_PUBLIC_API_URL=https://todo-api-phase3.vercel.app
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Development
```bash
npm run dev
```

## Build and Deployment
To create a production build:
```bash
npm run build
```
The application is optimized for deployment on Vercel.