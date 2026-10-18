import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Send, CheckCircle2, AlertCircle, RefreshCw, ShieldAlert, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ReviewItem } from '../types';

export const ReviewsSection: React.FC = () => {
  const { language } = useApp();
  const isUrdu = language === 'ur';

  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [hasRealReviews, setHasRealReviews] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Submission Form State
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [author, setAuthor] = useState('');
  const [role, setRole] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load reviews from backend
  const loadReviews = async () => {
    try {
      const res = await fetch('/api/reviews');
      const data = await res.json();
      if (data && Array.isArray(data.reviews)) {
        setReviews(data.reviews);
        setHasRealReviews(data.hasRealReviews || false);
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !comment.trim()) return;

    setIsSubmitting(true);
    setSubmissionStatus(null);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author,
          role,
          rating,
          comment,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit review.');

      setSubmissionStatus({
        type: 'success',
        text: isUrdu
          ? 'آپ کا ریویو موصول ہو گیا ہے اور کامیابی سے شامل کر لیا گیا ہے۔ شکریہ!'
          : 'Thank you! Your verified review has been recorded.',
      });

      setAuthor('');
      setRole('');
      setComment('');
      setRating(5);
      await loadReviews();
      setTimeout(() => setShowSubmitModal(false), 2000);
    } catch (err: any) {
      setSubmissionStatus({
        type: 'error',
        text: err.message || 'Error submitting review.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Only compute rating average if real reviews exist
  const realReviews = reviews.filter((r) => !r.isDemo);
  const realAvg =
    realReviews.length > 0
      ? (realReviews.reduce((acc, r) => acc + r.rating, 0) / realReviews.length).toFixed(1)
      : null;

  return (
    <section className="mt-16 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 sm:p-10 shadow-xs space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 dark:border-stone-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              {isUrdu ? 'صارفین کے تاثرات اور ریویوز' : 'Verified Community Feedback & Reviews'}
            </h2>
            {realAvg && (
              <span className="px-2.5 py-1 bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 rounded-lg text-xs font-bold font-mono">
                ★ {realAvg} / 5.0
              </span>
            )}
          </div>
          <p className="text-xs text-stone-500 mt-1">
            {isUrdu
              ? 'دنیا بھر کے طلباء اور عام صارفین کے حقیقی تاثرات'
              : 'Real feedback submitted by students, educators, and professionals.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setSubmissionStatus(null);
            setShowSubmitModal(true);
          }}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition cursor-pointer self-start sm:self-auto"
        >
          <MessageSquare className="w-4 h-4" />
          <span>{isUrdu ? 'اپنی رائے درج کریں' : 'Write a Review'}</span>
        </button>
      </div>

      {/* Honesty Disclosure Banner for demo reviews */}
      {!hasRealReviews && (
        <div className="flex items-center gap-2.5 p-3.5 bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700 rounded-2xl text-xs text-stone-500">
          <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>
            {isUrdu
              ? 'نوٹ: فی الحال مظاہرے کے لیے نمونہ آراء دکھائی جا رہی ہیں۔ حقیقی ریویو کی اوسط صرف تب دکھائی جائے گی جب اصلی صارفین ریویو درج کریں۔'
              : 'Transparency Notice: Demonstration sample cards are marked below until real user submissions are posted. No rating average is fabricated.'}
          </span>
        </div>
      )}

      {/* Reviews Grid */}
      {isLoading ? (
        <div className="py-8 text-center text-xs text-stone-400">Loading verified reviews...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 ${
                rev.isDemo
                  ? 'bg-stone-50/50 dark:bg-stone-900/40 border-dashed border-stone-300 dark:border-stone-700'
                  : 'bg-white dark:bg-stone-850 border-emerald-500/20 shadow-xs'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300 dark:text-stone-700'
                        }`}
                      />
                    ))}
                  </div>
                  {rev.isDemo ? (
                    <span className="text-[10px] uppercase font-bold text-stone-400 bg-stone-200 dark:bg-stone-800 px-2 py-0.5 rounded">
                      Sample Content
                    </span>
                  ) : (
                    <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded">
                      Verified
                    </span>
                  )}
                </div>

                <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>

              <div className="flex items-center gap-2.5 pt-3 border-t border-stone-100 dark:border-stone-800">
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold text-xs flex-shrink-0">
                  {rev.author.charAt(0).toUpperCase()}
                </div>
                <div className="truncate">
                  <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">{rev.author}</h4>
                  <p className="text-[11px] text-stone-400 truncate">{rev.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Submission Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex justify-between items-start border-b border-stone-100 dark:border-stone-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">Submit Your Review</h3>
                <p className="text-xs text-stone-500">Share your honest experience with Ali Haider utilities</p>
              </div>
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1">Your Name:</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Maryam Siddiqui"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl dark:bg-stone-800 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1">Role / Profession:</label>
                  <input
                    type="text"
                    placeholder="e.g. Student / Designer"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl dark:bg-stone-800 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1">Rating (1 to 5 Stars):</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 cursor-pointer transition transform hover:scale-110"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300 dark:text-stone-700'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1">Your Review:</label>
                <textarea
                  required
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What tool did you use and how was your experience?"
                  className="w-full p-3 border rounded-xl dark:bg-stone-800 text-xs focus:outline-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !author.trim() || !comment.trim()}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Submitting review...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Post Review</span>
                  </>
                )}
              </button>

              {submissionStatus && (
                <div
                  className={`p-3 rounded-xl flex items-center gap-2 text-xs ${
                    submissionStatus.type === 'error'
                      ? 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950 dark:text-rose-200'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-200'
                  }`}
                >
                  {submissionStatus.type === 'error' ? (
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                  )}
                  <span>{submissionStatus.text}</span>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
