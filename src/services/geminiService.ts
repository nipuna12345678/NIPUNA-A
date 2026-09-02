import { auth } from '../lib/firebase';
import { JournalMessage, SummaryResult } from '../types';

async function getAuthToken(): Promise<string> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Authentication required: You must be signed in to use the Gemini Journal companion.');
  }
  return await currentUser.getIdToken();
}

export async function sendChatMessage(messages: JournalMessage[]): Promise<JournalMessage> {
  const token = await getAuthToken();

  const response = await fetch('/api/gemini/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server error (${response.status})`);
  }

  const data = await response.json();
  return {
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    role: 'model',
    content: data.content,
    timestamp: data.timestamp || Date.now(),
  };
}

export async function generateEntrySummary(messages: JournalMessage[]): Promise<SummaryResult> {
  const token = await getAuthToken();

  const response = await fetch('/api/gemini/summarize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to summarize reflection (${response.status})`);
  }

  return await response.json();
}

