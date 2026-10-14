# Personal Gemini Journal

A private journaling app where you write about your day and talk it through with Gemini. It asks reflective follow-up questions, then saves a summary, key insights and theme tags for each entry. Sign in with Google, and your entries are stored in Cloud Firestore where only you can read them.

## Features

- Google Sign-In with Firebase Authentication
- Multi-turn reflection chat with Gemini that asks follow-up questions
- "Save & Summarize": generates a title, executive summary, key insights and theme tags
- Entry history with search by title, summary, insights and tags
- Delete any entry permanently
- Each user can only access their own data (Firestore security rules)

## Tech stack

| Part | Technology |
| --- | --- |
| Frontend | React 19, TypeScript, Tailwind CSS, Lucide Icons, React-Markdown |
| Backend | Node.js, Express, Vite |
| AI | Google GenAI SDK (`@google/genai`), Gemini Flash model (exact model ID is set in `server.ts`) |
| Auth | Firebase Authentication (Google Sign-In) |
| Database | Cloud Firestore |
| Deployment | Google Cloud Run, Secret Manager |

## How it works

```
Browser (React) ──► Firebase Auth (Google Sign-In)
      │
      ├──► Express server ──► Gemini API
      │      POST /api/gemini/chat
      │      POST /api/gemini/summarize
      │
      └──► Cloud Firestore   /users/{uid}/entries/{entryId}
```

The browser never sees the Gemini API key. It calls the Express server, and the server calls Gemini. Journal entries are read and written directly in Firestore, protected by the rules in [`firestore.rules`](firestore.rules).

## Run locally

**Prerequisites:** Node.js, a [Gemini API key](https://aistudio.google.com/apikey) and a Firebase project with Google Sign-In and Firestore enabled.

```bash
git clone https://github.com/nipuna12345678/personal-gemini-journal.git
cd personal-gemini-journal
npm install
cp .env.example .env
# open .env and set GEMINI_API_KEY="your-key"
npm run dev
```

The app opens at `http://localhost:3000`.

Other commands: `npm run lint` (type-check), `npm run build` (production build), `npm start` (run the production build).

## Firebase setup

1. Create a Firebase project and turn on **Google** as a sign-in provider.
2. Create a Cloud Firestore database.
3. Put your Firebase web app config in `firebase-applet-config.json`.
4. Deploy the rules from `firestore.rules`. Every entry lives at `/users/{userId}/entries/{entryId}`, and only the signed-in owner (`request.auth.uid == userId`) can read or write it.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `GEMINI_API_KEY` | Yes | Gemini API key, used on the server only |
| `APP_URL` | No | Public URL of the deployed app |

Copy `.env.example` to `.env`. The `.env` file is git-ignored, so never commit it.

## Deploy to Cloud Run

Store the key in Secret Manager:

```bash
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic" --data-file=/path/to/key.txt

gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

Deploy:

```bash
gcloud run deploy personal-gemini-journal \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-secrets GEMINI_API_KEY=GEMINI_API_KEY:latest
```

`--allow-unauthenticated` makes the app reachable by anyone, which is needed so people can see the sign-in page. The Gemini routes are meant to be protected by a Firebase ID token check on the server.

## Security notes

- The Gemini API key stays on the server and is never bundled into the browser code.
- Firestore rules deny access to anything outside the signed-in user's own `/users/{uid}` path.
- The API limits input to 10,000 characters per message and 40 messages per conversation.
- Gemini output is rendered with a Markdown component, not as raw HTML.

## Manual test checklist

- [ ] Signed-out users only see the Google Sign-In screen
- [ ] Signing in loads your own entries
- [ ] A multi-turn chat keeps context across messages
- [ ] Save & Summarize creates a title, summary, insights and tags
- [ ] The entry is saved at `/users/{userId}/entries/{entryId}` in Firestore
- [ ] A second account cannot see the first account's entries
- [ ] Signing out and back in reloads saved entries
- [ ] Search filters entries by title, summary, insights and tags
- [ ] Deleting an entry removes it from Firestore

## What I built

Started from Google's AI Studio repository template, then:

- (write what you added or changed, e.g. the reflection prompt, summary format, search, deletion)
- (write what you learned or fixed)
