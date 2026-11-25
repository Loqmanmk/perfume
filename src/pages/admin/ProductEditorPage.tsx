import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PageLoader } from '@/features/auth/RequireAuth';
import { useCatalogue } from '@/features/catalogue/useCatalogue';
import { ProductForm } from '@/features/admin/product-form/ProductForm';
import { emptyProductValues, toFormValues } from '@/features/admin/product-form/productFormValues';
import { useSaveProduct } from '@/features/admin/useAdminMutations';
import { usePageTitle } from '@/lib/hooks/usePageTitle';
import { NotFoundPage } from '@/pages/NotFoundPage';
import type { DashboardNotice } from './AdminDashboardPage';

/** Create a product (`/admin/products/new`) or edit one (`/admin/products/:id`). */
export function ProductEditorPage() {
  const { id } = useParams();
  const isNew = id === undefined;
  usePageTitle(isNew ? 'New product' : 'Edit product');

  const navigate = useNavigate();
  const { repository, isLoading } = useCatalogue();
  const product = isNew ? undefined : repository.getById(id);
  const save = useSaveProduct(product?.id);

  if (!isNew && isLoading) return <PageLoader />;
  if (!isNew && !product) return <NotFoundPage />;

  return (
    <div className="container-page pb-24 pt-32 md:pt-36">
      <Link to="/admin" className="inline-flex min-h-11 items-center gap-2 text-sm text-muted transition-colors hover:text-cream">
        <ArrowLeft size={16} aria-hidden /> Back to dashboard
      </Link>
      <p className="eyebrow mt-4">{isNew ? 'New product' : 'Edit product'}</p>
      <h1 className="mt-3 text-5xl md:text-6xl">{product?.name ?? 'Add a fragrance'}</h1>

      <div className="mt-10">
        <ProductForm
          key={product?.id ?? 'new'}
          initialValues={product ? toFormValues(product) : emptyProductValues()}
          submitLabel={isNew ? 'Publish product' : 'Save changes'}
          onSubmit={async (values) => {
            const saved = await save.mutateAsync(values);
            const notice: DashboardNotice = {
              text: isNew ? `“${saved.name}” is now live in the shop.` : `“${saved.name}” was updated.`,
              slug: saved.slug,
            };
            navigate('/admin', { state: { notice } });
          }}
        />
      </div>
    </div>
  );
}
