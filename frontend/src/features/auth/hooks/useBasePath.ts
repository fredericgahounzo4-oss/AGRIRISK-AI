import { useAuthStore } from '../store/authStore';

/** Préfixe du portail de l'utilisateur connecté ('/fournisseur' ou '/app'),
 *  pour que les pages partagées (Diagnostic IA, Assistant IA, Messages…)
 *  renvoient chacun vers son propre espace. */
export function useBasePath(): '/fournisseur' | '/app' {
  const role = useAuthStore((s) => s.user?.role);
  return role === 'supplier' ? '/fournisseur' : '/app';
}
