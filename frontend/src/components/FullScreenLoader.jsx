export default function FullScreenLoader() {
  return (
    <div class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300">
      <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-6"></div>
      <h2 class="text-2xl font-bold text-blue-700 mb-2 drop-shadow">Loading...</h2>
      <p class="text-blue-600">Please wait while we load your data.</p>
    </div>
  );
}