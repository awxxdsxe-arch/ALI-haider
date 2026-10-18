import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import compression from 'compression';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// High-speed response compression (Gzip / Deflate)
app.use(compression({
  threshold: 1024,
}));

// Security and parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Rate limiting map (in-memory sliding window)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 60; // 60 requests per minute

const rateLimiter = (req: Request, res: Response, next: Function) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return next();
  }

  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({
      error: 'Too many requests. Please wait a moment before trying again.',
      retryAfterMs: entry.resetTime - now,
    });
  }

  entry.count += 1;
  next();
};

app.use('/api', rateLimiter);

// In-memory reviews store with moderation flag
interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  role: string;
  date: string;
  approved: boolean;
  isDemo?: boolean;
}

const reviewsStore: Review[] = [
  {
    id: 'demo-1',
    author: 'Tariq Mehmood',
    rating: 5,
    comment: 'The PDF merger and image compressor worked instantly on my phone without needing an account or upload wait times.',
    role: 'Teacher & Student Counselor',
    date: '2026-09-12',
    approved: true,
    isDemo: true,
  },
  {
    id: 'demo-2',
    author: 'Sara Jenkins',
    rating: 5,
    comment: 'Clean, fast, and no ad popups. The study notes generator and discount calculator saved me so much time.',
    role: 'College Student',
    date: '2026-10-01',
    approved: true,
    isDemo: true,
  },
  {
    id: 'demo-3',
    author: 'Hamza Khan',
    rating: 5,
    comment: 'I use the unit converter and text formatting tools daily for work. Outstanding all-in-one utility.',
    role: 'Freelance Translator',
    date: '2026-10-10',
    approved: true,
    isDemo: true,
  }
];

const feedbackStore: Array<{
  id: string;
  name: string;
  email: string;
  category: string;
  message: string;
  date: string;
  status: string;
}> = [];

// Gemini client initialization
let genAiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    genAiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize Google GenAI SDK:', err);
  }
}

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    aiConfigured: Boolean(process.env.GEMINI_API_KEY && genAiClient),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    brand: 'Ali Haider — All-in-One Helper',
  });
});

// 2. AI Assist Endpoint (Study questions, math step explanations, grammar, translation, rewriting, summaries)
app.post('/api/ai/process', async (req, res) => {
  try {
    const { task, prompt, context, targetLang, tone } = req.body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({ error: 'Prompt is required.' });
    }

    if (prompt.length > 8000) {
      return res.status(400).json({ error: 'Prompt is too long (maximum 8,000 characters).' });
    }

    if (!process.env.GEMINI_API_KEY || !genAiClient) {
      return res.status(503).json({
        available: false,
        error: 'The Gemini AI service is currently unconfigured or requires an API key in Settings > Secrets.',
        details: 'Local offline tools remain fully functional.',
      });
    }

    let systemInstruction = 'You are the intelligent assistant for Ali Haider — All-in-One Helper. Provide accurate, clear, helpful, educational, and structured responses without fluff or filler.';
    
    if (task === 'study_help') {
      systemInstruction = 'You are an expert tutor. Break down concepts clearly with easy-to-understand explanations, examples, and key takeaways for students.';
    } else if (task === 'math_explain') {
      systemInstruction = 'You are a patient mathematics teacher. Provide clear step-by-step solutions with each intermediate calculation and formula explained.';
    } else if (task === 'grammar') {
      systemInstruction = 'You are a professional editor. Identify grammatical, spelling, and punctuation improvements, provide the corrected text, and list the specific rules or reasoning.';
    } else if (task === 'rewrite') {
      systemInstruction = `Rewrite the provided text in a ${tone || 'clear and polished'} tone while preserving the original meaning.`;
    } else if (task === 'summarize') {
      systemInstruction = 'Provide a structured summary of the text: 1) Executive Summary (2-3 sentences), 2) Key Takeaways (bullet points), 3) Actionable Points or Conclusions.';
    } else if (task === 'translate') {
      systemInstruction = `Translate the user text accurately into ${targetLang || 'English'}. Preserve formatting, context, and nuance. If translating to Urdu, provide proper Nastaliq-friendly phrasing.`;
    }

    let userContent = prompt;
    if (context) {
      userContent = `Context:\n${context}\n\nTask/Question:\n${prompt}`;
    }

    const response = await genAiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userContent,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const resultText = response.text || '';
    return res.json({
      available: true,
      text: resultText,
    });
  } catch (err: any) {
    console.error('AI processing error:', err);
    return res.status(500).json({
      available: false,
      error: 'An error occurred while generating AI assistance.',
      message: err.message || 'Unknown error',
    });
  }
});

// 3. User Reviews API
app.get('/api/reviews', (req, res) => {
  // Return reviews
  const approved = reviewsStore.filter((r) => r.approved);
  res.json({
    reviews: approved,
    hasRealReviews: approved.some((r) => !r.isDemo),
    count: approved.length,
  });
});

app.post('/api/reviews', (req, res) => {
  const { author, rating, comment, role } = req.body;

  if (!author || typeof author !== 'string' || author.trim().length < 2) {
    return res.status(400).json({ error: 'Please provide a valid name (at least 2 characters).' });
  }

  const numRating = Number(rating);
  if (isNaN(numRating) || numRating < 1 || numRating > 5) {
    return res.status(400).json({ error: 'Rating must be an integer between 1 and 5.' });
  }

  if (!comment || typeof comment !== 'string' || comment.trim().length < 5) {
    return res.status(400).json({ error: 'Review text must be at least 5 characters.' });
  }

  // Sanitize
  const cleanAuthor = author.replace(/[<>]/g, '').trim().slice(0, 50);
  const cleanComment = comment.replace(/[<>]/g, '').trim().slice(0, 500);
  const cleanRole = (role || 'User').replace(/[<>]/g, '').trim().slice(0, 40);

  const newReview: Review = {
    id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    author: cleanAuthor,
    rating: Math.round(numRating),
    comment: cleanComment,
    role: cleanRole,
    date: new Date().toISOString().split('T')[0],
    approved: true, // auto-approve verified user submissions in demo or mark for moderation
    isDemo: false,
  };

  reviewsStore.unshift(newReview);

  return res.status(201).json({
    success: true,
    message: 'Review successfully submitted! Thank you for your feedback.',
    review: newReview,
  });
});

// 4. Feedback & Tool Suggestions API
app.post('/api/feedback', (req, res) => {
  const { name, email, category, message } = req.body;

  if (!message || typeof message !== 'string' || message.trim().length < 5) {
    return res.status(400).json({ error: 'Please enter your message (at least 5 characters).' });
  }

  const cleanName = (name || 'Anonymous').replace(/[<>]/g, '').trim().slice(0, 60);
  const cleanEmail = (email || '').replace(/[<>]/g, '').trim().slice(0, 100);
  const cleanCategory = (category || 'general').replace(/[<>]/g, '').trim().slice(0, 50);
  const cleanMessage = message.replace(/[<>]/g, '').trim().slice(0, 1000);

  const entry = {
    id: `fb-${Date.now()}`,
    name: cleanName,
    email: cleanEmail,
    category: cleanCategory,
    message: cleanMessage,
    date: new Date().toISOString(),
    status: 'received',
  };

  feedbackStore.push(entry);

  return res.status(200).json({
    success: true,
    message: 'Thank you! Your feedback has been received and logged for review.',
  });
});

// SEO: robots.txt and sitemap.xml
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(['User-agent: *', 'Allow: /', `Sitemap: ${req.protocol}://${req.get('host')}/sitemap.xml`].join('\n'));
});

app.get('/sitemap.xml', (req, res) => {
  const host = `${req.protocol}://${req.get('host')}`;
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${host}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${host}/#tools-pdf</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${host}/#tools-image</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${host}/#tools-study</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${host}/#tools-writing</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${host}/#tools-calculators</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${host}/#help</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${host}/#about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
</urlset>`;
  res.type('application/xml');
  res.send(xml);
});

// Setup Vite in Dev or serve build in Prod
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    // Serve production static assets with immutable cache for hashed bundles
    app.use(
      express.static(path.resolve(__dirname, 'dist'), {
        maxAge: '1y',
        immutable: true,
        setHeaders: (res, filePath) => {
          if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache, must-revalidate');
          }
        },
      })
    );
    app.get('*', (req, res) => {
      res.setHeader('Cache-Control', 'no-cache, must-revalidate');
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    // Development mode with Vite middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Ali Haider All-in-One Helper server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
