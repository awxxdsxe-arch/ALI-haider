import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Heart, Sparkles, CheckCircle2, Lock, Terminal, Globe } from 'lucide-react';

export const AboutModal: React.FC = () => {
  const { closeInfoModal, language } = useApp();
  const isUrdu = language === 'ur';

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start border-b border-stone-100 dark:border-stone-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
              AH
            </div>
            <div>
              <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100">Ali Haider — All-in-One Helper</h3>
              <p className="text-xs text-emerald-600 font-semibold">“Everything Helpful, All in One Place.”</p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeInfoModal}
            className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 text-xl font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
          <p>
            {isUrdu
              ? 'علی حیدر — آل ان ون ہیلپر ایک ایسا جامع ڈیجیٹل پلیٹ فارم ہے جس کا مقصد دنیا بھر کے طلباء، اساتذہ، فری لانسرز اور خاندانوں کے روزمرہ تعلیمی، تحریری، حسابی اور دفتری کاموں کو بلا معاوضہ آسان بنانا ہے۔'
              : 'Ali Haider — All-in-One Helper is a universal, free digital utility suite built to solve everyday document, calculation, study, and language challenges for people across the globe.'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-1">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5 uppercase">
                <Lock className="w-4 h-4" /> 100% Client-Side Privacy
              </span>
              <p className="text-xs text-stone-600 dark:text-stone-300">
                PDF merging, splitting, image compression, and calculators run locally in your browser. Your sensitive files never touch any external server.
              </p>
            </div>

            <div className="p-4 bg-stone-100 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700 space-y-1">
              <span className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5 uppercase">
                <Globe className="w-4 h-4 text-emerald-600" /> Free & Accessible
              </span>
              <p className="text-xs text-stone-600 dark:text-stone-300">
                Free core tools without paywalls, watermark extortion, or forced registrations. Built mobile-first for high performance on all devices.
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">Architecture & API Transparency</h4>
            <ul className="space-y-1.5 text-xs text-stone-600 dark:text-stone-400">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span><strong>Core Utility Suite:</strong> Pure TypeScript, WebAssembly (pdf-lib), and HTML5 Canvas processing.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span><strong>AI Intelligence Layer:</strong> Powered by Google Gemini 3.8 Flash via secure server proxy routes with offline fallbacks.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span><strong>Zero Invasive Trackers:</strong> We strictly respect your privacy and provide a full cookie preference center.</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex justify-end">
          <button
            type="button"
            onClick={closeInfoModal}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export const ContactModal: React.FC = () => {
  const { closeInfoModal } = useApp();
  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex justify-between items-start border-b border-stone-100 dark:border-stone-800 pb-4">
          <div>
            <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100">Contact & Support</h3>
            <p className="text-xs text-stone-500">Ali Haider — All-in-One Helper Inquiries</p>
          </div>
          <button
            type="button"
            onClick={closeInfoModal}
            className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 text-xl font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
          <p>
            Have a question, feedback, security inquiry, or partnership idea? We welcome direct correspondence from community members worldwide.
          </p>

          <div className="p-4 bg-stone-50 dark:bg-stone-800 rounded-xl space-y-2 border border-stone-200 dark:border-stone-700">
            <div>
              <span className="font-bold text-stone-400 uppercase text-[10px] block">General Support & Suggestions</span>
              <span className="font-mono text-emerald-600 font-semibold text-sm">support@alihaider-helper.org</span>
            </div>
            <div>
              <span className="font-bold text-stone-400 uppercase text-[10px] block">Expected Response Window</span>
              <span className="font-medium">Within 24 to 48 business hours</span>
            </div>
            <div>
              <span className="font-bold text-stone-400 uppercase text-[10px] block">In-App Feedback</span>
              <span className="font-medium">You can also use the "Suggest a Tool" form in our Help Center anytime.</span>
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={closeInfoModal}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export const PrivacyModal: React.FC = () => {
  const { closeInfoModal } = useApp();
  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start border-b border-stone-100 dark:border-stone-800 pb-4">
          <div>
            <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100">Privacy Policy</h3>
            <p className="text-xs text-stone-500">Effective Date: October 2026</p>
          </div>
          <button
            type="button"
            onClick={closeInfoModal}
            className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 text-xl font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
          <div className="space-y-1">
            <h4 className="font-bold text-stone-900 dark:text-stone-100 text-sm">1. Zero Document Storage Commitment</h4>
            <p>
              When you use our PDF tools (merge, split, compress, extract, rotate, images to PDF) or Image processing tools (resize, crop, convert, compress), <strong>your files are never uploaded to any remote server</strong>. All operations execute strictly inside your local browser memory via WebAssembly and HTML5 Canvas. Once you close your browser tab, all memory buffers are instantly purged.
            </p>
          </div>

          <div className="space-y-1">
            <h4 className="font-bold text-stone-900 dark:text-stone-100 text-sm">2. AI Endpoints & Data Transmission</h4>
            <p>
              When you explicitly request AI-powered tools (such as study question explanations or AI text translation), your prompt text is transmitted securely over HTTPS to our backend server and passed to the Google Gemini API. We do not sell, store, or profile your personal data.
            </p>
          </div>

          <div className="space-y-1">
            <h4 className="font-bold text-stone-900 dark:text-stone-100 text-sm">3. Local Storage Usage</h4>
            <p>
              We store non-identifiable user preferences locally in your browser’s localStorage to remember your chosen theme (light or dark), language (English or Urdu), your pinned favorite tools, and recent tool usage history. You can clear this data at any time via your browser settings.
            </p>
          </div>

          <div className="space-y-1">
            <h4 className="font-bold text-stone-900 dark:text-stone-100 text-sm">4. Cookie Policy & Preferences</h4>
            <p>
              We only use strictly essential cookies and local state necessary to maintain site functionality. Optional analytics or tracking cookies are disabled by default until explicit consent is given via our Cookie Settings banner.
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex justify-end">
          <button
            type="button"
            onClick={closeInfoModal}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};

export const TermsModal: React.FC = () => {
  const { closeInfoModal } = useApp();
  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start border-b border-stone-100 dark:border-stone-800 pb-4">
          <div>
            <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100">Terms of Use</h3>
            <p className="text-xs text-stone-500">Universal Public Access Agreement</p>
          </div>
          <button
            type="button"
            onClick={closeInfoModal}
            className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 text-xl font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
          <p>
            By accessing or using the services provided by <strong>Ali Haider — All-in-One Helper</strong>, you agree to these fair usage terms:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-1">
            <li><strong>Free Personal & Commercial Utility:</strong> All core utilities (PDF, image, calculation, study templates) are free to use for personal, educational, or commercial projects.</li>
            <li><strong>Fair Use & Security:</strong> You agree not to perform automated abuse, denial of service attacks, or malicious payloads against API endpoints.</li>
            <li><strong>Educational & Calculation Estimates:</strong> Calculators and financial growth models are approximations provided for guidance and study planning, not certified financial or tax counsel.</li>
            <li><strong>No Warranty:</strong> Services are provided on an "as-is" and "as-available" basis without warranties of any kind.</li>
          </ul>
        </div>

        <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex justify-end">
          <button
            type="button"
            onClick={closeInfoModal}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Accept & Close
          </button>
        </div>
      </div>
    </div>
  );
};
