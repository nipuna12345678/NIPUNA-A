import React, { useState } from 'react';
import { BookOpen, ShieldCheck, Lock, Sparkles, Key, CheckCircle2, AlertCircle } from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

interface AuthScreenProps {
  onAuthSuccess?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      if (onAuthSuccess) onAuthSuccess();
    } catch (err: any) {
      console.error('Sign in error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in popup was closed before completing. Please try again.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        // Ignored
      } else {
        setError(err.message || 'Failed to sign in with Google. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        {/* Header Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#48533e] text-[#fbfaf8] shadow-sm mb-6">
          <BookOpen className="w-8 h-8 text-[#d8be9b]" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-[#2d2b28] sm:text-4xl font-serif">
          Personal Gemini Journal
        </h1>
        <p className="mt-3 text-sm sm:text-base text-[#6d665a] leading-relaxed max-w-sm mx-auto">
          A private, AI-powered reflection and brainstorming companion with automatic conversation summarization.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-[#ffffff] py-8 px-6 shadow-xs border border-[#e8e4dc] rounded-2xl sm:px-10">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-[#faeeee] border border-[#ecd2d0] flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[#a83226] shrink-0 mt-0.5" />
              <div className="text-xs text-[#82241a] leading-relaxed">{error}</div>
            </div>
          )}

          <div className="space-y-4">
            <button
              id="google-signin-button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 border border-[#ded8cc] rounded-xl bg-[#ffffff] hover:bg-[#f7f5f0] text-[#2d2b28] font-medium text-sm transition shadow-2xs hover:border-[#cbbfad] focus:outline-hidden focus:ring-2 focus:ring-[#5a6b4b] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-[#8c8275] border-t-[#48533e] rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
              )}
              <span>{loading ? 'Authenticating...' : 'Sign In with Google'}</span>
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-[#f0ebe1]">
            <h3 className="text-xs font-semibold text-[#48533e] uppercase tracking-wider mb-3">
              Production Security Baseline
            </h3>
            <ul className="space-y-2.5 text-xs text-[#6d665a]">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#5a7f4c] shrink-0 mt-0.5" />
                <span><strong>Strict Isolation:</strong> Your entries are stored in your own protected Firestore collection.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#5a7f4c] shrink-0 mt-0.5" />
                <span><strong>Server-Side AI Proxy:</strong> Gemini API keys are shielded from client browsers and executed securely.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#5a7f4c] shrink-0 mt-0.5" />
                <span><strong>Zero Cross-User Access:</strong> Authenticated token verification ensures no unauthorized reads.</span>
              </li>
            </ul>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-[#8c8275]">
          Personal Gemini Journal &bull; Built with Google GenAI & Firebase
        </p>
      </div>
    </div>
  );
};
