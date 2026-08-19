import { defineConfig } from 'cypress';

export default defineConfig({
  projectId: 'vwwffz',
  e2e: {
    // Match VITE_BACKEND_API's localhost origin so the Lax __session cookie
    // established by email sign-in is sent with the subsequent create request.
    baseUrl: 'http://localhost:4050',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
