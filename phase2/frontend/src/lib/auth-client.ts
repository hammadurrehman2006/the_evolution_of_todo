import { createAuthClient, type BaseClientOptions } from 'better-auth/client';
import { getBaseUrl } from './api/config';

// Create the Better Auth client
const betterAuthClient = createAuthClient({
  baseURL: getBaseUrl(), // Use the same base URL as your API
  fetch: globalThis.fetch,
} satisfies BaseClientOptions);

// Create a wrapper that integrates with the session provider
export const authClient = {
  ...betterAuthClient,
  // Override signIn methods to work with our session provider
  signIn: {
    ...betterAuthClient.signIn,
    email: async (params: { email: string; password: string; callbackURL?: string }) => {
      const result = await betterAuthClient.signIn.email(params);
      if (result.session && result.user) {
        // Store user and token in localStorage for the session provider
        localStorage.setItem('user', JSON.stringify({
          id: result.user.id,
          email: result.user.email,
          name: `${result.user.firstName || ''} ${result.user.lastName || ''}`.trim() || result.user.email?.split('@')[0]
        }));
        localStorage.setItem('access_token', result.session.token);
      }
      return result;
    }
  },
  // Override signUp methods to work with our session provider
  signUp: {
    ...betterAuthClient.signUp,
    email: async (params: { email: string; password: string; firstName: string; lastName: string; callbackURL?: string }) => {
      const result = await betterAuthClient.signUp.email(params);
      if (result.session && result.user) {
        // Store user and token in localStorage for the session provider
        localStorage.setItem('user', JSON.stringify({
          id: result.user.id,
          email: result.user.email,
          name: `${result.user.firstName || ''} ${result.user.lastName || ''}`.trim() || result.user.email?.split('@')[0]
        }));
        localStorage.setItem('access_token', result.session.token);
      }
      return result;
    }
  },
  // Override signOut to clear session provider data
  signOut: async () => {
    await betterAuthClient.signOut();
    // Clear session provider data
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
  }
};

// Export the type for type safety
export type { AuthClient } from 'better-auth/client';