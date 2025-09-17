import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as authService from '../auth/authService';
import API_ENDPOINTS from '../config/api.js';

const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock Intl and navigator
global.Intl = {
  DateTimeFormat: () => ({
    resolvedOptions: () => ({ timeZone: 'America/New_York' }),
  }),
};

global.navigator = {
  language: 'en-US',
};

describe('authService', () => {
  beforeEach(() => {
    authService.signout(); // reset accessToken
    mockFetch.mockReset();
  });

  describe('signup', () => {
    it('should call fetch with correct params', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });
      await authService.signup('test@example.com', 'pass', 'Test');
      expect(mockFetch).toHaveBeenCalledWith(
        API_ENDPOINTS.SIGNUP,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'pass',
            name: 'Test',
            timezone: 'America/New_York',
            locale: 'en-US',
          }),
        }),
      );
    });

    it('should throw error if signup fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        text: () => Promise.resolve('Signup failed'),
      });
      await expect(authService.signup('x', 'y', 'z')).rejects.toThrow('Signup failed');
    });
  });

  describe('signin', () => {
    it('should set accessToken on success', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ accessToken: 'abc123' }),
      });
      await authService.signin('test@example.com', 'pass');
      // accessToken is internal, but we can test authFetch uses it
      mockFetch.mockResolvedValueOnce({ ok: true });
      await authService.authFetch('http://localhost:8000/test');
      expect(mockFetch).toHaveBeenLastCalledWith(
        'http://localhost:8000/test',
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: 'Bearer abc123' }),
        }),
      );
    });

    it('should send timezone and locale with signin request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ accessToken: 'abc123' }),
      });
      await authService.signin('test@example.com', 'pass');
      expect(mockFetch).toHaveBeenCalledWith(
        API_ENDPOINTS.SIGNIN,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'pass',
            timezone: 'America/New_York',
            locale: 'en-US',
          }),
        }),
      );
    });

    it('should throw error if signin fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        text: () => Promise.resolve('Sign in failed'),
      });
      await expect(authService.signin('x', 'y')).rejects.toThrow('Sign in failed');
    });
  });

  describe('getCurrentUser', () => {
    it('should return user data on success', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ id: 1 }) });
      const user = await authService.getCurrentUser();
      expect(user).toEqual({ id: 1 });
    });

    it('should use authFetch with the correct endpoint', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ id: 1 }) });
      await authService.getCurrentUser();
      expect(mockFetch).toHaveBeenCalledWith(API_ENDPOINTS.CURRENT_USER, expect.any(Object));
    });

    it('should throw error if fetch fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        text: () => Promise.resolve('Failed to fetch user'),
      });
      await expect(authService.getCurrentUser()).rejects.toThrow('Failed to fetch user');
    });
  });

  describe('authFetch', () => {
    it('should retry on 401 and refresh token', async () => {
      // First call returns 401, refresh succeeds, second call returns ok
      mockFetch
        .mockResolvedValueOnce({ status: 401, ok: false }) // initial request
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ accessToken: 'newtoken' }) }) // refresh
        .mockResolvedValueOnce({ ok: true }); // retry
      await authService.authFetch('http://localhost:8000/test');
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it('should signout and throw if refresh fails', async () => {
      mockFetch
        .mockResolvedValueOnce({ status: 401, ok: false }) // initial request
        .mockResolvedValueOnce({ ok: false, text: () => Promise.resolve('Refresh failed') }); // refresh
      await expect(authService.authFetch('http://localhost:8000/test')).rejects.toThrow('Session expired. Please log in again.');
    });
  });

  describe('refreshAccessToken', () => {
    it('should update accessToken on success', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ accessToken: 'xyz' }) });
      await authService.refreshAccessToken();
      // accessToken is internal, but next authFetch should use it
      mockFetch.mockResolvedValueOnce({ ok: true });
      await authService.authFetch('http://localhost:8000/test');
      expect(mockFetch).toHaveBeenLastCalledWith(
        'http://localhost:8000/test',
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: 'Bearer xyz' }),
        }),
      );
    });

    it('should use credentials:include when refreshing', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ accessToken: 'xyz' }) });
      await authService.refreshAccessToken();
      expect(mockFetch).toHaveBeenCalledWith(
        API_ENDPOINTS.REFRESH,
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
        }),
      );
    });

    it('should throw error if refresh fails', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, text: () => Promise.resolve('Refresh failed') });
      await expect(authService.refreshAccessToken()).rejects.toThrow('Refresh failed');
    });
  });

  describe('signout', () => {
    it('should clear accessToken', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });
      await authService.signout();
      // accessToken is internal, but next authFetch should use null
      mockFetch.mockResolvedValueOnce({ ok: true });
      await authService.authFetch('http://localhost:8000/test');
      expect(mockFetch).toHaveBeenLastCalledWith(
        'http://localhost:8000/test',
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: 'Bearer null' }),
        }),
      );
    });

    it('should call signout endpoint with credentials:include', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });
      await authService.signout();
      expect(mockFetch).toHaveBeenCalledWith(
        API_ENDPOINTS.SIGNOUT,
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
        }),
      );
    });
  });

  describe('sendEmailVerification', () => {
    it('should call fetch with correct params', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });
      await authService.sendEmailVerification('test@example.com');
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/auth/send-verification',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'test@example.com' }),
        }),
      );
    });

    it('should throw error if send fails', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, text: () => Promise.resolve('Failed to send verification email') });
      await expect(authService.sendEmailVerification('x')).rejects.toThrow('Failed to send verification email');
    });
  });

  describe('verifyEmail', () => {
    it('should call fetch with correct params', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });
      await authService.verifyEmail('test@example.com', '123456');
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/auth/verify-email',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'test@example.com', code: '123456' }),
        }),
      );
    });

    it('should throw error if verify fails', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, text: () => Promise.resolve('Email verification failed') });
      await expect(authService.verifyEmail('x', 'y')).rejects.toThrow('Email verification failed');
    });
  });

  describe('requestPasswordReset', () => {
    it('should call fetch with correct params', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });
      await authService.requestPasswordReset('test@example.com');
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/auth/request-password-reset',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'test@example.com' }),
        }),
      );
    });

    it('should throw error if request fails', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, text: () => Promise.resolve('Failed to request password reset') });
      await expect(authService.requestPasswordReset('x')).rejects.toThrow('Failed to request password reset');
    });
  });

  describe('resetPassword', () => {
    it('should call fetch with correct params', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });
      await authService.resetPassword('test@example.com', 'code', 'newpass');
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/auth/reset-password',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'test@example.com', code: 'code', new_password: 'newpass' }),
        }),
      );
    });

    it('should throw error if reset fails', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, text: () => Promise.resolve('Failed to reset password') });
      await expect(authService.resetPassword('x', 'y', 'z')).rejects.toThrow('Failed to reset password');
    });
  });

  describe('checkHealth', () => {
    it('should call fetch with correct params', async () => {
      mockFetch.mockResolvedValueOnce({ status: 200, ok: true, json: () => Promise.resolve({ status: 'ok' }) });
      await authService.checkHealth();
      expect(mockFetch).toHaveBeenCalledWith(
        API_ENDPOINTS.HEALTH,
        expect.objectContaining({
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    });

    it('should throw error if health check fails', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, text: () => Promise.resolve('Health check failed') });
      await expect(authService.checkHealth()).rejects.toThrow('Health check failed');
    });
  });

  describe('checkHealthDb', () => {
    it('should call fetch with correct params', async () => {
      mockFetch.mockResolvedValueOnce({ status: 200, ok: true, json: () => Promise.resolve({ status: 'ok' }) });
      await authService.checkHealthDb();
      expect(mockFetch).toHaveBeenCalledWith(
        API_ENDPOINTS.HEALTH_DB,
        expect.objectContaining({
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    });

    it('should throw error if health DB check fails', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, text: () => Promise.resolve('Database health check failed') });
      await expect(authService.checkHealthDb()).rejects.toThrow('Database health check failed');
    });
  });
});
