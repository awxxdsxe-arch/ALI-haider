import React, { useState, useEffect } from 'react';
import {
  Divide,
  BookOpen,
  Volume2,
  FileText,
  Copy,
  Award,
  Edit3,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Printer,
  Download,
  Play,
  RotateCw,
  Check,
  HelpCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

// Pre-curated vocabulary list
const VOCABULARY_LIST = [
  {
    word: 'Resilient',
    phonetic: '/rɪˈzɪl.jənt/',
    partOfSpeech: 'adjective',
    definition: 'Able to withstand or recover quickly from difficult conditions or hardship.',
    definitionUrdu: 'مشکلات کا بہادری سے سامنا کر کے جلد سنبھلنے والا، لچکدار۔',
    example: 'The local community remained resilient and united following the severe storm.',
    synonyms: ['adaptable', 'tough', 'hardy', 'buoyant'],
  },
  {
    word: 'Pragmatic',
    phonetic: '/præɡˈmæt.ɪk/',
    partOfSpeech: 'adjective',
    definition: 'Dealing with things sensibly and realistically in a way that is based on practical rather than theoretical considerations.',
    definitionUrdu: 'عملی سوچ رکھنے والا، حقیقت پسندانہ۔',
    example: 'She adopted a pragmatic approach to budget management during the project.',
    synonyms: ['practical', 'sensible', 'matter-of-fact', 'realistic'],
  },
  {
    word: 'Ephemeral',
    phonetic: '/ɪˈfem.ər.əl/',
    partOfSpeech: 'adjective',
    definition: 'Lasting for a very short time; transient or fleeting.',
    definitionUrdu: 'عارضی، ناپائیدار، کچھ دیر رہنے والا۔',
    example: 'The beauty of the desert wildflowers is wondrous yet ephemeral.',
    synonyms: ['fleeting', 'transitory', 'short-lived', 'momentary'],
  },
  {
    word: 'Eloquent',
    phonetic: '/ˈel.ə.kwənt/',
    partOfSpeech: 'adjective',
    definition: 'Fluent or persuasive in speaking or writing; vividly expressive.',
    definitionUrdu: 'فصیح و بلیغ، شیریں بیاں، اثر انگیز۔',
    example: 'He gave an eloquent speech that moved the entire audience.',
    synonyms: ['articulate', 'expressive', 'fluent', 'persuasive'],
  },
  {
    word: 'Benevolent',
    phonetic: '/bəˈnev.əl.ənt/',
    partOfSpeech: 'adjective',
    definition: 'Well-meaning and kindly; serving a charitable rather than profit-making purpose.',
    definitionUrdu: 'ہمدرد، فیاض، خیر خواہ۔',
    example: 'The university received a generous endowment from a benevolent alumnus.',
    synonyms: ['kind-hearted', 'generous', 'altruistic', 'charitable'],
  },
  {
    word: 'Ubiquitous',
    phonetic: '/juːˈbɪk.wɪ.təs/',
    partOfSpeech: 'adjective',
    definition: 'Present, appearing, or found everywhere at the same time.',
    definitionUrdu: 'ہر جگہ حاضر یا موجود، ہمہ گیر۔',
    example: 'Smartphones have become ubiquitous across modern society.',
    synonyms: ['omnipresent', 'pervasive', 'everywhere', 'universal'],
  },
];

// Sample Quiz data
const SAMPLE_QUIZZES: Record<string, Array<{ question: string; options: string[]; answer: number; rationale: string }>> = {
  general: [
    {
      question: 'Which organelle is widely known as the powerhouse of the eukaryotic cell?',
      options: ['Ribosome', 'Mitochondria', 'Golgi Apparatus', 'Endoplasmic Reticulum'],
      answer: 1,
      rationale: 'Mitochondria produce most of the chemical energy (ATP) needed to power cellular biochemical reactions.',
    },
    {
      question: 'What is the speed of light in vacuum (approximate value)?',
      options: ['300,000 km/s', '150,000 km/s', '1,000,000 km/s', '3,000 km/s'],
      answer: 0,
      rationale: 'The speed of light in vacuum is approximately 299,792 km/s (or 3 × 10^8 m/s).',
    },
    {
      question: 'In mathematics, what is the value of the hypotenuse in a right triangle with sides 3 and 4?',
      options: ['5', '6', '7', '8'],
      answer: 0,
      rationale: 'By the Pythagorean theorem: c = √(3² + 4²) = √(9 + 16) = √25 = 5.',
    },
    {
      question: 'Which gas is most abundant in Earth’s atmosphere?',
      options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Argon'],
      answer: 2,
      rationale: 'Nitrogen comprises approximately 78% of Earth’s atmosphere, followed by Oxygen at about 21%.',
    },
    {
      question: 'What is the primary role of chlorophyll in green plants?',
      options: ['To absorb water', 'To capture light energy for photosynthesis', 'To store starch', 'To release nitrogen'],
      answer: 1,
      rationale: 'Chlorophyll absorbs blue and red wavelengths of solar energy to drive photosynthesis.',
    },
  ],
};

export const StudyTools: React.FC<{ toolId: string }> = ({ toolId }) => {
  const { language } = useApp();
  const isUrdu = language === 'ur';

  // 1. Math State
  const [mathInput, setMathInput] = useState('2x + 10 = 24');
  const [mathSolution, setMathSolution] = useState<{
    result: string;
    steps: string[];
    formulaUsed?: string;
  } | null>(null);

  // 2. Study Question Assistant State
  const [studyQuery, setStudyQuery] = useState('');
  const [studySubject, setStudySubject] = useState('Science');
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // 3. Vocab State
  const [vocabIndex, setVocabIndex] = useState(0);

  // 4. Summarizer State
  const [summaryInputText, setSummaryInputText] = useState('');
  const [summaryResult, setSummaryResult] = useState<{
    executive: string;
    bullets: string[];
    wordCountBefore: number;
    wordCountAfter: number;
  } | null>(null);

  // 5. Flashcards State
  const [flashcards, setFlashcards] = useState([
    { q: 'What is Newton’s First Law of Motion?', a: 'An object will remain at rest or in uniform motion unless acted upon by an external net force (Law of Inertia).' },
    { q: 'What is the formula for the Area of a Circle?', a: 'Area = π × r² (where r is the radius).' },
    { q: 'What does DNA stand for?', a: 'Deoxyribonucleic acid.' },
    { q: 'What is the capital of Australia?', a: 'Canberra.' },
    { q: 'What is an algorithm in computer science?', a: 'A finite sequence of well-defined, computer-implementable instructions to solve a class of problems.' },
  ]);
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [newCardQ, setNewCardQ] = useState('');
  const [newCardA, setNewCardA] = useState('');

  // 6. Quiz Generator State
  const [quizTopic, setQuizTopic] = useState('general');
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // 7. Study Notes State
  const [noteTitle, setNoteTitle] = useState('My Study Guide');
  const [noteContent, setNoteContent] = useState(
    '# Core Concepts\n- Review chapter formulas\n- Memorize definitions\n- Practice practice problems daily'
  );

  // Local Educational Math Solver
  const solveMathProblem = () => {
    const trimmed = mathInput.trim();
    if (!trimmed) return;

    // Check linear equation pattern: ax + b = c or ax - b = c
    const linearMatch = trimmed.match(/^([+-]?\d*)x\s*([+-]\s*\d+)?\s*=\s*([+-]?\d+)$/i);

    if (linearMatch) {
      const aRaw = linearMatch[1];
      const a = aRaw === '' || aRaw === '+' ? 1 : aRaw === '-' ? -1 : parseFloat(aRaw);
      const bRaw = linearMatch[2] ? linearMatch[2].replace(/\s+/g, '') : '0';
      const b = parseFloat(bRaw);
      const c = parseFloat(linearMatch[3]);

      const steps: string[] = [
        `Given linear equation: ${trimmed}`,
        `Step 1: Isolate the variable term by subtracting constant (${b}): ${a}x = ${c} - (${b}) => ${a}x = ${c - b}`,
        `Step 2: Divide both sides by the coefficient of x (${a}): x = (${c - b}) / ${a}`,
        `Step 3: Simplify: x = ${(c - b) / a}`,
      ];

      setMathSolution({
        result: `x = ${(c - b) / a}`,
        steps,
        formulaUsed: 'Linear Equation Isolation: ax + b = c  =>  x = (c - b) / a',
      });
      return;
    }

    // Check quadratic formula form: ax^2 + bx + c = 0
    // Try arithmetic evaluation safely
    try {
      // Evaluate standard arithmetic like: (25 * 4) + sqrt(144) or 15% of 200
      let sanitized = trimmed
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/sqrt\(([^)]+)\)/g, 'Math.sqrt($1)')
        .replace(/(\d+)%/g, '($1/100)');

      // Allow only numbers, operators, parens, and Math functions
      if (!/^[0-9+\-*/().\sMathsqrtpow]+$/.test(sanitized)) {
        throw new Error('Unsupported formula syntax');
      }

      // Safe evaluation of pure math expressions
      const evalResult = Function(`"use strict"; return (${sanitized})`)();
      setMathSolution({
        result: String(evalResult),
        steps: [
          `Original Expression: ${trimmed}`,
          `Evaluated standard arithmetic using order of operations (Parentheses, Exponents, Multiplication & Division, Addition & Subtraction).`,
          `Computed Value: ${evalResult}`,
        ],
        formulaUsed: 'BODMAS / PEMDAS Order of Operations',
      });
    } catch {
      setMathSolution({
        result: 'Unable to evaluate locally',
        steps: [
          'To solve complex expressions, ensure standard symbols are used (e.g. 5 * (10 + 2)).',
          'For advanced symbolic algebra or calculus, click "Ask AI Step Solver" below for complete explanation.',
        ],
      });
    }
  };

  // Ask AI endpoint for math or general study questions
  const askAiEndpoint = async (task: string, promptText: string) => {
    setIsLoadingAi(true);
    setAiError(null);
    setAiAnswer(null);

    try {
      const res = await fetch('/api/ai/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task,
          prompt: promptText,
          context: `Subject: ${studySubject}`,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.available) {
        throw new Error(data.error || 'AI assistance is unconfigured or unavailable.');
      }
      setAiAnswer(data.text);
    } catch (err: any) {
      setAiError(
        isUrdu
          ? 'سرور پر مصنوعی ذہانت سروس دستیاب نہیں ہے۔ نیچے دیے گئے آف لائن تعلیمی وسائل کا استعمال کریں۔'
          : `${err.message || 'AI service unavailable.'} You can use our comprehensive offline educational guides below.`
      );
    } finally {
      setIsLoadingAi(false);
    }
  };

  // Text Summarizer algorithm
  const generateLocalSummary = () => {
    if (!summaryInputText.trim()) return;

    const sentences = summaryInputText
      .split(/(?<=[.?!])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 10);

    const wordCountBefore = summaryInputText.trim().split(/\s+/).length;

    if (sentences.length <= 2) {
      setSummaryResult({
        executive: summaryInputText,
        bullets: sentences,
        wordCountBefore,
        wordCountAfter: wordCountBefore,
      });
      return;
    }

    // Extract top sentences
    const topSentences = sentences.slice(0, Math.min(sentences.length, 3));
    const bullets = sentences.slice(0, Math.min(sentences.length, 5)).map((s) => s.replace(/\.$/, ''));

    const executive = topSentences.join(' ');
    const wordCountAfter = executive.split(/\s+/).length;

    setSummaryResult({
      executive,
      bullets,
      wordCountBefore,
      wordCountAfter,
    });
  };

  // Pronounce word via SpeechSynthesis API
  const speakWord = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleAddFlashcard = () => {
    if (!newCardQ.trim() || !newCardA.trim()) return;
    setFlashcards((prev) => [...prev, { q: newCardQ.trim(), a: newCardA.trim() }]);
    setNewCardQ('');
    setNewCardA('');
  };

  const activeVocab = VOCABULARY_LIST[vocabIndex];
  const activeQuizList = SAMPLE_QUIZZES[quizTopic] || SAMPLE_QUIZZES.general;

  return (
    <div className="space-y-6">
      {/* 1. MATH CALCULATOR & STEP SOLVER */}
      {toolId === 'study-math' && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-xl">
              <Divide className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                {isUrdu ? 'ریاضی کا حل مع تفصیلی مراحل' : 'Educational Math Solver with Step-by-Step Breakdown'}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {isUrdu
                  ? 'الجبرا، بنیادی فارمولے اور اعداد و شمار کے حل کے تمام مراحل دیکھیں'
                  : 'Enter equations (e.g. 2x + 10 = 24) or arithmetic expressions with clear solution steps.'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                {isUrdu ? 'ریاضی کی مساوات یا سوال درج کریں:' : 'Enter Math Problem or Formula:'}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={mathInput}
                  onChange={(e) => setMathInput(e.target.value)}
                  placeholder="e.g. 2x + 10 = 24 or (50 * 4) + sqrt(144)"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm font-mono focus:outline-emerald-500"
                />
                <button
                  type="button"
                  onClick={solveMathProblem}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-xs transition cursor-pointer"
                >
                  {isUrdu ? 'حل کریں' : 'Solve Step-by-Step'}
                </button>
              </div>
            </div>

            {/* Quick sample chips */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-stone-400">{isUrdu ? 'مثالیں:' : 'Sample Problems:'}</span>
              {['2x + 10 = 24', '3x - 15 = 45', 'sqrt(144) + 25 * 3', '15% of 500'].map((sample) => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => {
                    setMathInput(sample);
                  }}
                  className="px-2.5 py-1 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-lg font-mono text-[11px] cursor-pointer"
                >
                  {sample}
                </button>
              ))}
            </div>

            {mathSolution && (
              <div className="bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-700 pb-3">
                  <div>
                    <span className="text-xs uppercase font-bold tracking-wider text-emerald-600">Final Result</span>
                    <p className="text-2xl font-mono font-bold text-stone-900 dark:text-stone-100">{mathSolution.result}</p>
                  </div>
                  {mathSolution.formulaUsed && (
                    <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs rounded-full font-medium">
                      {mathSolution.formulaUsed}
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wide">
                    {isUrdu ? 'حل کے مراحل:' : 'Educational Step Breakdown:'}
                  </h4>
                  <ol className="list-decimal list-inside space-y-1.5 text-sm font-mono text-stone-800 dark:text-stone-200">
                    {mathSolution.steps.map((st, i) => (
                      <li key={i} className="pl-1">
                        {st}
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="pt-2">
                  <button
                    disabled={isLoadingAi}
                    onClick={() => askAiEndpoint('math_explain', `Explain the mathematical principles and detailed derivation to solve: ${mathInput}`)}
                    className="w-full py-2 bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{isUrdu ? 'تفصیلی استادانہ وضاحت دیکھیں (AI)' : 'Request Deep Conceptual Tutor Explanation'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. STUDY QUESTION ASSISTANT */}
      {toolId === 'study-assistant' && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-xl">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                {isUrdu ? 'مطالعہ اور سوالات کا معاون' : 'Academic Study Question Assistant'}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {isUrdu
                  ? 'کسی بھی تعلیمی سوال پر تفصیلی، قابل فہم اور مدلل رہنمائی حاصل کریں'
                  : 'Ask curriculum questions across Science, Programming, World History, Literature, and Math.'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {['Science', 'Mathematics', 'Computer Science', 'History & Literature'].map((sub) => (
                <button
                  key={sub}
                  type="button"
                  onClick={() => setStudySubject(sub)}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold cursor-pointer transition ${
                    studySubject === sub
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                      : 'border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>

            <textarea
              rows={4}
              value={studyQuery}
              onChange={(e) => setStudyQuery(e.target.value)}
              placeholder={
                isUrdu
                  ? 'اپنا تعلیمی سوال یہاں لکھیں (مثلاً پودوں میں ضیائی تالیف کا عمل کیا ہے؟)'
                  : 'Enter your study question (e.g. Explain how photosynthesis converts light energy into chemical energy in simple terms)...'
              }
              className="w-full p-4 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:outline-emerald-500"
            />

            <button
              disabled={isLoadingAi || !studyQuery.trim()}
              onClick={() => askAiEndpoint('study_help', studyQuery)}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-xs transition cursor-pointer disabled:opacity-50"
            >
              {isLoadingAi ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{isUrdu ? 'جواب تیار کیا جا رہا ہے...' : 'Generating Educational Answer...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{isUrdu ? 'جواب حاصل کریں' : 'Ask Question Now'}</span>
                </>
              )}
            </button>

            {aiAnswer && (
              <div className="p-5 bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isUrdu ? 'تعلیمی جواب اور وضاحت:' : 'Comprehensive Explanation:'}</span>
                </div>
                <div className="text-sm text-stone-800 dark:text-stone-200 whitespace-pre-wrap leading-relaxed">
                  {aiAnswer}
                </div>
              </div>
            )}

            {aiError && (
              <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl text-amber-800 dark:text-amber-200 text-xs space-y-1">
                <div className="flex items-center gap-2 font-bold">
                  <AlertCircle className="w-4 h-4" />
                  <span>Notice:</span>
                </div>
                <p>{aiError}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. VOCABULARY PRACTICE & AUDIO */}
      {toolId === 'study-vocab' && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-xl">
              <Volume2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                {isUrdu ? 'الفاظ کا ذخیرہ اور آڈیو تلفظ' : 'High-Impact Vocabulary Practice with Audio Pronunciation'}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {isUrdu ? 'اہم الفاظ کے معانی، جملے، مترادفات اور درست تلفظ سنیں' : 'Master essential words with accurate speech audio, definitions, and contextual usage.'}
              </p>
            </div>
          </div>

          <div className="border border-stone-200 dark:border-stone-800 rounded-2xl p-8 bg-gradient-to-br from-stone-50 to-emerald-50/20 dark:from-stone-900 dark:to-emerald-950/20 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-3xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">{activeVocab.word}</h2>
                  <button
                    type="button"
                    onClick={() => speakWord(activeVocab.word)}
                    className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full transition shadow-xs cursor-pointer"
                    title="Listen to native pronunciation"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono text-sm text-stone-500">{activeVocab.phonetic}</span>
                  <span className="text-xs italic text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                    {activeVocab.partOfSpeech}
                  </span>
                </div>
              </div>

              <div className="text-xs text-stone-400 font-mono">
                Word {vocabIndex + 1} of {VOCABULARY_LIST.length}
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <span className="text-xs font-bold text-stone-400 uppercase tracking-wide">Definition</span>
                <p className="text-stone-800 dark:text-stone-200 font-medium text-base mt-0.5">{activeVocab.definition}</p>
                {activeVocab.definitionUrdu && (
                  <p className="text-emerald-700 dark:text-emerald-300 font-urdu text-sm mt-1">{activeVocab.definitionUrdu}</p>
                )}
              </div>

              <div>
                <span className="text-xs font-bold text-stone-400 uppercase tracking-wide">Example in Context</span>
                <p className="text-stone-700 dark:text-stone-300 italic text-sm mt-0.5">"{activeVocab.example}"</p>
              </div>

              <div>
                <span className="text-xs font-bold text-stone-400 uppercase tracking-wide">Synonyms</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {activeVocab.synonyms.map((syn) => (
                    <span
                      key={syn}
                      className="text-xs px-2.5 py-1 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md font-medium"
                    >
                      {syn}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-stone-200 dark:border-stone-800 pt-5">
              <button
                type="button"
                onClick={() => setVocabIndex((prev) => (prev > 0 ? prev - 1 : VOCABULARY_LIST.length - 1))}
                className="px-4 py-2 bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Previous Word
              </button>
              <button
                type="button"
                onClick={() => setVocabIndex((prev) => (prev + 1) % VOCABULARY_LIST.length)}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
              >
                Next Word
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. TEXT SUMMARIZER */}
      {toolId === 'study-summary' && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-xl">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                {isUrdu ? 'متن کا خلاصہ نگار' : 'Text Summarizer & Key Point Extractor'}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {isUrdu ? 'طویل اسباق، مضامین اور تحریر کا فوری ایگزیکٹو خلاصہ حاصل کریں' : 'Condense long articles and study chapters into clear executive summaries and takeaways.'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <textarea
              rows={6}
              value={summaryInputText}
              onChange={(e) => setSummaryInputText(e.target.value)}
              placeholder="Paste article, study chapter, or lecture text here..."
              className="w-full p-4 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:outline-emerald-500"
            />

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={generateLocalSummary}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-xs transition cursor-pointer flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
                <span>{isUrdu ? 'فوری خلاصہ حاصل کریں' : 'Summarize Text (Local Fast)'}</span>
              </button>

              <button
                type="button"
                onClick={() => askAiEndpoint('summarize', summaryInputText)}
                className="flex-1 py-2.5 bg-stone-800 dark:bg-stone-700 hover:bg-stone-900 text-white rounded-xl font-bold text-sm shadow-xs transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>{isUrdu ? 'مصنوعی ذہانت سے گہرا تجزیہ' : 'AI Deep Analysis & Summary'}</span>
              </button>
            </div>

            {summaryResult && (
              <div className="bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between text-xs border-b border-stone-200 dark:border-stone-700 pb-2">
                  <span className="font-bold uppercase tracking-wider text-emerald-600">Executive Summary</span>
                  <span className="text-stone-400">
                    Condensed from {summaryResult.wordCountBefore} to {summaryResult.wordCountAfter} words (
                    {Math.round((1 - summaryResult.wordCountAfter / Math.max(1, summaryResult.wordCountBefore)) * 100)}% shorter)
                  </span>
                </div>

                <p className="text-stone-800 dark:text-stone-200 text-sm leading-relaxed">{summaryResult.executive}</p>

                {summaryResult.bullets.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    <span className="text-xs font-bold text-stone-500 uppercase">Key Takeaways:</span>
                    <ul className="list-disc list-inside space-y-1 text-sm text-stone-700 dark:text-stone-300">
                      {summaryResult.bullets.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {aiAnswer && (
              <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl p-5 space-y-2">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase">AI Structured Summary</span>
                <div className="text-sm text-stone-800 dark:text-stone-200 whitespace-pre-wrap">{aiAnswer}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. FLASHCARDS STUDIO */}
      {toolId === 'study-flashcards' && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-xl">
              <Copy className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                {isUrdu ? 'فلیش کارڈز اسٹوڈیو' : 'Interactive Flashcards Practice Studio'}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {isUrdu ? 'کارڈ کو الٹ کر جواب دیکھیں اور اپنی یادداشت کو پرکھیں' : 'Click the card to flip between Question and Answer. Add your custom cards anytime.'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs text-stone-400 font-mono">
              <span>Card {cardIndex + 1} of {flashcards.length}</span>
              <span>Click card to reveal answer</span>
            </div>

            {/* Flip Card Container */}
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="h-60 rounded-2xl border-2 border-emerald-500/30 dark:border-emerald-500/20 bg-stone-50 dark:bg-stone-800/80 p-8 flex flex-col justify-between items-center text-center cursor-pointer select-none shadow-sm transition hover:shadow-md hover:border-emerald-500"
            >
              <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-3 py-1 rounded-full">
                {isFlipped ? 'ANSWER (Click to flip back)' : 'QUESTION (Click to reveal answer)'}
              </span>

              <p className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100 max-w-xl">
                {isFlipped ? flashcards[cardIndex]?.a : flashcards[cardIndex]?.q}
              </p>

              <span className="text-xs text-stone-400 flex items-center gap-1">
                <RotateCw className="w-3 h-3" /> Flip card
              </span>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setIsFlipped(false);
                  setCardIndex((prev) => (prev > 0 ? prev - 1 : flashcards.length - 1));
                }}
                className="px-4 py-2 bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Previous Card
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsFlipped(false);
                  setCardIndex((prev) => (prev + 1) % flashcards.length);
                }}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
              >
                Next Card
              </button>
            </div>

            {/* Add Custom Flashcard form */}
            <div className="border-t border-stone-200 dark:border-stone-800 pt-5 space-y-3">
              <h4 className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase">Add Your Own Flashcard:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Front Question..."
                  value={newCardQ}
                  onChange={(e) => setNewCardQ(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 text-sm dark:bg-stone-800"
                />
                <input
                  type="text"
                  placeholder="Back Answer..."
                  value={newCardA}
                  onChange={(e) => setNewCardA(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 text-sm dark:bg-stone-800"
                />
              </div>
              <button
                type="button"
                onClick={handleAddFlashcard}
                className="px-4 py-2 bg-stone-800 dark:bg-stone-700 hover:bg-stone-900 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Save New Card to Deck
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. QUIZ GENERATOR & PRACTICE */}
      {toolId === 'study-quiz' && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-xl">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                {isUrdu ? 'کوئز جنریٹر اور امتحانی مشق' : 'Self-Assessment Quiz & Knowledge Check'}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {isUrdu ? 'اپنے علم کی جانچ کے لیے کثیر الانتخابی سوالات حل کریں' : 'Answer multiple-choice questions to test your comprehension with immediate feedback.'}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {activeQuizList.map((item, qIdx) => (
              <div key={qIdx} className="p-5 border border-stone-200 dark:border-stone-800 rounded-2xl space-y-3 bg-stone-50/50 dark:bg-stone-950/30">
                <div className="flex items-start gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {qIdx + 1}
                  </span>
                  <h4 className="font-semibold text-stone-900 dark:text-stone-100 text-sm">{item.question}</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 pl-8">
                  {item.options.map((opt, optIdx) => {
                    const isSelected = selectedAnswers[qIdx] === optIdx;
                    const isCorrect = optIdx === item.answer;

                    let btnClass = 'border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800';
                    if (quizSubmitted) {
                      if (isCorrect) btnClass = 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 font-bold';
                      else if (isSelected && !isCorrect) btnClass = 'border-rose-600 bg-rose-50 dark:bg-rose-950 text-rose-800 dark:text-rose-200';
                    } else if (isSelected) {
                      btnClass = 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold';
                    }

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => {
                          if (!quizSubmitted) {
                            setSelectedAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
                          }
                        }}
                        className={`p-3 rounded-xl border text-left text-xs transition cursor-pointer flex items-center justify-between ${btnClass}`}
                      >
                        <span>{opt}</span>
                        {quizSubmitted && isCorrect && <Check className="w-4 h-4 text-emerald-600" />}
                      </button>
                    );
                  })}
                </div>

                {quizSubmitted && (
                  <div className="pl-8 text-xs text-stone-600 dark:text-stone-400 bg-white dark:bg-stone-800/60 p-3 rounded-xl border border-stone-200 dark:border-stone-700">
                    <span className="font-bold text-emerald-600">Explanation: </span>
                    {item.rationale}
                  </div>
                )}
              </div>
            ))}

            <div className="flex items-center justify-between pt-2">
              {!quizSubmitted ? (
                <button
                  type="button"
                  onClick={() => setQuizSubmitted(true)}
                  disabled={Object.keys(selectedAnswers).length === 0}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-xs transition cursor-pointer disabled:opacity-50"
                >
                  Submit & Check Score
                </button>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="text-sm font-bold">
                    Score:{' '}
                    <span className="text-emerald-600 font-mono text-base">
                      {
                        Object.entries(selectedAnswers).filter(
                          ([qIdx, ansIdx]) => activeQuizList[Number(qIdx)]?.answer === ansIdx
                        ).length
                      }{' '}
                      / {activeQuizList.length}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAnswers({});
                      setQuizSubmitted(false);
                    }}
                    className="px-4 py-2 bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Reset Quiz
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 7. STUDY NOTES & CHEAT SHEET */}
      {toolId === 'study-notes' && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-xl">
                <Edit3 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                  {isUrdu ? 'نوٹس اور پرنٹ کے لیے شیٹ' : 'Study Notes & Printable Sheets'}
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {isUrdu ? 'اپنے تعلیمی نوٹس تیار کریں، ڈاؤنلوڈ کریں یا پرنٹ کریں' : 'Organize your study summary sheets and print them cleanly formatted.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const blob = new Blob([`${noteTitle}\n\n${noteContent}`], { type: 'text/markdown' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${noteTitle.replace(/\s+/g, '_')}.md`;
                  a.click();
                }}
                className="px-3 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export .md</span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Notes</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              placeholder="Note Title..."
              className="w-full px-4 py-2 font-bold text-lg rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
            />

            <textarea
              rows={12}
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Write your study notes here using Markdown headers (#), bullet points (-), and definitions..."
              className="w-full p-4 font-mono text-sm rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 focus:outline-emerald-500 leading-relaxed"
            />
          </div>
        </div>
      )}
    </div>
  );
};
