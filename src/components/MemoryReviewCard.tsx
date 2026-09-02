import React from 'react';
import { Brain, BookmarkCheck, X, Sparkles, Target, AlertCircle, Heart, Lightbulb, Repeat, Clock } from 'lucide-react';
import { MemorySuggestion, MemoryCategory } from '../types';

interface MemoryReviewCardProps {
  suggestion: MemorySuggestion;
  onSave: (suggestion: MemorySuggestion) => Promise<void>;
  onDismiss: () => void;
  isSaving?: boolean;
}

const CATEGORY_CONFIG: Record<
  MemoryCategory,
  { label: string; icon: React.ComponentType<{ className?: string }>; bg: string; text: string; border: string }
> = {
  goal: {
    label: 'Goal',
    icon: Target,
    bg: 'bg-[#edf4e8]',
    text: 'text-[#415b36]',
    border: 'border-[#d2e2ca]',
  },
  concern: {
    label: 'Concern',
    icon: AlertCircle,
    bg: 'bg-[#faf0e6]',
    text: 'text-[#96522c]',
    border: 'border-[#ebd4c2]',
  },
  preference: {
    label: 'Preference',
    icon: Heart,
    bg: 'bg-[#f6effa]',
    text: 'text-[#6a3f78]',
    border: 'border-[#e4cee8]',
  },
  realization: {
    label: 'Realization',
    icon: Lightbulb,
    bg: 'bg-[#fef8e7]',
    text: 'text-[#946e16]',
    border: 'border-[#f2e2b6]',
  },
  pattern: {
    label: 'Pattern',
    icon: Repeat,
    bg: 'bg-[#eef4f8]',
    text: 'text-[#35617a]',
    border: 'border-[#c9dde8]',
  },
  ongoing: {
    label: 'Ongoing',
    icon: Clock,
    bg: 'bg-[#f2eee7]',
    text: 'text-[#5e584f]',
    border: 'border-[#dbd3c5]',
  },
};

export const MemoryReviewCard: React.FC<MemoryReviewCardProps> = ({
  suggestion,
  onSave,
  onDismiss,
  isSaving = false,
}) => {
  const categoryConfig = CATEGORY_CONFIG[suggestion.category] || CATEGORY_CONFIG.realization;
  const CategoryIcon = categoryConfig.icon;

  return (
    <div
      id="memory-review-card"
      className="bg-[#ffffff] rounded-2xl border-2 border-[#48533e]/20 p-5 sm:p-6 shadow-sm animate-in fade-in slide-in-from-top-3 duration-300 relative overflow-hidden"
    >
      {/* Decorative accent strip */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-[#48533e] via-[#8c8275] to-[#d8be9b]" />

      <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#f0ebe1]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#48533e] text-[#fbfaf8] flex items-center justify-center shrink-0 shadow-xs">
            <Brain className="w-4 h-4 text-[#d8be9b]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#2d2b28] uppercase tracking-wider font-serif">
                A Possible Memory
              </span>
              <span
                className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium border ${categoryConfig.bg} ${categoryConfig.text} ${categoryConfig.border}`}
              >
                <CategoryIcon className="w-3 h-3" />
                <span>{categoryConfig.label}</span>
              </span>
            </div>
            <p className="text-[11px] text-[#7d7568]">
              Gemini identified a meaningful long-term reflection insight
            </p>
          </div>
        </div>

        <button
          id="dismiss-memory-btn"
          onClick={onDismiss}
          disabled={isSaving}
          title="Not Now"
          className="text-[#9e9587] hover:text-[#554e43] p-1.5 rounded-lg hover:bg-[#faf8f5] transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3.5">
        <blockquote className="text-sm font-medium text-[#2d2b28] leading-relaxed bg-[#faf8f5] p-3.5 rounded-xl border border-[#e8e4dc] italic">
          &ldquo;{suggestion.content}&rdquo;
        </blockquote>

        <p className="mt-2 text-[11px] text-[#6d665a] leading-normal">
          Memories are only saved when you explicitly approve them. Approved memories are stored privately under your profile.
        </p>

        <div className="mt-4 flex items-center gap-2.5 justify-end">
          <button
            id="memory-not-now-btn"
            type="button"
            onClick={onDismiss}
            disabled={isSaving}
            className="px-4 py-2 rounded-xl text-xs font-medium text-[#6d665a] hover:text-[#2d2b28] hover:bg-[#ede7dc] transition disabled:opacity-50 cursor-pointer"
          >
            Not Now
          </button>

          <button
            id="save-memory-btn"
            type="button"
            onClick={() => onSave(suggestion)}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#48533e] text-[#fbfaf8] hover:bg-[#3a4432] text-xs font-semibold transition shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <BookmarkCheck className="w-3.5 h-3.5 text-[#d8be9b]" />
            )}
            <span>Save to Memory</span>
          </button>
        </div>
      </div>
    </div>
  );
};
