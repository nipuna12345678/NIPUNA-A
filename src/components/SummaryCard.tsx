import React from 'react';
import { Sparkles, CheckCircle2, Tag, Key, Lightbulb, FileText } from 'lucide-react';
import { SummaryResult } from '../types';

interface SummaryCardProps {
  summary: SummaryResult;
  onClose?: () => void;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ summary, onClose }) => {
  return (
    <div className="bg-[#ffffff] rounded-2xl border border-[#e8e4dc] p-5 sm:p-6 shadow-xs">
      <div className="flex items-center justify-between pb-4 border-b border-[#f0ebe1]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#f4ebe1] text-[#9e6b45] flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9e6b45]">
              AI-Generated Reflection Summary
            </span>
            <h3 className="text-base font-bold text-[#2d2b28] leading-tight font-serif">
              {summary.title}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-[#415b36] bg-[#edf4e8] px-3 py-1 rounded-full border border-[#d2e2ca] font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#5a7f4c]" />
          <span>Saved to Cloud Firestore</span>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {/* Executive Summary */}
        <div>
          <h4 className="text-xs font-semibold text-[#7d7568] uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
            <FileText className="w-3.5 h-3.5 text-[#9e9587]" />
            Executive Summary
          </h4>
          <p className="text-sm text-[#2d2b28] leading-relaxed bg-[#faf8f5] p-3.5 rounded-xl border border-[#e8e4dc]">
            {summary.summary}
          </p>
        </div>

        {/* Key Takeaways */}
        {summary.keyInsights && summary.keyInsights.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-[#7d7568] uppercase tracking-wide flex items-center gap-1.5 mb-2">
              <Lightbulb className="w-3.5 h-3.5 text-[#c27848]" />
              Key Realizations & Action Takeaways
            </h4>
            <ul className="space-y-2">
              {summary.keyInsights.map((insight, idx) => (
                <li
                  key={idx}
                  className="text-xs text-[#3c3c3c] flex items-start gap-2 bg-[#faf8f5]/80 p-2.5 rounded-lg border border-[#ede7dc]"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c27848] mt-1.5 shrink-0" />
                  <span className="leading-relaxed">{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Thematic Tags */}
        {summary.reflectionThemes && summary.reflectionThemes.length > 0 && (
          <div className="pt-2">
            <h4 className="text-xs font-semibold text-[#7d7568] uppercase tracking-wide flex items-center gap-1.5 mb-2">
              <Tag className="w-3.5 h-3.5 text-[#9e9587]" />
              Themes & Focus
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {summary.reflectionThemes.map((theme, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 text-xs font-medium rounded-md bg-[#f0ebe1] text-[#554e43] border border-[#ded7c8]"
                >
                  {theme}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
