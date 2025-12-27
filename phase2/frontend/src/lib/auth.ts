import { betterAuth } from 'better-auth';
import { neon } from '@neondatabase/serverless';
import { neonAdapter } from '@better-auth/neon-adapter';

// Initialize Neon database connection
const sql = neon(process.env.DATABASE_URL || '');

// Create Better Auth instance with Neon adapter
export const auth = betterAuth({
  database: neonAdapter(sql, {
    // Optional: customize table names if needed
    // user: 'custom_users',
    // session: 'custom_sessions',
  }),
  secret: process.env.AUTH_SECRET || 'fallback-auth-secret-for-development',
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true in production for email verification
    minPasswordLength: 8,
  },
  socialProviders: {
    // Add social providers as needed
    // google: {
    //   clientId: process.env.GOOGLE_CLIENT_ID || '',
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    // },
    // github: {
    //   clientId: process.env.GITHUB_CLIENT_ID || '',
    //   clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    // },
  },
  // Session configuration
  session: {
    expiresIn: 7 * 24 * 60 * 60, // 7 days
    slidingExpiration: true, // Refresh session on activity
    updateAge: 24 * 60 * 60, // Update session every 24 hours
  },
  // Account management
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ['email-password'], // Link accounts from trusted providers
    },
  },
  // User configuration
  user: {
    nameField: 'name',
    fields: {
      // Additional user fields can be added here
    },
  },
  // Email configuration (optional)
  email: {
    // provider: {
    //   type: 'smtp',
    //   host: process.env.SMTP_HOST || '',
    //   port: parseInt(process.env.SMTP_PORT || '587'),
    //   auth: {
    //     user: process.env.SMTP_USER || '',
    //     pass: process.env.SMTP_PASS || '',
    //   },
    // },
    // From address for emails
    // from: process.env.SMTP_FROM || 'noreply@example.com',
  },
  // Rate limiting (optional)
  rateLimit: {
    window: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
  },
  // Advanced security options
  advanced: {
    // Prevent concurrent sessions for the same user
    singleSessionPerUser: false,
    // Enable/disable password reset
    passwordResetEnabled: true,
    // Enable/disable account deletion
    accountDeletionEnabled: true,
  },
  // Hooks for custom logic
  hooks: {
    createUser: async (user) => {
      // Add custom logic when a user is created
      console.log(`New user created: ${user.email}`);
    },
    deleteUser: async (user) => {
      // Add custom logic when a user is deleted
      console.log(`User deleted: ${user.email}`);
    },
  },
});

// Export the type for client-side usage
export type Auth = typeof auth;