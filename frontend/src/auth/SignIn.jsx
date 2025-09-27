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

  async function handleSignin() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const result = signin(email(), password());
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
    setError('');
    if (!email() || !password()) {
      setError('Please enter email and password');
      return;
    }
    setLoading(true);
    try {
      await handleSignin();
      navigate('/dashboard', { replace: true });
      setLoading(false);
    } catch (err) {
      console.error('Signin error:', err);

      setLoading(false);
      setError('Incorrect email or password');
    }
  }

  return (
    <div class="h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-8 sm:py-12">
      <form
        aria-labelledby="signin-heading"
        onSubmit={handleSubmit}
        class="w-full max-w-md sm:max-w-xl bg-white rounded-xl sm:rounded-3xl shadow-2xl p-6 sm:p-12 space-y-4 border border-gray-100"
        autocomplete="off"
      >
        <div class="mb-2 sm:mb-4 text-center">
          <h2 class="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2" id="signin-heading">
            Welcome Back
          </h2>
          <p class="text-gray-500 text-xs sm:text-sm">Sign in to your account.</p>
        </div>
        <div>
          <label class="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2" for="email-input">
            Email
          </label>
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
        <div>
          <PasswordInput password={password()} onPasswordChange={setPassword} autoComplete="current-password" required />
          <AnimatedShow when={!!error()}>
            <p class="pt-2 sm:pt-3 px-2 text-red-600 text-xs sm:text-sm">{error()}</p>
          </AnimatedShow>
        </div>
        <button
          type="submit"
          class="w-full py-2 sm:py-3 text-sm sm:text-base bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg sm:rounded-xl shadow transition disabled:opacity-50 flex items-center justify-center"
          disabled={loading()}
        >
          <AnimatedShow when={loading()} fallback={'Sign In'}>
            <div class="flex items-center">
              <AiOutlineLoading3Quarters class="animate-spin mr-2" size={22} />
              Signing In...
            </div>
          </AnimatedShow>
        </button>
        <div class="text-center text-xs sm:text-sm text-gray-500 mt-2 sm:mt-4">
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
