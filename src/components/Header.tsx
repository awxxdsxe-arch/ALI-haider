import React, { useState } from 'react';
import {
  Search,
  Moon,
  Sun,
  Star,
  Globe,
  Menu,
  X,
  Layers,
  FileImage,
  BookOpen,
  Languages,
  Calculator,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ToolCategory } from '../types';

export const Header: React.FC = () => {
  const {
    theme,
    toggleTheme,
    language,
    setLanguage,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    favorites,
    activeTool,
    closeTool,
    openInfoModal,
  } = useApp();

  const isUrdu = language === 'ur';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const categories: Array<{ id: ToolCategory | 'all' | 'favorites'; labelEn: string; labelUr: string; icon: React.ElementType }> = [
    { id: 'all', labelEn: 'All Tools', labelUr: 'تمام ٹولز', icon: Sparkles },
    { id: 'favorites', labelEn: `Favorites (${favorites.length})`, labelUr: `پسندیدہ (${favorites.length})`, icon: Star },
    { id: 'pdf', labelEn: 'PDF & Documents', labelUr: 'پی ڈی ایف', icon: Layers },
    { id: 'image', labelEn: 'Image Tools', labelUr: 'تصویری ٹولز', icon: FileImage },
    { id: 'study', labelEn: 'Study Center', labelUr: 'تعلیم و مطالعہ', icon: BookOpen },
    { id: 'writing', labelEn: 'Language & Writing', labelUr: 'زبان و تحریر', icon: Languages },
    { id: 'calculator', labelEn: 'Calculators', labelUr: 'کیلکولیٹرز', icon: Calculator },
    { id: 'guides', labelEn: 'Help & Guides', labelUr: 'رہنمائی', icon: HelpCircle },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-stone-950/90 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Navbar Row */}
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo & Brand Identity */}
          <div
            onClick={() => {
              closeTool();
              setActiveCategory('all');
            }}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-extrabold text-xl shadow-md group-hover:scale-105 transition-transform duration-200">
              AH
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-stone-900 dark:text-stone-100">
                  {isUrdu ? 'علی حیدر' : 'Ali Haider'}
                </span>
                <span className="hidden sm:inline-block px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  Helper
                </span>
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium truncate hidden md:block">
                {isUrdu ? 'ہر مفید چیز، ایک ہی جگہ پر۔' : '“Everything Helpful, All in One Place.”'}
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-2 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-stone-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isUrdu
                  ? 'تیس سے زائد ٹولز تلاش کریں...'
                  : 'Search 30+ tools (e.g. merge pdf, resize, cv, percentage)...'
              }
              className="w-full pl-10 pr-9 py-2 rounded-2xl bg-stone-100 dark:bg-stone-900 border border-transparent focus:border-emerald-500 dark:focus:border-emerald-500 text-xs sm:text-sm text-stone-900 dark:text-stone-100 focus:outline-none transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <button
              type="button"
              onClick={() => setLanguage(language === 'en' ? 'ur' : 'en')}
              className="p-2 sm:px-3 sm:py-2 rounded-2xl border border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-900 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              title="Toggle English / اردو"
            >
              <Globe className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">{language === 'en' ? 'اردو' : 'English'}</span>
            </button>

            {/* Dark / Light Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 sm:p-2.5 rounded-2xl border border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-900 text-stone-700 dark:text-stone-300 transition cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-700" />}
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-2xl border border-stone-200 dark:border-stone-800 md:hidden text-stone-700 dark:text-stone-300 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Categories Bar (Desktop horizontal scroll) */}
        <div className="hidden md:flex items-center gap-1.5 py-2.5 overflow-x-auto no-scrollbar border-t border-stone-100 dark:border-stone-900">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id && !activeTool;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  closeTool();
                  setActiveCategory(cat.id);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-900 hover:text-stone-900 dark:hover:text-stone-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-stone-400'}`} />
                <span>{isUrdu ? cat.labelUr : cat.labelEn}</span>
              </button>
            );
          })}
        </div>

        {/* Mobile Slide-down Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-stone-200 dark:border-stone-800 space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 px-2 block">
              {isUrdu ? 'اقسام' : 'Tool Categories'}
            </span>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id && !activeTool;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      closeTool();
                      setActiveCategory(cat.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 text-left transition cursor-pointer ${
                      isActive
                        ? 'bg-emerald-600 text-white'
                        : 'bg-stone-100 dark:bg-stone-900 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{isUrdu ? cat.labelUr : cat.labelEn}</span>
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex justify-around text-xs font-medium text-stone-500">
              <button
                type="button"
                onClick={() => {
                  openInfoModal('about');
                  setMobileMenuOpen(false);
                }}
              >
                About
              </button>
              <button
                type="button"
                onClick={() => {
                  openInfoModal('contact');
                  setMobileMenuOpen(false);
                }}
              >
                Contact
              </button>
              <button
                type="button"
                onClick={() => {
                  openInfoModal('privacy');
                  setMobileMenuOpen(false);
                }}
              >
                Privacy
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
