import React, { useMemo, useEffect, useState, Suspense, lazy } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ToolCard } from './components/ToolCard';
import { CookieBanner } from './components/CookieBanner';
import { ReviewsSection } from './components/ReviewsSection';
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
  ChevronDown,
  CheckCircle2,
  Lock,
  Cpu,
  RefreshCw,
} from 'lucide-react';

// Code-split heavy tool components and modals for ultra-fast initial load
const PdfTools = lazy(() => import('./components/tools/PdfTools').then(m => ({ default: m.PdfTools })));
const ImageTools = lazy(() => import('./components/tools/ImageTools').then(m => ({ default: m.ImageTools })));
const StudyTools = lazy(() => import('./components/tools/StudyTools').then(m => ({ default: m.StudyTools })));
const WritingTools = lazy(() => import('./components/tools/WritingTools').then(m => ({ default: m.WritingTools })));
const CalculatorTools = lazy(() => import('./components/tools/CalculatorTools').then(m => ({ default: m.CalculatorTools })));
const HelpCenter = lazy(() => import('./components/tools/HelpCenter').then(m => ({ default: m.HelpCenter })));

const AboutModal = lazy(() => import('./components/modals/InfoModals').then(m => ({ default: m.AboutModal })));
const ContactModal = lazy(() => import('./components/modals/InfoModals').then(m => ({ default: m.ContactModal })));
const PrivacyModal = lazy(() => import('./components/modals/InfoModals').then(m => ({ default: m.PrivacyModal })));
const TermsModal = lazy(() => import('./components/modals/InfoModals').then(m => ({ default: m.TermsModal })));

// Zero-CLS Suspense Loading Skeleton
const ToolSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-8 space-y-6 animate-pulse min-h-[420px]">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-stone-200 dark:bg-stone-800 rounded-2xl" />
      <div className="space-y-2 flex-1">
        <div className="h-5 bg-stone-200 dark:bg-stone-800 rounded-lg w-1/3" />
        <div className="h-3 bg-stone-100 dark:bg-stone-800/60 rounded-lg w-1/2" />
      </div>
    </div>
    <div className="h-44 bg-stone-100 dark:bg-stone-800/40 rounded-2xl border-2 border-dashed border-stone-200 dark:border-stone-800" />
    <div className="h-10 bg-stone-200 dark:bg-stone-800 rounded-xl w-full" />
  </div>
);

// FAQ Item Component for Semantic Search Snippets
const FaqAccordionItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden bg-white dark:bg-stone-900 transition">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-stone-900 dark:text-stone-100 hover:text-emerald-600 transition cursor-pointer"
        aria-expanded={open}
      >
        <span>{question}</span>
        <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform duration-200 flex-shrink-0 ${open ? 'rotate-180 text-emerald-600' : ''}`} />
      </button>
      {open && (
        <div className="px-5 pb-5 text-xs text-stone-600 dark:text-stone-300 leading-relaxed border-t border-stone-100 dark:border-stone-800/80 pt-3">
          {answer}
        </div>
      )}
    </div>
  );
};

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
    language,
  } = useApp();

  const isUrdu = language === 'ur';

  // Deep URL Hash sync for Clean Tool URLs and direct link sharing (e.g. /#tool-pdf-merge)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#tool-')) {
        const id = hash.replace('#tool-', '');
        const match = TOOLS.find(t => t.id === id);
        if (match && (!activeTool || activeTool.id !== id)) {
          openTool(id);
        }
      } else if (!hash && activeTool) {
        closeTool();
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [activeTool]);

  // Dynamic SEO Title and Meta Description sync
  useEffect(() => {
    const metaDesc = document.querySelector('meta[name="description"]');
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDesc = document.querySelector('meta[property="og:description"]');

    // Dynamic canonical link
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = window.location.origin + window.location.pathname;

    if (activeTool) {
      const toolTitle = isUrdu && activeTool.nameUrdu
        ? `${activeTool.nameUrdu} — مفت آن لائن ٹول | علی حیدر`
        : `${activeTool.name} — Free Online Tool | Ali Haider Helper`;
      
      const toolDesc = isUrdu && activeTool.descriptionUrdu
        ? `${activeTool.descriptionUrdu} علی حیدر آل ان ون ہیلپر پر 100٪ مفت اور نجی استعمال کریں۔`
        : `${activeTool.description} Use 100% free and private in your browser on Ali Haider All-in-One Helper.`;

      document.title = toolTitle;
      if (metaDesc) metaDesc.setAttribute('content', toolDesc);
      if (ogTitle) ogTitle.setAttribute('content', toolTitle);
      if (ogDesc) ogDesc.setAttribute('content', toolDesc);
      if (canonical) canonical.href = `${window.location.origin}${window.location.pathname}#tool-${activeTool.id}`;

      if (window.location.hash !== `#tool-${activeTool.id}`) {
        window.history.pushState(null, '', `#tool-${activeTool.id}`);
      }
    } else {
      const defaultTitle = isUrdu
        ? 'علی حیدر — آل ان ون ہیلپر | مفت آن لائن ٹولز'
        : 'Ali Haider — All-in-One Helper | Free Everyday Utility Tools';

      const defaultDesc = isUrdu
        ? 'پی ڈی ایف جوڑیں، سائز کم کریں، تصاویر بدلیں، تعلیمی سوالات حل کریں، حساب کتاب کریں اور سی وی بنائیں — تیز رفتار اور نجی طور پر۔'
        : 'Free, 100% private online utility tools: Merge and compress PDFs, resize images, solve math step-by-step, calculate percentages, draft CVs, and practice languages.';

      document.title = defaultTitle;
      if (metaDesc) metaDesc.setAttribute('content', defaultDesc);
      if (ogTitle) ogTitle.setAttribute('content', defaultTitle);
      if (ogDesc) ogDesc.setAttribute('content', defaultDesc);

      if (window.location.hash.startsWith('#tool-')) {
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  }, [activeTool, isUrdu]);

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

      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* VIEW 1: ACTIVE TOOL WORKSPACE */}
        {activeTool ? (
          <div className="space-y-6">
            {/* Tool Navigation Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-5 sm:p-6 rounded-3xl shadow-xs">
              <div className="flex items-center gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={closeTool}
                  className="p-2 sm:px-3 sm:py-2.5 rounded-2xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 transition cursor-pointer flex items-center gap-1.5 text-xs font-bold focus-visible:ring-2 focus-visible:ring-emerald-500"
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
                  className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 ${
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

            {/* Suspense Container for Tool Components */}
            <Suspense fallback={<ToolSkeleton />}>
              <div className="transition-all duration-200">
                {activeTool.category === 'pdf' && <PdfTools toolId={activeTool.id} />}
                {activeTool.category === 'image' && <ImageTools toolId={activeTool.id} />}
                {activeTool.category === 'study' && <StudyTools toolId={activeTool.id} />}
                {activeTool.category === 'writing' && <WritingTools toolId={activeTool.id} />}
                {activeTool.category === 'calculator' && <CalculatorTools toolId={activeTool.id} />}
                {activeTool.category === 'guides' && <HelpCenter toolId={activeTool.id} />}
              </div>
            </Suspense>
          </div>
        ) : (
          /* VIEW 2: DASHBOARD & TOOL DIRECTORY */
          <div className="space-y-12">
            {/* Semantic Hero Banner (Optimized for LCP: Zero layout shift, no external heavy images) */}
            <div className="relative rounded-3xl bg-gradient-to-br from-stone-900 via-stone-850 to-emerald-950 text-white p-7 sm:p-12 overflow-hidden shadow-lg border border-stone-800 min-h-[280px]">
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
                    ? 'پی ڈی ایف فائلیں جوڑیں اور سائز کم کریں، تصاویر بدلیں، تعلیمی سوالات حل کریں، فیصد اور تاریخیں معلوم کریں، اور سی وی تیار کریں — تیز رفتار اور نجی طور پر۔'
                    : 'Merge and compress PDFs, resize images, solve curriculum math with step-by-step logic, compute percentages, draft CVs, and practice languages directly in your browser. Fast, private, and free.'}
                </p>

                <div className="flex flex-wrap items-center gap-2.5 pt-2 text-xs font-semibold text-stone-300">
                  <span className="flex items-center gap-1.5 bg-stone-850/80 px-3 py-1.5 rounded-xl border border-stone-700/60 shadow-2xs">
                    <Zap className="w-3.5 h-3.5 text-emerald-400" />
                    100% Client-Side Private (Wasm)
                  </span>
                  <span className="flex items-center gap-1.5 bg-stone-850/80 px-3 py-1.5 rounded-xl border border-stone-700/60 shadow-2xs">
                    <Globe className="w-3.5 h-3.5 text-teal-400" />
                    English & Urdu Dual Language
                  </span>
                  <span className="flex items-center gap-1.5 bg-stone-850/80 px-3 py-1.5 rounded-xl border border-stone-700/60 shadow-2xs">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    30+ Precision Free Tools
                  </span>
                </div>
              </div>

              {/* Decorative low-cost ambient background accent */}
              <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
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
                      className="px-3.5 py-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-emerald-500 rounded-2xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap shadow-2xs transition cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500"
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
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
                    {activeCategory === 'all'
                      ? isUrdu ? 'تمام دستیاب ٹولز' : 'All Available Tools'
                      : activeCategory === 'favorites'
                      ? isUrdu ? 'آپ کے پسندیدہ ٹولز' : 'Your Pinned Favorites'
                      : TOOLS.find((t) => t.category === activeCategory)?.name || activeCategory}
                  </h2>
                  <p className="text-xs text-stone-500">
                    {filteredTools.length} {isUrdu ? 'ٹولز دستیاب ہیں' : 'tools ready for immediate use'}
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

            {/* TECHNICAL SEO & SEARCH-INTENT CONTENT SECTION */}
            <section className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 sm:p-10 shadow-xs space-y-8">
              <div className="space-y-2 border-b border-stone-100 dark:border-stone-800 pb-5">
                <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest">
                  Comprehensive Platform Overview
                </span>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
                  Free Online Tools for Students, Professionals, and Everyday Tasks
                </h2>
                <p className="text-xs text-stone-600 dark:text-stone-400 max-w-3xl leading-relaxed">
                  Ali Haider — All-in-One Helper was designed with one unifying principle: essential utility tools should be free, lightning-fast, and unconditionally respectful of user privacy.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                <div className="space-y-2 p-4 bg-stone-50 dark:bg-stone-850 rounded-2xl border border-stone-200/70 dark:border-stone-800">
                  <div className="flex items-center gap-2 text-emerald-600 font-bold">
                    <Layers className="w-4 h-4" />
                    <h3 className="text-stone-900 dark:text-stone-100 font-bold">PDF Merger & Document Tools</h3>
                  </div>
                  <p>
                    Combine multiple PDF files into one clean document, extract select pages, split large publications by ranges, optimize file sizes, or convert JPG and PNG images into a single print-ready PDF booklet.
                  </p>
                </div>

                <div className="space-y-2 p-4 bg-stone-50 dark:bg-stone-850 rounded-2xl border border-stone-200/70 dark:border-stone-800">
                  <div className="flex items-center gap-2 text-emerald-600 font-bold">
                    <FileImage className="w-4 h-4" />
                    <h3 className="text-stone-900 dark:text-stone-100 font-bold">Image Resizer & Compressor</h3>
                  </div>
                  <p>
                    Resize images to exact pixel dimensions, crop to social media aspect ratios (1:1, 4:3, 16:9), and compress JPG, PNG, and WebP files with live KB savings without uploading files to remote servers.
                  </p>
                </div>

                <div className="space-y-2 p-4 bg-stone-50 dark:bg-stone-850 rounded-2xl border border-stone-200/70 dark:border-stone-800">
                  <div className="flex items-center gap-2 text-emerald-600 font-bold">
                    <Calculator className="w-4 h-4" />
                    <h3 className="text-stone-900 dark:text-stone-100 font-bold">Precision Everyday Calculators</h3>
                  </div>
                  <p>
                    Access a full scientific calculator with memory, 3-in-1 percentage calculations, birthday milestone age counter, business days date differences, 6-category unit converter, and compound savings projections.
                  </p>
                </div>
              </div>

              {/* FREQUENTLY ASKED QUESTIONS (Matches FAQPage Schema) */}
              <div className="space-y-4 pt-4 border-t border-stone-100 dark:border-stone-800">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">
                    Common Questions
                  </span>
                  <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                    Frequently Asked Questions
                  </h3>
                </div>

                <div className="space-y-3">
                  <FaqAccordionItem
                    question="Are the PDF merger and image compressor completely free?"
                    answer="Yes. All document and image tools on Ali Haider — All-in-One Helper are 100% free with no hidden subscriptions, credit card prompts, or watermarks applied to your files."
                  />
                  <FaqAccordionItem
                    question="Are my documents and photos uploaded to your server?"
                    answer="No. Your files never leave your device. All PDF operations (merging, splitting, compressing, extracting) and image editing (resizing, cropping, converting) run locally inside your browser via WebAssembly and HTML5 Canvas. Your documents remain completely private."
                  />
                  <FaqAccordionItem
                    question="Does this website work on iPhones, Android phones, and laptops?"
                    answer="Yes. The platform is responsive and mobile-first, tested to operate cleanly on Android smartphones, iPhones, iPads, MacBooks, Windows laptops, and high-resolution desktop monitors."
                  />
                  <FaqAccordionItem
                    question="How does the Urdu language option work?"
                    answer="Click the language toggle in the header to switch to Urdu. The platform dynamically adapts to a right-to-left (RTL) layout and loads clear Urdu typography for maximum readability."
                  />
                </div>
              </div>
            </section>

            {/* Community Reviews & Feedback Section */}
            <ReviewsSection />
          </div>
        )}
      </main>

      <Footer />

      {/* Cookie Consent Banner */}
      <CookieBanner />

      {/* Informational Modals (Lazy Loaded) */}
      <Suspense fallback={null}>
        {activeInfoModal === 'about' && <AboutModal />}
        {activeInfoModal === 'contact' && <ContactModal />}
        {activeInfoModal === 'privacy' && <PrivacyModal />}
        {activeInfoModal === 'terms' && <TermsModal />}
      </Suspense>
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
