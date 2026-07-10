// src/shared/components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode, useEffect, useState } from 'react';
import { useRouteError, isRouteErrorResponse } from 'react-router-dom';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export type AppTheme = 'orange' | 'blue' | 'purple';

const THEME_STYLES: Record<AppTheme, {
  bg: string;
  button: string;
  buttonHover: string;
  link: string;
  linkHover: string;
}> = {
  orange: {
    bg: 'from-orange-50 via-white to-orange-50',
    button: 'from-orange-500 to-orange-600',
    buttonHover: 'hover:from-orange-600 hover:to-orange-700',
    link: 'text-orange-600',
    linkHover: 'hover:text-orange-700',
  },
  blue: {
    bg: 'from-blue-50 via-white to-blue-50',
    button: 'from-blue-500 to-blue-600',
    buttonHover: 'hover:from-blue-600 hover:to-blue-700',
    link: 'text-blue-600',
    linkHover: 'hover:text-blue-700',
  },
  purple: {
    bg: 'from-purple-50 via-white to-purple-50',
    button: 'from-purple-500 to-purple-600',
    buttonHover: 'hover:from-purple-600 hover:to-purple-700',
    link: 'text-purple-600',
    linkHover: 'hover:text-purple-700',
  },
};

interface ErrorFallbackProps {
  theme: AppTheme;
  detail?: string;
  stack?: string | null;
  onRetry: () => void;
  retryLabel?: string;
  homeHref?: string;
  contactHref?: string;
  /**
   * If set, auto-navigates to homeHref after this many seconds. The person
   * can cancel it any time — this is a safety net for "stuck on a dead page"
   * scenarios, not something that should override someone actively reading
   * the error detail.
   */
  autoRedirectSeconds?: number;
}

/**
 * Shared visual, used by both the class ErrorBoundary (for wrapping a subtree)
 * and RouteErrorBoundary (for react-router-dom's errorElement). Keeping the
 * markup in one place means the three apps stay visually consistent even
 * though they hit this from two different mechanisms.
 */
const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  theme,
  detail,
  stack,
  onRetry,
  retryLabel = 'Try Again',
  homeHref = '/',
  contactHref = '/contact',
  autoRedirectSeconds,
}) => {
  const t = THEME_STYLES[theme];

  const [secondsLeft, setSecondsLeft] = useState<number | null>(autoRedirectSeconds ?? null);

  // Reset the countdown whenever a *new* error instance mounts this fallback
  // (e.g. the person hit "Try Again" and it errored again).
  useEffect(() => {
    setSecondsLeft(autoRedirectSeconds ?? null);
  }, [autoRedirectSeconds, detail]);

  useEffect(() => {
    if (secondsLeft === null) return;
    if (secondsLeft <= 0) {
      window.location.href = homeHref;
      return;
    }
    const timer = setTimeout(() => setSecondsLeft(s => (s ?? 1) - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft, homeHref]);

  const cancelAutoRedirect = () => setSecondsLeft(null);
  return (
    <div className={`min-h-screen bg-gradient-to-br ${t.bg} flex items-center justify-center p-4`}>
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Oops! Something went wrong
        </h1>

        <p className="text-gray-600 mb-6">
          We're sorry, but something unexpected happened. Please try refreshing the page.
        </p>

        {/* Vite's dev flag — process.env.NODE_ENV isn't defined by default in Vite */}
        {import.meta.env.DEV && detail && (
          <div className="mb-6 p-4 bg-red-50 rounded-lg text-left">
            <p className="text-sm font-mono text-red-800 mb-2">{detail}</p>
            {stack && (
              <details className="text-xs text-red-700">
                <summary className="cursor-pointer font-semibold mb-2">
                  Stack trace
                </summary>
                <pre className="whitespace-pre-wrap overflow-auto max-h-40">{stack}</pre>
              </details>
            )}
          </div>
        )}

        {secondsLeft !== null && (
          <p className="text-sm text-gray-500 mb-4">
            Redirecting home in {secondsLeft}s ·{' '}
            <button
              onClick={cancelAutoRedirect}
              className={`${t.link} ${t.linkHover} font-medium underline underline-offset-2`}
            >
              Cancel
            </button>
          </p>
        )}

        <div className="flex gap-3 justify-center">
          <button
            onClick={onRetry}
            className={`flex items-center gap-2 bg-gradient-to-r ${t.button} text-white px-6 py-3 rounded-lg font-semibold ${t.buttonHover} transition-all`}
          >
            <RefreshCw className="w-4 h-4" />
            {retryLabel}
          </button>

          <a
            href={homeHref}
            className="flex items-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-all"
          >
            <Home className="w-4 h-4" />
            Go Home
          </a>
        </div>

        <p className="text-sm text-gray-500 mt-6">
          If this problem persists, please{' '}
          <a href={contactHref} className={`${t.link} ${t.linkHover} font-medium`}>
            contact support
          </a>
        </p>
      </div>
    </div>
  );
};

// ─── Class boundary ─────────────────────────────────────────────────────────
// Wraps a subtree; catches errors thrown during render/lifecycle of its
// children. Use this around a specific widget or section you want isolated
// (e.g. a sidebar), so one broken section doesn't take down the whole page.

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  /** 'orange' for the user app, 'blue' for organizer, 'purple' for admin. */
  theme?: AppTheme;
  homeHref?: string;
  contactHref?: string;
  /** Auto-navigate home after N seconds; omit to disable (default). */
  autoRedirectSeconds?: number;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // TODO: send to error reporting service (e.g., Sentry)
    this.setState({ error, errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <ErrorFallback
          theme={this.props.theme ?? 'orange'}
          detail={this.state.error?.toString()}
          stack={this.state.errorInfo?.componentStack}
          onRetry={this.handleReset}
          homeHref={this.props.homeHref}
          contactHref={this.props.contactHref}
          autoRedirectSeconds={this.props.autoRedirectSeconds}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

// ─── Router error element ───────────────────────────────────────────────────
//
// IMPORTANT: with react-router-dom's data routers (createBrowserRouter /
// createRoutesFromElements), each route has its OWN internal error boundary
// that intercepts render/loader/action errors before they reach an ancestor
// <ErrorBoundary> component higher in the tree. That's exactly why the
// generic "Unexpected Application Error!" page appeared even though
// ErrorBoundary.tsx already existed — nothing had wired it into the router.
//
// Fix: assign this component as `errorElement` on your routes (root route is
// enough to catch everything beneath it, but you can also set it per-route
// for finer-grained fallbacks).
//
//   const router = createBrowserRouter([
//     {
//       path: '/',
//       element: <App />,
//       errorElement: <RouteErrorBoundary theme="blue" />,   // 'blue' for organizer app
//       children: [ ... ],
//     },
//   ]);
//
// Set theme to 'orange' in the user app's router, 'blue' in the organizer
// app's, and 'purple' in the admin app's.

export const RouteErrorBoundary: React.FC<{
  theme?: AppTheme;
  homeHref?: string;
  contactHref?: string;
  /**
   * Auto-navigate home after N seconds. Defaults to 12s in production and
   * disabled in dev — you're actively debugging in dev, so we shouldn't
   * yank the page away while you're reading the stack trace. Pass
   * `autoRedirectSeconds={0}` (or any falsy value) to disable outright.
   */
  autoRedirectSeconds?: number;
}> = ({ theme = 'orange', homeHref, contactHref, autoRedirectSeconds }) => {
  const error = useRouteError();

  let detail: string | undefined;
  if (isRouteErrorResponse(error)) {
    detail = `${error.status} ${error.statusText}`;
  } else if (error instanceof Error) {
    detail = error.toString();
  }

  const resolvedAutoRedirect =
    autoRedirectSeconds !== undefined
      ? (autoRedirectSeconds || undefined)
      : (import.meta.env.DEV ? undefined : 12);

  return (
    <ErrorFallback
      theme={theme}
      detail={detail}
      onRetry={() => window.location.reload()}
      retryLabel="Reload Page"
      homeHref={homeHref}
      contactHref={contactHref}
      autoRedirectSeconds={resolvedAutoRedirect}
    />
  );
};