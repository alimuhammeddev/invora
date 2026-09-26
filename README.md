This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

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

## Firebase Authentication

Create `.env.local` in the project root and add the web app configuration from Firebase Console > Project settings > Your apps:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

These `NEXT_PUBLIC_` values are Firebase web client configuration, not service-account credentials.

In Firebase Console, enable **Email/Password** and **Google** under Authentication > Sign-in method. Add `localhost` and your deployed hostname to Authentication > Settings > Authorized domains. Restart the development server after changing `.env.local`.

Create a Cloud Firestore database in Firebase Console. Publish the rules in [`firestore.rules`](firestore.rules) from Firestore Database > Rules. Invoices are saved under `users/{userId}/invoices`, so each user can access only their own records. Copying an invoice link creates a public, read-only snapshot under `publicInvoices`; anyone with that link can view the invoice, excluding the recipient email. Account deletion is a soft delete: the profile and invoices remain stored, access is blocked while deleted, and signing up again with the same verified credentials restores the same account and invoices. Republish the rules after changing them for these access checks to take effect.

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
