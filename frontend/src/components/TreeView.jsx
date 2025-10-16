import { createSignal, Show, For } from 'solid-js';
import { useAppStore } from '../AppStore.js';

export default function TreeView(props) {
  // Store expanded state with project ID as key for persistence
  const [expandedMap, setExpandedMap] = createSignal({});
  const { projects, currentProject } = useAppStore();
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
    px-2 py-1 font-medium text-xs text-gray-800 hover:bg-gray-100 ${currentProject()?.id === project()?.id ? 'bg-gray-200' : 'bg-white'}
  `}
        onClick={() => props.onSelect?.({ project: project() })}
        tabIndex={0}
        role="button"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            props.onSelect?.({ project: project() });
            e.preventDefault();
          }
        }}
      >
        <span class="truncate">{project().name || project().id}</span>
        <button
          class="flex items-center justify-center w-6 h-6 rounded hover:bg-gray-200 transition-colors"
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
      <Show when={(project().reviews || []).some((r) => (r.checklists || []).length > 0)}>
        <div
          class={`overflow-y-scroll`}
          style={{
            'max-height': isExpanded() ? '600px' : '0',
            opacity: isExpanded() ? 1 : 0,
            transition: 'max-height 0.25s ease-in-out, opacity 0.25s ease-in-out',
          }}
        >
          <For each={project().reviews || []}>
            {(review) => <For each={review.checklists || []}>{(checklist) => props.children(checklist, review)}</For>}
          </For>
        </div>
      </Show>
    </>
  );
}
