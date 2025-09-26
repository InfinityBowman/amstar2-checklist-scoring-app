import { createSignal, Show, createEffect } from 'solid-js';
import StrengthIndicator from './StrengthIndicator.jsx';
import PasswordInput from './PasswordInput.jsx';
import { useNavigate } from '@solidjs/router';
import { useAuth } from './AuthProvider.jsx';
import { AnimatedShow } from '../components/AnimatedShow.jsx';
import { AiOutlineLoading3Quarters } from 'solid-icons/ai';

export default function SignUp() {
  const [name, setName] = createSignal('');
  const [email, setEmail] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [confirmPassword, setConfirmPassword] = createSignal('');
  const [error, setError] = createSignal('');
  const [submitted, setSubmitted] = createSignal(false);
  const [unmetRequirements, setUnmetRequirements] = createSignal([]);
  const [loading, setLoading] = createSignal(false);

  const navigate = useNavigate();
  const { signup } = useAuth();

  async function handleSignup() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const result = signup(email(), password(), name());
        if (result.status === 'success') {
          resolve();
        } else {
          reject(new Error(result.message));
        }
      }, 200);
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
    setError('');
    if (!name() || !email() || !password() || !confirmPassword()) {
      setError('Please fill out all fields');
      return;
    }
    if (password() !== confirmPassword()) {
      setError('Passwords do not match');
      return;
    }
    if (unmetRequirements().length > 0) {
      return;
    }

    setLoading(true);
    try {
      await handleSignup();
      navigate('/verify-email', { replace: true });
      setLoading(false);
    } catch (err) {
      console.error('Signup error:', err);
      // TODO more specific error messages based on error code
      setLoading(false);
      setError('Sign up failed');
    }
  }

  createEffect(() => {
    if (password() === confirmPassword()) {
      setError('');
    }
  });

  return (
    <div class="h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-6 sm:py-12">
      <form
        aria-labelledby="signup-heading"
        onSubmit={handleSubmit}
        class="w-full max-w-md sm:max-w-xl bg-white rounded-xl sm:rounded-3xl shadow-2xl p-6 sm:p-12 space-y-4 border border-gray-100"
        autocomplete="off"
      >
        <div class="mb-2 text-center">
          <h2 class="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2" id="signup-heading">
            Get Started
          </h2>
          <p class="text-gray-500 text-xs sm:text-sm">Create a new account.</p>
        </div>
        <div>
          <label class="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2" for="name-input">
            Name
          </label>
          <div class="relative">
            <input
              type="text"
              autoComplete="name"
              autocapitalize="words"
              spellcheck="false"
              value={name()}
              onInput={(e) => setName(e.target.value)}
              class="w-full pl-3 sm:pl-4 pr-3 sm:pr-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
              required
              id="name-input"
              placeholder="What should we call you?"
            />
          </div>
        </div>
        <div>
          <label class="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2" for="email-input">
            Email
          </label>
          <div class="relative">
            <input
              type="email"
              autoComplete="email"
              autocapitalize="off"
              spellCheck="false"
              value={email()}
              onInput={(e) => setEmail(e.target.value)}
              class="w-full pl-3 sm:pl-4 pr-3 sm:pr-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
              required
              id="email-input"
              placeholder="you@example.com"
            />
          </div>
        </div>
        <div>
          <PasswordInput password={password()} onPasswordChange={setPassword} autoComplete="new-password" required />
          <AnimatedShow when={submitted() && unmetRequirements().length > 0}>
            <p class="pt-2 sm:pt-3 px-2 text-red-600 text-xs sm:text-sm">Password must include {unmetRequirements()?.[0]}</p>
          </AnimatedShow>
          <StrengthIndicator password={password()} onUnmet={setUnmetRequirements} />
        </div>
        <div>
          <label class="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2" for="confirm-password-input">
            Confirm Password
          </label>
          <div class="relative">
            <input
              type="password"
              autoComplete="new-password"
              autocapitalize="off"
              spellCheck="false"
              value={confirmPassword()}
              onInput={(e) => setConfirmPassword(e.target.value)}
              class="w-full pl-3 sm:pl-4 pr-3 sm:pr-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition big-placeholder"
              required
              id="confirm-password-input"
              placeholder="••••••••"
            />
          </div>
          <AnimatedShow when={!!error()}>
            <p class="pt-2 sm:pt-3 px-2 text-red-600 text-xs sm:text-sm">{error()}</p>
          </AnimatedShow>
        </div>
        <button
          type="submit"
          class="w-full py-2 sm:py-3 text-sm sm:text-base bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg sm:rounded-xl shadow transition disabled:opacity-50 flex items-center justify-center"
          disabled={loading()}
        >
          <AnimatedShow when={loading()} fallback={'Sign Up'}>
            <div class="flex items-center">
              <AiOutlineLoading3Quarters class="animate-spin mr-2" size={22} />
              Signing Up...
            </div>
          </AnimatedShow>
        </button>
        <div class="text-center text-xs sm:text-sm text-gray-500 mt-2 sm:mt-4">
          Already have an account?{' '}
          <a
            href="/signin"
            class="text-indigo-600 hover:underline font-semibold"
            onClick={(e) => {
              e.preventDefault();
              navigate('/signin');
            }}
          >
            Sign In
          </a>
        </div>
      </form>
    </div>
  );
}
