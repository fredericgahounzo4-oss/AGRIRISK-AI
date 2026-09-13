import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Language, User } from '../types';
import { translations } from '../data/translations';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  isAuthenticated: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const mockAdminUser: User = {
  id: 'admin-1',
  name: 'Admin AgriRisk',
  email: 'admin@agririsk.tg',
  role: 'admin',
  isActive: true,
  createdAt: '2024-01-01',
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('fr');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const t = (key: string): string => {
    return translations[language][key] || translations['fr'][key] || key;
  };

  return (
    <AppContext.Provider value={{
      language,
      setLanguage,
      t,
      currentUser,
      setCurrentUser,
      isAuthenticated: !!currentUser,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};

export { mockAdminUser };
