import { useQuery } from '@tanstack/react-query';
import { suppliersApi } from '../api/suppliersApi';
import type { SupplierQuery } from '../types';

/** Annuaire des fournisseurs, rafraîchi automatiquement (nouveaux inscrits, stocks, ventes). */
export function useSuppliers(query?: SupplierQuery) {
  return useQuery({
    queryKey: ['suppliers', query?.category ?? '', query?.lat ?? null, query?.lng ?? null],
    queryFn: () => suppliersApi.getAll(query),
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });
}
