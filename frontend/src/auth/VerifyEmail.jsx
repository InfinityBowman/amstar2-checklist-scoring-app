import { Show, createSignal } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { useAuth } from './AuthProvider.jsx';
import { AnimatedShow } from '../components/AnimatedShow.jsx';
import { AiOutlineLoading3Quarters } from 'solid-icons/ai';
import { useSearchParams } from '@solidjs/router';
import PinInput from './PinInput.jsx';



// TODO
// Use query param mode to determine where to redirect after verification
// Can also give user a link with the code in the URL and go straight to reset password/signin
export default function VerifyEmail() {
  const [code, setCode] = createSignal('');
  const [error, setError] = createSignal('');
  const [loading, setLoading] = createSignal(false);
  const [success, setSuccess] = createSignal(false);
  const [codeSent, setCodeSent] = createSignal(false);

  const navigate = useNavigate();
  const { verifyEmail } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {

      await verifyEmail(code());
      setSuccess(true);

      setTimeout(() => {
        navigate('/signin', { replace: true });
      }, 1000);


    } catch (err) {
      setError('Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  }
  createEffect(async () => {
    if (useSearchParams.code) {
      setLoading(true);
      try {
        await verifyEmail(useSearchParams.code);  // call backend
        setSuccess(true);
        navigate('/signin', { replace: true });
      } catch (err) {
        setError('Invalid or expired link.');
      } finally {
        setLoading(false);
      }
    }
  });


  return (
    <div class="h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-2 sm:px-4 py-6 sm:py-12">
      <form
        aria-labelledby="verifyemail-heading"
        onSubmit={handleSubmit}
        class="w-full max-w-md sm:max-w-2xl bg-white rounded-xl sm:rounded-3xl shadow-2xl p-4 sm:p-16 space-y-6 sm:space-y-8 border border-gray-100"
        autoComplete="off"
      >
        <div class="mb-2 sm:mb-4 text-center">
          <h2 class="text-2xl sm:text-4xl font-bold text-gray-900 mb-1 sm:mb-2" id="verifyemail-heading">
            Verify Your Email
          </h2>
          <p class="text-gray-500 text-base sm:text-lg">Enter the verification code sent to your email.</p>
        </div>
        <div>
          {/* <label class="block text-base sm:text-lg font-semibold text-gray-700 mb-1 sm:mb-2" htmlFor="code-input">
            Verification Code
          </label> */}

        </div>
        <AnimatedShow when={!!error()}>
          <p class="pt-2 sm:pt-3 px-2 text-red-600 text-base sm:text-lg">{error()}</p>
        </AnimatedShow>
        <AnimatedShow when={success()}>
          <p class="pt-2 sm:pt-3 px-2 text-green-600 text-base sm:text-lg">Email verified! Redirecting to sign in...</p>
        </AnimatedShow>

        <Show when={codeSent()} fallback={
          <button
            class="w-full py-3 sm:py-4 px-4 sm:px-6 text-lg sm:text-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg sm:rounded-xl shadow transition disabled:opacity-50 flex items-center justify-center"
            disabled={loading()}
            type='button'
            onClick={() => setCodeSent(true)}
          >
            <AnimatedShow when={loading()}>
              <AiOutlineLoading3Quarters class="animate-spin mr-2" size={22} />
            </AnimatedShow>
            {loading() ? 'Verifying...' : 'Send Code'}
          </button>
        }>
          <PinInput required />
          <button
            type="submit"
            class="w-full py-3 sm:py-4 px-4 sm:px-6 text-lg sm:text-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg sm:rounded-xl shadow transition disabled:opacity-50 flex items-center justify-center"
            disabled={loading()}
          >
            <AnimatedShow when={loading()}>
              <AiOutlineLoading3Quarters class="animate-spin mr-2" size={22} />
            </AnimatedShow>
            {loading() ? 'Verifying...' : 'Verify Email'}
          </button>

        </Show>
        <div class="text-center text-base sm:text-lg text-gray-500 mt-2 sm:mt-4">
          Didn't get a code?{' '}
          <a href="#" class="text-indigo-600 hover:underline font-semibold">
            Resend
          </a>
        </div>
      </form>
    </div>
  );
}
