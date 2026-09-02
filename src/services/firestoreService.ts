import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { JournalEntry, UserProfile, UserMemory, MemoryCategory } from '../types';

/**
 * Ensures user profile metadata is synced in Firestore under /users/{userId}
 */
export async function syncUserProfile(user: UserProfile): Promise<void> {
  if (!user.uid) return;
  try {
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(
      userDocRef,
      {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || 'Anonymous User',
        photoURL: user.photoURL || '',
        lastLoginAt: new Date().toISOString(),
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Error syncing user profile to Firestore:', error);
  }
}

/**
 * Retrieves all journal entries strictly isolated to the authenticated user
 */
export async function getUserEntries(userId: string): Promise<JournalEntry[]> {
  if (!userId) {
    throw new Error('User ID is required to fetch journal entries.');
  }

  const entriesRef = collection(db, 'users', userId, 'entries');
  const q = query(entriesRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);

  const entries: JournalEntry[] = [];
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    entries.push({
      id: docSnap.id,
      userId,
      title: data.title || 'Untitled Reflection',
      summary: data.summary || '',
      keyInsights: Array.isArray(data.keyInsights) ? data.keyInsights : [],
      reflectionThemes: Array.isArray(data.reflectionThemes) ? data.reflectionThemes : [],
      messages: Array.isArray(data.messages) ? data.messages : [],
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString(),
    });
  });

  return entries;
}

/**
 * Creates or updates a journal entry within the authenticated user's private collection
 */
export async function saveJournalEntry(
  userId: string,
  entryData: {
    title: string;
    summary: string;
    keyInsights: string[];
    reflectionThemes: string[];
    messages: JournalEntry['messages'];
  },
  existingId?: string
): Promise<JournalEntry> {
  if (!userId) {
    throw new Error('User ID is required to save journal entries.');
  }

  const entryId = existingId || `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const entryDocRef = doc(db, 'users', userId, 'entries', entryId);

  const nowIso = new Date().toISOString();

  // If updating, preserve original createdAt if it exists
  let originalCreatedAt = nowIso;
  if (existingId) {
    try {
      const existingDoc = await getDoc(entryDocRef);
      if (existingDoc.exists()) {
        originalCreatedAt = existingDoc.data().createdAt || nowIso;
      }
    } catch {
      // fallback to nowIso
    }
  }

  const payload: JournalEntry = {
    id: entryId,
    userId,
    title: entryData.title.trim() || 'Untitled Reflection',
    summary: entryData.summary || '',
    keyInsights: entryData.keyInsights || [],
    reflectionThemes: entryData.reflectionThemes || [],
    messages: entryData.messages || [],
    createdAt: originalCreatedAt,
    updatedAt: nowIso,
  };

  await setDoc(entryDocRef, {
    ...payload,
    serverTimestamp: serverTimestamp()
  });

  return payload;
}

/**
 * Deletes a journal entry belonging to the authenticated user
 */
export async function deleteJournalEntry(userId: string, entryId: string): Promise<void> {
  if (!userId || !entryId) {
    throw new Error('User ID and Entry ID are required to delete a journal entry.');
  }

  const entryDocRef = doc(db, 'users', userId, 'entries', entryId);
  await deleteDoc(entryDocRef);
}

/**
 * Retrieves all approved memories strictly isolated to the authenticated user
 */
export async function getUserMemories(userId: string): Promise<UserMemory[]> {
  if (!userId) {
    throw new Error('User ID is required to fetch memories.');
  }

  const memoriesRef = collection(db, 'users', userId, 'memories');
  const q = query(memoriesRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);

  const memories: UserMemory[] = [];
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    memories.push({
      id: docSnap.id,
      userId,
      content: data.content || '',
      category: (data.category as MemoryCategory) || 'realization',
      createdAt: data.createdAt || new Date().toISOString(),
      sourceEntryId: data.sourceEntryId || undefined,
    });
  });

  return memories;
}

/**
 * Saves a user-approved long-term memory to /users/{userId}/memories/{memoryId}
 */
export async function saveUserMemory(
  userId: string,
  memoryData: {
    content: string;
    category: MemoryCategory;
    sourceEntryId?: string;
  }
): Promise<UserMemory> {
  if (!userId) {
    throw new Error('User ID is required to save a memory.');
  }
  if (!memoryData.content || !memoryData.content.trim()) {
    throw new Error('Memory content cannot be empty.');
  }

  const memoryId = `mem-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const memoryDocRef = doc(db, 'users', userId, 'memories', memoryId);
  const nowIso = new Date().toISOString();

  const payload: UserMemory = {
    id: memoryId,
    userId,
    content: memoryData.content.trim(),
    category: memoryData.category || 'realization',
    createdAt: nowIso,
    sourceEntryId: memoryData.sourceEntryId,
  };

  await setDoc(memoryDocRef, {
    ...payload,
    serverTimestamp: serverTimestamp()
  });

  return payload;
}

/**
 * Deletes a user memory from /users/{userId}/memories/{memoryId}
 */
export async function deleteUserMemory(userId: string, memoryId: string): Promise<void> {
  if (!userId || !memoryId) {
    throw new Error('User ID and Memory ID are required to delete a memory.');
  }

  const memoryDocRef = doc(db, 'users', userId, 'memories', memoryId);
  await deleteDoc(memoryDocRef);
}

