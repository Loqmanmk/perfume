import { createBrowserRouter } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { CheckoutPage } from '@/pages/CheckoutPage';
import { HomePage } from '@/pages/HomePage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ProductPage } from '@/pages/ProductPage';
import { ScentFinderPage } from '@/pages/ScentFinderPage';
import { ShopPage } from '@/pages/ShopPage';
import { WishlistPage } from '@/pages/WishlistPage';

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/shop', element: <ShopPage /> },
      { path: '/product/:slug', element: <ProductPage /> },
      { path: '/scent-finder', element: <ScentFinderPage /> },
      { path: '/wishlist', element: <WishlistPage /> },
      { path: '/checkout', element: <CheckoutPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
