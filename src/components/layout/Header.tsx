import { useEffect, useRef, useState } from 'react';
import { Heart, LayoutDashboard, Menu, ShoppingBag, UserRound, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { NAV_LINKS, SITE } from '@/config/site';
import { useSession } from '@/features/auth/useSession';
import { useCart } from '@/features/cart/useCart';
import { cn } from '@/lib/cn';
import { useModalBehaviour } from '@/lib/hooks/useModalBehaviour';
import { useUiStore } from '@/store/uiStore';
import { useWishlistStore } from '@/store/wishlistStore';

const SCROLL_THRESHOLD = 24;

function useHasScrolled(): boolean {
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const update = () => setHasScrolled(window.scrollY > SCROLL_THRESHOLD);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  return hasScrolled;
}

function CountBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span
      aria-hidden
      className="absolute -right-0.5 -top-0.5 grid min-w-4.5 place-items-center rounded-full bg-gold px-1 text-[0.62rem] font-bold leading-[1.125rem] text-ink-950"
    >
      {count}
    </span>
  );
}

const iconButtonClass =
  'relative grid size-11 place-items-center rounded-full text-cream transition-colors hover:text-gold';

interface MenuLink {
  to: string;
  label: string;
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  links: readonly MenuLink[];
}

function MobileMenu({ isOpen, onClose, links }: MobileMenuProps) {
  const panel = useRef<HTMLDivElement>(null);
  useModalBehaviour(isOpen, onClose, panel);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={panel}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="fixed inset-0 z-50 flex flex-col bg-ink-950 px-5 pb-10 pt-4 md:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <button type="button" onClick={onClose} className={cn(iconButtonClass, 'self-end')} aria-label="Close menu">
            <X size={22} aria-hidden />
          </button>
          <nav aria-label="Mobile" className="mt-10 flex flex-col gap-2">
            {links.map((link, index) => (
              <motion.div
                key={link.to}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.06 * index + 0.1, duration: 0.5 }}
              >
                <Link to={link.to} onClick={onClose} className="block py-2 font-display text-5xl hover:text-gold">
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </nav>
          <p className="mt-auto text-sm text-muted">{SITE.supportEmail}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Header() {
  const hasScrolled = useHasScrolled();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { itemCount } = useCart();
  const wishlistCount = useWishlistStore((state) => state.productIds.length);
  const openCart = useUiStore((state) => state.openCart);
  const { user, isAdmin } = useSession();
  const { pathname } = useLocation();

  const accountLink: MenuLink = user ? { to: '/account', label: 'Account' } : { to: '/login', label: 'Sign in' };
  const mobileLinks: MenuLink[] = [
    ...NAV_LINKS,
    { to: '/wishlist', label: 'Wishlist' },
    accountLink,
    ...(isAdmin ? [{ to: '/admin', label: 'Dashboard' }] : []),
  ];

  useEffect(() => setIsMenuOpen(false), [pathname]);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-40 border-b transition-[background-color,border-color,backdrop-filter] duration-500',
        hasScrolled
          ? 'hairline bg-ink-950/80 backdrop-blur-xl'
          : 'border-transparent bg-transparent',
      )}
    >
      <div className="container-page flex h-18 items-center justify-between">
        <Link
          to="/"
          className="font-display text-2xl font-semibold uppercase tracking-[0.35em]"
          aria-label={`${SITE.name} — home`}
        >
          {SITE.name}
        </Link>

        <nav aria-label="Main" className="absolute left-1/2 hidden -translate-x-1/2 md:block">
          <ul className="flex items-center gap-10">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    cn(
                      'text-[0.72rem] font-semibold uppercase tracking-[0.22em] transition-colors hover:text-gold',
                      isActive && !link.to.includes('#') ? 'text-gold' : 'text-cream',
                    )
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center">
          {isAdmin && (
            <Link
              to="/admin"
              className="mr-2 hidden min-h-11 items-center gap-2 rounded-full border border-gold/40 px-4 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-gold transition-colors hover:bg-gold hover:text-ink-950 md:flex"
            >
              <LayoutDashboard size={15} aria-hidden /> Dashboard
            </Link>
          )}
          <Link
            to={accountLink.to}
            className={cn(iconButtonClass, 'hidden md:grid')}
            aria-label={user ? `Your account, signed in as ${user.name}` : 'Sign in'}
          >
            <UserRound size={20} aria-hidden />
          </Link>
          <Link
            to="/wishlist"
            className={cn(iconButtonClass, 'hidden md:grid')}
            aria-label={`Wishlist, ${wishlistCount} ${wishlistCount === 1 ? 'item' : 'items'}`}
          >
            <Heart size={20} aria-hidden />
            <CountBadge count={wishlistCount} />
          </Link>
          <button
            type="button"
            onClick={openCart}
            className={iconButtonClass}
            aria-label={`Open bag, ${itemCount} ${itemCount === 1 ? 'item' : 'items'}`}
          >
            <ShoppingBag size={20} aria-hidden />
            <CountBadge count={itemCount} />
          </button>
          <button
            type="button"
            onClick={() => setIsMenuOpen(true)}
            className={cn(iconButtonClass, 'md:hidden')}
            aria-label="Open menu"
            aria-expanded={isMenuOpen}
          >
            <Menu size={22} aria-hidden />
          </button>
        </div>
      </div>

      <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} links={mobileLinks} />
    </header>
  );
}
