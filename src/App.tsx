import React, { useMemo } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ToolCard } from './components/ToolCard';
import { CookieBanner } from './components/CookieBanner';
import { ReviewsSection } from './components/ReviewsSection';
import { AboutModal, ContactModal, PrivacyModal, TermsModal } from './components/modals/InfoModals';
import { PdfTools } from './components/tools/PdfTools';
import { ImageTools } from './components/tools/ImageTools';
import { StudyTools } from './components/tools/StudyTools';
import { WritingTools } from './components/tools/WritingTools';
import { CalculatorTools } from './components/tools/CalculatorTools';
import { HelpCenter } from './components/tools/HelpCenter';
import { TOOLS } from './data/tools';
import {
  ArrowLeft,
  Star,
  Search,
  Sparkles,
  Layers,
  FileImage,
  BookOpen,
  Languages,
  Calculator,
  HelpCircle,
  ShieldCheck,
  Zap,
  Globe,
} from 'lucide-react';

const MainContent: React.FC = () => {
  const {
    activeTool,
    closeTool,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    favorites,
    toggleFavorite,
    recentlyUsed,
    openTool,
    activeInfoModal,
    openInfoModal,
    language,
  } = useApp();

  const isUrdu = language === 'ur';

  // Filter tools by active category & search query
  const filteredTools = useMemo(() => {
    return TOOLS.filter((tool) => {
      // Category filter
      if (activeCategory === 'favorites') {
        if (!favorites.includes(tool.id)) return false;
      } else if (activeCategory !== 'all') {
        if (tool.category !== activeCategory) return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = tool.name.toLowerCase().includes(q) || (tool.nameUrdu && tool.nameUrdu.includes(q));
        const matchDesc = tool.description.toLowerCase().includes(q) || (tool.descriptionUrdu && tool.descriptionUrdu.includes(q));
        const matchCat = tool.category.toLowerCase().includes(q);
        const matchBadge = tool.badge?.toLowerCase().includes(q);
        return matchName || matchDesc || matchCat || matchBadge;
      }

      return true;
    });
  }, [activeCategory, searchQuery, favorites]);

  // Recently used tools definitions
  const recentToolItems = useMemo(() => {
    return recentlyUsed
      .map((id) => TOOLS.find((t) => t.id === id))
      .filter((t): t is typeof TOOLS[0] => t !== undefined);
  }, [recentlyUsed]);

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* VIEW 1: ACTIVE TOOL WORKSPACE */}
        {activeTool ? (
          <div className="space-y-6">
            {/* Tool Navigation Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 rounded-3xl shadow-xs">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={closeTool}
                  className="p-2.5 rounded-2xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 transition cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{isUrdu ? 'تمام ٹولز' : 'All Tools'}</span>
                </button>

                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
                      {isUrdu && activeTool.nameUrdu ? activeTool.nameUrdu : activeTool.name}
                    </h1>
                    {activeTool.badge && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                        {activeTool.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    {isUrdu && activeTool.descriptionUrdu ? activeTool.descriptionUrdu : activeTool.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => toggleFavorite(activeTool.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition cursor-pointer ${
                    favorites.includes(activeTool.id)
                      ? 'border-amber-300 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                      : 'border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400'
                  }`}
                >
                  <Star className={`w-3.5 h-3.5 ${favorites.includes(activeTool.id) ? 'fill-amber-400 text-amber-400' : ''}`} />
                  <span>{favorites.includes(activeTool.id) ? (isUrdu ? 'پسندیدہ' : 'Favorited') : (isUrdu ? 'پسند کریں' : 'Favorite')}</span>
                </button>
              </div>
            </div>

            {/* Render Tool Workspace */}
            <div className="transition-all duration-300">
              {activeTool.category === 'pdf' && <PdfTools toolId={activeTool.id} />}
              {activeTool.category === 'image' && <ImageTools toolId={activeTool.id} />}
              {activeTool.category === 'study' && <StudyTools toolId={activeTool.id} />}
              {activeTool.category === 'writing' && <WritingTools toolId={activeTool.id} />}
              {activeTool.category === 'calculator' && <CalculatorTools toolId={activeTool.id} />}
              {activeTool.category === 'guides' && <HelpCenter toolId={activeTool.id} />}
            </div>
          </div>
        ) : (
          /* VIEW 2: DASHBOARD & TOOL DIRECTORY */
          <div className="space-y-10">
            {/* Hero Welcome Banner */}
            <div className="relative rounded-3xl bg-gradient-to-br from-stone-900 via-stone-800 to-emerald-950 text-white p-8 sm:p-12 overflow-hidden shadow-lg">
              <div className="relative z-10 max-w-3xl space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-emerald-300 text-xs font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Free Universal Utility Suite</span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                  {isUrdu ? (
                    <>
                      ہر مفید چیز، <span className="text-emerald-400">ایک ہی جگہ پر۔</span>
                    </>
                  ) : (
                    <>
                      Everything Helpful, <span className="text-emerald-400">All in One Place.</span>
                    </>
                  )}
                </h1>

                <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-2xl">
                  {isUrdu
                    ? 'پی ڈی ایف جوڑیں، سائز کم کریں، تصاویر بدلیں، تعلیمی سوالات حل کریں، حساب کتاب کریں اور سی وی بنائیں — تیز رفتار اور نجی طور پر۔'
                    : 'Merge and split PDFs, compress images, solve curriculum math, draft professional CVs, translate text, and calculate finances directly inside your browser. No accounts or paywalls.'}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-semibold text-stone-300">
                  <span className="flex items-center gap-1.5 bg-stone-800/80 px-3 py-1.5 rounded-xl border border-stone-700/60">
                    <Zap className="w-3.5 h-3.5 text-emerald-400" />
                    Browser-Side Private Processing
                  </span>
                  <span className="flex items-center gap-1.5 bg-stone-800/80 px-3 py-1.5 rounded-xl border border-stone-700/60">
                    <Globe className="w-3.5 h-3.5 text-teal-400" />
                    English & Urdu Dual Language
                  </span>
                  <span className="flex items-center gap-1.5 bg-stone-800/80 px-3 py-1.5 rounded-xl border border-stone-700/60">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    30+ Precision Tools
                  </span>
                </div>
              </div>

              {/* Decorative background glow */}
              <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
            </div>

            {/* Recently Used Bar (if any) */}
            {recentToolItems.length > 0 && !searchQuery && (
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500 px-1">
                  {isUrdu ? 'حالیہ استعمال شدہ ٹولز' : 'Recently Used'}
                </span>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                  {recentToolItems.map((tool) => (
                    <button
                      key={tool.id}
                      type="button"
                      onClick={() => openTool(tool.id)}
                      className="px-3.5 py-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-emerald-500 rounded-2xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap shadow-2xs transition cursor-pointer"
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>{isUrdu && tool.nameUrdu ? tool.nameUrdu : tool.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tools Grid Section */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200/80 dark:border-stone-800/80 pb-4">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
                    {activeCategory === 'all'
                      ? isUrdu ? 'تمام دستیاب ٹولز' : 'All Available Tools'
                      : activeCategory === 'favorites'
                      ? isUrdu ? 'آپ کے پسندیدہ ٹولز' : 'Your Pinned Favorites'
                      : TOOLS.find((t) => t.category === activeCategory)?.name || activeCategory}
                  </h2>
                  <p className="text-xs text-stone-500">
                    {filteredTools.length} {isUrdu ? 'ٹولز دستیاب ہیں' : 'tools ready to use'}
                  </p>
                </div>

                {searchQuery && (
                  <div className="flex items-center gap-2 text-xs text-stone-500">
                    <span>Searching for: <strong>"{searchQuery}"</strong></span>
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="text-emerald-600 hover:underline cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              {filteredTools.length === 0 ? (
                <div className="py-16 text-center space-y-4 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-8">
                  <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-400 mx-auto flex items-center justify-center">
                    <Search className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-stone-800 dark:text-stone-200">
                      {isUrdu ? 'کوئی ملتا جلتا ٹول نہیں ملا' : 'No Matching Tools Found'}
                    </h3>
                    <p className="text-xs text-stone-500 max-w-sm mx-auto">
                      {isUrdu
                        ? 'کیا آپ کو کوئی مخصوص ٹول درکار ہے؟ آپ نیچے دیے گئے بٹن سے نیا ٹول تجویز کر سکتے ہیں۔'
                        : 'Looking for a utility not listed here? Tell Ali Haider what feature you need and we will build it.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openTool('help-suggest')}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
                  >
                    Suggest This Tool Now
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredTools.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} />
                  ))}
                </div>
              )}
            </div>

            {/* Community Reviews & Feedback Section */}
            <ReviewsSection />
          </div>
        )}
      </main>

      <Footer />

      {/* Cookie Consent Banner */}
      <CookieBanner />

      {/* Informational Modals */}
      {activeInfoModal === 'about' && <AboutModal />}
      {activeInfoModal === 'contact' && <ContactModal />}
      {activeInfoModal === 'privacy' && <PrivacyModal />}
      {activeInfoModal === 'terms' && <TermsModal />}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
