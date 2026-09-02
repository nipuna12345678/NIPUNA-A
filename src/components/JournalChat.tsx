import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Save,
  RotateCcw,
  Check,
  AlertCircle,
  Lightbulb,
  FileText,
  Clock,
  Layers
} from 'lucide-react';
import { JournalMessage, SummaryResult } from '../types';
import { sendChatMessage, generateEntrySummary } from '../services/geminiService';

interface JournalChatProps {
  messages: JournalMessage[];
  onUpdateMessages: (messages: JournalMessage[]) => void;
  onSaveEntry: (summary: SummaryResult, messages: JournalMessage[]) => Promise<void>;
  isSaving: boolean;
  onReset: () => void;
}

const STARTER_PROMPTS = [
  {
    title: 'Daily Reflection',
    prompt: "I want to reflect on what happened today. Here is what stands out in my mind...",
    icon: Clock,
  },
  {
    title: 'Decision Brainstorming',
    prompt: "I'm facing a tough decision and feeling conflicted about the trade-offs. Can you help me break it down?",
    icon: Lightbulb,
  },
  {
    title: 'Untangling Stress',
    prompt: "I'm feeling a bit overwhelmed and need help sorting through my thoughts and priorities.",
    icon: Layers,
  },
  {
    title: 'Creative Idea Exploration',
    prompt: "I have a new project idea and want to brainstorm possibilities, potential pitfalls, and first steps.",
    icon: Sparkles,
  },
];

export const JournalChat: React.FC<JournalChatProps> = ({
  messages,
  onUpdateMessages,
  onSaveEntry,
  isSaving,
  onReset,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSummaryPreview, setActiveSummaryPreview] = useState<SummaryResult | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputValue).trim();
    if (!textToSend || isSending) return;

    setError(null);
    const userMessage: JournalMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      role: 'user',
      content: textToSend,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMessage];
    onUpdateMessages(newMessages);
    setInputValue('');

    setIsSending(true);
    try {
      const botReply = await sendChatMessage(newMessages);
      onUpdateMessages([...newMessages, botReply]);
    } catch (err: any) {
      console.error('Failed to get Gemini response:', err);
      setError(err.message || 'Unable to connect to Gemini. Please try again.');
    } finally {
      setIsSending(false);
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSaveAndSummarize = async () => {
    if (messages.length === 0 || isSummarizing || isSaving) return;

    setIsSummarizing(true);
    setError(null);
    try {
      const summaryResult = await generateEntrySummary(messages);
      setActiveSummaryPreview(summaryResult);
      await onSaveEntry(summaryResult, messages);
    } catch (err: any) {
      console.error('Failed to summarize & save entry:', err);
      setError(err.message || 'Failed to generate summary or save to Firestore.');
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#ffffff] rounded-2xl border border-[#e8e4dc] shadow-xs overflow-hidden">
      {/* Workspace Sub-Header */}
      <div className="px-6 py-3.5 bg-[#faf8f5] border-b border-[#e8e4dc] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#5a7f4c] animate-pulse" />
          <h2 className="text-sm font-semibold text-[#2d2b28]">
            Active Reflection Workspace
          </h2>
          <span className="text-xs text-[#7d7568] font-normal">
            ({messages.length} {messages.length === 1 ? 'exchange' : 'exchanges'})
          </span>
        </div>

        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <>
              <button
                id="reset-workspace-btn"
                onClick={onReset}
                disabled={isSending || isSaving || isSummarizing}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#6d665a] hover:text-[#2d2b28] hover:bg-[#ede7dc] rounded-lg transition disabled:opacity-50 cursor-pointer"
                title="Start a fresh conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>

              <button
                id="save-summary-btn"
                onClick={handleSaveAndSummarize}
                disabled={isSending || isSaving || isSummarizing}
                className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#48533e] hover:bg-[#3a4432] text-[#fbfaf8] transition shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {isSummarizing || isSaving ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5 text-[#d8be9b]" />
                )}
                <span>
                  {isSummarizing
                    ? 'Summarizing...'
                    : isSaving
                    ? 'Persisting...'
                    : 'Save & Summarize'}
                </span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-[#faf8f5]/60">
        {messages.length === 0 ? (
          <div className="max-w-2xl mx-auto py-10 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#48533e] text-[#fbfaf8] flex items-center justify-center mx-auto mb-4 shadow-2xs">
              <Sparkles className="w-6 h-6 text-[#d8be9b]" />
            </div>
            <h3 className="text-2xl font-bold text-[#2d2b28] font-serif">
              Welcome to your personal reflection space
            </h3>
            <p className="mt-2 text-sm text-[#6d665a] leading-relaxed max-w-md mx-auto">
              Write down whatever is on your mind. Gemini is here to ask reflective questions, help untangle ideas, and summarize key takeaways when you are ready.
            </p>

            {/* Starter Prompt Cards */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-left">
              {STARTER_PROMPTS.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    id={`starter-prompt-${idx}`}
                    onClick={() => handleSendMessage(item.prompt)}
                    className="p-4 rounded-xl bg-[#ffffff] border border-[#e8e4dc] hover:border-[#b8ad99] hover:shadow-2xs transition text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-2 text-[#2d2b28] font-semibold text-xs mb-1.5 font-serif">
                      <Icon className="w-4 h-4 text-[#9e6b45] group-hover:scale-110 transition" />
                      <span>{item.title}</span>
                    </div>
                    <p className="text-xs text-[#7d7568] line-clamp-2 leading-relaxed">
                      {item.prompt}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${
                msg.role === 'user' ? 'ml-auto justify-end' : 'mr-auto justify-start'
              }`}
            >
              {msg.role === 'model' && (
                <div className="w-8 h-8 rounded-lg bg-[#48533e] text-[#d8be9b] flex items-center justify-center shrink-0 shadow-xs mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`rounded-2xl p-4 sm:p-5 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#3f4739] text-[#fbfaf8] max-w-[85%] sm:max-w-[75%] rounded-tr-xs shadow-xs'
                    : 'bg-[#ffffff] text-[#2d2b28] border border-[#e8e4dc] max-w-[90%] sm:max-w-[85%] rounded-tl-xs shadow-xs'
                }`}
              >
                {msg.role === 'user' ? (
                  <p className="whitespace-pre-wrap font-sans">{msg.content}</p>
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
          ))
        )}

        {isSending && (
          <div className="flex gap-3 max-w-3xl mr-auto justify-start items-center">
            <div className="w-8 h-8 rounded-lg bg-[#48533e] text-[#d8be9b] flex items-center justify-center shrink-0 shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-[#ffffff] border border-[#e8e4dc] rounded-2xl rounded-tl-xs px-4 py-3 shadow-xs flex items-center gap-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 rounded-full bg-[#8c8275] animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-[#8c8275] animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-[#8c8275] animate-bounce [animation-delay:0.4s]" />
              </div>
              <span className="text-xs text-[#7d7568]">Gemini is reflecting...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-xl bg-[#faeeee] border border-[#ecd2d0] text-[#82241a] text-xs flex items-start gap-2 max-w-2xl mx-auto">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#a83226]" />
            <div className="flex-1">{error}</div>
            <button
              onClick={() => setError(null)}
              className="text-[#a83226] hover:text-[#5e1811] font-semibold cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-[#ffffff] border-t border-[#e8e4dc]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative"
        >
          <textarea
            id="journal-input-textarea"
            ref={textareaRef}
            rows={3}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write your journal thoughts, reflections, or questions... (Press Enter to send, Shift+Enter for new line)"
            disabled={isSending || isSummarizing}
            className="w-full resize-none rounded-xl border border-[#ded8cc] bg-[#faf8f5]/40 p-3.5 pr-14 text-sm text-[#2d2b28] placeholder:text-[#9e9587] focus:border-[#48533e] focus:bg-[#ffffff] focus:ring-1 focus:ring-[#48533e] focus:outline-hidden disabled:bg-[#f2eee7] disabled:text-[#8c8275]"
          />

          <div className="absolute right-3 bottom-3 flex items-center gap-2">
            <button
              id="send-message-btn"
              type="submit"
              disabled={!inputValue.trim() || isSending || isSummarizing}
              className="p-2.5 rounded-lg bg-[#48533e] text-[#fbfaf8] hover:bg-[#3a4432] transition disabled:opacity-40 disabled:cursor-not-allowed shadow-xs cursor-pointer"
              title="Send to Gemini"
            >
              <Send className="w-4 h-4 text-[#d8be9b]" />
            </button>
          </div>
        </form>
        <div className="flex justify-between items-center mt-2 px-1 text-[11px] text-[#7d7568]">
          <span>
            {inputValue.length} characters &bull; Press Enter to send, Shift+Enter for a new line
          </span>
          {messages.length > 0 && (
            <span className="text-[#415b36] font-medium flex items-center gap-1">
              <Check className="w-3 h-3 text-[#5a7f4c]" /> Ready to summarize & save
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
