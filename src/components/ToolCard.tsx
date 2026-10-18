import React from 'react';
import {
  Layers,
  Scissors,
  Minimize2,
  FileImage,
  FileCheck,
  RotateCw,
  Maximize,
  Zap,
  Crop,
  RefreshCw,
  Compass,
  Divide,
  BookOpen,
  Volume2,
  FileText,
  Copy,
  Award,
  Edit3,
  Languages,
  CheckCircle2,
  Sparkles,
  Mail,
  FileBadge,
  Hash,
  Type,
  SlidersHorizontal,
  Calculator,
  Percent,
  Calendar,
  Clock,
  Scale,
  Tag,
  TrendingUp,
  ShieldCheck,
  MessageSquarePlus,
  Star,
  ArrowRight,
  Lock,
} from 'lucide-react';
import { ToolDefinition } from '../types';
import { useApp } from '../context/AppContext';

// Dynamic icon mapper
const ICON_MAP: Record<string, React.ElementType> = {
  Layers,
  Scissors,
  Minimize2,
  FileImage,
  FileCheck,
  RotateCw,
  Maximize,
  Zap,
  Crop,
  RefreshCw,
  Compass,
  Divide,
  BookOpen,
  Volume2,
  FileText,
  Copy,
  Award,
  Edit3,
  Languages,
  CheckCircle2,
  Sparkles,
  Mail,
  FileBadge,
  Hash,
  Type,
  SlidersHorizontal,
  Calculator,
  Percent,
  Calendar,
  Clock,
  Scale,
  Tag,
  TrendingUp,
  ShieldCheck,
  MessageSquarePlus,
};

export const ToolCard: React.FC<{ tool: ToolDefinition }> = ({ tool }) => {
  const { openTool, favorites, toggleFavorite, language } = useApp();
  const isUrdu = language === 'ur';

  const isFavorite = favorites.includes(tool.id);
  const IconComponent = ICON_MAP[tool.icon] || FileText;

  return (
    <div
      onClick={() => openTool(tool.id)}
      className="group relative bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800/80 hover:border-emerald-500/80 dark:hover:border-emerald-500 rounded-3xl p-6 transition-all duration-200 hover:shadow-lg flex flex-col justify-between cursor-pointer"
    >
      <div className="space-y-4">
        {/* Card Header: Icon, badges, and Favorite star */}
        <div className="flex items-center justify-between">
          <div className="p-3 bg-stone-100 dark:bg-stone-800 text-emerald-700 dark:text-emerald-400 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-200 shadow-xs">
            <IconComponent className="w-5 h-5" />
          </div>

          <div className="flex items-center gap-1.5">
            {tool.badge && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/40">
                {tool.badge}
              </span>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(tool.id);
              }}
              className="p-1.5 text-stone-400 hover:text-amber-500 dark:hover:text-amber-400 rounded-full transition cursor-pointer"
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Title and Description */}
        <div className="space-y-1.5">
          <h3 className="font-bold text-stone-900 dark:text-stone-100 text-base group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            {isUrdu && tool.nameUrdu ? tool.nameUrdu : tool.name}
          </h3>
          <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed line-clamp-2">
            {isUrdu && tool.descriptionUrdu ? tool.descriptionUrdu : tool.description}
          </p>
        </div>
      </div>

      {/* Card Footer */}
      <div className="pt-4 mt-4 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between text-xs">
        <span className="text-[11px] text-stone-400 flex items-center gap-1 font-medium">
          {tool.isClientSideOnly ? (
            <>
              <Lock className="w-3 h-3 text-emerald-600" />
              <span>{isUrdu ? '100% نجی براؤزر' : 'Device-only'}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>{isUrdu ? 'مصنوعی ذہانت' : 'AI Powered'}</span>
            </>
          )}
        </span>

        <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
          <span>{isUrdu ? 'کھولیں' : 'Open'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
};
