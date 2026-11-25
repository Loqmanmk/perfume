import type { ReactNode } from 'react';
import { LockKeyhole } from 'lucide-react';
import { Navigate, useLocation } from 'react-router-dom';
import { ButtonLink } from '@/components/ui/Button';
import type { Role } from '@/domain/user';
import { usePageTitle } from '@/lib/hooks/usePageTitle';
import { useSession } from './useSession';

export function PageLoader() {
  return (
    <div className="grid min-h-[80dvh] place-items-center" role="status" aria-label="Loading">
      <span className="size-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
    </div>
  );
}

function AccessDenied() {
  usePageTitle('No access');
  return (
    <div className="container-page grid min-h-[80dvh] place-items-center pt-18 text-center">
      <div>
        <LockKeyhole size={36} strokeWidth={1.3} className="mx-auto text-gold" aria-hidden />
        <h1 className="mt-5 text-5xl">This area is for the store team</h1>
        <p className="mt-3 text-muted">Your account does not have access to this page.</p>
        <ButtonLink to="/" className="mt-8">
          Back to the store
        </ButtonLink>
      </div>
    </div>
  );
}

interface RequireAuthProps {
  /** When set, only users with this role may enter. */
  role?: Role;
  children: ReactNode;
}

/**
 * Sends signed-out visitors to the login page and back afterwards.
 * This only shapes the interface — the API enforces every permission itself.
 */
export function RequireAuth({ role, children }: RequireAuthProps) {
  const { user, isLoading } = useSession();
  const location = useLocation();

  if (isLoading) return <PageLoader />;

  if (!user) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  if (role && user.role !== role) return <AccessDenied />;

  return children;
}
