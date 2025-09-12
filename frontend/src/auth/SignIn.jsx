import { createSignal } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { useAuth } from './AuthProvider.jsx';

export default function SignIn({ onSignIn }) {
  const [email, setEmail] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [error, setError] = createSignal('');
  const navigate = useNavigate();
  const { signin } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (email() && password()) {
      try {
        await signin(email(), password());
        if (onSignIn) onSignIn(email());
        navigate('/dashboard', { replace: true });
      } catch (err) {
        setError('Invalid credentials');
      }
    } else {
      setError('Please enter email and password');
    }
  }

  return (
    <form onSubmit={handleSubmit} class="max-w-sm mx-auto mt-8 p-4 border rounded shadow">
      <h2 class="text-xl mb-4">Sign In</h2>
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
          autoComplete="current-password"
          value={password()}
          onInput={(e) => setPassword(e.target.value)}
          class="w-full p-2 border rounded"
          required
        />
      </div>
      {error() && <div class="text-red-600 mb-2">{error()}</div>}
      <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded">
        Sign In
      </button>
    </form>
  );
}
