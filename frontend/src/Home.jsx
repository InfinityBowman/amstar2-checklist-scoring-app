import { A } from '@solidjs/router';

export default function Home() {
  return (
    <main class="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div class="max-w-xl w-full text-center py-12">
        {/* <img src="/logo.svg" alt="CoRATES Logo" class="mx-auto mb-6 w-24 h-24" /> */}
        <h1 class="text-4xl font-bold mb-4 text-blue-700">CoRATES</h1>
        <p class="text-lg text-gray-700 mb-6">Collaborative Research Appraisal Tool for Evidence Synthesis</p>
        <p class="mb-8 text-gray-600">
          Interactively fill out and score AMSTAR 2 checklists for systematic reviews.
          <br />
          Works fully offline, saves your work automatically, and helps you visualize results across projects.
        </p>
        <div class="flex flex-col gap-4">
          <A href="/dashboard" class="bg-blue-600 text-white py-3 px-6 rounded shadow hover:bg-blue-700 transition">
            Go to Dashboard
          </A>
          <A href="/signin" class="bg-white border border-blue-600 text-blue-700 py-3 px-6 rounded shadow hover:bg-blue-50 transition">
            Sign In
          </A>
          <A href="/signup" class="bg-white border border-green-600 text-green-700 py-3 px-6 rounded shadow hover:bg-green-50 transition">
            Create Account
          </A>
        </div>
        <div class="mt-10 text-xs text-gray-400">
          <a href="https://github.com/InfinityBowman/amstar2-checklist-scoring-app" target="_blank" rel="noopener">
            View on GitHub
          </a>
        </div>
      </div>
    </main>
  );
}
