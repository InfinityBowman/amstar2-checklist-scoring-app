import { createSignal } from 'solid-js';

// Currently does not work or do anything: unused component

export default function VerifyEmail({ onVerify }) {
  const [code, setCode] = createSignal('');
  const [error, setError] = createSignal('');
  const [success, setSuccess] = createSignal('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!code()) {
      setError('Please enter the verification code');
      return;
    }
    try {
      // Replace with your actual verification logic
      await fakeVerify(code());
      setSuccess('Email verified! You can now sign in.');
      if (onVerify) onVerify(code());
    } catch (err) {
      setError('Invalid verification code');
    }
  }

  // Dummy verification function for demonstration
  function fakeVerify(code) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        code === '123456' ? resolve() : reject();
      }, 500);
    });
  }

  return (
    <form onSubmit={handleSubmit} class="max-w-sm mx-auto mt-8 p-4 border rounded shadow">
      <h2 class="text-xl mb-4">Verify Email</h2>
      <div class="mb-2">
        <label class="block mb-1">Verification Code</label>
        <input type="text" value={code()} onInput={(e) => setCode(e.target.value)} class="w-full p-2 border rounded" required />
      </div>
      {error() && <div class="text-red-600 mb-2">{error()}</div>}
      {success() && <div class="text-green-600 mb-2">{success()}</div>}
      <button type="submit" class="w-full bg-purple-600 text-white py-2 rounded">
        Verify
      </button>
    </form>
  );
}
