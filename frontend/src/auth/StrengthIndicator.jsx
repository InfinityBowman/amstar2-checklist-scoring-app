import { createMemo } from 'solid-js';

const requirementsList = [
  { label: 'At least 8 characters', test: (pw) => pw.length >= 8 },
  { label: 'One uppercase letter', test: (pw) => /[A-Z]/.test(pw) },
  { label: 'One lowercase letter', test: (pw) => /[a-z]/.test(pw) },
  { label: 'One number', test: (pw) => /\d/.test(pw) },
  { label: 'One special character', test: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

function getStrength(password) {
  if (!password) return { score: 0, met: [], unmet: requirementsList.map((r) => r.label) };
  const met = requirementsList.filter((r) => r.test(password)).map((r) => r.label);
  const unmet = requirementsList.filter((r) => !r.test(password)).map((r) => r.label);
  // Score: 0 = weak, 1 = medium, 2 = strong
  let score =
    met.length >= 4 ?
      met.length === 5 ?
        2
      : 1
    : 0;
  return { score, met, unmet };
}

const barColors = ['bg-red-500', 'bg-yellow-400', 'bg-green-600'];

export default function StrengthIndicator(props) {
  const strength = createMemo(() => getStrength(props.password || ''));

  return (
    <div class="w-full mt-4">
      {/* Strength Bars */}
      <div class="flex gap-2 mb-3" aria-hidden="true">
        {[0, 1, 2].map((idx) => (
          <div class={`h-3 rounded transition-colors flex-1 ${idx <= strength().score ? barColors[strength().score] : 'bg-gray-200'}`} />
        ))}
      </div>
      {/* Requirements */}
      <div class="text-sm text-gray-700" id="password-requirements" aria-live="polite">
        <ul class="space-y-1">
          {requirementsList.map((req) => {
            const met = strength().met.includes(req.label);
            return (
              <li class="flex items-center gap-2">
                <span
                  class={`w-4 h-4 rounded-full flex items-center justify-center ${
                    met ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-500'
                  }`}
                  aria-hidden="true"
                >
                  {met ?
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 16 16">
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
