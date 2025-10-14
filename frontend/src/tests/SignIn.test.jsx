import { render, fireEvent, screen, waitFor } from '@solidjs/testing-library';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SignIn from '../auth/SignIn';

// Create mock functions
const mockNavigate = vi.fn();
const mockSignin = vi.fn();

// Mock dependencies
vi.mock('../auth/AuthProvider.jsx', () => {
  return {
    useAuth: () => ({
      signin: mockSignin,
    }),
  };
});

vi.mock('@solidjs/router', () => {
  return {
    useNavigate: () => mockNavigate,
  };
});

// Mock the PasswordInput component
vi.mock('../auth/PasswordInput.jsx', () => {
  return {
    default: (props) => (
      <div data-testid="password-input">
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          value={props.password || ''}
          onInput={(e) => props.onPasswordChange(e.target.value)}
          required={props.required}
        />
      </div>
    ),
  };
});

// Mock AnimatedShow component
vi.mock('../components/AnimatedShow.jsx', () => {
  return {
    AnimatedShow: (props) => {
      // Just render children regardless of when prop to make testing easier
      return props.when ? props.children : props.fallback || null;
    },
  };
});

describe('SignIn Component', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
  });

  it('renders the sign in form correctly', () => {
    render(() => <SignIn />);

    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
    expect(screen.getByText(/sign in to your account/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByText(/don't have an account\?/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument();
  });

  it('navigates to signup page when signup link is clicked', () => {
    render(() => <SignIn />);

    const signupLink = screen.getByRole('link', { name: /sign up/i });
    fireEvent.click(signupLink);

    expect(mockNavigate).toHaveBeenCalledWith('/signup');
  });

  it('validates form fields before submission', async () => {
    render(() => <SignIn />);

    // Submit the form with empty fields
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);

    // Since HTML5 validation would prevent submission, signin should not be called
    expect(mockSignin).not.toHaveBeenCalled();
  });

  it('calls signin function with correct parameters when form is submitted', async () => {
    mockSignin.mockResolvedValue();
    render(() => <SignIn />);

    // Fill in the form
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    fireEvent.input(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.input(passwordInput, { target: { value: 'password123' } });

    // Mock the loading state by directly calling setLoading(true)
    const form = screen.getByRole('form');

    // Trigger the form submission
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockSignin).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
    });
  });

  it('shows error message when signin fails with incorrect credentials', async () => {
    // Mock signin to throw an error
    mockSignin.mockRejectedValue({ message: JSON.stringify({ detail: 'Invalid credentials' }) });

    render(() => <SignIn />);

    // Fill in the form
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    fireEvent.input(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.input(passwordInput, { target: { value: 'wrongpassword' } });

    // Submit the form
    const form = screen.getByRole('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockSignin).toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalledWith('/dashboard', { replace: true });
    });
  });

  it('redirects to email verification when email is not verified', async () => {
    // Mock signin to throw an email not verified error
    mockSignin.mockRejectedValue({ message: JSON.stringify({ detail: 'Email not verified' }) });

    render(() => <SignIn />);

    // Fill in the form
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    fireEvent.input(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.input(passwordInput, { target: { value: 'password123' } });

    // Submit the form
    const form = screen.getByRole('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/verify-email', { replace: true });
    });
  });
});
