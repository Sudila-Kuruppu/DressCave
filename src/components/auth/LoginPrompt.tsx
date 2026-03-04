'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';

interface LoginPromptProps {
  message: string;
  onClose: () => void;
}

export default function LoginPrompt({ message, onClose }: LoginPromptProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle ESC key to close
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  // Focus trap for accessibility
  useEffect(() => {
    if (modalRef.current) {
      // Focus the close button when modal opens
      closeButtonRef.current?.focus();

      // Prevent tabbing outside the modal
      const focusableElements = modalRef.current.querySelectorAll(
        'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      const handleTab = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            // Shift + Tab: focus last element if currently focused on first
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else {
            // Tab: focus first element if currently focused on last
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }
      };

      document.addEventListener('keydown', handleTab);

      // Return focus to trigger element when closing
      const previouslyFocused = document.activeElement as HTMLElement;

      return () => {
        document.removeEventListener('keydown', handleTab);
        previouslyFocused?.focus();
      };
    }
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-prompt-title"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6"
      >
        <div className="flex justify-between items-start mb-4">
          <h2 id="login-prompt-title" className="text-xl font-bold text-[#FF6F61]">
            Sign In Required
          </h2>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#4FA1A0] rounded p-1"
            aria-label="Close login prompt"
            type="button"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
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
              className="text-[#FF6F61] hover:underline font-medium focus:outline-none focus:ring-2 focus:ring-[#4FA1A0] rounded"
            >
              Sign in
            </Link>
          </p>
          <p className="text-sm text-gray-600">
            New customer?{' '}
            <Link
              href="/register"
              className="text-[#FF6F61] hover:underline font-medium focus:outline-none focus:ring-2 focus:ring-[#4FA1A0] rounded"
            >
              Create an account
            </Link>
          </p>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            type="button"
            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#4FA1A0]"
          >
            Continue Browsing
          </button>
        </div>
      </div>
    </div>
  );
}
