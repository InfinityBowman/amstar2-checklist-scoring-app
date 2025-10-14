import { createShape } from '@electric-sql/solid';
import { API_ENDPOINTS } from '@api/config.js';
import { useAuth } from '@/auth/AuthStore.js';

export default function Electric() {
  const { authFetch, user } = useAuth();

  if (!user()) {
    return <div>Database access requires an authenticated user.</div>;
  }

  const { data } = createShape({
    url: API_ENDPOINTS.ELECTRIC_SHAPE,
    params: {
      table: `users`,
    },
    fetchClient: authFetch,
  });

  return <pre>{JSON.stringify(data(), null, 2)}</pre>;
}
