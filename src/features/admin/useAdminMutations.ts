import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { OrderStatus } from '@/domain/order';
import type { ProductInput } from '@/domain/productSchema';
import { queryKeys } from '@/lib/api/queryClient';
import { catalogueApi } from '@/services/catalogueApi';
import { orderApi } from '@/services/orderApi';

/** Creates a product, or updates it when an id is given. Refreshes the storefront either way. */
export function useSaveProduct(productId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: ProductInput) =>
      productId ? catalogueApi.update(productId, values) : catalogueApi.create(values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.products }),
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: catalogueApi.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.products }),
  });
}

export function useSetOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) => orderApi.setStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  });
}
