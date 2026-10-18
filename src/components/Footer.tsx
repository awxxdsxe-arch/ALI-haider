import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Heart, Cookie, Globe, Server, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC = () => {
  const { openInfoModal, setShowCookieBanner, language } = useApp();
  const isUrdu = language === 'ur';

  const [serverHealth, setServerHealth] = useState<{ status: string; aiConfigured: boolean } | null>(null);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => setServerHealth(data))
      .catch(() => setServerHealth({ status: 'offline_capable', aiConfigured: false }));
  }, []);

  return (
    <footer className="mt-20 border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-600 dark:text-stone-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                AH
              </div>
              <span className="font-extrabold text-base text-stone-900 dark:text-stone-100">Ali Haider</span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
              {isUrdu
                ? 'ایک مفت اور جامع یوٹیلیٹی پلیٹ فارم جو دنیا بھر کے ہر فرد کو روزمرہ کے مسائل حل کرنے میں مدد دیتا ہے۔'
                : '“Everything Helpful, All in One Place.” Genuinely free online utilities engineered for everyday productivity.'}
            </p>
            <div className="flex items-center gap-2 pt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% Client-Side Privacy Guaranteed</span>
            </div>
          </div>

          {/* Quick Categories */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider text-[11px]">
              {isUrdu ? 'ٹولز کی اقسام' : 'Core Categories'}
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li><span className="hover:text-emerald-600 cursor-pointer">PDF & Document Suite</span></li>
              <li><span className="hover:text-emerald-600 cursor-pointer">Image & Graphics Tools</span></li>
              <li><span className="hover:text-emerald-600 cursor-pointer">Study & Academic Solver</span></li>
              <li><span className="hover:text-emerald-600 cursor-pointer">Language, Writing & CV</span></li>
              <li><span className="hover:text-emerald-600 cursor-pointer">Everyday Precision Calculators</span></li>
            </ul>
          </div>

          {/* Legal & Trust */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider text-[11px]">
              {isUrdu ? 'قانونی اور شفافیت' : 'Trust & Governance'}
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => openInfoModal('privacy')}
                  className="hover:text-emerald-600 transition cursor-pointer"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openInfoModal('terms')}
                  className="hover:text-emerald-600 transition cursor-pointer"
                >
                  Terms of Use
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openInfoModal('about')}
                  className="hover:text-emerald-600 transition cursor-pointer"
                >
                  About the Platform
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openInfoModal('contact')}
                  className="hover:text-emerald-600 transition cursor-pointer"
                >
                  Contact & Support
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setShowCookieBanner(true)}
                  className="hover:text-emerald-600 transition flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400 cursor-pointer"
                >
                  <Cookie className="w-3.5 h-3.5" />
                  <span>Cookie Settings</span>
                </button>
              </li>
            </ul>
          </div>

          {/* System & Architecture */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider text-[11px]">
              {isUrdu ? 'سسٹم اسٹیٹس' : 'System Transparency'}
            </h4>
            <div className="p-3 bg-stone-50 dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-stone-500">Local Processing:</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Active (Wasm)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-500">AI Assistance:</span>
                <span className="font-mono text-stone-700 dark:text-stone-300">
                  {serverHealth?.aiConfigured ? 'Connected (Gemini 3.8)' : 'Offline Guide Mode'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-500">Security Headers:</span>
                <span className="font-bold text-stone-700 dark:text-stone-300">CSP & HTTPS</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-8 border-t border-stone-100 dark:border-stone-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-400">
          <p>© {new Date().getFullYear()} Ali Haider — All-in-One Helper. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with integrity for everyday utility. Free worldwide.
          </p>
        </div>
      </div>
    </footer>
  );
};
