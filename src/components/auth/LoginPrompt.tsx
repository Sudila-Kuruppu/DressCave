'use client';

import Link from 'next/link';

interface LoginPromptProps {
  message: string;
  onClose: () => void;
}

export default function LoginPrompt({ message, onClose }: LoginPromptProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-[#FF6F61]">Sign In Required</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-gray-700 mb-6">{message}</p>

        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-[#FF6F61] hover:underline font-medium"
            >
              Sign in
            </Link>
          </p>
          <p className="text-sm text-gray-600">
            New customer?{' '}
            <Link
              href="/register"
              className="text-[#FF6F61] hover:underline font-medium"
            >
              Create an account
            </Link>
          </p>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Continue Browsing
          </button>
        </div>
      </div>
    </div>
  );
}
