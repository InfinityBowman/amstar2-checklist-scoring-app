import { createSignal, onCleanup, onMount } from 'solid-js';

export default function useOnlineStatus() {
  const [online, setOnline] = createSignal(navigator.onLine);

  const goOnline = () => setOnline(true);
  const goOffline = () => setOnline(false);

  onMount(() => {
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
  });

  onCleanup(() => {
    window.removeEventListener('online', goOnline);
    window.removeEventListener('offline', goOffline);
  });

  return online;
}
