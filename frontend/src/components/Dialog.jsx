import { Show } from 'solid-js';
import { Portal } from 'solid-js/web';

export default function Dialog(props) {
  return (
    <Show when={props.open}>
      <Portal>
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div class="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 mx-2 animate-fade-in">
            <div class="mb-4">
              <h2 class="text-lg font-semibold text-gray-900">{props.title || 'Are you sure?'}</h2>
              {props.description && <p class="mt-2 text-gray-600">{props.description}</p>}
            </div>
            <div class="flex justify-end gap-2 mt-6">
              <button
                class="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={props.onCancel}
                autofocus
              >
                Cancel
              </button>
              <button
                class="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                onClick={props.onConfirm}
              >
                {props.confirmText || 'Delete'}
              </button>
            </div>
          </div>
        </div>
      </Portal>
    </Show>
  );
}
