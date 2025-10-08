import { createShape } from '@electric-sql/solid';

export default function Electric() {
  const { data } = createShape({
    url: `http://localhost:3000/v1/shape`,
    params: {
      table: `users`,
    },
  });

  return <pre>{JSON.stringify(data(), null, 2)}</pre>;
}
