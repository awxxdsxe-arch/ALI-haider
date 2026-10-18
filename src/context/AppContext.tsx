import React, { createContext, useContext, useState, useEffect } from 'react';
import { ToolCategory, ToolDefinition, CookiePreferences, Language } from '../types';
import { TOOLS } from '../data/tools';

interface AppContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  activeCategory: ToolCategory | 'all' | 'favorites';
  setActiveCategory: (cat: ToolCategory | 'all' | 'favorites') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeTool: ToolDefinition | null;
  openTool: (toolId: string) => void;
  closeTool: () => void;
  favorites: string[];
  toggleFavorite: (toolId: string) => void;
  recentlyUsed: string[];
  activeInfoModal: 'about' | 'contact' | 'privacy' | 'terms' | 'cookies' | 'reviews' | null;
  openInfoModal: (modal: 'about' | 'contact' | 'privacy' | 'terms' | 'cookies' | 'reviews') => void;
  closeInfoModal: () => void;
  cookiePrefs: CookiePreferences;
  saveCookiePreferences: (prefs: Partial<CookiePreferences>) => void;
  showCookieBanner: boolean;
  setShowCookieBanner: (show: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('ah_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Language state
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('ah_lang');
    return (saved === 'ur' || saved === 'en') ? saved : 'en';
  });

  // Category and search
  const [activeCategory, setActiveCategory] = useState<ToolCategory | 'all' | 'favorites'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTool, setActiveTool] = useState<ToolDefinition | null>(null);

  // Informational modals
  const [activeInfoModal, setActiveInfoModal] = useState<'about' | 'contact' | 'privacy' | 'terms' | 'cookies' | 'reviews' | null>(null);

  // Favorites
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('ah_favorites');
      return saved ? JSON.parse(saved) : ['pdf-merge', 'image-compress', 'calc-percentage', 'study-math'];
    } catch {
      return ['pdf-merge', 'image-compress', 'calc-percentage', 'study-math'];
    }
  });

  // Recently used
  const [recentlyUsed, setRecentlyUsed] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('ah_recent');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Cookie preferences
  const [cookiePrefs, setCookiePrefs] = useState<CookiePreferences>(() => {
    try {
      const saved = localStorage.getItem('ah_cookies');
      return saved ? JSON.parse(saved) : { essential: true, analytics: false, marketing: false, hasInteracted: false };
    } catch {
      return { essential: true, analytics: false, marketing: false, hasInteracted: false };
    }
  });

  const [showCookieBanner, setShowCookieBanner] = useState(!cookiePrefs.hasInteracted);

  // Apply theme class to <html>
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('ah_theme', theme);
  }, [theme]);

  // Apply language and RTL/LTR direction
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('lang', language);
    root.setAttribute('dir', language === 'ur' ? 'rtl' : 'ltr');
    localStorage.setItem('ah_lang', language);
  }, [language]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const openTool = (toolId: string) => {
    const found = TOOLS.find((t) => t.id === toolId);
    if (found) {
      setActiveTool(found);
      // Track recently used
      setRecentlyUsed((prev) => {
        const next = [toolId, ...prev.filter((id) => id !== toolId)].slice(0, 8);
        try {
          localStorage.setItem('ah_recent', JSON.stringify(next));
        } catch {}
        return next;
      });
      // Scroll to tool view smoothly or top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const closeTool = () => {
    setActiveTool(null);
  };

  const toggleFavorite = (toolId: string) => {
    setFavorites((prev) => {
      const next = prev.includes(toolId) ? prev.filter((id) => id !== toolId) : [...prev, toolId];
      try {
        localStorage.setItem('ah_favorites', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const saveCookiePreferences = (prefs: Partial<CookiePreferences>) => {
    const updated: CookiePreferences = {
      ...cookiePrefs,
      ...prefs,
      essential: true, // always required
      hasInteracted: true,
    };
    setCookiePrefs(updated);
    setShowCookieBanner(false);
    try {
      localStorage.setItem('ah_cookies', JSON.stringify(updated));
    } catch {}
  };

  const openInfoModal = (modal: 'about' | 'contact' | 'privacy' | 'terms' | 'cookies' | 'reviews') => {
    setActiveInfoModal(modal);
  };

  const closeInfoModal = () => {
    setActiveInfoModal(null);
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        language,
        setLanguage,
        activeCategory,
        setActiveCategory,
        searchQuery,
        setSearchQuery,
        activeTool,
        openTool,
        closeTool,
        favorites,
        toggleFavorite,
        recentlyUsed,
        activeInfoModal,
        openInfoModal,
        closeInfoModal,
        cookiePrefs,
        saveCookiePreferences,
        showCookieBanner,
        setShowCookieBanner,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
