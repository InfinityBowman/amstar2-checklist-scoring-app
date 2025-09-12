import { render } from 'solid-js/web';
import AppRoutes from './Routes.jsx';
import { StateProvider } from './AppState.jsx';
import { AuthProvider } from './auth/AuthProvider.jsx';

render(
  () => (
    <StateProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </StateProvider>
  ),
  document.getElementById('root'),
);
