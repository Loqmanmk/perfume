import { lazy, Suspense, type ComponentType, type ReactNode } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { PageLoader, RequireAuth } from '@/features/auth/RequireAuth';
import { AccountPage } from '@/pages/AccountPage';
import { AuthPage } from '@/pages/AuthPage';
import { CheckoutPage } from '@/pages/CheckoutPage';
import { HomePage } from '@/pages/HomePage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ProductPage } from '@/pages/ProductPage';
import { ScentFinderPage } from '@/pages/ScentFinderPage';
import { ShopPage } from '@/pages/ShopPage';
import { WishlistPage } from '@/pages/WishlistPage';

/** Loads a page only when it is visited. Keeps admin-only code out of the shoppers' bundle. */
function lazyPage<Module>(load: () => Promise<Module>, pick: (module: Module) => ComponentType) {
  const Page = lazy(async () => ({ default: pick(await load()) }));
  return (
    <Suspense fallback={<PageLoader />}>
      <Page />
    </Suspense>
  );
}

const adminDashboard = lazyPage(() => import('@/pages/admin/AdminDashboardPage'), (m) => m.AdminDashboardPage);
const productEditor = lazyPage(() => import('@/pages/admin/ProductEditorPage'), (m) => m.ProductEditorPage);

const admin = (page: ReactNode) => <RequireAuth role="admin">{page}</RequireAuth>;

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      // Shoppers
      { path: '/', element: <HomePage /> },
      { path: '/shop', element: <ShopPage /> },
      { path: '/product/:slug', element: <ProductPage /> },
      { path: '/scent-finder', element: <ScentFinderPage /> },
      { path: '/wishlist', element: <WishlistPage /> },
      { path: '/checkout', element: <CheckoutPage /> },

      // Accounts
      { path: '/login', element: <AuthPage key="login" mode="login" /> },
      { path: '/register', element: <AuthPage key="register" mode="register" /> },
      { path: '/account', element: <RequireAuth><AccountPage /></RequireAuth> },

      // Store admin
      { path: '/admin', element: admin(adminDashboard) },
      { path: '/admin/products/new', element: admin(productEditor) },
      { path: '/admin/products/:id', element: admin(productEditor) },

      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
