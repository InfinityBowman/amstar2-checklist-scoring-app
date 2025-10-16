import { createSignal } from 'solid-js';

const [online, setOnline] = createSignal(navigator.onLine);

window.addEventListener('online', () => {
  console.info('Went online');
  setOnline(true);
});
window.addEventListener('offline', () => {
  console.info('Went offline');
  setOnline(false);
});

export default function useOnlineStatus() {
  return online;
}
