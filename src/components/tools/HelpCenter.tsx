import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  BookOpen,
  Lock,
  FolderOpen,
  Send,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  MessageSquarePlus,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface Guide {
  id: string;
  category: string;
  title: string;
  titleUrdu: string;
  summary: string;
  summaryUrdu: string;
  keyPoints: string[];
}

const PRACTICAL_GUIDES: Guide[] = [
  {
    id: 'guide-internet-safety',
    category: 'Security',
    title: 'Internet Safety & Phishing Prevention',
    titleUrdu: 'انٹرنیٹ پر محفوظ رہنے اور دھوکہ دہی سے بچنے کے طریقے',
    summary: 'Essential rules for protecting yourself from suspicious links, fraudulent emails, and malicious downloads.',
    summaryUrdu: 'مشکوک لنکس، جعلساز ای میلز اور نقصان دہ فائلوں سے اپنے کمپیوٹر اور موبائل کو بچانے کی تدابیر۔',
    keyPoints: [
      'Always inspect the sender email address domain, not just the display name.',
      'Never share one-time passwords (OTP) or authentication codes with anyone, even if they claim to be support staff.',
      'Look for the secure padlock and HTTPS in the browser address bar before entering payment or credentials.',
      'Avoid clicking unsolicited urgency links ("Your account will be suspended within 24 hours"). Verify directly through the official website.',
    ],
  },
  {
    id: 'guide-passwords',
    category: 'Accounts',
    title: 'Safe Account Practices & Two-Factor Authentication',
    titleUrdu: 'مضبوط پاس ورڈ اور ٹو فیکٹر تصدیق کی اہمیت',
    summary: 'How to create resilient passphrases and enable multi-factor authentication across your personal and study accounts.',
    summaryUrdu: 'ناقابل تسخیر پاس ورڈ بنانے اور 2FA ایکٹیو کرنے کا آسان طریقہ۔',
    keyPoints: [
      'Use passphrases of 4 random words (e.g. "battery-staple-purple-cloud") rather than short complex passwords.',
      'Never reuse the same password across multiple sensitive services (email, banking, university portal).',
      'Enable Two-Factor Authentication (2FA) using an authenticator app (such as Google Authenticator) rather than SMS where possible.',
      'Use a reputable password manager to safely generate and store your credentials.',
    ],
  },
  {
    id: 'guide-digital-literacy',
    category: 'Digital Literacy',
    title: 'Everyday Digital Literacy & Browser Productivity',
    titleUrdu: 'ڈیجیٹل مہارت اور براؤزر میں تیز کام کرنے کے طریقے',
    summary: 'Master keyboard shortcuts, bookmark management, and file extension basics for efficient daily computer use.',
    summaryUrdu: 'کی بورڈ شارٹ کٹس اور براؤزر کے اہم فیچرز کے ذریعے اپنا قیمتی وقت بچائیں۔',
    keyPoints: [
      'Use Ctrl+F (or Cmd+F on Mac) to search any webpage or long PDF instantly for exact keywords.',
      'Reopen accidentally closed browser tabs instantly using Ctrl+Shift+T (Cmd+Shift+T).',
      'Understand file extensions: .pdf (documents), .png (lossless images with transparency), .jpg (photos), .webp (efficient web graphics).',
      'Clear corrupted browser cookies or cache when a webpage appears broken or fails to update.',
    ],
  },
  {
    id: 'guide-file-management',
    category: 'Organization',
    title: 'File Management & The 3-2-1 Backup Rule',
    titleUrdu: 'فائلوں کی درست ترتیب اور بیک اپ کے اصول',
    summary: 'Keep your study assignments and personal records organized and immune to accidental loss or device failure.',
    summaryUrdu: 'اپنے قیمتی نوٹس اور دستاویزات کو محفوظ رکھنے کا 3-2-1 فارمولا۔',
    keyPoints: [
      'Adopt the 3-2-1 backup rule: Keep 3 copies of important files, on 2 different media types, with 1 copy stored off-site (cloud or external drive).',
      'Use consistent date-first naming: "2026-10-18_Assignment_Physics_v1.pdf" to maintain chronological ordering.',
      'Regularly archive completed semester or project files into designated zip folders to maintain a clutter-free desktop.',
    ],
  },
  {
    id: 'guide-study-habits',
    category: 'Learning',
    title: 'Evidence-Based Study Techniques',
    titleUrdu: 'سائنسی بنیادوں پر پڑھائی اور یادداشت کے طریقے',
    summary: 'Proven cognitive science techniques: Active Recall, Spaced Repetition, and the Feynman Technique.',
    summaryUrdu: 'ایکٹو ریکال اور فائن مین تکنیک کے ذریعے طویل عرصے تک یاد رکھیں۔',
    keyPoints: [
      'Active Recall: Test yourself by closing the book and writing down concepts from memory, rather than passively re-reading.',
      'Spaced Repetition: Review newly learned material at expanding intervals (1 day, 3 days, 1 week, 1 month) to consolidate long-term memory.',
      'The Feynman Technique: Try explaining the topic in simple terms to a 10-year-old. Identify gaps wherever you stumble or use jargon.',
      'Pomodoro Rhythm: Work in focused 25-minute sprints followed by a 5-minute break to eliminate fatigue.',
    ],
  },
  {
    id: 'guide-online-forms',
    category: 'Practical',
    title: 'Online Forms & Job Application Success',
    titleUrdu: 'آن لائن فارمز اور نوکری کی درخواستیں جمع کروانے کے رہنما اصول',
    summary: 'Avoid common form submission mistakes, preserve draft text, and format digital resumes for applicant tracking systems.',
    summaryUrdu: 'آن لائن فارم بھرتے وقت ہونے والی عام غلطیوں اور ڈیٹا ضائع ہونے سے بچیں۔',
    keyPoints: [
      'Always draft lengthy form answers in a separate notepad or editor before pasting into web forms to avoid losing work on session timeouts.',
      'Export CVs and resumes as clean standard PDFs rather than image files so that applicant tracking systems (ATS) can parse text.',
      'Double-check all email and phone fields carefully before clicking submit; typos here prevent interview callbacks.',
    ],
  },
];

export const HelpCenter: React.FC<{ toolId: string }> = ({ toolId }) => {
  const { language } = useApp();
  const isUrdu = language === 'ur';

  // Search filter
  const [guideSearch, setGuideSearch] = useState('');
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);

  // Suggestion form state
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formCategory, setFormCategory] = useState('tool_suggestion');
  const [formMessage, setFormMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitFeedback, setSubmitFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const filteredGuides = PRACTICAL_GUIDES.filter((g) => {
    const q = guideSearch.toLowerCase();
    return (
      g.title.toLowerCase().includes(q) ||
      g.summary.toLowerCase().includes(q) ||
      g.category.toLowerCase().includes(q) ||
      g.keyPoints.some((p) => p.toLowerCase().includes(q))
    );
  });

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formMessage.trim()) return;

    setIsSubmitting(true);
    setSubmitFeedback(null);

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          email: formEmail,
          category: formCategory,
          message: formMessage,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit feedback.');

      setSubmitFeedback({
        type: 'success',
        text: isUrdu
          ? 'آپ کی رائے موصول ہو گئی ہے! علی حیدر اور ٹیم آپ کے مشورے کا شکریہ ادا کرتی ہے۔'
          : 'Thank you! Your suggestion has been logged directly for review by Ali Haider.',
      });
      setFormMessage('');
    } catch (err: any) {
      setSubmitFeedback({
        type: 'error',
        text: err.message || 'Unable to submit at this time.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Search Header */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-800 text-white rounded-2xl p-8 shadow-sm">
        <div className="max-w-2xl mx-auto text-center space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {isUrdu ? 'عملی رہنمائی اور ہیلپ سینٹر' : 'Help Center & Practical Knowledge'}
          </h2>
          <p className="text-sm text-emerald-100">
            {isUrdu
              ? 'انٹرنیٹ پر حفاظت، پاس ورڈ بنانے اور کمپیوٹر کی مہارت کے جامع رہنما'
              : 'Searchable best-practice guides for online safety, privacy, file management, and study routines.'}
          </p>

          <div className="relative mt-4">
            <Search className="w-5 h-5 absolute left-3.5 top-3 text-stone-400" />
            <input
              type="text"
              value={guideSearch}
              onChange={(e) => setGuideSearch(e.target.value)}
              placeholder="Search guides (e.g. phishing, backup, study habits, passwords)..."
              className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white text-stone-900 text-sm focus:outline-none shadow-md"
            />
          </div>
        </div>
      </div>

      {/* Guides Grid */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-stone-900 dark:text-stone-100 text-lg">
            {isUrdu ? 'اہم موضوعات اور گائیڈز' : 'Practical Guides'}
          </h3>
          <span className="text-xs text-stone-500 font-mono">{filteredGuides.length} articles</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGuides.map((guide) => (
            <div
              key={guide.id}
              onClick={() => setSelectedGuide(guide)}
              className="p-5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl hover:border-emerald-500 hover:shadow-md transition cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-2">
                <span className="px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold rounded-full uppercase tracking-wider">
                  {guide.category}
                </span>
                <h4 className="font-bold text-stone-900 dark:text-stone-100 text-base leading-snug">
                  {isUrdu ? guide.titleUrdu : guide.title}
                </h4>
                <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 leading-relaxed">
                  {isUrdu ? guide.summaryUrdu : guide.summary}
                </p>
              </div>

              <div className="pt-4 flex items-center justify-between text-xs text-emerald-600 font-semibold border-t border-stone-100 dark:border-stone-800/80 mt-4">
                <span>{isUrdu ? 'مکمل گائیڈ پڑھیں' : 'Read Full Guide'}</span>
                <span>→</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Guide Detail Modal */}
      {selectedGuide && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start gap-4 border-b border-stone-100 dark:border-stone-800 pb-4">
              <div>
                <span className="px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-full">
                  {selectedGuide.category}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 mt-2">
                  {isUrdu ? selectedGuide.titleUrdu : selectedGuide.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedGuide(null)}
                className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed font-medium">
              {isUrdu ? selectedGuide.summaryUrdu : selectedGuide.summary}
            </p>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                {isUrdu ? 'اہم ترین نکات:' : 'Practical Rules & Actionable Steps:'}
              </h4>
              <ul className="space-y-2.5 text-sm text-stone-800 dark:text-stone-200">
                {selectedGuide.keyPoints.map((pt, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span className="leading-relaxed">{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedGuide(null)}
                className="px-5 py-2 bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suggest a Tool / Feedback Section */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded-xl">
            <MessageSquarePlus className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
              {isUrdu ? 'نئے ٹول کی تجویز اور رائے بھیجیں' : 'Suggest a New Tool / Submit Feedback'}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {isUrdu ? 'بتائیں کہ آپ کو اپنے روزمرہ کام یا تعلیم کے لیے کون سے مزید ٹولز درکار ہیں' : 'Tell Ali Haider what feature, calculator, or tool you want added next.'}
            </p>
          </div>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1">
                Your Name (Optional):
              </label>
              <input
                type="text"
                placeholder="e.g. Asad Umar"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl dark:bg-stone-800 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1">
                Your Email (Optional, for replies):
              </label>
              <input
                type="email"
                placeholder="e.g. asad@example.com"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl dark:bg-stone-800 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1">Category:</label>
            <select
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl dark:bg-stone-800 text-xs font-semibold"
            >
              <option value="tool_suggestion">Suggest a New Tool</option>
              <option value="improvement">Improvement on Existing Tool</option>
              <option value="bug_report">Report an Issue or Bug</option>
              <option value="general">General Feedback</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1">Your Message:</label>
            <textarea
              required
              rows={4}
              value={formMessage}
              onChange={(e) => setFormMessage(e.target.value)}
              placeholder="Describe the tool you need or your suggestion in detail..."
              className="w-full p-3 border rounded-xl dark:bg-stone-800 text-xs focus:outline-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !formMessage.trim()}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Sending suggestion...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Send Suggestion to Ali Haider</span>
              </>
            )}
          </button>

          {submitFeedback && (
            <div
              className={`p-3 rounded-xl flex items-center gap-2 text-xs ${
                submitFeedback.type === 'error'
                  ? 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950 dark:text-rose-200'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-200'
              }`}
            >
              {submitFeedback.type === 'error' ? (
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              ) : (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
              )}
              <span>{submitFeedback.text}</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
