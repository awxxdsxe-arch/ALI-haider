import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Cookie, Settings, Check, X } from 'lucide-react';

export const CookieBanner: React.FC = () => {
  const { cookiePrefs, saveCookiePreferences, showCookieBanner, setShowCookieBanner } = useApp();
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);

  // Local draft state for modal
  const [analyticsConsent, setAnalyticsConsent] = useState(cookiePrefs.analytics);
  const [marketingConsent, setMarketingConsent] = useState(cookiePrefs.marketing);

  if (!showCookieBanner && !showCustomizeModal) return null;

  const handleAcceptAll = () => {
    saveCookiePreferences({
      essential: true,
      analytics: true,
      marketing: true,
    });
    setShowCustomizeModal(false);
  };

  const handleRejectOptional = () => {
    saveCookiePreferences({
      essential: true,
      analytics: false,
      marketing: false,
    });
    setShowCustomizeModal(false);
  };

  const handleSaveCustom = () => {
    saveCookiePreferences({
      essential: true,
      analytics: analyticsConsent,
      marketing: marketingConsent,
    });
    setShowCustomizeModal(false);
  };

  return (
    <>
      {/* Floating Bottom Banner */}
      {showCookieBanner && !showCustomizeModal && (
        <aside
          aria-label="Cookie consent banner"
          className="fixed bottom-4 left-4 right-4 md:left-8 md:right-auto md:max-w-xl z-40 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 shadow-2xl space-y-4"
        >
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-2xl flex-shrink-0">
              <Cookie className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">Cookie & Privacy Preferences</h4>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                We use strictly essential local storage to remember your preferences (theme, language, and favorite tools). No advertising or tracking cookies are enabled without your consent.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleAcceptAll}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
            >
              Accept All
            </button>
            <button
              type="button"
              onClick={handleRejectOptional}
              className="px-4 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              Reject Optional
            </button>
            <button
              type="button"
              onClick={() => setShowCustomizeModal(true)}
              className="px-3 py-2 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 text-xs font-semibold flex items-center gap-1 cursor-pointer ml-auto"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Customize</span>
            </button>
          </div>
        </aside>
      )}

      {/* Customize Preferences Modal */}
      {showCustomizeModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex justify-between items-start border-b border-stone-100 dark:border-stone-800 pb-4">
              <div className="flex items-center gap-2.5">
                <Cookie className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">Cookie Preference Center</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCustomizeModal(false)}
                className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              Customize which technologies you allow while using Ali Haider — All-in-One Helper. You can change these preferences at any time via the "Cookie Settings" link in the footer.
            </p>

            <div className="space-y-4">
              {/* Essential */}
              <div className="p-4 bg-stone-50 dark:bg-stone-800/40 rounded-2xl border border-stone-200 dark:border-stone-700 flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-stone-900 dark:text-stone-100">Essential Cookies & Storage</span>
                    <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold rounded-full">
                      Always Active
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 leading-normal">
                    Required for core site features, including remembering your dark/light theme, language selection, and pinned favorites.
                  </p>
                </div>
                <input type="checkbox" checked disabled className="accent-emerald-600 w-4 h-4 cursor-not-allowed mt-1" />
              </div>

              {/* Analytics */}
              <div className="p-4 bg-stone-50 dark:bg-stone-800/40 rounded-2xl border border-stone-200 dark:border-stone-700 flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="font-bold text-xs text-stone-900 dark:text-stone-100">Performance & Diagnostic Analytics</span>
                  <p className="text-[11px] text-stone-500 leading-normal">
                    Helps us understand aggregated tool usage counts and optimize server health. No personal documents or queries are logged.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={analyticsConsent}
                  onChange={(e) => setAnalyticsConsent(e.target.checked)}
                  className="accent-emerald-600 w-4 h-4 cursor-pointer mt-1"
                />
              </div>

              {/* Marketing */}
              <div className="p-4 bg-stone-50 dark:bg-stone-800/40 rounded-2xl border border-stone-200 dark:border-stone-700 flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="font-bold text-xs text-stone-900 dark:text-stone-100">External Integrations & Content</span>
                  <p className="text-[11px] text-stone-500 leading-normal">
                    Enables rich media embeds or third-party web fonts where applicable.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={marketingConsent}
                  onChange={(e) => setMarketingConsent(e.target.checked)}
                  className="accent-emerald-600 w-4 h-4 cursor-pointer mt-1"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800">
              <button
                type="button"
                onClick={handleRejectOptional}
                className="px-4 py-2 text-xs font-semibold text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 cursor-pointer"
              >
                Reject All Optional
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSaveCustom}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
