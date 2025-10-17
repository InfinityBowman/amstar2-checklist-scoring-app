import { createSignal } from 'solid-js';

export default function AddReviewForm(props) {
  const [reviewName, setReviewName] = createSignal('');

  const handleAddReview = async () => {
    if (!reviewName().trim()) return;
    await props.onAddReview(reviewName());
    setReviewName('');
  };

  return (
    <div class="mb-6 p-4 bg-white rounded-lg shadow-sm">
      <h3 class="text-base font-semibold mb-3 flex items-center">
        <svg
          class="w-5 h-5 mr-2 text-green-500"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
        </svg>
        Add New Review
      </h3>
      <div class="flex gap-2 items-center">
        <input
          type="text"
          class="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 w-64 text-sm"
          placeholder="Review (study/article) name"
          value={reviewName()}
          onInput={(e) => setReviewName(e.target.value)}
        />
        <button
          class="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition text-sm flex items-center"
          onClick={handleAddReview}
          disabled={!reviewName().trim()}
        >
          <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path
              fillRule="evenodd"
              d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
              clipRule="evenodd"
             />
          </svg>
          Add Review
        </button>
      </div>
    </div>
  );
}
