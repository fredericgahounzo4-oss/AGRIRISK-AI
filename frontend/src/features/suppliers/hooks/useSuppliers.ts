import { useQuery } from '@tanstack/react-query';
import { suppliersApi } from '../api/suppliersApi';

export function useSuppliers(category?: string) {
  return useQuery({
    queryKey: ['suppliers', category],
    queryFn: () => suppliersApi.getAll({ category }),
  });
}
