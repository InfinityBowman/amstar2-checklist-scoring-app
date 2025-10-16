import { A } from '@solidjs/router';

export default function Home() {
  return (
    <main class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div class="flex flex-col items-center justify-center min-h-screen px-4">
        <div class="max-w-4xl w-full text-center">
          {/* Logo/Icon */}
          <div class="mb-8">
            <div class="mx-auto w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>

          {/* Main Heading */}
          <h1 class="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            CoRATES
          </h1>

          {/* Subtitle */}
          <p class="text-xl md:text-2xl text-gray-600 mb-4 font-medium">
            Collaborative Research Appraisal Tool for Evidence Synthesis
          </p>

          {/* Description */}
          <p class="text-lg text-gray-500 mb-12 max-w-2xl mx-auto leading-relaxed">
            Streamline your systematic review process with our interactive AMSTAR 2 checklist tool. Create, score, and
            visualize research appraisals with confidence.
          </p>

          {/* CTA Buttons */}
          <div class="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <A
              href="/checklist/new"
              class="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Start New Checklist
            </A>
            <A
              href="/dashboard"
              class="inline-flex items-center px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:text-blue-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              View Saved Work
            </A>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div class="py-20 px-4 bg-white/50 backdrop-blur-sm">
        <div class="max-w-6xl mx-auto">
          <h2 class="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-800">Why Choose CoRATES?</h2>

          <div class="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div class="text-center p-8 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
              <div class="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707"
                  />
                </svg>
              </div>
              <h3 class="text-xl font-semibold mb-4 text-gray-800">Works Offline</h3>
              <p class="text-gray-600 leading-relaxed">
                Complete your assessments anywhere, anytime. No internet connection required once loaded.
              </p>
            </div>

            {/* Feature 2 */}
            <div class="text-center p-8 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
              <div class="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 class="text-xl font-semibold mb-4 text-gray-800">Auto-Save</h3>
              <p class="text-gray-600 leading-relaxed">
                Never lose your progress. Your work is automatically saved as you go.
              </p>
            </div>

            {/* Feature 3 */}
            <div class="text-center p-8 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
              <div class="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 class="text-xl font-semibold mb-4 text-gray-800">Visual Results</h3>
              <p class="text-gray-600 leading-relaxed">
                Generate clear, professional charts and summaries of your AMSTAR 2 assessments.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* About AMSTAR 2 Section */}
      <div class="py-20 px-4">
        <div class="max-w-4xl mx-auto text-center">
          <h2 class="text-3xl md:text-4xl font-bold mb-8 text-gray-800">About AMSTAR 2</h2>
          <p class="text-lg text-gray-600 leading-relaxed mb-8">
            AMSTAR 2 (A MeaSurement Tool to Assess systematic Reviews) is a critical appraisal tool for systematic
            reviews that include randomized or non-randomized studies of healthcare interventions.
          </p>
          <div class="bg-blue-50 rounded-2xl p-8 border border-blue-100">
            <p class="text-blue-800 font-medium">
              Our tool makes it easy to apply the 16 AMSTAR 2 criteria to evaluate the methodological quality of
              systematic reviews, helping researchers make informed decisions about evidence quality.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer class="py-12 px-4 bg-gray-50 border-t border-gray-200">
        <div class="max-w-4xl mx-auto text-center">
          <div class="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-500">
            <a
              href="https://github.com/InfinityBowman/amstar2-checklist-scoring-app"
              target="_blank"
              rel="noopener"
              class="flex items-center gap-2 hover:text-blue-600 transition-colors duration-200"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              View on GitHub
            </a>
            <span class="text-gray-300">•</span>
            <span>Built for researchers, by researchers</span>
            <span class="text-gray-300">•</span>
            <span>Free & Open Source</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
