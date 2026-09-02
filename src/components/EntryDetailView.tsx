import React from 'react';
import Markdown from 'react-markdown';
import {
  ArrowLeft,
  Calendar,
  Sparkles,
  Bot,
  User,
  Lightbulb,
  Tag,
  FileText,
  RotateCcw,
  Clock
} from 'lucide-react';
import { JournalEntry } from '../types';

interface EntryDetailViewProps {
  entry: JournalEntry;
  onBack: () => void;
  onResume: (entry: JournalEntry) => void;
}

export const EntryDetailView: React.FC<EntryDetailViewProps> = ({
  entry,
  onBack,
  onResume,
}) => {
  const formattedDate = new Date(entry.createdAt).toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = new Date(entry.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="bg-[#ffffff] rounded-2xl border border-[#e8e4dc] shadow-xs flex flex-col h-full overflow-hidden">
      {/* Top bar */}
      <div className="px-6 py-4 bg-[#faf8f5] border-b border-[#e8e4dc] flex items-center justify-between">
        <button
          id="detail-back-btn"
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-medium text-[#6d665a] hover:text-[#2d2b28] transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Workspace</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            id="detail-resume-btn"
            onClick={() => onResume(entry)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#48533e] text-[#fbfaf8] hover:bg-[#3a4432] text-xs font-medium transition shadow-xs cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#d8be9b]" />
            <span>Continue Reflection</span>
          </button>
        </div>
      </div>

      {/* Content scroll area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Header Metadata */}
        <div>
          <div className="flex items-center gap-2 text-xs text-[#7d7568] mb-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formattedDate} at {formattedTime}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2d2b28] tracking-tight font-serif">
            {entry.title}
          </h1>
        </div>

        {/* Structured AI Summary Card */}
        <div className="bg-[#faf8f5] rounded-2xl border border-[#e8e4dc] p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#9e6b45] uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-[#9e6b45]" />
            <span>Session Summary & Insights</span>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-[#7d7568] uppercase tracking-wide mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#9e9587]" />
              Executive Reflection Summary
            </h4>
            <p className="text-sm text-[#2d2b28] leading-relaxed bg-[#ffffff] p-3.5 rounded-xl border border-[#ede7dc]">
              {entry.summary}
            </p>
          </div>

          {entry.keyInsights && entry.keyInsights.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-[#7d7568] uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-[#c27848]" />
                Key Realizations & Takeaways
              </h4>
              <ul className="space-y-1.5">
                {entry.keyInsights.map((insight, idx) => (
                  <li
                    key={idx}
                    className="text-xs text-[#3c3c3c] flex items-start gap-2 bg-[#ffffff] p-2.5 rounded-lg border border-[#ede7dc]"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#c27848] mt-1.5 shrink-0" />
                    <span className="leading-relaxed">{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {entry.reflectionThemes && entry.reflectionThemes.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-[#7d7568] uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#9e9587]" />
                Thematic Focus
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {entry.reflectionThemes.map((theme, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 text-xs font-medium rounded-md bg-[#ffffff] text-[#554e43] border border-[#ded7c8] shadow-2xs"
                  >
                    {theme}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Full Dialogue Transcript */}
        <div>
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#e8e4dc]">
            <h3 className="text-sm font-bold text-[#2d2b28] uppercase tracking-wider font-serif">
              Dialogue Transcript ({entry.messages.length} exchanges)
            </h3>
            <span className="text-xs text-[#7d7568]">Immutable record</span>
          </div>

          <div className="space-y-4">
            {entry.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${
                  msg.role === 'user' ? 'ml-auto justify-end' : 'mr-auto justify-start'
                }`}
              >
                {msg.role === 'model' && (
                  <div className="w-8 h-8 rounded-lg bg-[#48533e] text-[#d8be9b] flex items-center justify-center shrink-0 shadow-xs mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`rounded-2xl p-4 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#3f4739] text-[#fbfaf8] max-w-[85%] rounded-tr-xs shadow-xs'
                      : 'bg-[#faf8f5] text-[#2d2b28] border border-[#e8e4dc] max-w-[90%] rounded-tl-xs shadow-xs'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <div className="space-y-3 prose prose-stone max-w-none text-[#2d2b28] text-sm">
                      <Markdown>{msg.content}</Markdown>
                    </div>
                  )}
                  <div
                    className={`mt-2 text-[10px] ${
                      msg.role === 'user' ? 'text-[#a6b59e] text-right' : 'text-[#8c8275] text-left'
                    }`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-lg bg-[#ede7dc] text-[#554e43] flex items-center justify-center shrink-0 shadow-xs mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
