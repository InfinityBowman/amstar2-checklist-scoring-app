import { createShape } from '@electric-sql/solid';
import { API_ENDPOINTS } from '@api/config.js';
import { useAuth } from '@auth/AuthProvider.jsx';

export default function Electric() {
  // const { authFetch } = useAuth();

  // const { data } = createShape({
  //   url: API_ENDPOINTS.ELECTRIC_SHAPE,
  //   params: {
  //     table: `users`,
  //   },
  //   fetchClient: authFetch,
  // });

  // return <pre>{JSON.stringify(data(), null, 2)}</pre>;
  return null;
}
