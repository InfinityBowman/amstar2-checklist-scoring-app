import { createSignal } from 'solid-js';

export default function SignUp({ onSignUp }) {
  const [email, setEmail] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [confirmPassword, setConfirmPassword] = createSignal('');
  const [error, setError] = createSignal('');
  const [success, setSuccess] = createSignal('');

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
      // Replace with your actual sign-up logic
      await fakeSignUp(email(), password());
      setSuccess('Account created! You can now sign in.');
      if (onSignUp) onSignUp(email());
    } catch (err) {
      setError('Sign up failed');
    }
  }

  // Dummy sign-up function for demonstration
  function fakeSignUp(email, password) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        email && password ? resolve() : reject();
      }, 500);
    });
  }

  return (
    <form onSubmit={handleSubmit} class="max-w-sm mx-auto mt-8 p-4 border rounded shadow">
      <h2 class="text-xl mb-4">Sign Up</h2>
      <div class="mb-2">
        <label class="block mb-1">Email</label>
        <input
          type="email"
          autoComplete="email"
          value={email()}
          onInput={(e) => setEmail(e.target.value)}
          class="w-full p-2 border rounded"
          required
        />
      </div>
      <div class="mb-2">
        <label class="block mb-1">Password</label>
        <input
          type="password"
          autoComplete="new-password"
          value={password()}
          onInput={(e) => setPassword(e.target.value)}
          class="w-full p-2 border rounded"
          required
        />
      </div>
      <div class="mb-2">
        <label class="block mb-1">Confirm Password</label>
        <input
          type="password"
          autoComplete="new-password"
          value={confirmPassword()}
          onInput={(e) => setConfirmPassword(e.target.value)}
          class="w-full p-2 border rounded"
          required
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
