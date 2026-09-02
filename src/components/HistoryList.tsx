import React, { useState } from 'react';
import {
  History,
  Calendar,
  MessageSquare,
  Sparkles,
  Trash2,
  ChevronRight,
  Search,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { JournalEntry } from '../types';

interface HistoryListProps {
  entries: JournalEntry[];
  selectedEntryId: string | null;
  onSelectEntry: (entry: JournalEntry) => void;
  onDeleteEntry: (entryId: string) => Promise<void>;
  onNewEntry: () => void;
  isLoading: boolean;
}

export const HistoryList: React.FC<HistoryListProps> = ({
  entries,
  selectedEntryId,
  onSelectEntry,
  onDeleteEntry,
  onNewEntry,
  isLoading,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredEntries = entries.filter((entry) => {
    const term = searchTerm.toLowerCase();
    const matchesTitle = entry.title.toLowerCase().includes(term);
    const matchesSummary = entry.summary.toLowerCase().includes(term);
    const matchesThemes = entry.reflectionThemes.some((t) => t.toLowerCase().includes(term));
    const matchesInsights = entry.keyInsights.some((i) => i.toLowerCase().includes(term));
    return matchesTitle || matchesSummary || matchesThemes || matchesInsights;
  });

  const handleDelete = async (e: React.MouseEvent, entryId: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to permanently delete this reflection?')) {
      setDeletingId(entryId);
      try {
        await onDeleteEntry(entryId);
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="bg-[#ffffff] rounded-2xl border border-[#e8e4dc] shadow-xs flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-[#e8e4dc] bg-[#faf8f5]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#5e6b52]" />
            <h2 className="text-sm font-semibold text-[#2d2b28] font-serif">
              Your Reflection History
            </h2>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#f0ebe1] text-[#554e43] font-medium border border-[#ded7c8]">
            {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#9e9587]" />
          <input
            id="history-search-input"
            type="text"
            placeholder="Search reflections, insights, or themes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#ffffff] rounded-lg border border-[#ded8cc] text-xs text-[#2d2b28] placeholder:text-[#9e9587] focus:outline-hidden focus:border-[#48533e] focus:ring-1 focus:ring-[#48533e]"
          />
        </div>
      </div>

      {/* Entries List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 divide-y divide-[#f5f1ea]">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="w-6 h-6 border-2 border-[#8c8275] border-t-[#48533e] rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-[#7d7568]">Loading isolated history from Firestore...</p>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="p-8 text-center">
            <BookOpen className="w-8 h-8 text-[#ded7c8] mx-auto mb-2" />
            <p className="text-xs font-semibold text-[#554e43] font-serif">
              {searchTerm ? 'No matching reflections found' : 'No reflections saved yet'}
            </p>
            <p className="text-[11px] text-[#7d7568] mt-1 max-w-xs mx-auto">
              {searchTerm
                ? 'Try a different search term or clear the filter.'
                : 'Start an active reflection conversation in the workspace to save your first entry.'}
            </p>
            {!searchTerm && (
              <button
                id="empty-history-new-entry-btn"
                onClick={onNewEntry}
                className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#48533e] text-[#fbfaf8] text-xs font-medium hover:bg-[#3a4432] transition cursor-pointer"
              >
                <span>Start New Reflection</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        ) : (
          filteredEntries.map((entry) => {
            const isSelected = selectedEntryId === entry.id;
            const formattedDate = new Date(entry.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
            const formattedTime = new Date(entry.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={entry.id}
                id={`history-entry-${entry.id}`}
                onClick={() => onSelectEntry(entry)}
                className={`p-3.5 rounded-xl transition cursor-pointer text-left relative group ${
                  isSelected
                    ? 'bg-[#48533e] text-[#fbfaf8] shadow-xs'
                    : 'bg-[#ffffff] hover:bg-[#faf8f5] text-[#2d2b28] border border-[#f0ebe1]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-[11px] mb-1">
                      <span
                        className={`flex items-center gap-1 ${
                          isSelected ? 'text-[#d8be9b]' : 'text-[#7d7568]'
                        }`}
                      >
                        <Calendar className="w-3 h-3" />
                        {formattedDate} &bull; {formattedTime}
                      </span>
                    </div>
                    <h3
                      className={`text-sm font-semibold truncate font-serif ${
                        isSelected ? 'text-[#fbfaf8]' : 'text-[#2d2b28]'
                      }`}
                    >
                      {entry.title}
                    </h3>
                  </div>

                  <button
                    id={`delete-entry-${entry.id}`}
                    onClick={(e) => handleDelete(e, entry.id)}
                    disabled={deletingId === entry.id}
                    title="Delete reflection"
                    className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition cursor-pointer ${
                      isSelected
                        ? 'text-[#d8be9b] hover:text-[#ffb4a8] hover:bg-[#394231]'
                        : 'text-[#9e9587] hover:text-[#a83226] hover:bg-[#faeeee]'
                    }`}
                  >
                    {deletingId === entry.id ? (
                      <div className="w-3.5 h-3.5 border-2 border-[#a83226] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                <p
                  className={`mt-1.5 text-xs line-clamp-2 leading-relaxed ${
                    isSelected ? 'text-[#e5dfd5]' : 'text-[#6d665a]'
                  }`}
                >
                  {entry.summary || 'Reflective dialogue with Gemini.'}
                </p>

                {/* Themes and counts */}
                <div className="mt-3 flex items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1">
                    {entry.reflectionThemes.slice(0, 2).map((theme, idx) => (
                      <span
                        key={idx}
                        className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                          isSelected
                            ? 'bg-[#394231] text-[#e3ded5]'
                            : 'bg-[#f0ebe1] text-[#554e43]'
                        }`}
                      >
                        {theme}
                      </span>
                    ))}
                    {entry.reflectionThemes.length > 2 && (
                      <span
                        className={`text-[10px] self-center ${
                          isSelected ? 'text-[#d8be9b]' : 'text-[#7d7568]'
                        }`}
                      >
                        +{entry.reflectionThemes.length - 2}
                      </span>
                    )}
                  </div>

                  <div
                    className={`flex items-center gap-1 text-[11px] font-medium shrink-0 ${
                      isSelected ? 'text-[#d8be9b]' : 'text-[#7d7568]'
                    }`}
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>{entry.messages.length}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
