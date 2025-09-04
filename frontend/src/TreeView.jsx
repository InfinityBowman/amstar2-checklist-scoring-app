import { createSignal, Show, For } from 'solid-js';

export default function TreeView(props) {
  const [expanded, setExpanded] = createSignal(false);

  const project = props.data[0]; // Only one node per TreeView

  if (!project) return null;

  return (
    <div class="mb-2">
      <div
        class={`
          flex items-center justify-between cursor-pointer select-none rounded-lg transition-colors
          px-2 py-2 font-semibold text-gray-800 hover:bg-gray-100
        `}
        onClick={() => props.onSelect?.(project)}
        tabIndex={0}
        role="button"
      >
        <span class="truncate">{project.label}</span>
        <button
          class="ml-2 flex items-center justify-center w-8 h-8 rounded hover:bg-gray-200 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded((e) => !e);
          }}
          tabIndex={0}
          aria-label={expanded() ? 'Collapse project' : 'Expand project'}
          type="button"
        >
          <svg
            class={`transition-transform duration-200 w-5 h-5 text-gray-500 ${expanded() ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            stroke-width="2.2"
            viewBox="0 0 20 20"
          >
            <polyline points="6 8 10 12 14 8" fill="none" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      </div>
      <Show when={expanded()}>
        <div class="ml-1 border-l border-gray-100 pl-2 mt-1 space-y-1">
          <For each={project.children}>
            {(child) =>
              props.children ?
                props.children(child)
              : <div
                  class="flex items-center px-2 py-2 rounded-lg cursor-pointer text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => props.onSelect?.(child)}
                >
                  {child.label}
                </div>
            }
          </For>
        </div>
      </Show>
    </div>
  );
}
