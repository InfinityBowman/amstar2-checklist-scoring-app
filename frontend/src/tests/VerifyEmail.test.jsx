import { render, fireEvent, screen, waitFor } from '@solidjs/testing-library';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import VerifyEmail from '../auth/VerifyEmail';

// Create mock functions
const mockNavigate = vi.fn();
const mockSetSearchParams = vi.fn();
let mockSearchParams = {};
const mockVerifyEmail = vi.fn();
const mockSendEmailVerification = vi.fn();
const mockGetPendingEmail = vi.fn(() => 'test@example.com');

// Mock dependencies
vi.mock('../auth/AuthStore.js', () => {
  return {
    useAuth: () => ({
      verifyEmail: mockVerifyEmail,
      sendEmailVerification: mockSendEmailVerification,
      getPendingEmail: mockGetPendingEmail,
    }),
  };
});

vi.mock('@solidjs/router', () => {
  return {
    useNavigate: () => mockNavigate,
    useSearchParams: () => [mockSearchParams, mockSetSearchParams],
    Router: ({ children }) => children,
  };
});

describe('VerifyEmail Component', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    mockSearchParams = {}; // Reset search params for each test
    mockGetPendingEmail.mockReturnValue('test@example.com');
  });

  it('renders the initial send code state correctly', () => {
    render(() => <VerifyEmail />);

    expect(screen.getByRole('heading', { name: /verify your email/i })).toBeInTheDocument();
    expect(screen.getByText(/send a code to verify your email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send code/i })).toBeInTheDocument();
  });

  it('navigates away if no pending email', async () => {
    // Override the default mock to return null for getPendingEmail
    mockGetPendingEmail.mockReturnValue(null);

    render(() => <VerifyEmail />);

    // Should redirect to signin
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/signin', { replace: true });
    });
  });

  it('sends verification code when button is clicked', async () => {
    mockSendEmailVerification.mockResolvedValue();

    render(() => <VerifyEmail />);

    const sendCodeButton = screen.getByRole('button', { name: /send code/i });
    fireEvent.click(sendCodeButton);

    expect(sendCodeButton).toBeDisabled();
    expect(screen.getByText(/sending/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(mockSendEmailVerification).toHaveBeenCalled();
      expect(mockSetSearchParams).toHaveBeenCalledWith({ codeSent: 'true' });
    });
  });

  it('shows verification form after code is sent', async () => {
    mockSendEmailVerification.mockResolvedValue();

    // Mock code sent is true
    mockSearchParams = { codeSent: 'true' };

    render(() => <VerifyEmail />);

    await waitFor(() => {
      // Should show pin input and verify button
      expect(screen.getByText(/enter the verification code/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /verify email/i })).toBeInTheDocument();
    });
  });

  it('handles verification submission successfully', async () => {
    // Mock code sent is true
    mockSearchParams = { codeSent: 'true' };
    mockVerifyEmail.mockResolvedValue();

    render(() => <VerifyEmail />);

    // We need to provide a value for the PIN input
    // To properly test we would need to simulate entering a value, but since PinInput is complex,
    // we'll use the form submission directly
    const form = screen.getByRole('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockVerifyEmail).toHaveBeenCalled();
    });
  });

  it('handles verification errors', async () => {
    // Mock code sent is true
    mockSearchParams = { codeSent: 'true' };

    // Mock verification to throw error
    mockVerifyEmail.mockRejectedValue(new Error('Invalid code'));

    render(() => <VerifyEmail />);

    // Submit the form
    const form = screen.getByRole('form');
    fireEvent.submit(form);

    await waitFor(() => {
      // Looking at the actual component, we need to adjust what text we're looking for
      expect(screen.getByText(/invalid code/i)).toBeInTheDocument();
    });
  });

  it('resends code when resend button is clicked', async () => {
    // Mock code sent is true
    mockSearchParams = { codeSent: 'true' };
    mockSendEmailVerification.mockResolvedValue();

    render(() => <VerifyEmail />);

    // Click resend button
    fireEvent.click(screen.getByRole('button', { name: /resend/i }));

    expect(screen.getByText(/sending/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(mockSendEmailVerification).toHaveBeenCalled();
    });
  });

  it('automatically verifies code from URL parameter', async () => {
    // Mock search params to simulate code in URL
    mockSearchParams = { codeSent: 'true', code: '123456' };
    mockVerifyEmail.mockResolvedValue();

    render(() => <VerifyEmail />);

    await waitFor(() => {
      expect(mockVerifyEmail).toHaveBeenCalledWith('123456');
      expect(mockNavigate).toHaveBeenCalledWith('/signin', { replace: true });
    });
  });

  it('handles failed code verification from URL', async () => {
    // Mock search params to simulate invalid code in URL
    mockSearchParams = { codeSent: 'true', code: 'invalid' };

    // Mock verification to throw error
    mockVerifyEmail.mockRejectedValue(new Error('Invalid code'));

    render(() => <VerifyEmail />);

    await waitFor(() => {
      expect(screen.getByText(/invalid or expired link/i)).toBeInTheDocument();
    });
  });

  it('handles API errors when sending code', async () => {
    // Mock sendEmailVerification to throw error
    mockSendEmailVerification.mockRejectedValue(new Error('Network error'));

    render(() => <VerifyEmail />);

    // Click send code button
    fireEvent.click(screen.getByRole('button', { name: /send code/i }));

    await waitFor(() => {
      expect(screen.getByText(/error sending code/i)).toBeInTheDocument();
    });
  });
});
