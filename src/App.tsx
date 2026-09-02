import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from './lib/firebase';
import { JournalEntry, JournalMessage, SummaryResult, UserProfile, UserMemory, MemorySuggestion } from './types';
import {
  getUserEntries,
  saveJournalEntry,
  deleteJournalEntry,
  syncUserProfile,
  getUserMemories,
  saveUserMemory,
  deleteUserMemory,
} from './services/firestoreService';
import { Navbar } from './components/Navbar';
import { AuthScreen } from './components/AuthScreen';
import { JournalChat } from './components/JournalChat';
import { HistoryList } from './components/HistoryList';
import { EntryDetailView } from './components/EntryDetailView';
import { SummaryCard } from './components/SummaryCard';
import { MemoryReviewCard } from './components/MemoryReviewCard';
import { MemoryList } from './components/MemoryList';
import { AlertCircle, CheckCircle2, ShieldCheck, Brain } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [historyEntries, setHistoryEntries] = useState<JournalEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // User Long-Term Memories State
  const [savedMemories, setSavedMemories] = useState<UserMemory[]>([]);
  const [memoriesLoading, setMemoriesLoading] = useState(false);
  const [pendingMemorySuggestion, setPendingMemorySuggestion] = useState<{
    suggestion: MemorySuggestion;
    sourceEntryId?: string;
  } | null>(null);
  const [isSavingMemory, setIsSavingMemory] = useState(false);

  // Active Workspace State
  const [activeMessages, setActiveMessages] = useState<JournalMessage[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [latestSummary, setLatestSummary] = useState<SummaryResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // View state for responsive layouts
  const [activeView, setActiveView] = useState<'editor' | 'history' | 'memories'>('editor');
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        const profile: UserProfile = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        };
        setCurrentUser(profile);
        syncUserProfile(profile).catch((err) =>
          console.error('Failed to sync profile:', err)
        );
        loadUserHistory(user.uid);
        loadUserMemories(user.uid);
      } else {
        setCurrentUser(null);
        setHistoryEntries([]);
        setSavedMemories([]);
        setActiveMessages([]);
        setSelectedEntry(null);
        setLatestSummary(null);
        setPendingMemorySuggestion(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loadUserHistory = async (userId: string) => {
    setHistoryLoading(true);
    try {
      const entries = await getUserEntries(userId);
      setHistoryEntries(entries);
    } catch (error: any) {
      console.error('Failed to load user history from Firestore:', error);
      showNotification('error', 'Failed to load your previous reflections.');
    } finally {
      setHistoryLoading(false);
    }
  };

  const loadUserMemories = async (userId: string) => {
    setMemoriesLoading(true);
    try {
      const memories = await getUserMemories(userId);
      setSavedMemories(memories);
    } catch (error: any) {
      console.error('Failed to load user memories from Firestore:', error);
      showNotification('error', 'Failed to load your saved memories.');
    } finally {
      setMemoriesLoading(false);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      showNotification('success', 'You have been signed out safely.');
    } catch (err: any) {
      console.error('Sign out error:', err);
      showNotification('error', 'Error signing out.');
    }
  };

  const handleStartNewEntry = () => {
    setSelectedEntry(null);
    setLatestSummary(null);
    setPendingMemorySuggestion(null);
    setActiveMessages([]);
    setActiveView('editor');
  };

  const handleSaveEntry = async (
    summary: SummaryResult,
    messages: JournalMessage[]
  ) => {
    if (!currentUser) return;
    setIsSaving(true);
    try {
      const savedEntry = await saveJournalEntry(currentUser.uid, {
        title: summary.title,
        summary: summary.summary,
        keyInsights: summary.keyInsights,
        reflectionThemes: summary.reflectionThemes,
        messages,
      });

      setLatestSummary(summary);
      setHistoryEntries((prev) => [
        savedEntry,
        ...prev.filter((e) => e.id !== savedEntry.id),
      ]);

      // If Gemini suggested a potential long-term memory, stage it for explicit user approval
      if (summary.suggestedMemory && summary.suggestedMemory.content?.trim()) {
        setPendingMemorySuggestion({
          suggestion: summary.suggestedMemory,
          sourceEntryId: savedEntry.id,
        });
      } else {
        setPendingMemorySuggestion(null);
      }

      showNotification('success', 'Reflection and summary saved to Firestore!');
    } catch (err: any) {
      console.error('Save entry failed:', err);
      showNotification('error', err.message || 'Failed to save entry.');
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!currentUser) return;
    try {
      await deleteJournalEntry(currentUser.uid, entryId);
      setHistoryEntries((prev) => prev.filter((e) => e.id !== entryId));
      if (selectedEntry?.id === entryId) {
        setSelectedEntry(null);
      }
      showNotification('success', 'Reflection deleted permanently.');
    } catch (err: any) {
      console.error('Failed to delete entry:', err);
      showNotification('error', 'Failed to delete reflection.');
    }
  };

  const handleSaveMemory = async (suggestion: MemorySuggestion) => {
    if (!currentUser) return;
    setIsSavingMemory(true);
    try {
      const savedMemory = await saveUserMemory(currentUser.uid, {
        content: suggestion.content,
        category: suggestion.category,
        sourceEntryId: pendingMemorySuggestion?.sourceEntryId,
      });

      setSavedMemories((prev) => [savedMemory, ...prev]);
      setPendingMemorySuggestion(null);
      showNotification('success', 'Long-term memory approved and saved to your profile!');
    } catch (err: any) {
      console.error('Failed to save memory:', err);
      showNotification('error', 'Failed to save memory to your profile.');
    } finally {
      setIsSavingMemory(false);
    }
  };

  const handleDismissMemory = () => {
    setPendingMemorySuggestion(null);
    showNotification('success', 'Memory suggestion dismissed. Not saved.');
  };

  const handleDeleteMemory = async (memoryId: string) => {
    if (!currentUser) return;
    try {
      await deleteUserMemory(currentUser.uid, memoryId);
      setSavedMemories((prev) => prev.filter((m) => m.id !== memoryId));
      showNotification('success', 'Memory deleted permanently.');
    } catch (err: any) {
      console.error('Failed to delete memory:', err);
      showNotification('error', 'Failed to delete memory.');
    }
  };

  const handleSelectHistoryEntry = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setPendingMemorySuggestion(null);
    setActiveView('editor');
  };

  const handleResumeEntry = (entry: JournalEntry) => {
    setActiveMessages([...entry.messages]);
    setSelectedEntry(null);
    setPendingMemorySuggestion(null);
    setLatestSummary({
      title: entry.title,
      summary: entry.summary,
      keyInsights: entry.keyInsights,
      reflectionThemes: entry.reflectionThemes,
    });
    setActiveView('editor');
    showNotification(
      'success',
      'Previous dialogue loaded into your active workspace.'
    );
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-[#8c8275] border-t-[#48533e] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-medium text-[#6d665a]">
            Verifying secure authentication...
          </p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] flex flex-col text-[#3c3c3c]">
      {/* Top Navigation */}
      <Navbar
        user={currentUser}
        onSignOut={handleSignOut}
        onNewEntry={handleStartNewEntry}
        isCreatingNew={!selectedEntry && activeMessages.length === 0}
        historyCount={historyEntries.length}
        memoriesCount={savedMemories.length}
        activeView={activeView}
        onToggleView={setActiveView}
      />

      {/* Floating Alert Notification */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200 max-w-sm">
          <div
            className={`p-4 rounded-xl shadow-lg border flex items-start gap-3 ${
              notification.type === 'success'
                ? 'bg-[#3f4739] text-[#fbfaf8] border-[#5a6b4b]'
                : 'bg-[#82241a] text-[#fdfcfb] border-[#a83226]'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-[#cddfc3] shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-[#f5b8b2] shrink-0 mt-0.5" />
            )}
            <div className="text-xs font-medium leading-relaxed">
              {notification.message}
            </div>
          </div>
        </div>
      )}

      {/* Main Dashboard Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col">
        {/* Security & Isolation Callout Bar */}
        <div className="mb-4 bg-[#ffffff] border border-[#e8e4dc] rounded-xl px-4 py-2.5 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2 text-xs text-[#554e43]">
            <ShieldCheck className="w-4 h-4 text-[#5a7f4c] shrink-0" />
            <span>
              <strong>Authenticated Isolation:</strong> Storing reflections under{' '}
              <code className="text-[11px] bg-[#f0ebe1] px-1.5 py-0.5 rounded text-[#2d2b28] font-mono border border-[#ded7c8]">
                /users/{currentUser.uid.slice(0, 8)}.../entries
              </code>
              {' & memories under '}
              <code className="text-[11px] bg-[#f0ebe1] px-1.5 py-0.5 rounded text-[#2d2b28] font-mono border border-[#ded7c8]">
                /users/{currentUser.uid.slice(0, 8)}.../memories
              </code>
            </span>
          </div>
          <span className="text-[11px] text-[#7d7568] hidden md:inline">
            Server-Side Gemini 3.6 Flash Proxy
          </span>
        </div>

        {/* View Switcher: Memories View vs Workspace/History */}
        {activeView === 'memories' ? (
          <div className="flex-1 flex flex-col">
            <MemoryList
              memories={savedMemories}
              onDeleteMemory={handleDeleteMemory}
              onNewReflection={handleStartNewEntry}
              isLoading={memoriesLoading}
            />
          </div>
        ) : (
          /* 2-Column Responsive Workspace Grid */
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[620px]">
            {/* Main Reflection & Interaction Column */}
            <div
              className={`lg:col-span-8 flex flex-col space-y-4 ${
                activeView === 'editor' ? 'flex' : 'hidden lg:flex'
              }`}
            >
              {selectedEntry ? (
                <EntryDetailView
                  entry={selectedEntry}
                  onBack={() => setSelectedEntry(null)}
                  onResume={handleResumeEntry}
                />
              ) : (
                <div className="flex-1 flex flex-col space-y-4">
                  <div className="flex-1 min-h-[500px]">
                    <JournalChat
                      messages={activeMessages}
                      onUpdateMessages={setActiveMessages}
                      onSaveEntry={handleSaveEntry}
                      isSaving={isSaving}
                      onReset={handleStartNewEntry}
                    />
                  </div>

                  {/* AI Memory Review Proposal (User-Controlled Approval) */}
                  {pendingMemorySuggestion && (
                    <MemoryReviewCard
                      suggestion={pendingMemorySuggestion.suggestion}
                      onSave={handleSaveMemory}
                      onDismiss={handleDismissMemory}
                      isSaving={isSavingMemory}
                    />
                  )}

                  {/* Summary Card when generated */}
                  {latestSummary && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <SummaryCard
                        summary={latestSummary}
                        onClose={() => setLatestSummary(null)}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User Isolated History Column */}
            <div
              className={`lg:col-span-4 flex flex-col ${
                activeView === 'history' ? 'flex' : 'hidden lg:flex'
              }`}
            >
              <HistoryList
                entries={historyEntries}
                selectedEntryId={selectedEntry?.id || null}
                onSelectEntry={handleSelectHistoryEntry}
                onDeleteEntry={handleDeleteEntry}
                onNewEntry={handleStartNewEntry}
                isLoading={historyLoading}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

