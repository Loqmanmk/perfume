import type { Product } from '@/domain/product';
import type { ProductFormValues } from '@/domain/productSchema';
import { apiRequest } from '@/lib/api/http';

export type UploadKind = 'image' | 'model';

export const catalogueApi = {
  async list(): Promise<Product[]> {
    return (await apiRequest<{ products: Product[] }>('/products')).products;
  },

  async create(values: ProductFormValues): Promise<Product> {
    return (await apiRequest<{ product: Product }>('/products', { method: 'POST', json: values })).product;
  },

  async update(id: string, values: ProductFormValues): Promise<Product> {
    return (await apiRequest<{ product: Product }>(`/products/${id}`, { method: 'PUT', json: values })).product;
  },

  remove(id: string): Promise<void> {
    return apiRequest(`/products/${id}`, { method: 'DELETE' });
  },

  /** Uploads a photo or 3D model and returns its public URL. */
  async upload(file: Blob, kind: UploadKind, fileName = 'upload'): Promise<string> {
    const form = new FormData();
    form.set('kind', kind);
    form.set('file', file, fileName);
    return (await apiRequest<{ url: string }>('/uploads', { method: 'POST', body: form })).url;
  },
};
