import { createSignal } from 'solid-js';

// Currently does not work or do anything: unused component

export default function ResetPassword({ onReset }) {
  const [email, setEmail] = createSignal('');
  const [newPassword, setNewPassword] = createSignal('');
  const [confirmPassword, setConfirmPassword] = createSignal('');
  const [error, setError] = createSignal('');
  const [success, setSuccess] = createSignal('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!email() || !newPassword() || !confirmPassword()) {
      setError('Please fill out all fields');
      return;
    }
    if (newPassword() !== confirmPassword()) {
      setError('Passwords do not match');
      return;
    }
    try {
      // Replace with your actual reset logic
      await fakeReset(email(), newPassword());
      setSuccess('Password reset successful! You can now sign in.');
      if (onReset) onReset(email());
    } catch (err) {
      setError('Password reset failed');
    }
  }

  // Dummy reset function for demonstration
  function fakeReset(email, password) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        email && password ? resolve() : reject();
      }, 500);
    });
  }

  return (
    <form onSubmit={handleSubmit} class="max-w-sm mx-auto mt-8 p-4 border rounded shadow">
      <h2 class="text-xl mb-4">Reset Password</h2>
      <div class="mb-2">
        <label class="block mb-1">Email</label>
        <input type="email" value={email()} onInput={(e) => setEmail(e.target.value)} class="w-full p-2 border rounded" required />
      </div>
      <div class="mb-2">
        <label class="block mb-1">New Password</label>
        <input
          type="password"
          value={newPassword()}
          onInput={(e) => setNewPassword(e.target.value)}
          class="w-full p-2 border rounded"
          required
        />
      </div>
      <div class="mb-2">
        <label class="block mb-1">Confirm New Password</label>
        <input
          type="password"
          value={confirmPassword()}
          onInput={(e) => setConfirmPassword(e.target.value)}
          class="w-full p-2 border rounded"
          required
        />
      </div>
      {error() && <div class="text-red-600 mb-2">{error()}</div>}
      {success() && <div class="text-green-600 mb-2">{success()}</div>}
      <button type="submit" class="w-full bg-yellow-600 text-white py-2 rounded">
        Reset Password
      </button>
    </form>
  );
}
