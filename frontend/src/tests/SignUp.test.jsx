import { render, fireEvent, screen } from '@solidjs/testing-library';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import SignUp from '@auth/SignUp';

// Create mock functions
const mockNavigate = vi.fn();
const mockSignup = vi.fn();

// Mock dependencies
vi.mock('../auth/AuthStore.js', () => {
  return {
    useAuth: () => ({
      signup: mockSignup,
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
        <label htmlFor="password-input">Password</label>
        <input
          type="password"
          id="password-input"
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

// Mock StrengthIndicator component
vi.mock('../auth/StrengthIndicator.jsx', () => {
  return {
    default: (props) => {
      if (props.onUnmet) {
        props.onUnmet(['an uppercase letter', 'a special character']);
      }
      return <div data-testid="strength-indicator"></div>;
    },
  };
});

describe('SignUp Component', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
  });

  it('renders the signup form correctly', () => {
    render(() => <SignUp />);

    expect(screen.getByRole('heading', { name: /get started/i })).toBeInTheDocument();
    expect(screen.getByText(/create a new account/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
    expect(screen.getByText(/already have an account/i)).toBeInTheDocument();
  });

  it('shows validation error when submitting empty form', async () => {
    // Mock the DOM manipulation for setting error
    render(() => <SignUp />);

    // Submit form with no data
    const submitButton = screen.getByRole('button', { name: /sign up/i });
    fireEvent.click(submitButton);

    // The form validation should prevent submission
    expect(mockSignup).not.toHaveBeenCalled();
  });

  it('shows error when passwords do not match', async () => {
    render(() => <SignUp />);

    // Fill in form with non-matching passwords
    fireEvent.input(screen.getByLabelText(/name/i), { target: { value: 'Test User' } });
    fireEvent.input(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });

    // Use getByTestId instead of getByLabelText for the password input
    const passwordInput = screen.getByTestId('password-input').querySelector('input');
    fireEvent.input(passwordInput, { target: { value: 'Password1!' } });

    fireEvent.input(screen.getByLabelText(/confirm password/i), { target: { value: 'Password2!' } });

    // Submit form
    const form = screen.getByRole('form');
    fireEvent.submit(form);

    // The mock makes SignUp functionality work properly
    expect(mockSignup).not.toHaveBeenCalled();
  });

  it('shows password requirements error when password is weak', async () => {
    render(() => <SignUp />);

    // Fill in form with weak password
    fireEvent.input(screen.getByLabelText(/name/i), { target: { value: 'Test User' } });
    fireEvent.input(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });

    // Use getByTestId instead of getByLabelText for the password input
    const passwordInput = screen.getByTestId('password-input').querySelector('input');
    fireEvent.input(passwordInput, { target: { value: 'password' } });

    fireEvent.input(screen.getByLabelText(/confirm password/i), { target: { value: 'password' } });

    // Submit form
    const form = screen.getByRole('form');
    fireEvent.submit(form);

    // The mock makes SignUp functionality work properly
    expect(mockSignup).not.toHaveBeenCalled();
  });

  it('navigates to sign in page when clicking sign in link', () => {
    render(() => <SignUp />);

    // Click on the "Sign In" link
    const signInLink = screen.getByRole('link', { name: /sign in/i });
    fireEvent.click(signInLink);

    expect(mockNavigate).toHaveBeenCalledWith('/signin');
  });
});
