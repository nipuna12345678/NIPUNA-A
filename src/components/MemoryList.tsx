import React, { useState } from 'react';
import {
  Brain,
  Trash2,
  Tag,
  Target,
  AlertCircle,
  Heart,
  Lightbulb,
  Repeat,
  Clock,
  Search,
  Filter,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { UserMemory, MemoryCategory } from '../types';

interface MemoryListProps {
  memories: UserMemory[];
  onDeleteMemory: (memoryId: string) => Promise<void>;
  onNewReflection: () => void;
  isLoading?: boolean;
}

const CATEGORIES: { key: 'all' | MemoryCategory; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'all', label: 'All Memories', icon: Brain },
  { key: 'goal', label: 'Goals', icon: Target },
  { key: 'pattern', label: 'Patterns', icon: Repeat },
  { key: 'realization', label: 'Realizations', icon: Lightbulb },
  { key: 'concern', label: 'Concerns', icon: AlertCircle },
  { key: 'preference', label: 'Preferences', icon: Heart },
  { key: 'ongoing', label: 'Ongoing', icon: Clock },
];

const CATEGORY_STYLES: Record<
  MemoryCategory,
  { label: string; icon: React.ComponentType<{ className?: string }>; bg: string; text: string; border: string; accent: string }
> = {
  goal: {
    label: 'Goal',
    icon: Target,
    bg: 'bg-[#edf4e8]',
    text: 'text-[#415b36]',
    border: 'border-[#d2e2ca]',
    accent: '#415b36',
  },
  concern: {
    label: 'Concern',
    icon: AlertCircle,
    bg: 'bg-[#faf0e6]',
    text: 'text-[#96522c]',
    border: 'border-[#ebd4c2]',
    accent: '#96522c',
  },
  preference: {
    label: 'Preference',
    icon: Heart,
    bg: 'bg-[#f6effa]',
    text: 'text-[#6a3f78]',
    border: 'border-[#e4cee8]',
    accent: '#6a3f78',
  },
  realization: {
    label: 'Realization',
    icon: Lightbulb,
    bg: 'bg-[#fef8e7]',
    text: 'text-[#946e16]',
    border: 'border-[#f2e2b6]',
    accent: '#946e16',
  },
  pattern: {
    label: 'Pattern',
    icon: Repeat,
    bg: 'bg-[#eef4f8]',
    text: 'text-[#35617a]',
    border: 'border-[#c9dde8]',
    accent: '#35617a',
  },
  ongoing: {
    label: 'Ongoing',
    icon: Clock,
    bg: 'bg-[#f2eee7]',
    text: 'text-[#5e584f]',
    border: 'border-[#dbd3c5]',
    accent: '#5e584f',
  },
};

export const MemoryList: React.FC<MemoryListProps> = ({
  memories,
  onDeleteMemory,
  onNewReflection,
  isLoading = false,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | MemoryCategory>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredMemories = memories.filter((m) => {
    if (selectedCategory === 'all') return true;
    return m.category === selectedCategory;
  });

  const handleDelete = async (memoryId: string) => {
    setDeletingId(memoryId);
    try {
      await onDeleteMemory(memoryId);
    } finally {
      setDeletingId(null);
    }
  };

  const categoryCounts = memories.reduce<Record<string, number>>((acc, m) => {
    acc[m.category] = (acc[m.category] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="bg-[#ffffff] rounded-2xl border border-[#e8e4dc] p-5 sm:p-6 shadow-xs flex-1 flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[#f0ebe1]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#48533e] text-[#fbfaf8] flex items-center justify-center shrink-0 shadow-xs">
            <Brain className="w-5 h-5 text-[#d8be9b]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#2d2b28] font-serif flex items-center gap-2">
              <span>Your Long-Term Memories</span>
              <span className="text-xs font-sans font-semibold bg-[#f0ebe1] text-[#554e43] px-2 py-0.5 rounded-full border border-[#ded7c8]">
                {memories.length}
              </span>
            </h2>
            <p className="text-xs text-[#7d7568]">
              User-approved long-term goals, patterns, realizations, and ongoing contexts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-[#415b36] bg-[#edf4e8] px-3 py-1.5 rounded-xl border border-[#d2e2ca] font-medium self-start sm:self-auto">
          <ShieldCheck className="w-3.5 h-3.5 text-[#5a7f4c] shrink-0" />
          <span>User-Isolated &amp; Approved Only</span>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1.5 py-3 overflow-x-auto border-b border-[#f0ebe1] no-scrollbar">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const count = cat.key === 'all' ? memories.length : categoryCounts[cat.key] || 0;
          const isSelected = selectedCategory === cat.key;

          return (
            <button
              key={cat.key}
              id={`memory-filter-${cat.key}`}
              onClick={() => setSelectedCategory(cat.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                isSelected
                  ? 'bg-[#48533e] text-[#fbfaf8] shadow-2xs'
                  : 'bg-[#faf8f5] text-[#6d665a] hover:bg-[#f0ebe1] hover:text-[#2d2b28] border border-[#e8e4dc]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#d8be9b]' : 'text-[#8c8275]'}`} />
              <span>{cat.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-[#3a4432] text-[#fbfaf8]' : 'bg-[#e8e4dc] text-[#554e43]'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Memory Cards Content */}
      <div className="flex-1 mt-4">
        {isLoading ? (
          <div className="py-16 text-center text-[#7d7568]">
            <div className="w-7 h-7 border-3 border-[#8c8275] border-t-[#48533e] rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs">Loading your saved memories...</p>
          </div>
        ) : filteredMemories.length === 0 ? (
          <div className="py-16 text-center max-w-md mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-[#faf8f5] text-[#8c8275] flex items-center justify-center mx-auto mb-3 border border-[#e8e4dc]">
              <Brain className="w-6 h-6 text-[#9e9587]" />
            </div>
            <h3 className="text-base font-bold text-[#2d2b28] font-serif">
              {selectedCategory === 'all' ? 'No Memories Saved Yet' : `No ${selectedCategory} memories`}
            </h3>
            <p className="mt-1.5 text-xs text-[#6d665a] leading-relaxed">
              When you reflect with Gemini and click &ldquo;Save &amp; Summarize&rdquo;, Gemini will highlight valuable long-term insights for you to approve or decline.
            </p>
            <button
              id="empty-start-reflection-btn"
              onClick={onNewReflection}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#48533e] text-[#fbfaf8] hover:bg-[#3a4432] text-xs font-semibold transition shadow-xs cursor-pointer"
            >
              <span>Start a Reflection</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredMemories.map((mem) => {
              const style = CATEGORY_STYLES[mem.category] || CATEGORY_STYLES.realization;
              const Icon = style.icon;
              const isDeleting = deletingId === mem.id;

              return (
                <div
                  key={mem.id}
                  id={`memory-item-${mem.id}`}
                  className="bg-[#faf8f5] rounded-xl border border-[#e8e4dc] p-4 flex flex-col justify-between hover:border-[#ded8cc] transition shadow-2xs group relative"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border ${style.bg} ${style.text} ${style.border}`}
                      >
                        <Icon className="w-3 h-3" />
                        <span>{style.label}</span>
                      </span>

                      <span className="text-[10px] text-[#9e9587]">
                        {new Date(mem.createdAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    <p className="text-xs font-medium text-[#2d2b28] leading-relaxed">
                      {mem.content}
                    </p>
                  </div>

                  <div className="mt-3.5 pt-2.5 border-t border-[#ede7dc] flex items-center justify-between text-[11px] text-[#7d7568]">
                    <span className="text-[10px] text-[#8c8275] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-[#5a7f4c]" />
                      Approved
                    </span>

                    <button
                      id={`delete-memory-${mem.id}`}
                      onClick={() => handleDelete(mem.id)}
                      disabled={isDeleting}
                      title="Delete Memory"
                      className="text-[#9e9587] hover:text-[#a83226] p-1.5 rounded-lg hover:bg-[#faeeec] transition disabled:opacity-50 cursor-pointer"
                    >
                      {isDeleting ? (
                        <div className="w-3.5 h-3.5 border-2 border-[#a83226] border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
