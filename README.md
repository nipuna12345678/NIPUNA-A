# Personal Gemini Journal

A production-grade, secure, user-authenticated AI journaling and reflection companion built with **React**, **TypeScript**, **Google Gemini 3.6 Flash**, **Firebase Authentication**, and **Cloud Firestore**.

---

## 1. Application Purpose

The Personal Gemini Journal provides users with a private, safe space to reflect on their experiences, untangle complex emotions, brainstorm decisions, and organize their thoughts. It engages in multi-turn reflective dialogue, asks Socratic follow-up questions, and automatically generates structured executive summaries, key realizations, and thematic tags persisted securely in Cloud Firestore under strict per-user data isolation boundaries.

---

## 2. Architecture

```
+-----------------------------------------------------------------------------------+
|                                  CLIENT (React 19)                                 |
|  - Firebase Auth (Google Sign-In)                                                 |
|  - Authenticated Private Dashboard                                                |
|  - Multi-Turn Reflection Dialogue Workspace                                       |
|  - Cloud Firestore Direct Sync (Per-User Subcollections)                          |
+------------------------------------------+----------------------------------------+
                                           |
                   +-----------------------+-----------------------+
                   | (Encrypted API Calls)                         | (Direct Firestore SDK)
                   v                                               v
+--------------------------------------+      +-------------------------------------+
|        SERVER (Express + Vite)       |      |          CLOUD FIRESTORE            |
|  - POST /api/gemini/chat             |      |  - Rules: request.auth.uid == uid   |
|  - POST /api/gemini/summarize        |      |  - Path: /users/{uid}/entries/{id}  |
|  - Protected Gemini API Key proxy    |      +-------------------------------------+
+------------------+-------------------+
                   |
                   v
+--------------------------------------+
|       GOOGLE GEMINI 3.6 FLASH        |
|  - Empathetic Socratic Guide System  |
|  - JSON Schema Constrained Summary   |
+--------------------------------------+
```

---

## 3. Technologies Used

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, React-Markdown.
- **AI & Reasoning**: Google GenAI SDK (`@google/genai`), Gemini 3.6 Flash (`gemini-3.6-flash`).
- **Backend**: Node.js, Express, tsx, esbuild.
- **Authentication**: Firebase Authentication with Google Sign-In provider.
- **Persistence**: Google Cloud Firestore with security rules enforcing zero cross-user access.
- **Infrastructure**: Google Cloud Run ready, Google Cloud Secret Manager.

---

## 4. Firebase Authentication Setup

Authentication is handled via Firebase Auth client SDK with Google Sign-In popup:
- The authoritative user identity is derived strictly from the verified Firebase UID (`request.auth.uid`).
- No passwords or sensitive user credentials are stored or handled directly.
- User metadata (display name, email, avatar URL) is synced to `/users/{userId}` upon sign-in.

---

## 5. Cloud Firestore Setup & Security Rules

All journal entries and reflection summaries are stored in user-isolated subcollections:
- **Collection Path**: `/users/{userId}/entries/{entryId}`

### Firestore Security Rules (`firestore.rules`):

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    match /users/{userId} {
      allow read, write: if isOwner(userId);

      match /entries/{entryId} {
        allow read, write: if isOwner(userId);
      }
    }
  }
}
```

---

## 6. Gemini Integration & Secret Management

- **Zero Client Credential Leakage**: The Gemini API key is never exposed to the client bundle.
- **Backend API Routes**:
  - `POST /api/gemini/chat`: Receives sanitized message history, verifies Firebase Auth ID token, and invokes Gemini with an empathetic reflection prompt.
  - `POST /api/gemini/summarize`: Analyzes the reflection dialogue, verifies Firebase Auth ID token, and produces structured JSON containing title, executive summary, key insights, and reflection themes.
- **Google Cloud Secret Manager Architecture**:
  ```
  +-------------------------------+
  | Google Cloud Secret Manager   |
  | (Secret: GEMINI_API_KEY)      |
  +---------------+---------------+
                  |
                  | Cloud Run Secret Binding (--set-secrets)
                  v
  +-------------------------------+
  | Cloud Run Runtime Environment |
  | (process.env.GEMINI_API_KEY)  |
  +---------------+---------------+
                  |
                  | Server-Side Access (No Client Leakage)
                  v
  +-------------------------------+
  | server.ts (GoogleGenAI SDK)   |
  +-------------------------------+
  ```

### Cloud Run & Secret Manager Setup Guide

1. **Create the Secret in Google Cloud Secret Manager**:
   ```bash
   gcloud secrets create GEMINI_API_KEY \
     --replication-policy="automatic" \
     --data-file=/path/to/key.txt
   ```
   *(Or create via Google Cloud Console > Security > Secret Manager > Create Secret)*

2. **Grant the Cloud Run Service Account Access**:
   Ensure the Cloud Run runtime service account (e.g., `PROJECT_NUMBER-compute@developer.gserviceaccount.com` or custom service account) has the `roles/secretmanager.secretAccessor` role:
   ```bash
   gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
     --member="serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
     --role="roles/secretmanager.secretAccessor"
   ```

3. **Bind the Secret to Cloud Run as an Environment Variable**:
   ```bash
   gcloud run services update SERVICE_NAME \
     --set-secrets="GEMINI_API_KEY=GEMINI_API_KEY:latest" \
     --region=REGION
   ```

4. **Fail-Safe Server Behavior**:
   - `server.ts` lazily retrieves `process.env.GEMINI_API_KEY`. If unavailable or misconfigured, it safely fails fast with an explicit error without crashing the server startup or exposing tokens in logs.


---

## 7. Environment Configuration

Define secrets in `.env`:

```env
# GEMINI_API_KEY: Required for Gemini AI API calls
GEMINI_API_KEY="your-gemini-api-key"

# Optional Cloud Run App URL
APP_URL="https://your-app-url.run.app"
```

Refer to `.env.example` for all required environment variable definitions.

---

## 8. Local Development

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Opens on `http://localhost:3000`.

3. **Verify Type-Checking & Linting**:
   ```bash
   npm run lint
   ```

4. **Build Production Bundle**:
   ```bash
   npm run build
   ```

5. **Start Production Server**:
   ```bash
   npm start
   ```

---

## 9. Functional Test Checklist

- [x] **Authentication Boundary**: Unauthenticated users see only the secure Google Sign-In prompt.
- [x] **Google Sign-In**: Authenticated user session triggers Firestore user profile sync and loads private entries.
- [x] **Multi-Turn Conversation**: User inputs reflections, and Gemini responds with empathetic, Socratic questions.
- [x] **Automatic Summarization**: "Save & Summarize" triggers Gemini to generate structured executive summaries, takeaways, and theme chips.
- [x] **Firestore Persistence**: Conversations and summaries are saved to `/users/{userId}/entries/{entryId}`.
- [x] **Cross-User Data Isolation**: Firestore rules enforce `request.auth.uid == userId`. User A cannot read, query, edit, or delete User B's entries.
- [x] **Logout & Re-Login**: Signing out clears local active state; signing back in reloads all saved entries accurately.
- [x] **Search & History Filtering**: Search bar filters past entries by title, summary content, insights, and theme tags.
- [x] **Deletion**: Users can permanently delete an entry from Firestore.

---

## 10. Security Considerations

- **Least Privilege**: Application accesses only user-scoped paths and minimal required scopes.
- **Input Validation**: Volumetric message length caps (10,000 chars per message, 40 messages max per context window) and input sanitization at API endpoints.
- **Output Safety**: Gemini text output rendered through safe Markdown components without raw HTML or code execution.
