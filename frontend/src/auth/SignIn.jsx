import { createSignal } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { useAuth } from './AuthProvider.jsx';
import { AnimatedShow } from '../components/AnimatedShow.jsx';
import PasswordInput from './PasswordInput.jsx';
import { AiOutlineLoading3Quarters } from 'solid-icons/ai';

export default function SignIn() {
  const [email, setEmail] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [error, setError] = createSignal('');
  const [loading, setLoading] = createSignal(false);
  const navigate = useNavigate();
  const { signin } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!email() || !password()) {
      setError('Please enter email and password');
      return;
    }
    try {
      setLoading(true);
      await signin(email(), password());
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError('Invalid credentials');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div class="h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-2 sm:px-4 py-6 sm:py-12">
      <form
        aria-labelledby="signin-heading"
        onSubmit={handleSubmit}
        class="w-full max-w-md sm:max-w-2xl bg-white rounded-xl sm:rounded-3xl shadow-2xl p-4 sm:p-16 space-y-6 sm:space-y-8 border border-gray-100"
        autocomplete="off"
      >
        <div class="mb-2 sm:mb-4 text-center">
          <h2 class="text-2xl sm:text-4xl font-bold text-gray-900 mb-1 sm:mb-2" id="signin-heading">
            Welcome Back
          </h2>
          <p class="text-gray-500 text-base sm:text-lg">Sign in to your account.</p>
        </div>
        <div>
          <label class="block text-base sm:text-lg font-semibold text-gray-700 mb-1 sm:mb-2" for="email-input">
            Email
          </label>
          <input
            type="email"
            autoComplete="email"
            autocapitalize="off"
            spellCheck="false"
            value={email()}
            onInput={(e) => setEmail(e.target.value)}
            class="w-full pl-3 sm:pl-4 pr-3 sm:pr-4 py-2 text-base sm:text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            required
            id="email-input"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <PasswordInput password={password()} onPasswordChange={setPassword} autoComplete="current-password" required />
          <AnimatedShow when={!!error()}>
            <p class="pt-2 sm:pt-3 px-2 text-red-600 text-base sm:text-lg">{error()}</p>
          </AnimatedShow>
        </div>
        <button
          type="submit"
          class="w-full py-3 sm:py-4 px-4 sm:px-6 text-lg sm:text-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg sm:rounded-xl shadow transition disabled:opacity-50 flex items-center justify-center"
          disabled={loading()}
        >
          <AnimatedShow when={loading()}>
            <AiOutlineLoading3Quarters class="animate-spin mr-2" size={22} />
          </AnimatedShow>
          {loading() ? 'Signing In...' : 'Sign In'}
        </button>
        <div class="text-center text-base sm:text-lg text-gray-500 mt-2 sm:mt-4">
          Don&apos;t have an account?{' '}
          <a
            href="/signup"
            class="text-indigo-600 hover:underline font-semibold"
            onClick={(e) => {
              e.preventDefault();
              navigate('/signup');
            }}
          >
            Sign Up
          </a>
        </div>
      </form>
    </div>
  );
}
