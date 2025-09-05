import { render } from 'solid-js/web';
import App from './App.jsx';
import { StateProvider } from './state.jsx';

render(
  () => (
    <StateProvider>
      <App />
    </StateProvider>
  ),
  document.getElementById('root'),
);
