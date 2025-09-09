import { render } from 'solid-js/web';
import AppRoutes from './Routes.jsx';
import { StateProvider } from './AppState.jsx';

render(
  () => (
    <StateProvider>
      <AppRoutes />
    </StateProvider>
  ),
  document.getElementById('root'),
);
