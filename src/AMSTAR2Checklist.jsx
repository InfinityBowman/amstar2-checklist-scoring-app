import { createSignal, createEffect } from 'solid-js';
import { AMSTAR_CHECKLIST } from './ChecklistMap.js';

function Question1({ onUpdate, checklistState }) {
  const state = () => checklistState().state.q1;
  const question = AMSTAR_CHECKLIST.q1;

  // Helper to auto-toggle Yes/No in last column based on first column
  function autoToggleYesNo(colIdx, optIdx, value) {
    // Update the clicked checkbox
    onUpdate(colIdx, optIdx, value);

    // After updating, check if all options in the first column are checked
    const allChecked = state()[0].every((v, i) => (colIdx === 0 && i === optIdx ? value : v));

    // Set Yes/No in last column accordingly
    if (allChecked) {
      if (!state()[2][0]) onUpdate(2, 0, true); // Yes
      if (state()[2][1]) onUpdate(2, 1, false); // No
    } else {
      if (state()[2][0]) onUpdate(2, 0, false); // Yes
      if (!state()[2][1]) onUpdate(2, 1, true); // No
    }
  }

  // Ensure Yes/No are mutually exclusive when toggled directly
  function handleYesNo(colIdx, optIdx, value) {
    // If checking Yes, uncheck No; if checking No, uncheck Yes
    if (optIdx === 0 && value) {
      onUpdate(colIdx, 0, true); // Yes
      if (state()[colIdx][1]) onUpdate(colIdx, 1, false); // Uncheck No
    } else if (optIdx === 1 && value) {
      onUpdate(colIdx, 1, true); // No
      if (state()[colIdx][0]) onUpdate(colIdx, 0, false); // Uncheck Yes
    } else {
      // Just toggle as normal
      onUpdate(colIdx, optIdx, value);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{question.text} </h3>
      <div className="flex gap-6">
        {question.columns.map((col, colIdx) => (
          <div key={colIdx} className={colIdx === question.columns.length - 1 ? 'w-42 flex flex-col' : 'flex-1 flex flex-col'}>
            {/* Label */}
            <div className="font-medium text-gray-800 mb-2 h-6">{col.label}</div>
            {/* Options */}
            <div className="flex flex-col gap-2">
              {col.options.map((option, optIdx) => (
                <label key={optIdx} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={state()[colIdx][optIdx]}
                    onChange={() =>
                      colIdx === 0 ? autoToggleYesNo(colIdx, optIdx, !state()[colIdx][optIdx])
                      : colIdx === 2 ? handleYesNo(colIdx, optIdx, !state()[colIdx][optIdx])
                      : onUpdate(colIdx, optIdx, !state()[colIdx][optIdx])
                    }
                    className="w-4 h-4 flex-shrink-0 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Question2({ onUpdate, checklistState }) {
  const state = () => checklistState().state.q2;

  const question = AMSTAR_CHECKLIST.q2;

  // Helper to auto-toggle Yes/Partial Yes/No in last column based on first two columns
  function autoToggleMain(colIdx, optIdx, value) {
    const allPartialYes = state()[0].every((v, i) => (colIdx === 0 && i === optIdx ? value : v));
    const allYes = allPartialYes && state()[1].every((v, i) => (colIdx === 1 && i === optIdx ? value : v));
    onUpdate(colIdx, optIdx, value);

    if (allYes) {
      onUpdate(2, 0, true); // Yes
      onUpdate(2, 1, false); // Partial Yes
      onUpdate(2, 2, false); // No
    } else if (allPartialYes) {
      onUpdate(2, 0, false); // Yes
      onUpdate(2, 1, true); // Partial Yes
      onUpdate(2, 2, false); // No
    } else {
      onUpdate(2, 0, false); // Yes
      onUpdate(2, 1, false); // Partial Yes
      onUpdate(2, 2, true); // No
    }
  }

  // Ensure Yes/Partial Yes/No are mutually exclusive when toggled directly
  function handleMain(colIdx, optIdx, value) {
    if (value) {
      // Set the selected option to true, others to false
      onUpdate(colIdx, 0, optIdx === 0);
      onUpdate(colIdx, 1, optIdx === 1);
      onUpdate(colIdx, 2, optIdx === 2);
    } else {
      // Just toggle as normal
      onUpdate(colIdx, optIdx, value);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{question.text}</h3>
      <div className="flex gap-6">
        {question.columns.map((col, colIdx) => (
          <div key={colIdx} className={colIdx === question.columns.length - 1 ? 'w-32 flex flex-col' : 'flex-1 flex flex-col'}>
            {/* Label */}
            <div className="font-medium text-gray-800 h-6">{col.label}</div>
            {/* Description */}
            <div className="font-light text-gray-800 mb-4 h-12">{col.description}</div>
            {/* Options */}
            <div className="flex flex-col gap-2">
              {col.options.map((option, optIdx) => (
                <label key={optIdx} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={state()[colIdx][optIdx]}
                    onChange={() =>
                      colIdx === 0 || colIdx === 1 ?
                        autoToggleMain(colIdx, optIdx, !state()[colIdx][optIdx])
                      : handleMain(colIdx, optIdx, !state()[colIdx][optIdx])
                    }
                    className="w-4 h-4 flex-shrink-0 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Question3({ onUpdate, checklistState }) {
  const state = () => checklistState().state.q3;

  const question = AMSTAR_CHECKLIST.q3;

  function autoToggleYesNo(colIdx, optIdx, value) {
    // Simulate the next state for the first column
    const col0 = colIdx === 0 ? state()[0].map((v, i) => (i === optIdx ? value : v)) : state()[0];
    const anyChecked = col0.some(Boolean);

    // Update the clicked checkbox
    onUpdate(colIdx, optIdx, value);

    // Set Yes/No in last column accordingly (mutually exclusive)
    if (anyChecked) {
      onUpdate(1, 0, true);
      onUpdate(1, 1, false);
    } else {
      onUpdate(1, 0, false);
      onUpdate(1, 1, true);
    }
  }

  // Ensure Yes/No are mutually exclusive when toggled directly
  function handleYesNo(colIdx, optIdx, value) {
    if (optIdx === 0 && value) {
      onUpdate(colIdx, 0, true); // Yes
      if (state()[colIdx][1]) onUpdate(colIdx, 1, false); // Uncheck No
    } else if (optIdx === 1 && value) {
      onUpdate(colIdx, 1, true); // No
      if (state()[colIdx][0]) onUpdate(colIdx, 0, false); // Uncheck Yes
    } else {
      onUpdate(colIdx, optIdx, value);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{question.text}</h3>
      <div className="flex gap-6">
        {question.columns.map((col, colIdx) => (
          <div key={colIdx} className={colIdx === question.columns.length - 1 ? 'w-42 flex flex-col' : 'flex-1 flex flex-col'}>
            {/* Label */}
            <div className="font-medium text-gray-800 h-8">{col.label}</div>
            {/* Options */}
            <div className="flex flex-col gap-2">
              {col.options.map((option, optIdx) => (
                <label key={optIdx} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={state()[colIdx][optIdx]}
                    onChange={() =>
                      colIdx === 0 ?
                        autoToggleYesNo(colIdx, optIdx, !state()[colIdx][optIdx])
                      : handleYesNo(colIdx, optIdx, !state()[colIdx][optIdx])
                    }
                    className="w-4 h-4 flex-shrink-0 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Question4({ onUpdate, checklistState }) {
  const state = () => checklistState().state.q4;

  const question = AMSTAR_CHECKLIST.q4;

  function autoToggleMain(colIdx, optIdx, value) {
    const col0 = colIdx === 0 ? state()[0].map((v, i) => (i === optIdx ? value : v)) : state()[0];
    const col1 = colIdx === 1 ? state()[1].map((v, i) => (i === optIdx ? value : v)) : state()[1];

    const allPartialYes = col0.every(Boolean);
    const allYes = allPartialYes && col1.every(Boolean);

    onUpdate(colIdx, optIdx, value);

    if (allYes) {
      onUpdate(2, 0, true);
      onUpdate(2, 1, false);
      onUpdate(2, 2, false);
    } else if (allPartialYes) {
      onUpdate(2, 0, false);
      onUpdate(2, 1, true);
      onUpdate(2, 2, false);
    } else {
      onUpdate(2, 0, false);
      onUpdate(2, 1, false);
      onUpdate(2, 2, true);
    }
  }

  function handleMain(colIdx, optIdx, value) {
    if (value) {
      onUpdate(colIdx, 0, optIdx === 0);
      onUpdate(colIdx, 1, optIdx === 1);
      onUpdate(colIdx, 2, optIdx === 2);
    } else {
      onUpdate(colIdx, optIdx, value);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{question.text}</h3>
      <div className="flex gap-6">
        {question.columns.map((col, colIdx) => (
          <div key={colIdx} className={colIdx === question.columns.length - 1 ? 'w-32 flex flex-col' : 'flex-1 flex flex-col'}>
            {/* Label */}
            <div className="font-medium text-gray-800 h-8">{col.label}</div>
            {/* Options */}
            <div className="flex flex-col gap-2">
              {col.options.map((option, optIdx) => (
                <label key={optIdx} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={state()[colIdx][optIdx]}
                    onChange={() =>
                      colIdx === 0 || colIdx === 1 ?
                        autoToggleMain(colIdx, optIdx, !state()[colIdx][optIdx])
                      : handleMain(colIdx, optIdx, !state()[colIdx][optIdx])
                    }
                    className="w-4 h-4 flex-shrink-0 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Question5({ onUpdate, checklistState }) {
  const state = () => checklistState().state.q5;

  const question = AMSTAR_CHECKLIST.q5;

  function autoToggleYesNo(colIdx, optIdx, value) {
    const col0 = colIdx === 0 ? state()[0].map((v, i) => (i === optIdx ? value : v)) : state()[0];
    const anyChecked = col0.some(Boolean);

    onUpdate(colIdx, optIdx, value);

    if (anyChecked) {
      onUpdate(1, 0, true);
      onUpdate(1, 1, false);
    } else {
      onUpdate(1, 0, false);
      onUpdate(1, 1, true);
    }
  }

  function handleYesNo(colIdx, optIdx, value) {
    if (optIdx === 0 && value) {
      onUpdate(colIdx, 0, true);
      if (state()[colIdx][1]) onUpdate(colIdx, 1, false);
    } else if (optIdx === 1 && value) {
      onUpdate(colIdx, 1, true);
      if (state()[colIdx][0]) onUpdate(colIdx, 0, false);
    } else {
      onUpdate(colIdx, optIdx, value);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{question.text}</h3>
      <div className="flex gap-6">
        {question.columns.map((col, colIdx) => (
          <div key={colIdx} className={colIdx === question.columns.length - 1 ? 'w-32 flex flex-col' : 'flex-1 flex flex-col'}>
            {/* Label */}
            <div className="font-medium text-gray-800 h-8">{col.label}</div>
            {/* Options */}
            <div className="flex flex-col gap-2">
              {col.options.map((option, optIdx) => (
                <label key={optIdx} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={state()[colIdx][optIdx]}
                    onChange={() =>
                      colIdx === 0 ?
                        autoToggleYesNo(colIdx, optIdx, !state()[colIdx][optIdx])
                      : handleYesNo(colIdx, optIdx, !state()[colIdx][optIdx])
                    }
                    className="w-4 h-4 flex-shrink-0 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Question6({ onUpdate, checklistState }) {
  const state = () => checklistState().state.q6;

  const question = AMSTAR_CHECKLIST.q6;

  function autoToggleYesNo(colIdx, optIdx, value) {
    const col0 = colIdx === 0 ? state()[0].map((v, i) => (i === optIdx ? value : v)) : state()[0];
    const anyChecked = col0.some(Boolean);
    onUpdate(colIdx, optIdx, value);
    if (anyChecked) {
      onUpdate(1, 0, true);
      onUpdate(1, 1, false);
    } else {
      onUpdate(1, 0, false);
      onUpdate(1, 1, true);
    }
  }

  function handleYesNo(colIdx, optIdx, value) {
    if (optIdx === 0 && value) {
      onUpdate(colIdx, 0, true);
      if (state()[colIdx][1]) onUpdate(colIdx, 1, false);
    } else if (optIdx === 1 && value) {
      onUpdate(colIdx, 1, true);
      if (state()[colIdx][0]) onUpdate(colIdx, 0, false);
    } else {
      onUpdate(colIdx, optIdx, value);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{question.text}</h3>
      <div className="flex gap-6">
        {question.columns.map((col, colIdx) => (
          <div key={colIdx} className={colIdx === question.columns.length - 1 ? 'w-32 flex flex-col' : 'flex-1 flex flex-col'}>
            {/* Label */}
            <div className="font-medium text-gray-800 h-8">{col.label}</div>
            {/* Options */}
            <div className="flex flex-col gap-2">
              {col.options.map((option, optIdx) => (
                <label key={optIdx} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={state()[colIdx][optIdx]}
                    onChange={() =>
                      colIdx === 0 ?
                        autoToggleYesNo(colIdx, optIdx, !state()[colIdx][optIdx])
                      : handleYesNo(colIdx, optIdx, !state()[colIdx][optIdx])
                    }
                    className="w-4 h-4 flex-shrink-0 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Question7({ onUpdate, checklistState }) {
  const state = () => checklistState().state.q7;

  const question = AMSTAR_CHECKLIST.q7;

  function autoToggleMain(colIdx, optIdx, value) {
    const col0 = colIdx === 0 ? state()[0].map((v, i) => (i === optIdx ? value : v)) : state()[0];
    const col1 = colIdx === 1 ? state()[1].map((v, i) => (i === optIdx ? value : v)) : state()[1];
    const allPartialYes = col0.every(Boolean);
    const allYes = allPartialYes && col1.every(Boolean);
    onUpdate(colIdx, optIdx, value);
    if (allYes) {
      onUpdate(2, 0, true);
      onUpdate(2, 1, false);
      onUpdate(2, 2, false);
    } else if (allPartialYes) {
      onUpdate(2, 0, false);
      onUpdate(2, 1, true);
      onUpdate(2, 2, false);
    } else {
      onUpdate(2, 0, false);
      onUpdate(2, 1, false);
      onUpdate(2, 2, true);
    }
  }

  function handleMain(colIdx, optIdx, value) {
    if (value) {
      onUpdate(colIdx, 0, optIdx === 0);
      onUpdate(colIdx, 1, optIdx === 1);
      onUpdate(colIdx, 2, optIdx === 2);
    } else {
      onUpdate(colIdx, optIdx, value);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{question.text}</h3>
      <div className="flex gap-6">
        {question.columns.map((col, colIdx) => (
          <div key={colIdx} className={colIdx === question.columns.length - 1 ? 'w-32 flex flex-col' : 'flex-1 flex flex-col'}>
            {/* Label */}
            <div className="font-medium text-gray-800 h-8">{col.label}</div>
            {/* Options */}
            <div className="flex flex-col gap-2">
              {col.options.map((option, optIdx) => (
                <label key={optIdx} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={state()[colIdx][optIdx]}
                    onChange={() =>
                      colIdx === 0 || colIdx === 1 ?
                        autoToggleMain(colIdx, optIdx, !state()[colIdx][optIdx])
                      : handleMain(colIdx, optIdx, !state()[colIdx][optIdx])
                    }
                    className="w-4 h-4 flex-shrink-0 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Question8({ onUpdate, checklistState }) {
  const state = () => checklistState().state.q8;

  const question = AMSTAR_CHECKLIST.q8;

  function autoToggleMain(colIdx, optIdx, value) {
    const col0 = colIdx === 0 ? state()[0].map((v, i) => (i === optIdx ? value : v)) : state()[0];
    const col1 = colIdx === 1 ? state()[1].map((v, i) => (i === optIdx ? value : v)) : state()[1];
    const allPartialYes = col0.every(Boolean);
    const allYes = allPartialYes && col1.every(Boolean);
    onUpdate(colIdx, optIdx, value);
    if (allYes) {
      onUpdate(2, 0, true);
      onUpdate(2, 1, false);
      onUpdate(2, 2, false);
    } else if (allPartialYes) {
      onUpdate(2, 0, false);
      onUpdate(2, 1, true);
      onUpdate(2, 2, false);
    } else {
      onUpdate(2, 0, false);
      onUpdate(2, 1, false);
      onUpdate(2, 2, true);
    }
  }

  function handleMain(colIdx, optIdx, value) {
    if (value) {
      onUpdate(colIdx, 0, optIdx === 0);
      onUpdate(colIdx, 1, optIdx === 1);
      onUpdate(colIdx, 2, optIdx === 2);
    } else {
      onUpdate(colIdx, optIdx, value);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{question.text}</h3>
      <div className="flex gap-6">
        {question.columns.map((col, colIdx) => (
          <div key={colIdx} className={colIdx === question.columns.length - 1 ? 'w-32 flex flex-col' : 'flex-1 flex flex-col'}>
            <div className="font-medium text-gray-800 h-8">{col.label}</div>
            <div className="flex flex-col gap-2">
              {col.options.map((option, optIdx) => (
                <label key={optIdx} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={state()[colIdx][optIdx]}
                    onChange={() =>
                      colIdx === 0 || colIdx === 1 ?
                        autoToggleMain(colIdx, optIdx, !state()[colIdx][optIdx])
                      : handleMain(colIdx, optIdx, !state()[colIdx][optIdx])
                    }
                    className="w-4 h-4 flex-shrink-0 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Question9({ onUpdatea, onUpdateb, checklistState }) {
  const statea = () => checklistState().state.q9a;
  const stateb = () => checklistState().state.q9b;

  const question = AMSTAR_CHECKLIST.q9;

  function autoToggleMainA(colIdx, optIdx, value) {
    const col0 = colIdx === 0 ? statea()[0].map((v, i) => (i === optIdx ? value : v)) : statea()[0];
    const col1 = colIdx === 1 ? statea()[1].map((v, i) => (i === optIdx ? value : v)) : statea()[1];
    const allPartialYes = col0.every(Boolean);
    const allYes = allPartialYes && col1.every(Boolean);
    onUpdatea(colIdx, optIdx, value);
    if (allYes) {
      onUpdatea(2, 0, true);
      onUpdatea(2, 1, false);
      onUpdatea(2, 2, false);
      onUpdatea(2, 3, false);
    } else if (allPartialYes) {
      onUpdatea(2, 0, false);
      onUpdatea(2, 1, true);
      onUpdatea(2, 2, false);
      onUpdatea(2, 3, false);
    } else {
      onUpdatea(2, 0, false);
      onUpdatea(2, 1, false);
      onUpdatea(2, 2, true);
      onUpdatea(2, 3, false);
    }
  }

  function handleMainA(colIdx, optIdx, value) {
    if (value) {
      onUpdatea(colIdx, 0, optIdx === 0);
      onUpdatea(colIdx, 1, optIdx === 1);
      onUpdatea(colIdx, 2, optIdx === 2);
      onUpdatea(colIdx, 3, optIdx === 3);
    } else {
      onUpdatea(colIdx, optIdx, value);
    }
  }

  function autoToggleMainB(colIdx, optIdx, value) {
    const col0 = colIdx === 0 ? stateb()[0].map((v, i) => (i === optIdx ? value : v)) : stateb()[0];
    const col1 = colIdx === 1 ? stateb()[1].map((v, i) => (i === optIdx ? value : v)) : stateb()[1];
    const allPartialYes = col0.every(Boolean);
    const allYes = allPartialYes && col1.every(Boolean);
    onUpdateb(colIdx, optIdx, value);
    if (allYes) {
      onUpdateb(2, 0, true);
      onUpdateb(2, 1, false);
      onUpdateb(2, 2, false);
      onUpdateb(2, 3, false);
    } else if (allPartialYes) {
      onUpdateb(2, 0, false);
      onUpdateb(2, 1, true);
      onUpdateb(2, 2, false);
      onUpdateb(2, 3, false);
    } else {
      onUpdateb(2, 0, false);
      onUpdateb(2, 1, false);
      onUpdateb(2, 2, true);
      onUpdateb(2, 3, false);
    }
  }

  function handleMainB(colIdx, optIdx, value) {
    if (value) {
      onUpdateb(colIdx, 0, optIdx === 0);
      onUpdateb(colIdx, 1, optIdx === 1);
      onUpdateb(colIdx, 2, optIdx === 2);
      onUpdateb(colIdx, 3, optIdx === 3);
    } else {
      onUpdateb(colIdx, optIdx, value);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{question.text}</h3>
      <div className="font-semibold text-gray-900 h-6 my-2">{question.subtitle}</div>
      <div className="flex gap-6">
        {question.columns.map((col, colIdx) => (
          <div key={colIdx} className={colIdx === question.columns.length - 1 ? 'w-42 flex flex-col' : 'flex-1 flex flex-col'}>
            {/* Label */}
            <div className="font-medium text-gray-800 h-8">{col.label}</div>
            {/* Options */}
            <div className="flex flex-col gap-2">
              {col.options.map((option, optIdx) => (
                <label key={optIdx} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={statea()[colIdx][optIdx]}
                    onChange={() =>
                      colIdx === 0 || colIdx === 1 ?
                        autoToggleMainA(colIdx, optIdx, !statea()[colIdx][optIdx])
                      : handleMainA(colIdx, optIdx, !statea()[colIdx][optIdx])
                    }
                    className="w-4 h-4 flex-shrink-0 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="font-semibold text-gray-900 h-6 my-2">{question.subtitle2}</div>
      <div className="flex gap-6">
        {question.columns2.map((col, colIdx) => (
          <div key={colIdx} className={colIdx === question.columns2.length - 1 ? 'w-42 flex flex-col' : 'flex-1 flex flex-col'}>
            {/* Label */}
            <div className="font-medium text-gray-800 h-8">{col.label}</div>
            {/* Options */}
            <div className="flex flex-col gap-2">
              {col.options.map((option, optIdx) => (
                <label key={optIdx} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={stateb()[colIdx][optIdx]}
                    onChange={() =>
                      colIdx === 0 || colIdx === 1 ?
                        autoToggleMainB(colIdx, optIdx, !stateb()[colIdx][optIdx])
                      : handleMainB(colIdx, optIdx, !stateb()[colIdx][optIdx])
                    }
                    className="w-4 h-4 flex-shrink-0 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Question10({ onUpdate, checklistState }) {
  const state = () => checklistState().state.q10;

  const question = AMSTAR_CHECKLIST.q10;

  // Auto-toggling logic: if the first column is checked, set Yes; otherwise, set No. Yes/No are mutually exclusive.
  function autoToggleYesNo(colIdx, optIdx, value) {
    const col0 = colIdx === 0 ? state()[0].map((v, i) => (i === optIdx ? value : v)) : state()[0];
    const anyChecked = col0.some(Boolean);
    onUpdate(colIdx, optIdx, value);
    if (anyChecked) {
      onUpdate(1, 0, true);
      onUpdate(1, 1, false);
    } else {
      onUpdate(1, 0, false);
      onUpdate(1, 1, true);
    }
  }

  function handleYesNo(colIdx, optIdx, value) {
    if (optIdx === 0 && value) {
      onUpdate(colIdx, 0, true);
      if (state()[colIdx][1]) onUpdate(colIdx, 1, false);
    } else if (optIdx === 1 && value) {
      onUpdate(colIdx, 1, true);
      if (state()[colIdx][0]) onUpdate(colIdx, 0, false);
    } else {
      onUpdate(colIdx, optIdx, value);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{question.text}</h3>
      <div className="flex gap-6">
        {question.columns.map((col, colIdx) => (
          <div key={colIdx} className={colIdx === question.columns.length - 1 ? 'w-42 flex flex-col' : 'flex-1 flex flex-col'}>
            {/* Label */}
            <div className="font-medium text-gray-800 h-8">{col.label}</div>
            {/* Options */}
            <div className="flex flex-col gap-2">
              {col.options.map((option, optIdx) => (
                <label key={optIdx} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={state()[colIdx][optIdx]}
                    onChange={() =>
                      colIdx === 0 ?
                        autoToggleYesNo(colIdx, optIdx, !state()[colIdx][optIdx])
                      : handleYesNo(colIdx, optIdx, !state()[colIdx][optIdx])
                    }
                    className="w-4 h-4 flex-shrink-0 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Question11({ onUpdatea, onUpdateb, checklistState }) {
  const statea = () => checklistState().state.q11a;
  const stateb = () => checklistState().state.q11b;

  const question = AMSTAR_CHECKLIST.q11;

  // RCTs section logic
  function autoToggleMainA(colIdx, optIdx, value) {
    const col0 = colIdx === 0 ? statea()[0].map((v, i) => (i === optIdx ? value : v)) : statea()[0];
    const allChecked = col0.every(Boolean);
    onUpdatea(colIdx, optIdx, value);
    if (allChecked) {
      onUpdatea(1, 0, true); // Yes
      onUpdatea(1, 1, false); // No
      onUpdatea(1, 2, false); // No meta-analysis conducted
    } else {
      onUpdatea(1, 0, false);
      onUpdatea(1, 1, true);
      onUpdatea(1, 2, false);
    }
  }

  function handleMainA(colIdx, optIdx, value) {
    // Yes/No/No meta-analysis conducted mutually exclusive
    if (value) {
      onUpdatea(colIdx, 0, optIdx === 0);
      onUpdatea(colIdx, 1, optIdx === 1);
      onUpdatea(colIdx, 2, optIdx === 2);
    } else {
      onUpdatea(colIdx, optIdx, value);
    }
  }

  // NRSI section logic
  function autoToggleMainB(colIdx, optIdx, value) {
    const col0 = colIdx === 0 ? stateb()[0].map((v, i) => (i === optIdx ? value : v)) : stateb()[0];
    const allChecked = col0.every(Boolean);
    onUpdateb(colIdx, optIdx, value);
    if (allChecked) {
      onUpdateb(1, 0, true); // Yes
      onUpdateb(1, 1, false); // No
      onUpdateb(1, 2, false); // No meta-analysis conducted
    } else {
      onUpdateb(1, 0, false);
      onUpdateb(1, 1, true);
      onUpdateb(1, 2, false);
    }
  }

  function handleMainB(colIdx, optIdx, value) {
    // Yes/No/No meta-analysis conducted mutually exclusive
    if (value) {
      onUpdateb(colIdx, 0, optIdx === 0);
      onUpdateb(colIdx, 1, optIdx === 1);
      onUpdateb(colIdx, 2, optIdx === 2);
    } else {
      onUpdateb(colIdx, optIdx, value);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{question.text}</h3>
      <div className="font-semibold text-gray-900 h-6 my-2">{question.subtitle}</div>
      <div className="flex gap-6">
        {question.columns.map((col, colIdx) => (
          <div key={colIdx} className={colIdx === question.columns.length - 1 ? 'w-60 flex flex-col' : 'flex-1 flex flex-col'}>
            {/* Label */}
            <div className="font-medium text-gray-800 h-8">{col.label}</div>
            {/* Options */}
            <div className="flex flex-col gap-2">
              {col.options.map((option, optIdx) => (
                <label key={optIdx} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={statea()[colIdx][optIdx]}
                    onChange={() =>
                      colIdx === 0 ?
                        autoToggleMainA(colIdx, optIdx, !statea()[colIdx][optIdx])
                      : handleMainA(colIdx, optIdx, !statea()[colIdx][optIdx])
                    }
                    className="w-4 h-4 flex-shrink-0 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="font-semibold text-gray-900 h-6 my-2">{question.subtitle2}</div>
      <div className="flex gap-6">
        {question.columns2.map((col, colIdx) => (
          <div key={colIdx} className={colIdx === question.columns2.length - 1 ? 'w-60 flex flex-col' : 'flex-1 flex flex-col'}>
            {/* Label */}
            <div className="font-medium text-gray-800 h-8">{col.label}</div>
            {/* Options */}
            <div className="flex flex-col gap-2">
              {col.options.map((option, optIdx) => (
                <label key={optIdx} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={stateb()[colIdx][optIdx]}
                    onChange={() =>
                      colIdx === 0 ?
                        autoToggleMainB(colIdx, optIdx, !stateb()[colIdx][optIdx])
                      : handleMainB(colIdx, optIdx, !stateb()[colIdx][optIdx])
                    }
                    className="w-4 h-4 flex-shrink-0 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Question12({ onUpdate, checklistState }) {
  const state = () => checklistState().state.q12;

  const question = AMSTAR_CHECKLIST.q12;

  // Auto-toggling logic: if the first column is checked, set Yes; otherwise, set No. 'No meta-analysis conducted' is mutually exclusive.
  function autoToggleMain(colIdx, optIdx, value) {
    const col0 = colIdx === 0 ? state()[0].map((v, i) => (i === optIdx ? value : v)) : state()[0];
    const anyChecked = col0.some(Boolean);
    onUpdate(colIdx, optIdx, value);
    if (anyChecked) {
      onUpdate(1, 0, true); // Yes
      onUpdate(1, 1, false); // No
      onUpdate(1, 2, false); // No meta-analysis conducted
    } else {
      onUpdate(1, 0, false);
      onUpdate(1, 1, true);
      onUpdate(1, 2, false);
    }
  }

  function handleMain(colIdx, optIdx, value) {
    // Yes/No/No meta-analysis conducted mutually exclusive
    if (value) {
      onUpdate(colIdx, 0, optIdx === 0);
      onUpdate(colIdx, 1, optIdx === 1);
      onUpdate(colIdx, 2, optIdx === 2);
    } else {
      onUpdate(colIdx, optIdx, value);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{question.text}</h3>
      <div className="flex gap-6">
        {question.columns.map((col, colIdx) => (
          <div key={colIdx} className={colIdx === question.columns.length - 1 ? 'w-60 flex flex-col' : 'flex-1 flex flex-col'}>
            {/* Label */}
            <div className="font-medium text-gray-800 h-8">{col.label}</div>
            {/* Options */}
            <div className="flex flex-col gap-2">
              {col.options.map((option, optIdx) => (
                <label key={optIdx} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={state()[colIdx][optIdx]}
                    onChange={() =>
                      colIdx === 0 ?
                        autoToggleMain(colIdx, optIdx, !state()[colIdx][optIdx])
                      : handleMain(colIdx, optIdx, !state()[colIdx][optIdx])
                    }
                    className="w-4 h-4 flex-shrink-0 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Question13({ onUpdate, checklistState }) {
  const state = () => checklistState().state.q13;

  const question = AMSTAR_CHECKLIST.q13;

  // Auto-toggling logic: if the first column is checked, set Yes; otherwise, set No. Yes/No are mutually exclusive.
  function autoToggleYesNo(colIdx, optIdx, value) {
    const col0 = colIdx === 0 ? state()[0].map((v, i) => (i === optIdx ? value : v)) : state()[0];
    const anyChecked = col0.some(Boolean);
    onUpdate(colIdx, optIdx, value);
    if (anyChecked) {
      onUpdate(1, 0, true);
      onUpdate(1, 1, false);
    } else {
      onUpdate(1, 0, false);
      onUpdate(1, 1, true);
    }
  }

  function handleYesNo(colIdx, optIdx, value) {
    if (optIdx === 0 && value) {
      onUpdate(colIdx, 0, true);
      if (state()[colIdx][1]) onUpdate(colIdx, 1, false);
    } else if (optIdx === 1 && value) {
      onUpdate(colIdx, 1, true);
      if (state()[colIdx][0]) onUpdate(colIdx, 0, false);
    } else {
      onUpdate(colIdx, optIdx, value);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{question.text}</h3>
      <div className="flex gap-6">
        {question.columns.map((col, colIdx) => (
          <div key={colIdx} className={colIdx === question.columns.length - 1 ? 'w-42 flex flex-col' : 'flex-1 flex flex-col'}>
            {/* Label */}
            <div className="font-medium text-gray-800 h-8">{col.label}</div>
            {/* Options */}
            <div className="flex flex-col gap-2">
              {col.options.map((option, optIdx) => (
                <label key={optIdx} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={state()[colIdx][optIdx]}
                    onChange={() =>
                      colIdx === 0 ?
                        autoToggleYesNo(colIdx, optIdx, !state()[colIdx][optIdx])
                      : handleYesNo(colIdx, optIdx, !state()[colIdx][optIdx])
                    }
                    className="w-4 h-4 flex-shrink-0 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Question14({ onUpdate, checklistState }) {
  const state = () => checklistState().state.q14;

  const question = AMSTAR_CHECKLIST.q14;

  // Auto-toggling logic: if the first column is checked, set Yes; otherwise, set No. Yes/No are mutually exclusive.
  function autoToggleYesNo(colIdx, optIdx, value) {
    const col0 = colIdx === 0 ? state()[0].map((v, i) => (i === optIdx ? value : v)) : state()[0];
    const anyChecked = col0.some(Boolean);
    onUpdate(colIdx, optIdx, value);
    if (anyChecked) {
      onUpdate(1, 0, true);
      onUpdate(1, 1, false);
    } else {
      onUpdate(1, 0, false);
      onUpdate(1, 1, true);
    }
  }

  function handleYesNo(colIdx, optIdx, value) {
    if (optIdx === 0 && value) {
      onUpdate(colIdx, 0, true);
      if (state()[colIdx][1]) onUpdate(colIdx, 1, false);
    } else if (optIdx === 1 && value) {
      onUpdate(colIdx, 1, true);
      if (state()[colIdx][0]) onUpdate(colIdx, 0, false);
    } else {
      onUpdate(colIdx, optIdx, value);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{question.text}</h3>
      <div className="flex gap-6">
        {question.columns.map((col, colIdx) => (
          <div key={colIdx} className={colIdx === question.columns.length - 1 ? 'w-42 flex flex-col' : 'flex-1 flex flex-col'}>
            {/* Label */}
            <div className="font-medium text-gray-800 h-8">{col.label}</div>
            {/* Options */}
            <div className="flex flex-col gap-2">
              {col.options.map((option, optIdx) => (
                <label key={optIdx} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={state()[colIdx][optIdx]}
                    onChange={() =>
                      colIdx === 0 ?
                        autoToggleYesNo(colIdx, optIdx, !state()[colIdx][optIdx])
                      : handleYesNo(colIdx, optIdx, !state()[colIdx][optIdx])
                    }
                    className="w-4 h-4 flex-shrink-0 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Question15({ onUpdate, checklistState }) {
  const state = () => checklistState().state.q15;

  const question = AMSTAR_CHECKLIST.q15;

  // Auto-toggling logic: if the first column is checked, set Yes; otherwise, set No. 'No meta-analysis conducted' is mutually exclusive.
  function autoToggleMain(colIdx, optIdx, value) {
    const col0 = colIdx === 0 ? state()[0].map((v, i) => (i === optIdx ? value : v)) : state()[0];
    const anyChecked = col0.some(Boolean);
    onUpdate(colIdx, optIdx, value);
    if (anyChecked) {
      onUpdate(1, 0, true);
      onUpdate(1, 1, false);
      onUpdate(1, 2, false);
    } else {
      onUpdate(1, 0, false);
      onUpdate(1, 1, true);
      onUpdate(1, 2, false);
    }
  }

  function handleMain(colIdx, optIdx, value) {
    // Yes/No/No meta-analysis conducted mutually exclusive
    if (value) {
      onUpdate(colIdx, 0, optIdx === 0);
      onUpdate(colIdx, 1, optIdx === 1);
      onUpdate(colIdx, 2, optIdx === 2);
    } else {
      onUpdate(colIdx, optIdx, value);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{question.text}</h3>
      <div className="flex gap-6">
        {question.columns.map((col, colIdx) => (
          <div key={colIdx} className={colIdx === question.columns.length - 1 ? 'w-60 flex flex-col' : 'flex-1 flex flex-col'}>
            {/* Label */}
            <div className="font-medium text-gray-800 h-8">{col.label}</div>
            {/* Options */}
            <div className="flex flex-col gap-2">
              {col.options.map((option, optIdx) => (
                <label key={optIdx} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={state()[colIdx][optIdx]}
                    onChange={() =>
                      colIdx === 0 ?
                        autoToggleMain(colIdx, optIdx, !state()[colIdx][optIdx])
                      : handleMain(colIdx, optIdx, !state()[colIdx][optIdx])
                    }
                    className="w-4 h-4 flex-shrink-0 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Question16({ onUpdate, checklistState }) {
  const state = () => checklistState().state.q16;

  const question = AMSTAR_CHECKLIST.q16;

  // Auto-toggling logic: if the first column is checked, set Yes; otherwise, set No. Yes/No are mutually exclusive.
  function autoToggleYesNo(colIdx, optIdx, value) {
    const col0 = colIdx === 0 ? state()[0].map((v, i) => (i === optIdx ? value : v)) : state()[0];
    const anyChecked = col0.some(Boolean);
    onUpdate(colIdx, optIdx, value);
    if (anyChecked) {
      onUpdate(1, 0, true);
      onUpdate(1, 1, false);
    } else {
      onUpdate(1, 0, false);
      onUpdate(1, 1, true);
    }
  }

  function handleYesNo(colIdx, optIdx, value) {
    if (optIdx === 0 && value) {
      onUpdate(colIdx, 0, true);
      if (state()[colIdx][1]) onUpdate(colIdx, 1, false);
    } else if (optIdx === 1 && value) {
      onUpdate(colIdx, 1, true);
      if (state()[colIdx][0]) onUpdate(colIdx, 0, false);
    } else {
      onUpdate(colIdx, optIdx, value);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{question.text}</h3>
      <div className="flex gap-6">
        {question.columns.map((col, colIdx) => (
          <div key={colIdx} className={colIdx === question.columns.length - 1 ? 'w-42 flex flex-col' : 'flex-1 flex flex-col'}>
            {/* Label */}
            <div className="font-medium text-gray-800 h-8">{col.label}</div>
            {/* Options */}
            <div className="flex flex-col gap-2">
              {col.options.map((option, optIdx) => (
                <label key={optIdx} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={state()[colIdx][optIdx]}
                    onChange={() =>
                      colIdx === 0 ?
                        autoToggleYesNo(colIdx, optIdx, !state()[colIdx][optIdx])
                      : handleYesNo(colIdx, optIdx, !state()[colIdx][optIdx])
                    }
                    className="w-4 h-4 flex-shrink-0 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AMSTAR2Checklist({ checklistState, onChecklistChange }) {
  const [reviewTitle, setReviewTitle] = createSignal('');
  const [reviewerName, setReviewerName] = createSignal('');
  const [reviewDate, setReviewDate] = createSignal('');

  createEffect(() => {
    const state = checklistState().state;
    setReviewTitle(state.title || '');
    setReviewerName(state.reviewerName || '');
    setReviewDate(state.reviewDate || '');
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AMSTAR 2 Checklist</h1>
          <p className="text-gray-600 mb-6">App description here</p>

          {/* Review Details */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Review Title</label>
              <input
                type="text"
                value={reviewTitle()}
                onChange={(e) => {
                  setReviewTitle(e.target.value);
                  checklistState().state.title = e.target.value;
                  onChecklistChange({ ...checklistState().state });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter review title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reviewer Name</label>
              <input
                type="text"
                value={reviewerName()}
                onChange={(e) => {
                  setReviewerName(e.target.value);
                  checklistState().state.reviewerName = e.target.value;
                  onChecklistChange({ ...checklistState().state });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Review Date</label>
              <input
                type="date"
                value={reviewDate()}
                onChange={(e) => {
                  setReviewDate(e.target.value);
                  checklistState().state.reviewDate = e.target.value;
                  onChecklistChange({ ...checklistState().state });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-6">
          <Question1
            onUpdate={(colIdx, optIdx, value) => {
              const newQ1 = checklistState().state.q1.map((arr) => [...arr]);
              newQ1[colIdx][optIdx] = value;
              onChecklistChange({ ...checklistState().state, q1: newQ1 });
            }}
            checklistState={checklistState}
          />
          <Question2
            onUpdate={(colIdx, optIdx, value) => {
              const newQ2 = checklistState().state.q2.map((arr) => [...arr]);
              newQ2[colIdx][optIdx] = value;
              onChecklistChange({ ...checklistState().state, q2: newQ2 });
            }}
            checklistState={checklistState}
          />
          <Question3
            onUpdate={(colIdx, optIdx, value) => {
              const newQ3 = checklistState().state.q3.map((arr) => [...arr]);
              newQ3[colIdx][optIdx] = value;
              onChecklistChange({ ...checklistState().state, q3: newQ3 });
            }}
            checklistState={checklistState}
          />
          <Question4
            onUpdate={(colIdx, optIdx, value) => {
              const newQ4 = checklistState().state.q4.map((arr) => [...arr]);
              newQ4[colIdx][optIdx] = value;
              onChecklistChange({ ...checklistState().state, q4: newQ4 });
            }}
            checklistState={checklistState}
          />
          <Question5
            onUpdate={(colIdx, optIdx, value) => {
              const newQ5 = checklistState().state.q5.map((arr) => [...arr]);
              newQ5[colIdx][optIdx] = value;
              onChecklistChange({ ...checklistState().state, q5: newQ5 });
            }}
            checklistState={checklistState}
          />
          <Question6
            onUpdate={(colIdx, optIdx, value) => {
              const newQ6 = checklistState().state.q6.map((arr) => [...arr]);
              newQ6[colIdx][optIdx] = value;
              onChecklistChange({ ...checklistState().state, q6: newQ6 });
            }}
            checklistState={checklistState}
          />
          <Question7
            onUpdate={(colIdx, optIdx, value) => {
              const newQ7 = checklistState().state.q7.map((arr) => [...arr]);
              newQ7[colIdx][optIdx] = value;
              onChecklistChange({ ...checklistState().state, q7: newQ7 });
            }}
            checklistState={checklistState}
          />
          <Question8
            onUpdate={(colIdx, optIdx, value) => {
              const newQ8 = checklistState().state.q8.map((arr) => [...arr]);
              newQ8[colIdx][optIdx] = value;
              onChecklistChange({ ...checklistState().state, q8: newQ8 });
            }}
            checklistState={checklistState}
          />
          <Question9
            onUpdatea={(colIdx, optIdx, value) => {
              const newQ9a = checklistState().state.q9a.map((arr) => [...arr]);
              newQ9a[colIdx][optIdx] = value;
              onChecklistChange({ ...checklistState().state, q9a: newQ9a });
            }}
            onUpdateb={(colIdx, optIdx, value) => {
              const newQ9b = checklistState().state.q9b.map((arr) => [...arr]);
              newQ9b[colIdx][optIdx] = value;
              onChecklistChange({ ...checklistState().state, q9b: newQ9b });
            }}
            checklistState={checklistState}
          />
          <Question10
            onUpdate={(colIdx, optIdx, value) => {
              const newQ10 = checklistState().state.q10.map((arr) => [...arr]);
              newQ10[colIdx][optIdx] = value;
              onChecklistChange({ ...checklistState().state, q10: newQ10 });
            }}
            checklistState={checklistState}
          />
          <Question11
            onUpdatea={(colIdx, optIdx, value) => {
              const newQ11a = checklistState().state.q11a.map((arr) => [...arr]);
              newQ11a[colIdx][optIdx] = value;
              onChecklistChange({ ...checklistState().state, q11a: newQ11a });
            }}
            onUpdateb={(colIdx, optIdx, value) => {
              const newQ11b = checklistState().state.q11b.map((arr) => [...arr]);
              newQ11b[colIdx][optIdx] = value;
              onChecklistChange({ ...checklistState().state, q11b: newQ11b });
            }}
            checklistState={checklistState}
          />
          <Question12
            onUpdate={(colIdx, optIdx, value) => {
              const newQ12 = checklistState().state.q12.map((arr) => [...arr]);
              newQ12[colIdx][optIdx] = value;
              onChecklistChange({ ...checklistState().state, q12: newQ12 });
            }}
            checklistState={checklistState}
          />
          <Question13
            onUpdate={(colIdx, optIdx, value) => {
              const newQ13 = checklistState().state.q13.map((arr) => [...arr]);
              newQ13[colIdx][optIdx] = value;
              onChecklistChange({ ...checklistState().state, q13: newQ13 });
            }}
            checklistState={checklistState}
          />
          <Question14
            onUpdate={(colIdx, optIdx, value) => {
              const newQ14 = checklistState().state.q14.map((arr) => [...arr]);
              newQ14[colIdx][optIdx] = value;
              onChecklistChange({ ...checklistState().state, q14: newQ14 });
            }}
            checklistState={checklistState}
          />
          <Question15
            onUpdate={(colIdx, optIdx, value) => {
              const newQ15 = checklistState().state.q15.map((arr) => [...arr]);
              newQ15[colIdx][optIdx] = value;
              onChecklistChange({ ...checklistState().state, q15: newQ15 });
            }}
            checklistState={checklistState}
          />
          <Question16
            onUpdate={(colIdx, optIdx, value) => {
              const newQ16 = checklistState().state.q16.map((arr) => [...arr]);
              newQ16[colIdx][optIdx] = value;
              onChecklistChange({ ...checklistState().state, q16: newQ16 });
            }}
            checklistState={checklistState}
          />
        </div>
      </div>
    </div>
  );
}
