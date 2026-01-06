# Task Hive - Todo Application

This is a [Next.js](https://nextjs.org) application built with TypeScript, React 19, and Better Auth authentication.

## Hybrid Cloud Integration

This frontend connects to a production backend API deployed at **https://teot-phase2.vercel.app/** for data persistence. All task data is stored in a remote Neon PostgreSQL database.

## Environment Configuration

### Required Environment Variables

Create a `.env.local` file in the project root with the following variables:

```env
# Backend API URL (production)
NEXT_PUBLIC_API_URL=https://teot-phase2.vercel.app/

# Frontend Application URL (local development)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 🔐 Authentication Flow

**No `BETTER_AUTH_SECRET` needed on frontend!** Here's how JWT authentication works:

1. **User Login**: Frontend calls Better Auth's `signIn.email()` endpoint on backend
2. **Backend Signs JWT**: Backend uses its configured `BETTER_AUTH_SECRET` to sign the token
3. **Token Returned**: Backend returns signed JWT to frontend (stored in cookies)
4. **API Requests**: Frontend retrieves JWT via `authClient.token()` and sends as `Authorization: Bearer <token>`
5. **Backend Verifies**: Backend uses its secret to verify incoming Bearer tokens

**Key Point**: The frontend never needs the secret - it only receives and uses pre-signed tokens from the backend.

### Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
