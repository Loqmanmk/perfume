import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/api/queryClient';
import { catalogueApi } from '@/services/catalogueApi';
import { InMemoryProductRepository, type ProductRepository } from '@/services/productRepository';

export interface Catalogue {
  repository: ProductRepository;
  isLoading: boolean;
  error: Error | null;
}

const EMPTY = new InMemoryProductRepository([]);

/**
 * The whole catalogue, fetched once and cached. Components query it through the
 * `ProductRepository` interface, so they never know it came over the network.
 */
export function useCatalogue(): Catalogue {
  const { data, isPending, error } = useQuery({ queryKey: queryKeys.products, queryFn: catalogueApi.list });
  const repository = useMemo(() => (data ? new InMemoryProductRepository(data) : EMPTY), [data]);
  return { repository, isLoading: isPending, error };
}
