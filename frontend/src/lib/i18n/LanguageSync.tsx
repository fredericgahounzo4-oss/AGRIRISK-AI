import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useTranslation, type Language } from './I18nContext';

/**
 * Applique la langue enregistrée sur le profil utilisateur dès qu'on se
 * connecte (ou qu'on recharge une session déjà authentifiée), pour que
 * la préférence sauvegardée dans les Paramètres soit respectée partout.
 * Ne s'exécute qu'une fois par connexion pour ne pas écraser un choix
 * fait manuellement ensuite via le sélecteur de langue.
 */
export function LanguageSync() {
  const { user, isAuthenticated } = useAuthStore();
  const { setLanguage } = useTranslation();
  const appliedForUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      appliedForUserId.current = null;
      return;
    }
    const lang = user.language;
    if ((lang === 'fr' || lang === 'en') && appliedForUserId.current !== user.id) {
      setLanguage(lang as Language);
      appliedForUserId.current = user.id;
    }
  }, [isAuthenticated, user, setLanguage]);

  return null;
}
