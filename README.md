# LockIn - Focus & Productivity App

A Next.js-based productivity application that helps users stay focused with advanced task management, calendar integration, and priority matrices.

## Features

- **Task Management**: Create, organize, and track tasks with priority levels
- **Priority Matrix**: Visual task prioritization using the Eisenhower Matrix
- **Calendar Integration**: Schedule and manage events seamlessly
- **Analytics**: Track productivity patterns with PostHog integration
- **User Authentication**: Secure login with Firebase Auth

## Getting Started

### Prerequisites

- Node.js 18+
- npm/yarn/pnpm
- PostHog account (for analytics)
- Firebase project (for auth and database)

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# PostHog Configuration
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_project_api_key
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# Firebase Configuration (add your Firebase config here)
# NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
# NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
# ... other Firebase config
```

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up your environment variables (see above)
4. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Analytics Integration

This project uses PostHog for analytics tracking. Key events tracked include:

- Task creation, completion, and updates
- Priority matrix interactions
- Calendar usage
- User authentication events

Analytics events are defined in `lib/analytics.js` for consistent naming across the application.

## Project Structure

```
├── app/                  # Next.js app router pages
├── components/           # Reusable React components
├── context/             # React context providers
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions and configurations
└── public/              # Static assets
```

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **Analytics**: PostHog
- **UI Components**: Custom components with Framer Motion
- **AI Integration**: Google Generative AI

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs)
- [PostHog Documentation](https://posthog.com/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
