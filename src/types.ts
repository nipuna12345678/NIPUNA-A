export interface JournalMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export type MemoryCategory = 'goal' | 'concern' | 'preference' | 'realization' | 'pattern' | 'ongoing';

export interface MemorySuggestion {
  content: string;
  category: MemoryCategory;
}

export interface SummaryResult {
  title: string;
  summary: string;
  keyInsights: string[];
  reflectionThemes: string[];
  suggestedMemory?: MemorySuggestion | null;
}

export interface UserMemory {
  id: string;
  userId: string;
  content: string;
  category: MemoryCategory;
  createdAt: string;
  sourceEntryId?: string;
}

export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  summary: string;
  keyInsights: string[];
  reflectionThemes: string[];
  messages: JournalMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}
