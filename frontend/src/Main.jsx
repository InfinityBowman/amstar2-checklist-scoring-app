import { render } from 'solid-js/web';
import AppRoutes from './routes/Routes.jsx';
import { StateProvider } from './AppState.jsx';
import { AuthProvider } from './auth/AuthProvider.jsx';

function Root() {
  return (
    <StateProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </StateProvider>
  );
}

render(() => <Root />, document.getElementById('root'));
