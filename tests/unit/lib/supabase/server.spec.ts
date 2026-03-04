/**
 * [P0] Unit Tests for Supabase Server Infrastructure
 *
 * Tests the Supabase server client setup and configuration:
 * - Environment variable validation
 * - Client initialization with service role key
 * - Authentication configuration
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Supabase Server Infrastructure - Unit Tests', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };

    // Reset modules to force re-import
    vi.clearAllMocks();
    vi.resetModules();
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('server.ts - supabaseAdmin client', () => {
    it('[P0] should throw error when NEXT_PUBLIC_SUPABASE_URL is missing', async () => {
      // Arrange
      process.env.NEXT_PUBLIC_SUPABASE_URL = '';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';

      // Act & Assert
      await expect(async () => {
        vi.doMock('@supabase/supabase-js', () => ({
          createClient: vi.fn(),
        }));
        // Force re-import
        const module = await import('@/lib/supabase/server');
      }).rejects.toThrow('Missing Supabase environment variables');
    });

    it('[P0] should throw error when SUPABASE_SERVICE_ROLE_KEY is missing', async () => {
      // Arrange
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_SERVICE_ROLE_KEY = '';

      // Act & Assert
      await expect(async () => {
        const module = await import('@/lib/supabase/server');
      }).rejects.toThrow('Missing Supabase environment variables');
    });

    it('[P0] should throw detailed error message when both env vars are missing', async () => {
      // Arrange
      process.env.NEXT_PUBLIC_SUPABASE_URL = undefined;
      process.env.SUPABASE_SERVICE_ROLE_KEY = undefined;

      // Act & Assert
      await expect(async () => {
        const module = await import('@/lib/supabase/server');
      }).rejects.toThrow(
        'Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set'
      );
    });

    it('[P0] should initialize client with service role key when env vars are present', async () => {
      // Arrange
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';

      const mockCreateClient = vi.fn();

      vi.doMock('@supabase/supabase-js', () => ({
        createClient: mockCreateClient,
      }));

      // Act
      const module = await import('@/lib/supabase/server');

      // Assert
      expect(mockCreateClient).toHaveBeenCalledWith(
        'https://test.supabase.co',
        'test-service-key',
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          },
        }
      );
    });

    it('[P1] should configure auth with persistSession: false', async () => {
      // Arrange
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';

      const mockCreateClient = vi.fn();

      vi.doMock('@supabase/supabase-js', () => ({
        createClient: mockCreateClient,
      }));

      // Act
      await import('@/lib/supabase/server');

      // Assert
      expect(mockCreateClient).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        {
          auth: expect.objectContaining({
            persistSession: false,
          }),
        }
      );
    });

    it('[P1] should configure auth with autoRefreshToken: false', async () => {
      // Arrange
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';

      const mockCreateClient = vi.fn();

      vi.doMock('@supabase/supabase-js', () => ({
        createClient: mockCreateClient,
      }));

      // Act
      await import('@/lib/supabase/server');

      // Assert
      expect(mockCreateClient).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        {
          auth: expect.objectContaining({
            autoRefreshToken: false,
          }),
        }
      );
    });

    it('[P2] should not expose service role key in exported interface', async () => {
      // Arrange
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';

      vi.doMock('@supabase/supabase-js', () => ({
        createClient: vi.fn(),
      }));

      // Act
      const module = await import('@/lib/supabase/server');

      // Assert
      expect(module.supabaseAdmin).toBeDefined();
      expect(typeof module.supabaseAdmin).toBe('object');
      // The key should not be directly accessible from the client object
      expect(module.supabaseAdmin.auth?.config?.apiKey).toBeUndefined();
    });
  });

  describe('Environment Variable Security', () => {
    it('[P0] should validate presence of public URL', () => {
      // Arrange
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

      // Assert - in test environment this should be set
      expect(url).toBeDefined();
      expect(typeof url).toBe('string');
    });

    it('[P1] should validate presence of anon key', () => {
      // Arrange
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      // Assert
      expect(key).toBeDefined();
      expect(typeof key).toBe('string');
    });

    it('[P1] public URL should be HTTPS in production', () => {
      // Arrange
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

      // Assert - if URL starts with https:// or localhost
      if (url && !url.includes('localhost') && !url.includes('127.0.0.1')) {
        expect(url.startsWith('https://')).toBe(true);
      }
    });
  });
});
