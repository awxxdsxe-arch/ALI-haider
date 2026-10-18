import React, { useState, useMemo } from 'react';
import {
  Calculator,
  Percent,
  Calendar,
  Clock,
  Scale,
  Tag,
  TrendingUp,
  RotateCcw,
  Equal,
  Delete,
  ArrowRightLeft,
  Info,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CalculatorTools: React.FC<{ toolId: string }> = ({ toolId }) => {
  const { language } = useApp();
  const isUrdu = language === 'ur';

  // 1. BASIC CALCULATOR STATE
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [calcHistory, setCalcHistory] = useState<string[]>([]);
  const [calcMemory, setCalcMemory] = useState<number>(0);

  const handleCalcInput = (char: string) => {
    setCalcDisplay((prev) => {
      if (prev === '0' && char !== '.') return char;
      return prev + char;
    });
  };

  const handleCalcClear = () => {
    setCalcDisplay('0');
  };

  const handleCalcBackspace = () => {
    setCalcDisplay((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));
  };

  const handleCalcEvaluate = () => {
    try {
      let sanitized = calcDisplay
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/π/g, 'Math.PI')
        .replace(/sqrt\(([^)]+)\)/g, 'Math.sqrt($1)')
        .replace(/\^/g, '**');

      if (!/^[0-9+\-*/().\sMathPIsqrt**]+$/.test(sanitized)) {
        throw new Error('Invalid syntax');
      }

      const res = Function(`"use strict"; return (${sanitized})`)();
      const rounded = Number.isFinite(res) ? Math.round(res * 100000000) / 100000000 : res;
      setCalcHistory((prev) => [`${calcDisplay} = ${rounded}`, ...prev.slice(0, 9)]);
      setCalcDisplay(String(rounded));
    } catch {
      setCalcDisplay('Error');
      setTimeout(() => setCalcDisplay('0'), 1500);
    }
  };

  // 2. PERCENTAGE CALCULATOR STATE
  const [p1Percent, setP1Percent] = useState<number>(15);
  const [p1Value, setP1Value] = useState<number>(200);

  const [p2Val1, setP2Val1] = useState<number>(25);
  const [p2Val2, setP2Val2] = useState<number>(100);

  const [p3From, setP3From] = useState<number>(80);
  const [p3To, setP3To] = useState<number>(120);

  // 3. AGE CALCULATOR STATE
  const [birthDate, setBirthDate] = useState('2000-01-01');

  const ageDetails = useMemo(() => {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    const now = new Date();

    if (isNaN(birth.getTime()) || birth > now) return null;

    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    let days = now.getDate() - birth.getDate();

    if (days < 0) {
      months -= 1;
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    const diffMs = now.getTime() - birth.getTime();
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
    const totalWeeks = Math.floor(totalDays / 7);

    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayBorn = weekdays[birth.getDay()];

    // Next birthday calculation
    const nextBday = new Date(now.getFullYear(), birth.getMonth(), birth.getDate());
    if (nextBday < now) {
      nextBday.setFullYear(now.getFullYear() + 1);
    }
    const daysUntilNext = Math.ceil((nextBday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return {
      years,
      months,
      days,
      totalDays,
      totalHours,
      totalWeeks,
      dayBorn,
      daysUntilNext,
    };
  }, [birthDate]);

  // 4. DATE DIFFERENCE STATE
  const [date1, setDate1] = useState('2026-01-01');
  const [date2, setDate2] = useState('2026-10-18');

  const dateDiffResult = useMemo(() => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return null;

    const start = d1 < d2 ? d1 : d2;
    const end = d1 < d2 ? d2 : d1;

    const diffMs = end.getTime() - start.getTime();
    const totalDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(totalDays / 7);
    const remDays = totalDays % 7;

    // Working days (excluding Sat & Sun)
    let workdays = 0;
    const cur = new Date(start);
    while (cur < end) {
      const day = cur.getDay();
      if (day !== 0 && day !== 6) workdays++;
      cur.setDate(cur.getDate() + 1);
    }

    return {
      totalDays,
      weeks,
      remDays,
      workdays,
    };
  }, [date1, date2]);

  // 5. UNIT CONVERTER STATE
  const [unitCategory, setUnitCategory] = useState<'length' | 'weight' | 'temp' | 'volume' | 'data' | 'speed'>('length');
  const [unitFrom, setUnitFrom] = useState('m');
  const [unitTo, setUnitTo] = useState('ft');
  const [unitValue, setUnitValue] = useState<number>(10);

  // Conversion rates to base unit (meters for length, grams for weight, liters for vol, bytes for data, km/h for speed)
  const CONVERSIONS: Record<string, Record<string, number>> = {
    length: {
      m: 1,
      km: 1000,
      cm: 0.01,
      mm: 0.001,
      mi: 1609.344,
      yd: 0.9144,
      ft: 0.3048,
      in: 0.0254,
    },
    weight: {
      kg: 1000,
      g: 1,
      mg: 0.001,
      lb: 453.59237,
      oz: 28.3495,
      ton: 1000000,
    },
    volume: {
      l: 1,
      ml: 0.001,
      m3: 1000,
      gal: 3.78541,
      fl_oz: 0.0295735,
      cup: 0.236588,
    },
    data: {
      b: 1,
      kb: 1024,
      mb: 1024 * 1024,
      gb: 1024 * 1024 * 1024,
      tb: 1024 * 1024 * 1024 * 1024,
    },
    speed: {
      kmh: 1,
      mph: 1.60934,
      ms: 3.6,
      knot: 1.852,
    },
  };

  const convertedUnitValue = useMemo(() => {
    if (unitCategory === 'temp') {
      let celsius = unitValue;
      if (unitFrom === 'f') celsius = (unitValue - 32) * (5 / 9);
      else if (unitFrom === 'k') celsius = unitValue - 273.15;

      if (unitTo === 'c') return Math.round(celsius * 100) / 100;
      if (unitTo === 'f') return Math.round((celsius * (9 / 5) + 32) * 100) / 100;
      if (unitTo === 'k') return Math.round((celsius + 273.15) * 100) / 100;
      return unitValue;
    }

    const rates = CONVERSIONS[unitCategory];
    if (!rates || !rates[unitFrom] || !rates[unitTo]) return 0;

    const baseVal = unitValue * rates[unitFrom];
    const targetVal = baseVal / rates[unitTo];
    return Math.round(targetVal * 1000000) / 1000000;
  }, [unitCategory, unitFrom, unitTo, unitValue]);

  // Set default units when category changes
  const handleCategoryChange = (cat: any) => {
    setUnitCategory(cat);
    if (cat === 'length') {
      setUnitFrom('m');
      setUnitTo('ft');
    } else if (cat === 'weight') {
      setUnitFrom('kg');
      setUnitTo('lb');
    } else if (cat === 'temp') {
      setUnitFrom('c');
      setUnitTo('f');
    } else if (cat === 'volume') {
      setUnitFrom('l');
      setUnitTo('gal');
    } else if (cat === 'data') {
      setUnitFrom('gb');
      setUnitTo('mb');
    } else if (cat === 'speed') {
      setUnitFrom('kmh');
      setUnitTo('mph');
    }
  };

  // 6. DISCOUNT CALCULATOR STATE
  const [discOriginalPrice, setDiscOriginalPrice] = useState<number>(100);
  const [discPercent, setDiscPercent] = useState<number>(20);
  const [discTaxPercent, setDiscTaxPercent] = useState<number>(5);

  const discountResults = useMemo(() => {
    const discounted = discOriginalPrice * (1 - discPercent / 100);
    const savings = discOriginalPrice - discounted;
    const taxAmount = discounted * (discTaxPercent / 100);
    const finalPrice = discounted + taxAmount;

    return {
      discounted,
      savings,
      taxAmount,
      finalPrice: Math.round(finalPrice * 100) / 100,
    };
  }, [discOriginalPrice, discPercent, discTaxPercent]);

  // 7. SAVINGS CALCULATOR STATE
  const [savingsInitial, setSavingsInitial] = useState<number>(1000);
  const [savingsMonthly, setSavingsMonthly] = useState<number>(100);
  const [savingsRate, setSavingsRate] = useState<number>(6);
  const [savingsYears, setSavingsYears] = useState<number>(5);

  const savingsResults = useMemo(() => {
    let balance = savingsInitial;
    let totalDeposited = savingsInitial;
    const monthlyRate = savingsRate / 100 / 12;
    const yearlyBreakdown: Array<{ year: number; deposited: number; balance: number; interest: number }> = [];

    for (let y = 1; y <= savingsYears; y++) {
      for (let m = 1; m <= 12; m++) {
        balance += savingsMonthly;
        totalDeposited += savingsMonthly;
        balance += balance * monthlyRate;
      }
      yearlyBreakdown.push({
        year: y,
        deposited: Math.round(totalDeposited),
        balance: Math.round(balance),
        interest: Math.round(balance - totalDeposited),
      });
    }

    return {
      finalBalance: Math.round(balance),
      totalDeposited: Math.round(totalDeposited),
      totalInterest: Math.round(balance - totalDeposited),
      yearlyBreakdown,
    };
  }, [savingsInitial, savingsMonthly, savingsRate, savingsYears]);

  return (
    <div className="space-y-6">
      {/* 1. SCIENTIFIC BASIC CALCULATOR */}
      {toolId === 'calc-basic' && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-xl">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                {isUrdu ? 'سائنٹیفک اور عام کیلکولیٹر' : 'Scientific & Everyday Calculator'}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {isUrdu ? 'بنیادی ریاضیاتی عمل، میموری، اور ہسٹری لاگ' : 'Responsive keypad with memory storage, parentheses, square roots, and history.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-3">
              {/* Screen */}
              <div className="p-4 bg-stone-100 dark:bg-stone-950 rounded-2xl border border-stone-200 dark:border-stone-800 text-right">
                <span className="text-[11px] font-mono text-stone-400 block h-5">
                  {calcMemory !== 0 ? `M = ${calcMemory}` : ''}
                </span>
                <p className="text-3xl sm:text-4xl font-mono font-bold text-stone-900 dark:text-stone-100 truncate">
                  {calcDisplay}
                </p>
              </div>

              {/* Keypad */}
              <div className="grid grid-cols-4 gap-2 text-sm font-semibold">
                {/* Memory Row */}
                <button
                  type="button"
                  onClick={() => setCalcMemory((prev) => prev + parseFloat(calcDisplay || '0'))}
                  className="p-3 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-xs font-mono cursor-pointer"
                >
                  M+
                </button>
                <button
                  type="button"
                  onClick={() => setCalcMemory((prev) => prev - parseFloat(calcDisplay || '0'))}
                  className="p-3 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-xs font-mono cursor-pointer"
                >
                  M-
                </button>
                <button
                  type="button"
                  onClick={() => setCalcDisplay(String(calcMemory))}
                  className="p-3 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-xs font-mono cursor-pointer"
                >
                  MR
                </button>
                <button
                  type="button"
                  onClick={() => setCalcMemory(0)}
                  className="p-3 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-xs font-mono cursor-pointer"
                >
                  MC
                </button>

                {/* Operations */}
                <button
                  type="button"
                  onClick={handleCalcClear}
                  className="p-3.5 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 hover:bg-rose-200 cursor-pointer"
                >
                  C
                </button>
                <button
                  type="button"
                  onClick={handleCalcBackspace}
                  className="p-3.5 rounded-xl bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 cursor-pointer flex items-center justify-center"
                >
                  <Delete className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleCalcInput('(')}
                  className="p-3.5 rounded-xl bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 cursor-pointer"
                >
                  (
                </button>
                <button
                  type="button"
                  onClick={() => handleCalcInput(')')}
                  className="p-3.5 rounded-xl bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 cursor-pointer"
                >
                  )
                </button>

                {/* Digits 7,8,9, / */}
                {['7', '8', '9'].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => handleCalcInput(n)}
                    className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/80 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 cursor-pointer text-base"
                  >
                    {n}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handleCalcInput(' / ')}
                  className="p-3.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 cursor-pointer font-bold"
                >
                  ÷
                </button>

                {/* Digits 4,5,6, * */}
                {['4', '5', '6'].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => handleCalcInput(n)}
                    className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/80 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 cursor-pointer text-base"
                  >
                    {n}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handleCalcInput(' * ')}
                  className="p-3.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 cursor-pointer font-bold"
                >
                  ×
                </button>

                {/* Digits 1,2,3, - */}
                {['1', '2', '3'].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => handleCalcInput(n)}
                    className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/80 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 cursor-pointer text-base"
                  >
                    {n}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handleCalcInput(' - ')}
                  className="p-3.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 cursor-pointer font-bold"
                >
                  −
                </button>

                {/* 0, ., =, + */}
                <button
                  type="button"
                  onClick={() => handleCalcInput('0')}
                  className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/80 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 cursor-pointer text-base"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={() => handleCalcInput('.')}
                  className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/80 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 cursor-pointer text-base"
                >
                  .
                </button>
                <button
                  type="button"
                  onClick={handleCalcEvaluate}
                  className="p-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer shadow-xs text-base flex items-center justify-center"
                >
                  =
                </button>
                <button
                  type="button"
                  onClick={() => handleCalcInput(' + ')}
                  className="p-3.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 cursor-pointer font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* History Tape */}
            <div className="bg-stone-50 dark:bg-stone-800/50 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-stone-500 uppercase">
                <span>History Log</span>
                {calcHistory.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setCalcHistory([])}
                    className="text-[10px] text-stone-400 hover:underline cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="space-y-1.5 max-h-56 overflow-y-auto text-xs font-mono text-stone-700 dark:text-stone-300">
                {calcHistory.length === 0 ? (
                  <p className="text-stone-400 italic text-[11px] py-4 text-center">Calculations will appear here</p>
                ) : (
                  calcHistory.map((item, idx) => (
                    <div key={idx} className="p-1.5 rounded bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 truncate">
                      {item}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. PERCENTAGE CALCULATOR */}
      {toolId === 'calc-percentage' && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-xl">
              <Percent className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                {isUrdu ? 'فیصد کیلکولیٹر (تین طریقے)' : '3-in-1 Percentage Calculator'}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {isUrdu ? 'رقم کا تناسب، فیصد میں اضافہ، یا کمی معلوم کریں' : 'Calculate values from percentages, find ratios, and compute growth or drop.'}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Mode 1: What is X% of Y? */}
            <div className="p-4 bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-800 rounded-xl space-y-2">
              <span className="text-xs font-bold text-stone-600 dark:text-stone-400">1. What is X% of Y?</span>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span>What is</span>
                <input
                  type="number"
                  value={p1Percent}
                  onChange={(e) => setP1Percent(Number(e.target.value))}
                  className="w-20 px-2 py-1 border rounded-lg dark:bg-stone-800 text-center font-mono"
                />
                <span>% of</span>
                <input
                  type="number"
                  value={p1Value}
                  onChange={(e) => setP1Value(Number(e.target.value))}
                  className="w-24 px-2 py-1 border rounded-lg dark:bg-stone-800 text-center font-mono"
                />
                <span>=</span>
                <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-lg font-bold font-mono">
                  {Math.round(((p1Percent / 100) * p1Value) * 1000) / 1000}
                </span>
              </div>
            </div>

            {/* Mode 2: X is what percent of Y? */}
            <div className="p-4 bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-800 rounded-xl space-y-2">
              <span className="text-xs font-bold text-stone-600 dark:text-stone-400">2. X is what percent of Y?</span>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <input
                  type="number"
                  value={p2Val1}
                  onChange={(e) => setP2Val1(Number(e.target.value))}
                  className="w-24 px-2 py-1 border rounded-lg dark:bg-stone-800 text-center font-mono"
                />
                <span>is what % of</span>
                <input
                  type="number"
                  value={p2Val2}
                  onChange={(e) => setP2Val2(Number(e.target.value))}
                  className="w-24 px-2 py-1 border rounded-lg dark:bg-stone-800 text-center font-mono"
                />
                <span>=</span>
                <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-lg font-bold font-mono">
                  {p2Val2 !== 0 ? Math.round(((p2Val1 / p2Val2) * 100) * 100) / 100 : 0}%
                </span>
              </div>
            </div>

            {/* Mode 3: Percentage increase / decrease */}
            <div className="p-4 bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-800 rounded-xl space-y-2">
              <span className="text-xs font-bold text-stone-600 dark:text-stone-400">3. Percentage Change (Increase / Decrease)</span>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span>From</span>
                <input
                  type="number"
                  value={p3From}
                  onChange={(e) => setP3From(Number(e.target.value))}
                  className="w-24 px-2 py-1 border rounded-lg dark:bg-stone-800 text-center font-mono"
                />
                <span>to</span>
                <input
                  type="number"
                  value={p3To}
                  onChange={(e) => setP3To(Number(e.target.value))}
                  className="w-24 px-2 py-1 border rounded-lg dark:bg-stone-800 text-center font-mono"
                />
                <span>=</span>
                <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-lg font-bold font-mono">
                  {p3From !== 0 ? Math.round((((p3To - p3From) / p3From) * 100) * 100) / 100 : 0}%{' '}
                  {p3To >= p3From ? 'Increase' : 'Decrease'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. AGE CALCULATOR */}
      {toolId === 'calc-age' && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-xl">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                {isUrdu ? 'عمر اور سنگ میل کیلکولیٹر' : 'Exact Age & Milestone Calculator'}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {isUrdu ? 'اپنی اصل عمر سالوں، مہینوں، دنوں اور گھنٹوں میں معلوم کریں' : 'Calculate exact age down to the day, hours lived, day born, and birthday countdown.'}
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                {isUrdu ? 'اپنی تاریخ پیدائش منتخب کریں:' : 'Select Your Date of Birth:'}
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="px-4 py-2 border rounded-xl dark:bg-stone-800 text-sm font-mono"
              />
            </div>

            {ageDetails && (
              <div className="space-y-4">
                <div className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl">
                  <span className="text-xs uppercase font-bold text-emerald-600 tracking-wider">Your Exact Age</span>
                  <p className="text-3xl font-extrabold text-stone-900 dark:text-stone-100 mt-1">
                    {ageDetails.years} <span className="text-base font-normal text-stone-500">years,</span> {ageDetails.months}{' '}
                    <span className="text-base font-normal text-stone-500">months,</span> {ageDetails.days}{' '}
                    <span className="text-base font-normal text-stone-500">days</span>
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-4 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700 text-center">
                    <span className="text-xs text-stone-400 font-semibold uppercase">Total Days</span>
                    <p className="text-xl font-bold font-mono text-stone-900 dark:text-stone-100 mt-0.5">
                      {ageDetails.totalDays.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700 text-center">
                    <span className="text-xs text-stone-400 font-semibold uppercase">Total Hours</span>
                    <p className="text-xl font-bold font-mono text-stone-900 dark:text-stone-100 mt-0.5">
                      {ageDetails.totalHours.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700 text-center">
                    <span className="text-xs text-stone-400 font-semibold uppercase">Day of Birth</span>
                    <p className="text-lg font-bold text-emerald-600 mt-0.5">{ageDetails.dayBorn}</p>
                  </div>
                  <div className="p-4 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700 text-center">
                    <span className="text-xs text-stone-400 font-semibold uppercase">Next Birthday</span>
                    <p className="text-lg font-bold text-emerald-600 mt-0.5">In {ageDetails.daysUntilNext} days</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. DATE DIFFERENCE */}
      {toolId === 'calc-date' && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                {isUrdu ? 'تاریخوں کا درمیانی فرق' : 'Date Difference & Working Days Calculator'}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {isUrdu ? 'دو تاریخوں کے درمیان کل دن اور ورکنگ دن نکالیں' : 'Compute calendar days, weeks, and business days excluding weekends.'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1">Start Date:</label>
                <input
                  type="date"
                  value={date1}
                  onChange={(e) => setDate1(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl dark:bg-stone-800 text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1">End Date:</label>
                <input
                  type="date"
                  value={date2}
                  onChange={(e) => setDate2(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl dark:bg-stone-800 text-sm font-mono"
                />
              </div>
            </div>

            {dateDiffResult && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-5 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700 text-center">
                  <span className="text-xs text-stone-400 uppercase font-semibold">Total Calendar Days</span>
                  <p className="text-3xl font-extrabold font-mono text-emerald-600 mt-1">{dateDiffResult.totalDays}</p>
                  <span className="text-xs text-stone-500">
                    ({dateDiffResult.weeks} weeks and {dateDiffResult.remDays} days)
                  </span>
                </div>
                <div className="p-5 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700 text-center">
                  <span className="text-xs text-stone-400 uppercase font-semibold">Business Workdays</span>
                  <p className="text-3xl font-extrabold font-mono text-stone-900 dark:text-stone-100 mt-1">
                    {dateDiffResult.workdays}
                  </p>
                  <span className="text-xs text-stone-500">Excludes Saturdays & Sundays</span>
                </div>
                <div className="p-5 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700 text-center">
                  <span className="text-xs text-stone-400 uppercase font-semibold">Weekend Days</span>
                  <p className="text-3xl font-extrabold font-mono text-stone-500 mt-1">
                    {dateDiffResult.totalDays - dateDiffResult.workdays}
                  </p>
                  <span className="text-xs text-stone-500">Off-days in range</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. UNIVERSAL UNIT CONVERTER */}
      {toolId === 'calc-units' && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-xl">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                {isUrdu ? 'پیمائش اور اکائیوں کا تبادلہ' : 'Universal Unit Converter'}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {isUrdu ? 'لمبائی، وزن، درجہ حرارت، حجم اور ڈیٹا کی اکائیاں تبدیل کریں' : 'Instant conversions for length, mass, temperature, volume, digital data, and speed.'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Categories */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {[
                { id: 'length', label: 'Length' },
                { id: 'weight', label: 'Weight' },
                { id: 'temp', label: 'Temperature' },
                { id: 'volume', label: 'Volume' },
                { id: 'data', label: 'Data' },
                { id: 'speed', label: 'Speed' },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleCategoryChange(c.id)}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition ${
                    unitCategory === c.id
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold'
                      : 'border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Conversion controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div className="p-4 bg-stone-50 dark:bg-stone-800/40 rounded-xl border border-stone-200 dark:border-stone-800 space-y-2">
                <label className="text-[11px] font-bold text-stone-400 uppercase">From:</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={unitValue}
                    onChange={(e) => setUnitValue(Number(e.target.value))}
                    className="flex-1 px-3 py-2 border rounded-xl dark:bg-stone-800 font-mono text-sm"
                  />
                  <select
                    value={unitFrom}
                    onChange={(e) => setUnitFrom(e.target.value)}
                    className="px-3 py-2 border rounded-xl dark:bg-stone-800 text-xs font-semibold"
                  >
                    {unitCategory === 'length' && (
                      <>
                        <option value="m">Meters (m)</option>
                        <option value="km">Kilometers (km)</option>
                        <option value="cm">Centimeters (cm)</option>
                        <option value="mm">Millimeters (mm)</option>
                        <option value="mi">Miles (mi)</option>
                        <option value="yd">Yards (yd)</option>
                        <option value="ft">Feet (ft)</option>
                        <option value="in">Inches (in)</option>
                      </>
                    )}
                    {unitCategory === 'weight' && (
                      <>
                        <option value="kg">Kilograms (kg)</option>
                        <option value="g">Grams (g)</option>
                        <option value="mg">Milligrams (mg)</option>
                        <option value="lb">Pounds (lb)</option>
                        <option value="oz">Ounces (oz)</option>
                        <option value="ton">Metric Tons</option>
                      </>
                    )}
                    {unitCategory === 'temp' && (
                      <>
                        <option value="c">Celsius (°C)</option>
                        <option value="f">Fahrenheit (°F)</option>
                        <option value="k">Kelvin (K)</option>
                      </>
                    )}
                    {unitCategory === 'volume' && (
                      <>
                        <option value="l">Liters (L)</option>
                        <option value="ml">Milliliters (mL)</option>
                        <option value="gal">Gallons (US)</option>
                        <option value="fl_oz">Fluid Ounces (fl oz)</option>
                        <option value="cup">Cups</option>
                      </>
                    )}
                    {unitCategory === 'data' && (
                      <>
                        <option value="b">Bytes (B)</option>
                        <option value="kb">Kilobytes (KB)</option>
                        <option value="mb">Megabytes (MB)</option>
                        <option value="gb">Gigabytes (GB)</option>
                        <option value="tb">Terabytes (TB)</option>
                      </>
                    )}
                    {unitCategory === 'speed' && (
                      <>
                        <option value="kmh">km/h</option>
                        <option value="mph">mph</option>
                        <option value="ms">m/s</option>
                        <option value="knot">Knots</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-2">
                <label className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase">To:</label>
                <div className="flex gap-2 items-center">
                  <div className="flex-1 px-3 py-2 bg-white dark:bg-stone-800 border border-emerald-300 dark:border-emerald-700 rounded-xl font-mono text-base font-bold text-emerald-800 dark:text-emerald-200 truncate">
                    {convertedUnitValue}
                  </div>
                  <select
                    value={unitTo}
                    onChange={(e) => setUnitTo(e.target.value)}
                    className="px-3 py-2 border rounded-xl dark:bg-stone-800 text-xs font-semibold"
                  >
                    {unitCategory === 'length' && (
                      <>
                        <option value="ft">Feet (ft)</option>
                        <option value="m">Meters (m)</option>
                        <option value="km">Kilometers (km)</option>
                        <option value="cm">Centimeters (cm)</option>
                        <option value="mi">Miles (mi)</option>
                        <option value="in">Inches (in)</option>
                      </>
                    )}
                    {unitCategory === 'weight' && (
                      <>
                        <option value="lb">Pounds (lb)</option>
                        <option value="kg">Kilograms (kg)</option>
                        <option value="g">Grams (g)</option>
                        <option value="oz">Ounces (oz)</option>
                      </>
                    )}
                    {unitCategory === 'temp' && (
                      <>
                        <option value="f">Fahrenheit (°F)</option>
                        <option value="c">Celsius (°C)</option>
                        <option value="k">Kelvin (K)</option>
                      </>
                    )}
                    {unitCategory === 'volume' && (
                      <>
                        <option value="gal">Gallons (US)</option>
                        <option value="l">Liters (L)</option>
                        <option value="ml">Milliliters (mL)</option>
                        <option value="cup">Cups</option>
                      </>
                    )}
                    {unitCategory === 'data' && (
                      <>
                        <option value="mb">Megabytes (MB)</option>
                        <option value="gb">Gigabytes (GB)</option>
                        <option value="kb">Kilobytes (KB)</option>
                        <option value="tb">Terabytes (TB)</option>
                      </>
                    )}
                    {unitCategory === 'speed' && (
                      <>
                        <option value="mph">mph</option>
                        <option value="kmh">km/h</option>
                        <option value="ms">m/s</option>
                        <option value="knot">Knots</option>
                      </>
                    )}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. DISCOUNT & SALES TAX */}
      {toolId === 'calc-discount' && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-xl">
              <Tag className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                {isUrdu ? 'رعایت اور ٹیکس کیلکولیٹر' : 'Discount & Sales Tax Calculator'}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {isUrdu ? 'رعایت اور ٹیکس کے بعد حتمی قیمت اور کل بچت معلوم کریں' : 'Calculate checkout savings and final cost after sales discounts and taxes.'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1">Original Price ($):</label>
                <input
                  type="number"
                  value={discOriginalPrice}
                  onChange={(e) => setDiscOriginalPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-xl dark:bg-stone-800 text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1">Discount (%):</label>
                <input
                  type="number"
                  value={discPercent}
                  onChange={(e) => setDiscPercent(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-xl dark:bg-stone-800 text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1">Sales Tax (%):</label>
                <input
                  type="number"
                  value={discTaxPercent}
                  onChange={(e) => setDiscTaxPercent(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-xl dark:bg-stone-800 text-sm font-mono"
                />
              </div>
            </div>

            <div className="p-6 bg-stone-50 dark:bg-stone-800/50 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <span className="text-xs uppercase font-bold text-stone-400">Final Price to Pay</span>
                <span className="text-3xl font-extrabold text-emerald-600 font-mono">${discountResults.finalPrice}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex justify-between p-2 bg-white dark:bg-stone-800 rounded-lg">
                  <span className="text-stone-500">You Save:</span>
                  <span className="font-bold text-emerald-600 font-mono">${discountResults.savings.toFixed(2)}</span>
                </div>
                <div className="flex justify-between p-2 bg-white dark:bg-stone-800 rounded-lg">
                  <span className="text-stone-500">Tax Amount:</span>
                  <span className="font-bold font-mono text-stone-700 dark:text-stone-300">
                    ${discountResults.taxAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. SAVINGS & COMPOUND GROWTH */}
      {toolId === 'calc-savings' && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                {isUrdu ? 'بچت اور منافع کی منصوبہ بندی' : 'Savings & Compound Growth Projection'}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {isUrdu ? 'ماہانہ بچت اور متوقع منافع کا سال بہ سال تخمینہ' : 'Project long-term compound growth with initial deposit and monthly contributions.'}
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1">Initial Deposit ($):</label>
                <input
                  type="number"
                  value={savingsInitial}
                  onChange={(e) => setSavingsInitial(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-xl dark:bg-stone-800 text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1">Monthly Deposit ($):</label>
                <input
                  type="number"
                  value={savingsMonthly}
                  onChange={(e) => setSavingsMonthly(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-xl dark:bg-stone-800 text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1">Interest Rate (%/yr):</label>
                <input
                  type="number"
                  value={savingsRate}
                  onChange={(e) => setSavingsRate(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-xl dark:bg-stone-800 text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1">Years to Grow:</label>
                <input
                  type="number"
                  min={1}
                  max={40}
                  value={savingsYears}
                  onChange={(e) => setSavingsYears(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-xl dark:bg-stone-800 text-sm font-mono"
                />
              </div>
            </div>

            {/* Estimates Notice */}
            <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl text-blue-800 dark:text-blue-200 text-xs">
              <Info className="w-4 h-4 flex-shrink-0" />
              <span>Financial estimates are projected approximations for educational planning purposes.</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700 text-center">
                <span className="text-xs text-stone-400 font-semibold uppercase">Total Future Balance</span>
                <p className="text-2xl font-bold font-mono text-emerald-600 mt-1">
                  ${savingsResults.finalBalance.toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700 text-center">
                <span className="text-xs text-stone-400 font-semibold uppercase">Total Deposited</span>
                <p className="text-2xl font-bold font-mono text-stone-900 dark:text-stone-100 mt-1">
                  ${savingsResults.totalDeposited.toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700 text-center">
                <span className="text-xs text-stone-400 font-semibold uppercase">Total Interest Earned</span>
                <p className="text-2xl font-bold font-mono text-amber-600 mt-1">
                  ${savingsResults.totalInterest.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Yearly Table */}
            <div className="border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-bold uppercase">
                  <tr>
                    <th className="p-3">Year</th>
                    <th className="p-3">Total Contributed</th>
                    <th className="p-3">Interest Earned</th>
                    <th className="p-3">Ending Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 dark:divide-stone-800 font-mono">
                  {savingsResults.yearlyBreakdown.map((row) => (
                    <tr key={row.year} className="hover:bg-stone-50 dark:hover:bg-stone-800/40">
                      <td className="p-3 font-bold font-sans">Year {row.year}</td>
                      <td className="p-3">${row.deposited.toLocaleString()}</td>
                      <td className="p-3 text-emerald-600">+${row.interest.toLocaleString()}</td>
                      <td className="p-3 font-bold">${row.balance.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
