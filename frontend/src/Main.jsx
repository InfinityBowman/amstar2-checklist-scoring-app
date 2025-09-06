import { render } from 'solid-js/web';
import AppRoutes from './Routes.jsx';
import { StateProvider } from './state.jsx';
import { Router } from '@solidjs/router';

render(
  () => (
    <StateProvider>
      <AppRoutes />
    </StateProvider>
  ),
  document.getElementById('root'),
);
