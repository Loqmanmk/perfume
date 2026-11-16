import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { CartDrawer } from '@/features/cart/CartDrawer';
import { Footer } from './Footer';
import { Header } from './Header';

/** Scrolls to the hash target when there is one, otherwise back to the top on navigation. */
function useScrollRestoration() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView();
      return;
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname, hash]);
}

export function Layout() {
  useScrollRestoration();

  return (
    <div className="grain flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-gold focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-ink-950"
      >
        Skip to content
      </a>
      <Header />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
