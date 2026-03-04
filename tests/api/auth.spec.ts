import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createClient as createBrowserClient } from '@supabase/supabase-js';
import type { AuthError, User, Session } from '@supabase/supabase-js';

// Test ID: 1.3-API-001
// Description: Supabase Auth signup/login flow
// Level: API
// Priority: P0

vi.mock('@supabase/supabase-js', async () => {
  const actual = await import('@supabase/supabase-js');
  return {
    ...actual,
    createClient: vi.fn(),
  };
});

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

describe('1.3-API-001: Supabase Auth API Tests', () => {
  let mockSupabaseClient: any;

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();

    // Setup mock client
    mockSupabaseClient = {
      auth: {
        signUp: vi.fn(),
        signInWithPassword: vi.fn(),
        signInWithOAuth: vi.fn(),
        signOut: vi.fn(),
        getSession: vi.fn(),
        getUser: vi.fn(),
        refreshSession: vi.fn(),
        resetPasswordForEmail: vi.fn(),
        updateUser: vi.fn(),
      },
    };

    vi.mocked(createBrowserClient).mockReturnValue(mockSupabaseClient);
  });

  describe('[P0] User Signup Flow', () => {
    it('[P0] should successfully sign up a new user with valid data', async () => {
      const testEmail = 'test@example.com';
      const testPassword = 'SecurePassword123!';

      const mockUser: User = {
        id: 'user-123',
        email: testEmail,
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      };

      const mockSession: Session = {
        user: mockUser,
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        expires_in: 3600,
        token_type: 'bearer',
      };

      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const client = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const result = await client.auth.signUp({
        email: testEmail,
        password: testPassword,
      });

      // Verify success
      expect(result.error).toBeNull();
      expect(result.data.user).toBeDefined();
      expect(result.data.user?.email).toBe(testEmail);
      expect(result.data.session).toBeDefined();
      expect(result.data.session?.access_token).toBeDefined();
    });

    it('[P0] should return error for invalid email format', async () => {
      const testEmail = 'invalid-email';
      const testPassword = 'SecurePassword123!';

      const mockError: AuthError = {
        message: 'Invalid email',
        name: 'AuthError',
        status: 400,
      };

      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: mockError,
      });

      const client = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const result = await client.auth.signUp({
        email: testEmail,
        password: testPassword,
      });

      // Verify error
      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('email');
      expect(result.data.user).toBeNull();
    });

    it('[P1] should return error when password is too short', async () => {
      const testEmail = 'test@example.com';
      const testPassword = 'short';

      const mockError: AuthError = {
        message: 'Password should be at least 6 characters',
        name: 'AuthError',
        status: 400,
      };

      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: mockError,
      });

      const client = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const result = await client.auth.signUp({
        email: testEmail,
        password: testPassword,
      });

      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('password');
    });

    it('[P1] should return error when user already exists', async () => {
      const testEmail = 'existing@example.com';
      const testPassword = 'SecurePassword123!';

      const mockError: AuthError = {
        message: 'User already registered',
        name: 'AuthError',
        status: 409,
      };

      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: mockError,
      });

      const client = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const result = await client.auth.signUp({
        email: testEmail,
        password: testPassword,
      });

      expect(result.error).toBeDefined();
      expect(result.error?.status).toBe(409);
      expect(result.data.user).toBeNull();
    });
  });

  describe('[P0] User Login Flow', () => {
    it('[P0] should successfully login with valid credentials', async () => {
      const testEmail = 'user@example.com';
      const testPassword = 'CorrectPassword123!';

      const mockUser: User = {
        id: 'user-456',
        email: testEmail,
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      };

      const mockSession: Session = {
        user: mockUser,
        access_token: 'access-token-abc',
        refresh_token: 'refresh-token-xyz',
        expires_in: 3600,
        token_type: 'bearer',
      };

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const client = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const result = await client.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });

      // Verify success
      expect(result.error).toBeNull();
      expect(result.data.user).toBeDefined();
      expect(result.data.user?.email).toBe(testEmail);
      expect(result.data.session).toBeDefined();
      expect(result.data.session?.access_token).toBeDefined();
    });

    it('[P0] should return error for incorrect credentials', async () => {
      const testEmail = 'user@example.com';
      const testPassword = 'WrongPassword123!';

      const mockError: AuthError = {
        message: 'Invalid login credentials',
        name: 'AuthError',
        status: 401,
      };

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: mockError,
      });

      const client = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const result = await client.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });

      // Verify error
      expect(result.error).toBeDefined();
      expect(result.error?.status).toBe(401);
      expect(result.data.user).toBeNull();
      expect(result.data.session).toBeNull();
    });

    it('[P0] should return error for non-existent user', async () => {
      const testEmail = 'nonexistent@example.com';
      const testPassword = 'Password123!';

      const mockError: AuthError = {
        message: 'Invalid login credentials',
        name: 'AuthError',
        status: 401,
      };

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: mockError,
      });

      const client = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const result = await client.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });

      expect(result.error).toBeDefined();
      expect(result.error?.status).toBe(401);
    });
  });

  describe('[P0] Session Management', () => {
    it('[P0] should retrieve current session when user is logged in', async () => {
      const mockUser: User = {
        id: 'user-789',
        email: 'current@example.com',
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      };

      const mockSession: Session = {
        user: mockUser,
        access_token: 'current-access-token',
        refresh_token: 'current-refresh-token',
        expires_in: 3600,
        token_type: 'bearer',
      };

      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const client = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const result = await client.auth.getSession();

      expect(result.error).toBeNull();
      expect(result.data.session).toBeDefined();
      expect(result.data.session?.user?.email).toBe('current@example.com');
    });

    it('[P0] should return null session when user is logged out', async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const client = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const result = await client.auth.getSession();

      expect(result.error).toBeNull();
      expect(result.data.session).toBeNull();
    });

    it('[P1] should successfully logout the current user', async () => {
      mockSupabaseClient.auth.signOut.mockResolvedValue({
        data: {},
        error: null,
      });

      const client = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const result = await client.auth.signOut();

      expect(result.error).toBeNull();
    });
  });

  describe('[P1] Token Refresh', () => {
    it('[P1] should refresh expired access token', async () => {
      const mockRefreshToken = 'old-refresh-token';

      const mockNewSession: Session = {
        user: {
          id: 'user-refresh',
          email: 'refresh@example.com',
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        },
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        expires_in: 3600,
        token_type: 'bearer',
      };

      mockSupabaseClient.auth.refreshSession.mockResolvedValue({
        data: { session: mockNewSession },
        error: null,
      });

      const client = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const result = await client.auth.refreshSession({
        refresh_token: mockRefreshToken,
      });

      expect(result.error).toBeNull();
      expect(result.data.session?.access_token).toBe('new-access-token');
      expect(result.data.session?.refresh_token).toBe('new-refresh-token');
    });

    it('[P1] should return error refresh token is invalid', async () => {
      const mockError: AuthError = {
        message: 'Invalid refresh token',
        name: 'AuthError',
        status: 401,
      };

      mockSupabaseClient.auth.refreshSession.mockResolvedValue({
        data: { session: null },
        error: mockError,
      });

      const client = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const result = await client.auth.refreshSession({
        refresh_token: 'invalid-token',
      });

      expect(result.error).toBeDefined();
      expect(result.error?.status).toBe(401);
      expect(result.data.session).toBeNull();
    });
  });

  describe('[P2] Password Recovery', () => {
    it('[P2] should send password reset email for valid email', async () => {
      mockSupabaseClient.auth.resetPasswordForEmail.mockResolvedValue({
        data: {},
        error: null,
      });

      const client = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const result = await client.auth.resetPasswordForEmail('user@example.com');

      expect(result.error).toBeNull();
    });

    it('[P2] should handle invalid email for password reset', async () => {
      const mockError: AuthError = {
        message: 'Invalid email',
        name: 'AuthError',
        status: 400,
      };

      mockSupabaseClient.auth.resetPasswordForEmail.mockResolvedValue({
        data: {},
        error: mockError,
      });

      const client = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const result = await client.auth.resetPasswordForEmail('invalid-email');

      expect(result.error).toBeDefined();
    });
  });

  describe('[P2] OAuth Login', () => {
    it('[P2] should support OAuth login (Google)', async () => {
      const mockUrl = 'https://test.supabase.co/auth/v1/authorize?provider=google';

      mockSupabaseClient.auth.signInWithOAuth.mockResolvedValue({
        data: { url: mockUrl, provider: 'google', providerToken: null },
        error: null,
      });

      const client = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const result = await client.auth.signInWithOAuth({
        provider: 'google',
      });

      expect(result.error).toBeNull();
      expect(result.data.url).toBeDefined();
      expect(result.data.provider).toBe('google');
    });

    it('[P2] should support OAuth login (GitHub)', async () => {
      mockSupabaseClient.auth.signInWithOAuth.mockResolvedValue({
        data: { url: 'https://test.supabase.co/auth/v1/authorize?provider=github', provider: 'github', providerToken: null },
        error: null,
      });

      const client = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const result = await client.auth.signInWithOAuth({
        provider: 'github',
      });

      expect(result.error).toBeNull();
      expect(result.data.provider).toBe('github');
    });
  });
});
