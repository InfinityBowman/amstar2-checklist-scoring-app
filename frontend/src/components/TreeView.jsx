import { createSignal, Show, For } from 'solid-js';
import { useAppState } from '../AppState.jsx';

export default function TreeView(props) {
  // Store expanded state with project ID as key for persistence
  const [expandedMap, setExpandedMap] = createSignal({});
  const { projects } = useAppState();
  const project = () => projects().find((p) => p.id === props.projectId);

  // Helper to get/set expanded state for current project
  const isExpanded = () => project() && expandedMap()[project().id];
  const toggleExpanded = (e) => {
    e.stopPropagation();
    setExpandedMap((prev) => ({
      ...prev,
      [project().id]: !prev[project().id],
    }));
  };

  return (
    <>
      <div
        class={`
          flex items-center justify-between cursor-pointer select-none rounded-md transition-colors
          px-2 py-1 font-semibold text-sm text-gray-800 hover:bg-gray-100
        `}
        onClick={() => props.onSelect?.({ project: project() })}
        tabIndex={0}
        role="button"
      >
        <span class="truncate">{project().name || project().id}</span>
        <button
          class="flex items-center justify-center w-8 h-8 rounded hover:bg-gray-200 transition-colors"
          onClick={toggleExpanded}
          tabIndex={0}
          aria-label={isExpanded() ? 'Collapse project' : 'Expand project'}
          type="button"
        >
          <svg
            class={`transition-transform duration-200 w-5 h-5 text-gray-500 ${isExpanded() ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            stroke-width="2.2"
            viewBox="0 0 20 20"
          >
            <polyline points="6 8 10 12 14 8" fill="none" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      </div>
      <Show when={isExpanded() && project().checklists?.length > 0}>
        <div class="ml-1 border-l border-gray-100 pl-2 mt-1 space-y-1">
          <For each={project().checklists}>{(checklist) => props.children(checklist)}</For>
        </div>
      </Show>
    </>
  );
}
