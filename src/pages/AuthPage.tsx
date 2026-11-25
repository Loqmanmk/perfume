import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Reveal } from '@/components/ui/Reveal';
import type { PublicUser } from '@/domain/user';
import { LoginForm, RegisterForm } from '@/features/auth/AuthForms';
import { PageLoader } from '@/features/auth/RequireAuth';
import { useSession } from '@/features/auth/useSession';
import { safeRedirect } from '@/lib/forms';
import { usePageTitle } from '@/lib/hooks/usePageTitle';

type Mode = 'login' | 'register';

const COPY: Record<Mode, { eyebrow: string; title: string; switchText: string; switchLink: string; switchTo: string }> = {
  login: {
    eyebrow: 'Welcome back',
    title: 'Sign in',
    switchText: 'New to Nuée?',
    switchLink: 'Create an account',
    switchTo: '/register',
  },
  register: {
    eyebrow: 'Join the house',
    title: 'Create your account',
    switchText: 'Already have an account?',
    switchLink: 'Sign in',
    switchTo: '/login',
  },
};

/** Where to go after signing in when no page asked for it. */
const homeFor = (user: PublicUser) => (user.role === 'admin' ? '/admin' : '/account');

export function AuthPage({ mode }: { mode: Mode }) {
  const copy = COPY[mode];
  usePageTitle(copy.title);

  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirectParam = params.get('redirect');
  const { user, isLoading } = useSession();

  const goNext = (signedIn: PublicUser) =>
    navigate(safeRedirect(redirectParam, homeFor(signedIn)), { replace: true });

  if (isLoading) return <PageLoader />;
  if (user) return <Navigate to={safeRedirect(redirectParam, homeFor(user))} replace />;

  const switchHref = redirectParam ? `${copy.switchTo}?redirect=${encodeURIComponent(redirectParam)}` : copy.switchTo;

  return (
    <div className="container-page grid min-h-dvh place-items-center pb-20 pt-32">
      <Reveal className="w-full max-w-md">
        <p className="eyebrow text-center">{copy.eyebrow}</p>
        <h1 className="mt-4 text-center text-5xl md:text-6xl">{copy.title}</h1>

        <div className="hairline mt-10 rounded-3xl border bg-ink-900/70 p-6 backdrop-blur md:p-8">
          {mode === 'login' ? <LoginForm onSuccess={goNext} /> : <RegisterForm onSuccess={goNext} />}
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          {copy.switchText}{' '}
          <Link to={switchHref} className="font-semibold text-cream underline-offset-4 hover:text-gold hover:underline">
            {copy.switchLink}
          </Link>
        </p>
      </Reveal>
    </div>
  );
}
