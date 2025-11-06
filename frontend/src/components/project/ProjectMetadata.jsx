import { For } from 'solid-js';
import { solidStore } from '@offline/solidStore';
import { FiUsers } from 'solid-icons/fi';
import { AiFillCalendar } from 'solid-icons/ai';

export default function ProjectMetadata(props) {
  const { getUserName } = solidStore;

  function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const isToday =
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate();
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  }

  return (
    <div class="mb-6 p-2 ">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Last Updated */}
        <div class="flex items-center text-sm text-gray-600">
          <AiFillCalendar class="w-4 h-4 mr-2 text-gray-400" />
          Created: <span class="font-medium ml-1">{formatDate(props.updatedAt)}</span>
        </div>

        {/* Members */}
        <div class="flex items-center">
          <FiUsers class="w-4 h-4 mr-2 text-gray-400" />
          <span class="text-sm text-gray-600 mr-2">Members:</span>
          <div class="flex flex-wrap gap-1">
            <For each={props.members}>
              {(member) => (
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {getUserName(member.user_id)}
                </span>
              )}
            </For>
            {(!props.members || props.members.length === 0) && (
              <span class="text-xs text-gray-400 italic">No members</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
