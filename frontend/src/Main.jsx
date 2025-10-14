import { render } from 'solid-js/web';
import AppRoutes from './routes/Routes.jsx';

function Root() {
  return <AppRoutes />;
}

render(() => <Root />, document.getElementById('root'));
