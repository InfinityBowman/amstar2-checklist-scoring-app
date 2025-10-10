import { createSignal } from 'solid-js';

const [online, setOnline] = createSignal(navigator.onLine);

window.addEventListener('online', () => {
  console.log('Went online');
  setOnline(true);
});
window.addEventListener('offline', () => {
  console.log('Went offline');
  setOnline(false);
});

export default function useOnlineStatus() {
  return online;
}
