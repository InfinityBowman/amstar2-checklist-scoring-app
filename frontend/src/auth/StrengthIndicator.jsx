import { createMemo } from 'solid-js';
import { createEffect } from 'solid-js';

const requirementsList = [
  { label: '8 characters or more', test: (pw) => pw.length >= 8, error: 'at least 8 characters' },
  { label: 'Uppercase letter', test: (pw) => /[A-Z]/.test(pw), error: 'an uppercase letter' },
  { label: 'Lowercase letter', test: (pw) => /[a-z]/.test(pw), error: 'a lowercase letter' },
  { label: 'Number', test: (pw) => /\d/.test(pw), error: 'a number' },
  { label: 'Special character (e.g. !?<>@#$%)', test: (pw) => /[^A-Za-z0-9]/.test(pw), error: 'a symbol' },
];

function getStrength(password) {
  if (!password) return { met: [], unmet: requirementsList.map((r) => r.label) };
  const met = requirementsList.filter((r) => r.test(password)).map((r) => r.label);
  const unmet = requirementsList.filter((r) => !r.test(password)).map((r) => r.label);
  const errors = requirementsList.filter((r) => !r.test(password)).map((r) => r.error);
  return { met, unmet, errors };
}

export default function StrengthIndicator(props) {
  const strength = createMemo(() => getStrength(props.password || ''));

  createEffect(() => {
    props.onUnmet?.(strength().errors);
  });

  return (
    <div class="w-full mt-3 sm:mt-4">
      {/* Requirements */}
      <div class="text-sm sm:text-base text-gray-700" id="password-requirements" aria-live="polite">
        <ul class="pace-y-0.5 sm:space-y-1">
          {requirementsList.map((req) => {
            const met = strength().met.includes(req.label);
            return (
              <li class="flex items-center gap-2">
                <span
                  class={`w-3 h-3 sm:w-4 sm:h-4 ml-1 rounded-full flex items-center justify-center ${
                    met ? 'bg-green-500 text-white' : 'border-gray-500 border'
                  }`}
                  aria-hidden="true"
                >
                  {met ?
                    <svg class="w-2 h-2 sm:w-3 sm:h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 16 16">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M4 8l3 3 5-5" />
                    </svg>
                  : null}
                </span>
                <span class={met ? 'text-gray-900' : 'text-gray-500'}>{req.label}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
