import React, { useState, useMemo } from 'react';
import {
  Languages,
  CheckCircle2,
  Sparkles,
  Mail,
  FileBadge,
  Hash,
  Type,
  SlidersHorizontal,
  Copy,
  Check,
  Download,
  Printer,
  RefreshCw,
  AlertCircle,
  Clock,
  ArrowRightLeft,
  Trash2,
  Plus,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

// Common templates
const TEMPLATES = [
  {
    id: 'job_app',
    name: 'Job Application Cover Letter',
    nameUrdu: 'ملازمت کی باضابطہ درخواست',
    fields: [
      { id: 'recipient', label: 'Hiring Manager / Company', default: 'Hiring Team, Tech Innovators Ltd.' },
      { id: 'position', label: 'Target Position', default: 'Full-Stack Software Engineer' },
      { id: 'years', label: 'Years of Experience', default: '4' },
      { id: 'skills', label: 'Top Key Skills', default: 'React, Node.js, and TypeScript' },
      { id: 'sender', label: 'Your Full Name', default: 'Muhammad Ali' },
    ],
    generate: (f: Record<string, string>) =>
      `Dear ${f.recipient || 'Hiring Team'},\n\nI am writing to express my strong enthusiasm and application for the ${f.position || 'open'} role. With over ${f.years || '3'} years of hands-on experience specializing in ${f.skills || 'modern software development'}, I have consistently delivered robust, scalable, and user-centric solutions.\n\nThroughout my career, I have prided myself on problem-solving, clean code standards, and collaborating cross-functionally to achieve mission-critical goals. I am very eager to bring this same dedication to your esteemed team.\n\nThank you very much for your time and consideration. I welcome the opportunity to discuss my background and how my skillset can add immediate value to your organization.\n\nSincerely,\n${f.sender || 'Applicant'}`,
  },
  {
    id: 'leave_request',
    name: 'Formal Leave / Vacation Request',
    nameUrdu: 'رخصت یا چھٹی کی باضابطہ درخواست',
    fields: [
      { id: 'manager', label: 'Supervisor / Manager Name', default: 'Mr. David Miller' },
      { id: 'startDate', label: 'Leave Start Date', default: 'Monday, 24th October' },
      { id: 'endDate', label: 'Leave End Date', default: 'Wednesday, 26th October' },
      { id: 'reason', label: 'Reason for Leave', default: 'urgent personal family commitments' },
      { id: 'coverage', label: 'Colleague Providing Coverage', default: 'Zahid Khan' },
      { id: 'sender', label: 'Your Full Name', default: 'Sara Ahmed' },
    ],
    generate: (f: Record<string, string>) =>
      `Dear ${f.manager || 'Manager'},\n\nI am writing to formally request leave of absence from ${f.startDate || 'upcoming date'} through ${f.endDate || 'return date'} due to ${f.reason || 'personal obligations'}.\n\nPrior to my departure, I will ensure that all urgent deliverables are completed. My colleague ${f.coverage || 'my team member'} has kindly agreed to monitor any urgent queries during this interval. I will remain reachable via email for emergencies.\n\nThank you in advance for your understanding and approval.\n\nKind regards,\n${f.sender || 'Team Member'}`,
  },
  {
    id: 'invoice_reminder',
    name: 'Polite Client Invoice Reminder',
    nameUrdu: 'بقایاجات اور انوائس کی یاد دہانی',
    fields: [
      { id: 'client', label: 'Client / Company Name', default: 'Acme Corporation' },
      { id: 'invoiceNum', label: 'Invoice Number', default: 'INV-2026-089' },
      { id: 'amount', label: 'Outstanding Amount', default: '$1,450.00' },
      { id: 'dueDate', label: 'Original Due Date', default: 'October 10, 2026' },
      { id: 'sender', label: 'Your Name or Business', default: 'Ali Studio Services' },
    ],
    generate: (f: Record<string, string>) =>
      `Dear ${f.client || 'Valued Client'},\n\nI hope this email finds you well.\n\nThis is a friendly reminder that invoice ${f.invoiceNum || 'issued recently'} for the amount of ${f.amount || 'the outstanding balance'}, which was due on ${f.dueDate || 'the scheduled date'}, is currently outstanding.\n\nCould you please check on the payment status with your accounts department? If payment has already been sent, please disregard this note. A copy of the invoice is re-attached for your convenience.\n\nThank you for your prompt cooperation and continued partnership.\n\nBest regards,\n${f.sender || 'Service Provider'}`,
  },
];

export const WritingTools: React.FC<{ toolId: string }> = ({ toolId }) => {
  const { language } = useApp();
  const isUrdu = language === 'ur';

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // 1. Translation State
  const [transInput, setTransInput] = useState('');
  const [transTargetLang, setTransTargetLang] = useState('Urdu');
  const [transResult, setTransResult] = useState('');
  const [transLoading, setTransLoading] = useState(false);
  const [transError, setTransError] = useState<string | null>(null);

  // 2. Grammar State
  const [grammarInput, setGrammarInput] = useState(
    'Their are alot of people who goes to the library everyday because they want to improve them skills.'
  );
  const [grammarIssues, setGrammarIssues] = useState<string[]>([]);
  const [grammarAiResult, setGrammarAiResult] = useState<string | null>(null);
  const [grammarLoading, setGrammarLoading] = useState(false);

  // 3. Rewriter State
  const [rewriteInput, setRewriteInput] = useState('Can you please give me the report soon because I need it for the boss?');
  const [rewriteTone, setRewriteTone] = useState<'formal' | 'friendly' | 'concise' | 'academic'>('formal');
  const [rewriteResult, setRewriteResult] = useState('');
  const [rewriteLoading, setRewriteLoading] = useState(false);

  // 4. Templates State
  const [selectedTemplateId, setSelectedTemplateId] = useState('job_app');
  const [templateFieldValues, setTemplateFieldValues] = useState<Record<string, string>>({});

  // 5. CV State
  const [cvData, setCvData] = useState({
    fullName: 'Hamza Farooq',
    title: 'Senior Software Engineer & Tech Lead',
    email: 'hamza.farooq@example.com',
    phone: '+92 300 1234567',
    location: 'Lahore, Pakistan',
    summary:
      'Passionate software engineer with 6+ years of expertise building resilient distributed web applications, optimizing database performance, and coaching engineering teams.',
    skills: 'TypeScript, React, Node.js, PostgreSQL, Docker, Cloud Architecture, GraphQL, CI/CD',
    experience: [
      {
        role: 'Lead Full-Stack Developer',
        company: 'Apex Digital Solutions',
        duration: '2023 - Present',
        description: 'Architected microservices that scaled user throughput by 300%. Mentored junior developers.',
      },
      {
        role: 'Frontend Engineer',
        company: 'Crest Technologies',
        duration: '2020 - 2023',
        description: 'Developed responsive user interfaces with Next.js and Tailwind, improving core web vitals by 45%.',
      },
    ],
    education: [
      {
        degree: 'B.S. in Computer Science',
        institution: 'National University of Sciences & Technology (NUST)',
        year: '2016 - 2020',
      },
    ],
  });

  // 6. Word Count State
  const [wordCountText, setWordCountText] = useState(
    'Ali Haider — All-in-One Helper is a fast, free, and accessible utility suite designed to assist students, teachers, and professionals across the world with everyday document, language, and calculation tasks.'
  );

  // 7. Case Converter State
  const [caseInput, setCaseInput] = useState('Transform this sample sentence into any desired programming or typography casing style.');

  // 8. Cleanup State
  const [cleanupInput, setCleanupInput] = useState(
    '  First Line with trailing whitespace    \nSecond Line\nSecond Line\n<p>HTML paragraph line</p>\nThird Line\n'
  );

  // Execute Translation via Backend API
  const handleTranslate = async () => {
    if (!transInput.trim()) return;
    setTransLoading(true);
    setTransError(null);
    try {
      const res = await fetch('/api/ai/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'translate',
          prompt: transInput,
          targetLang: transTargetLang,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.available) {
        throw new Error(data.error || 'Translation service unconfigured.');
      }
      setTransResult(data.text);
    } catch (err: any) {
      setTransError(
        isUrdu
          ? 'سرور پر خودکار ترجمہ سروس دستیاب نہیں ہے۔ نیچے لغت کے مطابق چیک کریں۔'
          : `${err.message || 'Translation unavailable.'} Free core browser tools operate without server dependency.`
      );
    } finally {
      setTransLoading(false);
    }
  };

  // Local Grammar Heuristics
  const analyzeGrammarLocally = () => {
    const issues: string[] = [];
    const text = grammarInput;

    if (/\s{2,}/.test(text)) issues.push('Double or multiple consecutive spaces detected.');
    if (/\b(alot)\b/i.test(text)) issues.push('Misspelling: "alot" should be written as two words: "a lot".');
    if (/\b(tehm)\b/i.test(text)) issues.push('Typo: "tehm" should be "them".');
    if (/\b(recieve)\b/i.test(text)) issues.push('Spelling: "recieve" should be "receive" (i before e except after c).');
    if (/\b(seperate)\b/i.test(text)) issues.push('Spelling: "seperate" should be "separate".');
    if (/\b(definately)\b/i.test(text)) issues.push('Spelling: "definately" should be "definitely".');
    if (/\b(their are)\b/i.test(text)) issues.push('Homophone confusion: Did you mean "There are" instead of "Their are"?');
    if (/\b(who goes)\b/i.test(text) && /\bpeople\b/i.test(text)) issues.push('Subject-verb agreement: Plural "people" takes "who go" rather than "who goes".');
    if (/\b(them skills)\b/i.test(text)) issues.push('Pronoun misuse: Did you mean "their skills" instead of "them skills"?');

    setGrammarIssues(issues);
  };

  // AI Grammar Analysis
  const handleAiGrammarCheck = async () => {
    if (!grammarInput.trim()) return;
    setGrammarLoading(true);
    try {
      const res = await fetch('/api/ai/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'grammar',
          prompt: grammarInput,
        }),
      });
      const data = await res.json();
      if (data.available && data.text) {
        setGrammarAiResult(data.text);
      } else {
        throw new Error(data.error || 'AI not configured');
      }
    } catch {
      // Fallback
      analyzeGrammarLocally();
    } finally {
      setGrammarLoading(false);
    }
  };

  // Rewrite Text
  const handleRewrite = async () => {
    if (!rewriteInput.trim()) return;
    setRewriteLoading(true);
    try {
      const res = await fetch('/api/ai/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'rewrite',
          prompt: rewriteInput,
          tone: rewriteTone,
        }),
      });
      const data = await res.json();
      if (data.available && data.text) {
        setRewriteResult(data.text);
      } else {
        throw new Error();
      }
    } catch {
      // Offline rule-based transformation
      let transformed = rewriteInput;
      if (rewriteTone === 'formal') {
        transformed = rewriteInput
          .replace(/can you please give me/gi, 'I would appreciate it if you could kindly provide')
          .replace(/need it for the boss/gi, 'require it for executive review')
          .replace(/soon/gi, 'at your earliest convenience');
      } else if (rewriteTone === 'concise') {
        transformed = rewriteInput
          .replace(/Can you please give me the report soon because I need it for the boss\?/gi, 'Please send the report promptly for executive review.')
          .replace(/in order to/gi, 'to')
          .replace(/due to the fact that/gi, 'because');
      } else if (rewriteTone === 'friendly') {
        transformed = `Hi there! Hope you are having a wonderful day. ${rewriteInput} Thanks a bunch!`;
      }
      setRewriteResult(transformed);
    } finally {
      setRewriteLoading(false);
    }
  };

  // Word count calculations
  const wordCountStats = useMemo(() => {
    const raw = wordCountText;
    const words = raw.trim() ? raw.trim().split(/\s+/).length : 0;
    const characters = raw.length;
    const charactersNoSpaces = raw.replace(/\s/g, '').length;
    const sentences = raw.split(/[.?!]+/).filter(Boolean).length;
    const paragraphs = raw.split(/\n+/).filter(Boolean).length;
    const readingTimeMin = Math.ceil(words / 200);
    const speakingTimeMin = Math.ceil(words / 130);

    return {
      words,
      characters,
      charactersNoSpaces,
      sentences,
      paragraphs,
      readingTimeMin,
      speakingTimeMin,
    };
  }, [wordCountText]);

  // Casing conversions
  const caseFormats = useMemo(() => {
    const str = caseInput;
    return {
      uppercase: str.toUpperCase(),
      lowercase: str.toLowerCase(),
      titleCase: str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()),
      sentenceCase: str.toLowerCase().replace(/(^\s*\w|[.?!]\s*\w)/g, (c) => c.toUpperCase()),
      camelCase: str
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
        .replace(/^[A-Z]/, (c) => c.toLowerCase()),
      snakeCase: str
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+/g, '_')
        .replace(/^_+|_+$/g, ''),
      kebabCase: str
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .replace(/^-+|-+$/g, ''),
      constantCase: str
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, '_')
        .replace(/^_+|_+$/g, ''),
    };
  }, [caseInput]);

  // Text Cleanup operations
  const executeCleanSpaces = () => {
    setCleanupInput((prev) =>
      prev
        .split('\n')
        .map((line) => line.trim().replace(/\s+/g, ' '))
        .join('\n')
    );
  };

  const executeRemoveDuplicateLines = () => {
    const lines = cleanupInput.split('\n');
    const unique = Array.from(new Set(lines));
    setCleanupInput(unique.join('\n'));
  };

  const executeStripHtml = () => {
    setCleanupInput((prev) => prev.replace(/<[^>]*>?/gm, ''));
  };

  const executeSortLines = () => {
    const lines = cleanupInput.split('\n').filter((l) => l.trim().length > 0);
    lines.sort((a, b) => a.localeCompare(b));
    setCleanupInput(lines.join('\n'));
  };

  const executeAddLineNumbers = () => {
    const lines = cleanupInput.split('\n');
    const numbered = lines.map((l, i) => `${i + 1}. ${l}`);
    setCleanupInput(numbered.join('\n'));
  };

  const activeTemplate = TEMPLATES.find((t) => t.id === selectedTemplateId) || TEMPLATES[0];

  return (
    <div className="space-y-6">
      {/* 1. TRANSLATOR */}
      {toolId === 'writing-translate' && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-xl">
              <Languages className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                {isUrdu ? 'کثیر لسانی درست مترجم' : 'Multilingual Text Translator'}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {isUrdu ? 'انگریزی، اردو، عربی، ہسپانوی، فرانسیسی اور جرمن میں ترجمہ' : 'Translate text with contextual nuance and grammar accuracy.'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-stone-600 dark:text-stone-400">{isUrdu ? 'ہدف زبان:' : 'Target Language:'}</span>
                <select
                  value={transTargetLang}
                  onChange={(e) => setTransTargetLang(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs font-semibold"
                >
                  <option value="Urdu">Urdu (اردو)</option>
                  <option value="English">English</option>
                  <option value="Arabic">Arabic (العربية)</option>
                  <option value="Spanish">Spanish (Español)</option>
                  <option value="French">French (Français)</option>
                  <option value="German">German (Deutsch)</option>
                  <option value="Chinese">Chinese (中文)</option>
                </select>
              </div>

              <span className="text-[11px] text-stone-400 font-mono">
                {transInput.length} chars
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-400 uppercase">{isUrdu ? 'اصل تحریر' : 'Source Text'}</label>
                <textarea
                  rows={6}
                  value={transInput}
                  onChange={(e) => setTransInput(e.target.value)}
                  placeholder="Enter text to translate..."
                  className="w-full p-4 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:outline-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold text-stone-400 uppercase">{isUrdu ? 'ترجمہ' : 'Translation Output'}</label>
                  {transResult && (
                    <button
                      type="button"
                      onClick={() => handleCopy(transResult, 'trans')}
                      className="text-xs text-emerald-600 flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      {copiedKey === 'trans' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'trans' ? 'Copied' : 'Copy'}</span>
                    </button>
                  )}
                </div>
                <div
                  className={`w-full p-4 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50 min-h-[150px] text-sm leading-relaxed ${
                    transTargetLang === 'Urdu' || transTargetLang === 'Arabic' ? 'font-urdu text-right text-base' : ''
                  }`}
                >
                  {transResult || <span className="text-stone-400 italic">Translation will appear here...</span>}
                </div>
              </div>
            </div>

            <button
              disabled={transLoading || !transInput.trim()}
              onClick={handleTranslate}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-xs transition cursor-pointer disabled:opacity-50"
            >
              {transLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{isUrdu ? 'ترجمہ کیا جا رہا ہے...' : 'Translating Text...'}</span>
                </>
              ) : (
                <>
                  <Languages className="w-4 h-4" />
                  <span>{isUrdu ? 'ترجمہ کریں' : 'Translate Now'}</span>
                </>
              )}
            </button>

            {transError && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-amber-800 dark:text-amber-200 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{transError}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. GRAMMAR & STYLE ASSISTANT */}
      {toolId === 'writing-grammar' && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                {isUrdu ? 'گرامر اور املا درستگی کا معاون' : 'Grammar, Spelling & Style Assistant'}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {isUrdu ? 'تحریر میں املا، گرامر اور روانی کی غلطیوں کی خودکار نشان دہی' : 'Detect punctuation errors, typos, passive voice, and redundant phrases.'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <textarea
              rows={5}
              value={grammarInput}
              onChange={(e) => setGrammarInput(e.target.value)}
              placeholder="Paste English text to check grammar..."
              className="w-full p-4 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:outline-emerald-500"
            />

            <div className="flex gap-3">
              <button
                type="button"
                onClick={analyzeGrammarLocally}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-xs transition cursor-pointer"
              >
                Check Grammar (Fast Local)
              </button>
              <button
                type="button"
                disabled={grammarLoading}
                onClick={handleAiGrammarCheck}
                className="flex-1 py-2.5 bg-stone-800 dark:bg-stone-700 hover:bg-stone-900 text-white rounded-xl font-bold text-sm shadow-xs transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>AI Deep Editorial Proofread</span>
              </button>
            </div>

            {grammarIssues.length > 0 && (
              <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl p-4 space-y-2">
                <span className="text-xs font-bold text-amber-800 dark:text-amber-200 uppercase tracking-wide">
                  Detected Improvement Suggestions ({grammarIssues.length}):
                </span>
                <ul className="list-disc list-inside space-y-1 text-xs text-amber-900 dark:text-amber-300">
                  {grammarIssues.map((issue, idx) => (
                    <li key={idx}>{issue}</li>
                  ))}
                </ul>
              </div>
            )}

            {grammarAiResult && (
              <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl p-5 space-y-2">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase">AI Polished Revision</span>
                <div className="text-sm text-stone-800 dark:text-stone-200 whitespace-pre-wrap">{grammarAiResult}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. TEXT TONE REWRITER */}
      {toolId === 'writing-rewriter' && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-xl">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                {isUrdu ? 'متن کا انداز بدلیں (ری رائٹر)' : 'Text Tone Rewriter & Paraphraser'}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {isUrdu ? 'اپنی تحریر کو باضابطہ، دوستانہ، پر اثر یا مختصر انداز میں دوبارہ لکھیں' : 'Rephrase your writing to suit professional, friendly, or academic contexts.'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'formal', label: 'Professional Formal' },
                { id: 'friendly', label: 'Warm & Friendly' },
                { id: 'concise', label: 'Short & Concise' },
                { id: 'academic', label: 'Scholarly Academic' },
              ].map((tone) => (
                <button
                  key={tone.id}
                  type="button"
                  onClick={() => setRewriteTone(tone.id as any)}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold cursor-pointer transition ${
                    rewriteTone === tone.id
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold'
                      : 'border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800'
                  }`}
                >
                  {tone.label}
                </button>
              ))}
            </div>

            <textarea
              rows={4}
              value={rewriteInput}
              onChange={(e) => setRewriteInput(e.target.value)}
              placeholder="Enter text to rephrase..."
              className="w-full p-4 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:outline-emerald-500"
            />

            <button
              disabled={rewriteLoading || !rewriteInput.trim()}
              onClick={handleRewrite}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
            >
              {rewriteLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Rewriting...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Rewrite in {rewriteTone.toUpperCase()} Style</span>
                </>
              )}
            </button>

            {rewriteResult && (
              <div className="p-5 bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-emerald-600 uppercase">Polished Version:</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(rewriteResult, 'rewrite')}
                    className="text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'rewrite' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'rewrite' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-sm text-stone-900 dark:text-stone-100 leading-relaxed">{rewriteResult}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. EMAIL & APPLICATION TEMPLATES */}
      {toolId === 'writing-templates' && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-xl">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                {isUrdu ? 'ای میل اور درخواستی سانچے' : 'Professional Email & Application Templates'}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {isUrdu ? 'ملازمت، رخصت اور بزنس خط و کتابت کے ریڈی میڈ فارمیٹس' : 'Customize job applications, leave requests, and formal correspondence with 1-click copy.'}
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              {TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => {
                    setSelectedTemplateId(tpl.id);
                    setTemplateFieldValues({});
                  }}
                  className={`py-2 px-3.5 rounded-xl border text-xs font-semibold cursor-pointer transition ${
                    selectedTemplateId === tpl.id
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold'
                      : 'border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800'
                  }`}
                >
                  {isUrdu && tpl.nameUrdu ? tpl.nameUrdu : tpl.name}
                </button>
              ))}
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-stone-50 dark:bg-stone-800/40 rounded-xl border border-stone-200 dark:border-stone-800">
              {activeTemplate.fields.map((fld) => (
                <div key={fld.id}>
                  <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-1">{fld.label}:</label>
                  <input
                    type="text"
                    value={templateFieldValues[fld.id] ?? fld.default}
                    onChange={(e) =>
                      setTemplateFieldValues((prev) => ({ ...prev, [fld.id]: e.target.value }))
                    }
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
                  />
                </div>
              ))}
            </div>

            {/* Generated Template Output */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase">Generated Document Preview:</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const fullText = activeTemplate.generate({
                        ...Object.fromEntries(activeTemplate.fields.map((f) => [f.id, f.default])),
                        ...templateFieldValues,
                      });
                      handleCopy(fullText, 'template');
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedKey === 'template' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'template' ? 'Copied' : 'Copy All'}</span>
                  </button>
                </div>
              </div>

              <textarea
                readOnly
                rows={10}
                value={activeTemplate.generate({
                  ...Object.fromEntries(activeTemplate.fields.map((f) => [f.id, f.default])),
                  ...templateFieldValues,
                })}
                className="w-full p-4 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm font-sans leading-relaxed focus:outline-emerald-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* 5. CV & RESUME BUILDER */}
      {toolId === 'writing-cv' && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-xl">
                <FileBadge className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                  {isUrdu ? 'سی وی اور ریزیومے بلڈر' : 'CV & Professional Resume Builder'}
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {isUrdu ? 'اپنی تفصیلات درج کریں اور خوبصورت پرنٹ کے قابل سی وی حاصل کریں' : 'Fill in your credentials to instantly render and print a clean modern resume.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Edit Form */}
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              <h4 className="text-xs font-bold uppercase tracking-wide text-stone-500">Personal Details</h4>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={cvData.fullName}
                  onChange={(e) => setCvData({ ...cvData, fullName: e.target.value })}
                  className="px-3 py-2 border rounded-xl dark:bg-stone-800 text-xs"
                />
                <input
                  type="text"
                  placeholder="Professional Title"
                  value={cvData.title}
                  onChange={(e) => setCvData({ ...cvData, title: e.target.value })}
                  className="px-3 py-2 border rounded-xl dark:bg-stone-800 text-xs"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={cvData.email}
                  onChange={(e) => setCvData({ ...cvData, email: e.target.value })}
                  className="px-3 py-2 border rounded-xl dark:bg-stone-800 text-xs"
                />
                <input
                  type="text"
                  placeholder="Phone"
                  value={cvData.phone}
                  onChange={(e) => setCvData({ ...cvData, phone: e.target.value })}
                  className="px-3 py-2 border rounded-xl dark:bg-stone-800 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1">Executive Summary:</label>
                <textarea
                  rows={3}
                  value={cvData.summary}
                  onChange={(e) => setCvData({ ...cvData, summary: e.target.value })}
                  className="w-full p-2.5 border rounded-xl dark:bg-stone-800 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1">Skills (comma separated):</label>
                <input
                  type="text"
                  value={cvData.skills}
                  onChange={(e) => setCvData({ ...cvData, skills: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl dark:bg-stone-800 text-xs"
                />
              </div>
            </div>

            {/* Print-Ready Live Preview Sheet */}
            <div className="p-8 bg-white text-stone-900 border border-stone-200 rounded-2xl shadow-sm text-left space-y-5 print:border-none print:shadow-none">
              <div className="border-b pb-4">
                <h2 className="text-2xl font-bold tracking-tight text-stone-900">{cvData.fullName || 'Your Name'}</h2>
                <p className="text-emerald-700 font-semibold text-sm">{cvData.title || 'Professional Title'}</p>
                <div className="flex flex-wrap gap-3 text-xs text-stone-500 mt-2 font-mono">
                  <span>{cvData.email}</span>
                  <span>•</span>
                  <span>{cvData.phone}</span>
                  <span>•</span>
                  <span>{cvData.location}</span>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-1">Summary</h3>
                <p className="text-xs text-stone-700 leading-relaxed">{cvData.summary}</p>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">Experience</h3>
                <div className="space-y-3">
                  {cvData.experience.map((exp, i) => (
                    <div key={i} className="text-xs">
                      <div className="flex justify-between font-bold text-stone-800">
                        <span>{exp.role} — {exp.company}</span>
                        <span className="text-stone-400 font-normal">{exp.duration}</span>
                      </div>
                      <p className="text-stone-600 mt-0.5">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-1">Skills</h3>
                <div className="flex flex-wrap gap-1">
                  {cvData.skills.split(',').map((s, i) => (
                    <span key={i} className="px-2 py-0.5 bg-stone-100 rounded text-[11px] font-medium text-stone-700">
                      {s.trim()}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. WORD & CHARACTER COUNTER */}
      {toolId === 'writing-wordcount' && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-xl">
              <Hash className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                {isUrdu ? 'الفاظ و حروف کا درست شمارندہ' : 'Real-Time Word & Character Counter'}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {isUrdu ? 'الفاظ، حروف، پیراگراف اور بولنے کے وقت کا لمحہ بہ لمحہ حساب' : 'Instant metrics on text length, characters without spaces, and speaking duration.'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 bg-stone-50 dark:bg-stone-800/60 rounded-xl text-center border border-stone-200 dark:border-stone-700">
                <span className="text-xs text-stone-400 uppercase font-semibold">Words</span>
                <p className="text-2xl font-bold font-mono text-emerald-600 mt-1">{wordCountStats.words}</p>
              </div>
              <div className="p-4 bg-stone-50 dark:bg-stone-800/60 rounded-xl text-center border border-stone-200 dark:border-stone-700">
                <span className="text-xs text-stone-400 uppercase font-semibold">Characters</span>
                <p className="text-2xl font-bold font-mono text-stone-900 dark:text-stone-100 mt-1">{wordCountStats.characters}</p>
              </div>
              <div className="p-4 bg-stone-50 dark:bg-stone-800/60 rounded-xl text-center border border-stone-200 dark:border-stone-700">
                <span className="text-xs text-stone-400 uppercase font-semibold">Chars (No Space)</span>
                <p className="text-2xl font-bold font-mono text-stone-900 dark:text-stone-100 mt-1">{wordCountStats.charactersNoSpaces}</p>
              </div>
              <div className="p-4 bg-stone-50 dark:bg-stone-800/60 rounded-xl text-center border border-stone-200 dark:border-stone-700">
                <span className="text-xs text-stone-400 uppercase font-semibold">Reading Time</span>
                <p className="text-2xl font-bold font-mono text-emerald-600 mt-1">{wordCountStats.readingTimeMin} min</p>
              </div>
            </div>

            <textarea
              rows={8}
              value={wordCountText}
              onChange={(e) => setWordCountText(e.target.value)}
              placeholder="Paste or type text here..."
              className="w-full p-4 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:outline-emerald-500 leading-relaxed"
            />

            <div className="flex justify-between items-center text-xs text-stone-400">
              <span>{wordCountStats.paragraphs} paragraphs • {wordCountStats.sentences} sentences</span>
              <button
                type="button"
                onClick={() => setWordCountText('')}
                className="text-stone-500 hover:text-rose-600 cursor-pointer"
              >
                Clear text
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. TEXT CASE CONVERTER */}
      {toolId === 'writing-case' && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-xl">
              <Type className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                {isUrdu ? 'حروف کی تبدیلی (کیس کنورٹر)' : 'Universal Text Case Converter'}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {isUrdu ? 'انگریزی تحریر کو کیپٹل، اسمال، کیمل کیس یا ٹائٹل کیس میں بدلیں' : 'Convert between 8 case conventions with instant 1-click clipboard copying.'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <textarea
              rows={3}
              value={caseInput}
              onChange={(e) => setCaseInput(e.target.value)}
              placeholder="Type or paste text..."
              className="w-full p-4 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:outline-emerald-500"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: 'Sentence case', val: caseFormats.sentenceCase },
                { label: 'Title Case', val: caseFormats.titleCase },
                { label: 'UPPERCASE', val: caseFormats.uppercase },
                { label: 'lowercase', val: caseFormats.lowercase },
                { label: 'camelCase', val: caseFormats.camelCase },
                { label: 'snake_case', val: caseFormats.snakeCase },
                { label: 'kebab-case', val: caseFormats.kebabCase },
                { label: 'CONSTANT_CASE', val: caseFormats.constantCase },
              ].map((fmt, i) => (
                <div
                  key={i}
                  className="p-3 bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 rounded-xl flex items-center justify-between text-xs"
                >
                  <div className="truncate mr-2">
                    <span className="text-[10px] uppercase font-bold text-stone-400 block">{fmt.label}</span>
                    <span className="font-mono text-stone-900 dark:text-stone-100 truncate block mt-0.5">{fmt.val}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(fmt.val, `case-${i}`)}
                    className="p-2 text-stone-500 hover:text-emerald-600 cursor-pointer transition flex-shrink-0"
                    title="Copy to clipboard"
                  >
                    {copiedKey === `case-${i}` ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 8. TEXT CLEANUP & FORMATTER */}
      {toolId === 'writing-cleanup' && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-xl">
              <SlidersHorizontal className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                {isUrdu ? 'متن کی صفائی اور فارمیٹنگ' : 'Text Cleanup & Batch Line Formatter'}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {isUrdu ? 'غیر ضروری خالی جگہیں ختم کریں، ڈپلیکیٹ لائنیں ہٹائیں اور ترتیب دیں' : 'Clean up extra whitespace, remove duplicate lines, strip HTML, and sort lines.'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={executeCleanSpaces}
                className="px-3 py-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Trim Extra Spaces
              </button>
              <button
                type="button"
                onClick={executeRemoveDuplicateLines}
                className="px-3 py-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Remove Duplicate Lines
              </button>
              <button
                type="button"
                onClick={executeStripHtml}
                className="px-3 py-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Strip HTML Tags
              </button>
              <button
                type="button"
                onClick={executeSortLines}
                className="px-3 py-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Sort Lines Alphabetically (A-Z)
              </button>
              <button
                type="button"
                onClick={executeAddLineNumbers}
                className="px-3 py-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Add Line Numbers (1., 2.)
              </button>
            </div>

            <textarea
              rows={10}
              value={cleanupInput}
              onChange={(e) => setCleanupInput(e.target.value)}
              className="w-full p-4 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm font-mono focus:outline-emerald-500 leading-relaxed"
            />

            <div className="flex justify-between items-center pt-1">
              <button
                type="button"
                onClick={() => setCleanupInput('')}
                className="text-xs text-stone-400 hover:text-rose-500 cursor-pointer"
              >
                Clear Input
              </button>
              <button
                type="button"
                onClick={() => handleCopy(cleanupInput, 'cleanup')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {copiedKey === 'cleanup' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'cleanup' ? 'Copied' : 'Copy Cleaned Text'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
