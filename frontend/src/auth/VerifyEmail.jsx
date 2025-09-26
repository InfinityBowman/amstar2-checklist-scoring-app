import { Show, createSignal, createEffect } from 'solid-js';
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
  const [codeSent, setCodeSent] = createSignal(false);
  const [error, setError] = createSignal('');
  const [loading, setLoading] = createSignal(false);
  const [success, setSuccess] = createSignal(false);

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { verifyEmail, sendEmailVerification } = useAuth();

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function handleVerifyEmail() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // const result = verifyEmail(code()); // backend verifies code
        // if (result.status === 'success') {
        //   resolve();
        // } else {
        //   reject(new Error(result.message));
        // }
        console.log('Verifying code:', code());
        if (code() === '111111' || code() === 111111) resolve();
        else reject(new Error('Invalid code'));
      }, 200);
    });
  }

  async function handleSendEmail() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        console.log('Sending verification code to email');
        resolve();
        // const result = sendEmailVerification(); // server generates and sends code
        // if (result.status === 'success') {
        //   resolve();
        // } else {
        //   reject(new Error(result.message));
        // }
      }, 400);
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await handleVerifyEmail();
      setSuccess(true);
      navigate('/signin', { replace: true });
      setLoading(false);
    } catch (err) {
      console.error('Verify email error:', err);
      setLoading(false);
      setError('Invalid code. Please try again.');
    }
  }

  async function sendCode() {
    setError('');
    setLoading(true);
    try {
      await handleSendEmail();
      setLoading(false);
      setSearchParams({ codeSent: 'true' });
      setCodeSent(true);
    } catch (err) {
      setLoading(false);
      setError('Error sending code. Please try again later.');
    }
  }

  // Handle cases where user comes with code in URL or code has been sent
  createEffect(async () => {
    if (searchParams.codeSent === 'true') {
      setCodeSent(true);
      if (searchParams.code) {
        try {
          await verifyEmail(searchParams.code);
          setSuccess(true);
          navigate('/signin', { replace: true });
          setLoading(false);
        } catch (err) {
          setLoading(false);
          setError('Invalid or expired link.');
        }
      }
    }
  });

  createEffect(() => {
    code() && setError('');
  });

  return (
    <div class="h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-12">
      <form
        aria-labelledby="verifyemail-heading"
        onSubmit={handleSubmit}
        class="w-full max-w-md sm:max-w-xl bg-white rounded-xl sm:rounded-3xl shadow-2xl p-4 sm:p-12 space-y-2 border border-gray-100 relative"
        autoComplete="off"
      >
        <div class="text-center">
          <h2 class="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2" id="verifyemail-heading">
            Verify Your Email
          </h2>
        </div>

        <Show
          when={codeSent()}
          fallback={
            <>
              <div class="mb-6 sm:mb-8 text-center">
                <p class="text-gray-500 text-xs sm:text-sm">Send a code to verify your email.</p>
              </div>
              <button
                class="w-full py-2 sm:py-3 text-sm sm:text-base bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg sm:rounded-xl shadow transition disabled:opacity-50 flex items-center justify-center"
                disabled={loading()}
                type="button"
                onClick={() => sendCode()}
              >
                <AnimatedShow when={loading()} fallback={'Send Code'}>
                  <div class="flex items-center">
                    <AiOutlineLoading3Quarters class="animate-spin mr-2" size={22} />
                    Sending...
                  </div>
                </AnimatedShow>
              </button>
            </>
          }
        >
          <div class="text-center">
            <p class="text-gray-500 text-sm sm:text-base">Enter the verification code sent to your email.</p>
          </div>

          <PinInput otp required autocomplete onInput={setCode} isError={!!error()} />

          <button
            type="submit"
            class="w-full py-2 sm:py-3 text-sm sm:text-base bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg sm:rounded-xl shadow transition disabled:opacity-50 flex items-center justify-center"
            disabled={loading()}
          >
            <AnimatedShow when={loading()} fallback={'Verify Email'}>
              <div class="flex items-center">
                <AiOutlineLoading3Quarters class="animate-spin mr-2" size={22} />
                Verifying...
              </div>
            </AnimatedShow>
          </button>
          <div class="text-center text-xs sm:text-sm text-gray-500 mt-2 sm:mt-4">
            Didn't get a code?{' '}
            <a href="#" class="text-indigo-600 hover:underline font-semibold">
              Resend
            </a>
          </div>
        </Show>
        <AnimatedShow when={!!error()} class="absolute left-10 right-0 bottom-2 sm:bottom-6">
          <p class=" text-red-600 text-xs sm:text-sm">{error()}</p>
        </AnimatedShow>
        <AnimatedShow when={success()} class="absolute left-10 right-0 bottom-2 sm:bottom-6">
          <p class="pt-2 sm:pt-3 px-2 text-green-600 text-xs sm:text-sm">Email verified! Ready to sign in...</p>
        </AnimatedShow>
      </form>
    </div>
  );
}
