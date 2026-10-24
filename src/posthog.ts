import posthog from 'posthog-js';

const posthogKey = import.meta.env.VITE_POSTHOG_KEY;
const posthogHost = import.meta.env.VITE_POSTHOG_HOST;

const isPlaceholder = (val?: string) =>
  !val || val.includes('your-posthog-host') || val.includes('placeholder') || val.trim() === '';

export const isPostHogConfigured = Boolean(
  posthogKey &&
  posthogHost &&
  !isPlaceholder(posthogKey) &&
  !isPlaceholder(posthogHost)
);

if (isPostHogConfigured) {
  try {
    posthog.init(posthogKey, {
      api_host: posthogHost,
      defaults: '2026-05-30',
      capture_exceptions: {
        capture_unhandled_errors: true,
        capture_unhandled_rejections: true,
        capture_console_errors: false,
      },
    });
  } catch (err) {
    console.warn('PostHog initialization bypassed:', err);
  }
}

export default posthog;
