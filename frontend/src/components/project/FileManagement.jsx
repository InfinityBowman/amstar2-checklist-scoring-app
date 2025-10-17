import { createSignal } from 'solid-js';
import { getStoredFile, uploadAndStoreFile } from '@offline/fileStorage.js';
import { exportChecklistsToCSV } from '@offline/AMSTAR2Checklist.js';

export default function FileManagement() {
  const handleGetStoredFile = async () => {
    const fileName = prompt('Enter the name of the file to retrieve (including extension):');
    if (!fileName) return;
    try {
      const file = await getStoredFile(fileName);
      if (!file) {
        alert(`File "${fileName}" not found.`);
        return;
      }
      const url = URL.createObjectURL(file);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name || fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error retrieving file:', error);
      alert('Error retrieving file. See console for details.');
    }
  };

  const handleDisplayStoredFile = async () => {
    const fileName = prompt('Enter the name of the PDF file to display (including .pdf):');
    if (!fileName) return;
    try {
      const file = await getStoredFile(fileName);
      if (!file) {
        alert(`File "${fileName}" not found.`);
        return;
      }
      // Only display if it's a PDF
      if (file.type !== 'application/pdf' && !fileName.toLowerCase().endsWith('.pdf')) {
        alert('Selected file is not a PDF.');
        return;
      }
      const url = URL.createObjectURL(file);
      // Open in a new tab using the browser's PDF viewer
      window.open(url, '_blank');
      // Revoke the URL after some time since this is an example implementation
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (error) {
      console.error('Error displaying file:', error);
      alert('Error displaying file. See console for details.');
    }
  };

  const handleChecklistExport = () => {
    let csv = exportChecklistsToCSV(currentProject().checklists);
    console.log(csv);
  };

  const [isExpanded, setIsExpanded] = createSignal(false);

  return (
    <div class="mb-6 p-4 bg-white rounded-lg shadow-sm">
      <h3
        class="text-base font-semibold mb-3 flex items-center cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded())}
      >
        <svg
          class="w-5 h-5 mr-2 text-gray-600"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1H8a3 3 0 00-3 3v1.5a1.5 1.5 0 01-3 0V6z"
            clipRule="evenodd"
           />
          <path d="M6 12a2 2 0 012-2h8a2 2 0 012 2v2a2 2 0 01-2 2H2h2a2 2 0 002-2v-2z" />
        </svg>
        File Management
        <svg
          class={`ml-2 w-4 h-4 transition-transform ${isExpanded() ? 'transform rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </h3>

      {isExpanded() && (
        <div class="grid grid-cols-2 gap-3 mt-3">
          <button
            class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition text-sm flex items-center justify-center"
            onClick={handleChecklistExport}
          >
            <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path
                fillRule="evenodd"
                d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                clipRule="evenodd"
               />
            </svg>
            Export Checklists CSV
          </button>
          <button
            class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition text-sm flex items-center justify-center"
            onClick={uploadAndStoreFile}
          >
            <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path
                fillRule="evenodd"
                d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                clipRule="evenodd"
               />
            </svg>
            Upload File
          </button>
          <button
            class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition text-sm flex items-center justify-center"
            onClick={handleGetStoredFile}
          >
            <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path
                fillRule="evenodd"
                d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                clipRule="evenodd"
               />
            </svg>
            Download File
          </button>
          <button
            class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition text-sm flex items-center justify-center"
            onClick={handleDisplayStoredFile}
          >
            <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path
                fillRule="evenodd"
                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                clipRule="evenodd"
               />
            </svg>
            Display File
          </button>
        </div>
      )}
    </div>
  );
}
