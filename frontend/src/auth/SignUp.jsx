import { createSignal, createMemo } from 'solid-js';
import { runTestAuth } from './authService';
import StrengthIndicator from './StrengthIndicator.jsx';
import PasswordInput from './PasswordInput.jsx';
import { useNavigate } from '@solidjs/router';
import { useAuth } from './AuthProvider.jsx';

export default function SignUp({ onSignUp }) {
  const [email, setEmail] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [confirmPassword, setConfirmPassword] = createSignal('');
  const [error, setError] = createSignal('');
  const [success, setSuccess] = createSignal('');
  const navigate = useNavigate();
  const { signup } = useAuth();

  // Uncomment to run the auth api test
  // runTestAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!email() || !password() || !confirmPassword()) {
      setError('Please fill out all fields');
      return;
    }
    if (password() !== confirmPassword()) {
      setError('Passwords do not match');
      return;
    }
    try {
      await signup(email(), password());
      setSuccess('Account created! You can now sign in.');
      if (onSignUp) {
        onSignUp(email());
      }
      navigate('/signin', { replace: true });
    } catch (err) {
      setError(err.message || 'Sign up failed');
    }
  }

  return (
    <form onSubmit={handleSubmit} class="max-w-sm mx-auto mt-8 p-4 border rounded shadow">
      <h2 class="text-xl mb-4">Sign Up</h2>
      <div class="mb-2">
        <label class="block mb-1" for="email-input">
          Email
        </label>
        <input
          type="email"
          autoComplete="email"
          autocapitalize="off"
          spellcheck="false"
          value={email()}
          onInput={(e) => setEmail(e.target.value)}
          class="w-full p-2 border rounded"
          required
          id="email-input"
        />
      </div>
      <div class="mb-2">
        <label class="block mb-1" for="password-input">
          Password
        </label>
        <input
          type="password"
          autoComplete="new-password"
          autocapitalize="off"
          spellcheck="false"
          value={password()}
          onInput={(e) => setPassword(e.target.value)}
          class="w-full p-2 border rounded"
          required
          id="password-input"
        />
        <StrengthIndicator password={password()} />
      </div>
      <PasswordInput />
      <div class="mb-2">
        <label class="block mb-1" for="confirm-password-input">
          Confirm Password
        </label>
        <input
          type="password"
          autoComplete="new-password"
          autocapitalize="off"
          spellcheck="false"
          value={confirmPassword()}
          onInput={(e) => setConfirmPassword(e.target.value)}
          class="w-full p-2 border rounded"
          required
          id="confirm-password-input"
        />
      </div>
      {error() && <div class="text-red-600 mb-2">{error()}</div>}
      {success() && <div class="text-green-600 mb-2">{success()}</div>}
      <button type="submit" class="w-full bg-green-600 text-white py-2 rounded">
        Sign Up
      </button>
    </form>
  );
}

function getStrength(password) {
  let score = 0;
  if (!password)
    return {
      score,
      requirements: ['At least 8 characters', 'One uppercase letter', 'One lowercase letter', 'One number', 'One special character'],
    };
  const requirements = [];
  if (password.length < 8) requirements.push('At least 8 characters');
  if (!/[A-Z]/.test(password)) requirements.push('One uppercase letter');
  if (!/[a-z]/.test(password)) requirements.push('One lowercase letter');
  if (!/\d/.test(password)) requirements.push('One number');
  if (!/[^A-Za-z0-9]/.test(password)) requirements.push('One special character');

  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  return { score, requirements };
}

const strengthClasses = ['bg-red-500', 'bg-yellow-400', 'bg-green-600'];

function StrengthIndicator1(props) {
  const strength = createMemo(() => getStrength(props.password || ''));

  function getBarColor(idx) {
    if (idx < strength().score) {
      if (strength().score >= 4) return strengthClasses[2];
      if (strength().score >= 2) return strengthClasses[1];
      return strengthClasses[0];
    }
    return 'bg-gray-200';
  }

  return (
    <div class="mt-3">
      <div class="mb-2 text-sm text-gray-600" id="password-requirements" aria-live="polite">
        {strength().requirements.length === 0 ?
          'Password meets all requirements.'
        : <ul class="list-disc ml-5">
            {strength().requirements.map((req) => (
              <li>{req}</li>
            ))}
          </ul>
        }
      </div>
      <div aria-hidden="true" class="flex gap-2 mt-2">
        {[0, 1, 2, 3, 4].map((idx) => (
          <div class={`h-3 w-10 rounded ${getBarColor(idx)} transition-colors`} />
        ))}
      </div>
    </div>
  );
}
