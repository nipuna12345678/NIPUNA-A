import React from 'react';
import { BookOpen, LogOut, PlusCircle, Sparkles, User, History, Brain } from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  user: UserProfile;
  onSignOut: () => void;
  onNewEntry: () => void;
  isCreatingNew: boolean;
  historyCount: number;
  memoriesCount: number;
  activeView: 'editor' | 'history' | 'memories';
  onToggleView: (view: 'editor' | 'history' | 'memories') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onSignOut,
  onNewEntry,
  isCreatingNew,
  historyCount,
  memoriesCount,
  activeView,
  onToggleView,
}) => {
  return (
    <header className="bg-[#fdfcfb] border-b border-[#e8e4dc] sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#48533e] flex items-center justify-center text-[#fbfaf8] shadow-xs">
            <BookOpen className="w-5 h-5 text-[#d8be9b]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#2d2b28] tracking-tight text-lg font-serif">
                Personal Gemini Journal
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full bg-[#edf4e8] text-[#415b36] border border-[#d2e2ca] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5a7f4c] animate-pulse" />
                Isolated & Secure
              </span>
            </div>
            <p className="text-xs text-[#7d7568] hidden sm:block">
              Private AI-assisted reflection & structured takeaways
            </p>
          </div>
        </div>

        {/* Action Controls & Navigation */}
        <div className="flex items-center gap-3">
          <button
            id="nav-new-entry-btn"
            onClick={onNewEntry}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#48533e] text-[#fbfaf8] hover:bg-[#3a4432] text-sm font-medium transition shadow-xs focus:ring-2 focus:ring-[#6f825e] focus:outline-hidden cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-[#d8be9b]" />
            <span className="hidden sm:inline">New Reflection</span>
          </button>

          {/* Toggle Views */}
          <div className="flex items-center bg-[#f2eee7] p-1 rounded-lg border border-[#e2dcce]">
            <button
              id="view-editor-btn"
              onClick={() => onToggleView('editor')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
                activeView === 'editor'
                  ? 'bg-white text-[#2d2b28] shadow-xs'
                  : 'text-[#6d665a] hover:text-[#2d2b28]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#5e6b52]" />
              <span>Workspace</span>
            </button>
            <button
              id="view-history-btn"
              onClick={() => onToggleView('history')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
                activeView === 'history'
                  ? 'bg-white text-[#2d2b28] shadow-xs'
                  : 'text-[#6d665a] hover:text-[#2d2b28]'
              }`}
            >
              <History className="w-3.5 h-3.5 text-[#5e6b52]" />
              <span>History ({historyCount})</span>
            </button>
            <button
              id="view-memories-btn"
              onClick={() => onToggleView('memories')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
                activeView === 'memories'
                  ? 'bg-white text-[#2d2b28] shadow-xs'
                  : 'text-[#6d665a] hover:text-[#2d2b28]'
              }`}
            >
              <Brain className="w-3.5 h-3.5 text-[#5e6b52]" />
              <span>Memories ({memoriesCount})</span>
            </button>
          </div>

          {/* User Profile & Sign Out */}
          <div className="flex items-center gap-2 pl-2 border-l border-[#e8e4dc]">
            <div className="flex items-center gap-2">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User profile'}
                  className="w-8 h-8 rounded-full border border-[#ded8cc] object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#ece6dc] text-[#554e43] flex items-center justify-center text-xs font-medium">
                  <User className="w-4 h-4" />
                </div>
              )}
              <div className="hidden md:block text-left">
                <p className="text-xs font-semibold text-[#2d2b28] leading-tight">
                  {user.displayName || 'Authenticated User'}
                </p>
                <p className="text-[11px] text-[#7d7568] truncate max-w-[140px]">
                  {user.email || ''}
                </p>
              </div>
            </div>

            <button
              id="auth-logout-btn"
              onClick={onSignOut}
              title="Sign Out"
              className="p-2 text-[#7d7568] hover:text-[#964235] hover:bg-[#faeeec] rounded-lg transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
