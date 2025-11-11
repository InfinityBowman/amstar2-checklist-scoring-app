import { createSignal } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { useAuth } from './AuthStore.js';
import PasswordInput from './PasswordInput.jsx';

export default function ResetPassword() {
  const [email, setEmail] = createSignal('');
  const [code, setCode] = createSignal('');
  const [newPassword, setNewPassword] = createSignal('');
  const [confirmPassword, setConfirmPassword] = createSignal('');
  const [step, setStep] = createSignal(1); // 1: request, 2: verify code, 3: reset password
  const [error, setError] = createSignal('');
  const [loading, setLoading] = createSignal(false);
  const navigate = useNavigate();
  const { requestPasswordReset, verifyResetCode, resetPassword } = useAuth();

  // Dev-only: generate a random 6-digit code for testing
  const [generatedCode, setGeneratedCode] = createSignal('');

  async function handleRequest() {
    setError('');
    if (!email()) return setError('Enter your email');
    setLoading(true);
    try {
      await requestPasswordReset(email()); // optional real backend call
      // Generate random 6-digit code
      const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedCode(randomCode);
      console.log('DEV: Generated code:', randomCode);
      setStep(2);
    } catch (err) {
      // For dev: treat as success anyway
      const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedCode(randomCode);
      console.log('DEV: Generated code (fallback):', randomCode);
      setStep(2);
    }
    setLoading(false);
  }

  async function handleVerify() {
    setError('');
    if (!code()) return setError('Enter verification code');
    setLoading(true);
    try {
      // Dev logic: accept the code if it matches the generated code
      if (code() === generatedCode()) {
        setStep(3); // move to reset password
      } else {
        throw new Error('Invalid code');
      }
    } catch (err) {
      setError('Invalid code');
    }
    setLoading(false);
  }

  async function handleReset() {
    setError('');
    if (!newPassword() || newPassword() !== confirmPassword()) {
      return setError('Passwords do not match');
    }
    setLoading(true);

    try {
      // DEV: skip real backend, just simulate a successful reset
      await new Promise((resolve) => setTimeout(resolve, 200)); // optional delay for UX
      navigate('/signin'); // go to sign-in after "successful" reset
    } catch (err) {
      setError('Failed to reset password');
    }

    setLoading(false);
  }

  return (
    <div class="h-full flex items-center justify-center p-4">
      <div class="w-full max-w-md bg-white rounded-xl p-6 sm:p-12 shadow-2xl space-y-4">
        {step() === 1 && (
          <>
            <h2 class="text-xl font-bold text-gray-900 mb-2">Reset Password</h2>
            <input
              type="email"
              placeholder="Enter your email"
              value={email()}
              onInput={(e) => setEmail(e.target.value)}
              class="w-full p-2 border border-gray-300 rounded-lg"
            />
            <button onClick={handleRequest} class="w-full bg-indigo-600 text-white py-2 rounded-lg mt-2" disabled={loading()}>
              {loading() ? 'Sending...' : 'Send Verification Code'}
            </button>
          </>
        )}
        {step() === 2 && (
          <>
            <h2 class="text-xl font-bold text-gray-900 mb-2">Enter Verification Code</h2>
            <p class="text-gray-500 text-xs mb-2">(DEV: Use code {generatedCode()} for testing)</p>
            <input
              type="text"
              placeholder="Verification code"
              value={code()}
              onInput={(e) => setCode(e.target.value)}
              class="w-full p-2 border border-gray-300 rounded-lg"
            />
            <button onClick={handleVerify} class="w-full bg-indigo-600 text-white py-2 rounded-lg mt-2" disabled={loading()}>
              {loading() ? 'Verifying...' : 'Verify Code'}
            </button>
            {error() && <p class="text-red-600 text-xs mt-2">{error()}</p>}
          </>
        )}
        {step() === 3 && (
          <>
            <h2 class="text-xl font-bold text-gray-900 mb-2">Set New Password</h2>
            <PasswordInput password={newPassword()} onPasswordChange={setNewPassword} placeholder="New password" />
            <PasswordInput password={confirmPassword()} onPasswordChange={setConfirmPassword} placeholder="Confirm password" />
            <button onClick={handleReset} class="w-full bg-indigo-600 text-white py-2 rounded-lg mt-2" disabled={loading()}>
              {loading() ? 'Resetting...' : 'Reset Password'}
            </button>
            {error() && <p class="text-red-600 text-xs mt-2">{error()}</p>}
          </>
        )}
      </div>
    </div>
  );
}
