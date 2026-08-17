import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  release: `v${import.meta.env.PACKAGE_VERSION}`,
  environment: import.meta.env.MODE,
});

export default Sentry;
