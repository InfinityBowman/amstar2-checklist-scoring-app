import { createSignal, createEffect } from 'solid-js';

function Question1({ onUpdate, checklistState }) {
  const state = () => checklistState().state.q1;
  const question = {
    text: '1. Did the research questions and inclusion criteria for the review include the components of PICO?',
    columns: [
      {
        label: 'For Yes:',
        options: ['Population', 'Intervention', 'Comparator group', 'Outcome'],
      },
      {
        label: 'Optional (recommended):',
        options: ['Timeframe for follow-up'],
      },
      {
        label: '',
        options: ['Yes', 'No'],
      },
    ],
  };

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
          <div
            key={colIdx}
            className={colIdx === question.columns.length - 1 ? 'w-42 flex flex-col' : 'flex-1 flex flex-col'}
          >
            {/* Label */}
            <div className="font-medium text-gray-800 mb-2 h-6">{col.label}</div>
            {/* Options */}
            <div className="flex flex-col gap-2">
              {col.options.map((option, optIdx) => (
                <label
                  key={optIdx}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="checkbox"
                    checked={state()[colIdx][optIdx]}
                    onChange={() =>
                      colIdx === 0
                        ? autoToggleYesNo(colIdx, optIdx, !state()[colIdx][optIdx])
                        : colIdx === 2
                        ? handleYesNo(colIdx, optIdx, !state()[colIdx][optIdx])
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

  const question = {
    text: '2. Did the report of the review contain an explicit statement that the review methods were established prior to the conduct of the review and did the report justify any significant deviations from the protocol?',
    columns: [
      {
        label: 'For Partial Yes:',
        description: 'The authors state that they had a written protocol or guide that included ALL the following:',
        options: ['review question(s)', 'a search strategy', 'inclusion/exclusion criteria', 'risk of bias assessment'],
      },
      {
        label: 'For Yes:',
        description: 'As for Partial Yes, plus the protocol should be registered and should also have specified:',
        options: [
          'a meta-analysis/synthesis plan, if appropriate, and',
          'a plan for investigating causes of heterogeneity',
          'a plan for investigating causes of heterogeneity',
        ],
      },
      {
        label: '',
        description: '',
        options: ['Yes', 'Partial Yes', 'No'],
      },
    ],
  };

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
          <div
            key={colIdx}
            className={colIdx === question.columns.length - 1 ? 'w-32 flex flex-col' : 'flex-1 flex flex-col'}
          >
            {/* Label */}
            <div className="font-medium text-gray-800 h-6">{col.label}</div>
            {/* Description */}
            <div className="font-light text-gray-800 mb-4 h-12">{col.description}</div>
            {/* Options */}
            <div className="flex flex-col gap-2">
              {col.options.map((option, optIdx) => (
                <label
                  key={optIdx}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="checkbox"
                    checked={state()[colIdx][optIdx]}
                    onChange={() =>
                      colIdx === 0 || colIdx === 1
                        ? autoToggleMain(colIdx, optIdx, !state()[colIdx][optIdx])
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

  const question = {
    text: '3. Did the review authors explain their selection of the study designs for inclusion in the review?',
    columns: [
      {
        label: 'For Yes, the review should satisfy ONE of the following:',
        options: [
          'Explanation for including only RCTs ',
          'OR Explanation for including only NRSI',
          'OR Explanation for including both RCTs and NRSI',
        ],
      },
      {
        label: '',
        options: ['Yes', 'No'],
      },
    ],
  };

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
          <div
            key={colIdx}
            className={colIdx === question.columns.length - 1 ? 'w-42 flex flex-col' : 'flex-1 flex flex-col'}
          >
            {/* Label */}
            <div className="font-medium text-gray-800 h-8">{col.label}</div>
            {/* Options */}
            <div className="flex flex-col gap-2">
              {col.options.map((option, optIdx) => (
                <label
                  key={optIdx}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="checkbox"
                    checked={state()[colIdx][optIdx]}
                    onChange={() =>
                      colIdx === 0
                        ? autoToggleYesNo(colIdx, optIdx, !state()[colIdx][optIdx])
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

  const question = {
    text: '4. Did the review authors use a comprehensive literature search strategy? ',
    columns: [
      {
        label: 'For Partial Yes (all the following):',
        options: [
          'searched at least 2 databases (relevant to research question)',
          'provided key word and/or search strategy',
          'justified publication restrictions (e.g. language)',
        ],
      },
      {
        label: 'For Yes, should also have (all the following):',
        options: [
          'searched the reference lists / bibliographies of included studies',
          'searched trial/study registries',
          'included/consulted content experts in the field',
          'where relevant, searched for grey literature',
          'conducted search within 24 months of completion of the review',
        ],
      },
      {
        label: '',
        options: ['Yes', 'Partial Yes', 'No'],
      },
    ],
  };

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
          <div
            key={colIdx}
            className={colIdx === question.columns.length - 1 ? 'w-32 flex flex-col' : 'flex-1 flex flex-col'}
          >
            {/* Label */}
            <div className="font-medium text-gray-800 h-8">{col.label}</div>
            {/* Options */}
            <div className="flex flex-col gap-2">
              {col.options.map((option, optIdx) => (
                <label
                  key={optIdx}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="checkbox"
                    checked={state()[colIdx][optIdx]}
                    onChange={() =>
                      colIdx === 0 || colIdx === 1
                        ? autoToggleMain(colIdx, optIdx, !state()[colIdx][optIdx])
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

  const question = {
    text: '5. Did the review authors perform study selection in duplicate?',
    columns: [
      {
        label: 'For Yes, either ONE of the following:',
        options: [
          'at least two reviewers achieved consensus on which data to extract from included studies',
          'OR two reviewers extracted data from a sample of eligible studies and achieved good agreement (at least 80 percent), with the remainder extracted by one reviewer.',
        ],
      },
      {
        label: '',
        options: ['Yes', 'No'],
      },
    ],
  };

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
          <div
            key={colIdx}
            className={colIdx === question.columns.length - 1 ? 'w-32 flex flex-col' : 'flex-1 flex flex-col'}
          >
            {/* Label */}
            <div className="font-medium text-gray-800 h-8">{col.label}</div>
            {/* Options */}
            <div className="flex flex-col gap-2">
              {col.options.map((option, optIdx) => (
                <label
                  key={optIdx}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="checkbox"
                    checked={state()[colIdx][optIdx]}
                    onChange={() =>
                      colIdx === 0
                        ? autoToggleYesNo(colIdx, optIdx, !state()[colIdx][optIdx])
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

  const question = {
    text: '6. Did the review authors perform data extraction in duplicate?',
    columns: [
      {
        label: 'For Yes, either ONE of the following:',
        options: [
          'at least two reviewers achieved consensus on which data to extract from included studies',
          'OR two reviewers extracted data from a sample of eligible studies and achieved good agreement (at least 80 percent), with the remainder extracted by one reviewer.',
        ],
      },
      {
        label: '',
        options: ['Yes', 'No'],
      },
    ],
  };

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
          <div
            key={colIdx}
            className={colIdx === question.columns.length - 1 ? 'w-32 flex flex-col' : 'flex-1 flex flex-col'}
          >
            {/* Label */}
            <div className="font-medium text-gray-800 h-8">{col.label}</div>
            {/* Options */}
            <div className="flex flex-col gap-2">
              {col.options.map((option, optIdx) => (
                <label
                  key={optIdx}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="checkbox"
                    checked={state()[colIdx][optIdx]}
                    onChange={() =>
                      colIdx === 0
                        ? autoToggleYesNo(colIdx, optIdx, !state()[colIdx][optIdx])
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

  const question = {
    text: '7. Did the review authors provide a list of excluded studies and justify the exclusions?',
    columns: [
      {
        label: 'For Partial Yes:',
        options: ['provided a list of all potentially relevant studies that were read in full-text form but excluded from the review'],
      },
      {
        label: 'For Yes, must also have:',
        options: ['Justified the exclusion from the review of each potentially relevant study'],
      },
      {
        label: '',
        options: ['Yes', 'Partial Yes', 'No'],
      },
    ],
  };

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
          <div
            key={colIdx}
            className={colIdx === question.columns.length - 1 ? 'w-32 flex flex-col' : 'flex-1 flex flex-col'}
          >
            {/* Label */}
            <div className="font-medium text-gray-800 h-8">{col.label}</div>
            {/* Options */}
            <div className="flex flex-col gap-2">
              {col.options.map((option, optIdx) => (
                <label
                  key={optIdx}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="checkbox"
                    checked={state()[colIdx][optIdx]}
                    onChange={() =>
                      colIdx === 0 || colIdx === 1
                        ? autoToggleMain(colIdx, optIdx, !state()[colIdx][optIdx])
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

  const question = {
    text: '8. Did the review authors describe the included studies in adequate detail?',
    columns: [
      {
        label: 'For Partial Yes (ALL the following):',
        options: [
          'described populations',
          'described interventions',
          'described comparators',
          'described outcomes',
          'described research designs',
        ],
      },
      {
        label: 'For Yes, should also have ALL the following:',
        options: [
          'described population in detail',
          'described comparator in detail (including doses where relevant)',
          'described study’s setting in detail',
          'timeframe for follow-up',
        ],
      },
      {
        label: '',
        options: ['Yes', 'Partial Yes', 'No'],
      },
    ],
  };

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
          <div
            key={colIdx}
            className={colIdx === question.columns.length - 1 ? 'w-32 flex flex-col' : 'flex-1 flex flex-col'}
          >
            <div className="font-medium text-gray-800 h-8">{col.label}</div>
            <div className="flex flex-col gap-2">
              {col.options.map((option, optIdx) => (
                <label
                  key={optIdx}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="checkbox"
                    checked={state()[colIdx][optIdx]}
                    onChange={() =>
                      colIdx === 0 || colIdx === 1
                        ? autoToggleMain(colIdx, optIdx, !state()[colIdx][optIdx])
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

  const question = {
    text: '9. Did the review authors use a satisfactory technique for assessing the risk of bias (RoB) in individual studies that were included in the review?',
    subtitle: 'RCTs',
    columns: [
      {
        label: 'For Partial Yes, must have assessed RoB from',
        options: [
          'unconcealed allocation, and',
          'lack of blinding of patients and assessors when assessing outcomes (unnecessary for objective outcomes such as all-cause mortality)',
        ],
      },
      {
        label: 'For Yes, must also have assessed RoB from:',
        options: [
          'allocation sequence that was not truly random, and',
          'selection of the reported result from among multiple measurements or analyses of a specified outcome',
        ],
      },
      {
        label: '',
        description: '',
        options: ['Yes', 'Partial Yes', 'No', ' Includes only NRSI'],
      },
    ],
    subtitle2: 'NRSI',
    columns2: [
      {
        label: 'For Partial Yes, must have assessed RoB:',
        options: ['from confounding, and', 'from selection bias'],
      },
      {
        label: 'For Yes, must also have assessed RoB:',
        options: [
          'methods used to ascertain exposures and outcomes, and',
          'selection of the reported result from among multiple measurements or analyses of a specified outcome',
        ],
      },
      {
        label: '',
        options: ['Yes', 'Partial Yes', 'No', 'Includes only RCTs'],
      },
    ],
  };

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
          <div
            key={colIdx}
            className={colIdx === question.columns.length - 1 ? 'w-42 flex flex-col' : 'flex-1 flex flex-col'}
          >
            {/* Label */}
            <div className="font-medium text-gray-800 h-8">{col.label}</div>
            {/* Options */}
            <div className="flex flex-col gap-2">
              {col.options.map((option, optIdx) => (
                <label
                  key={optIdx}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="checkbox"
                    checked={statea()[colIdx][optIdx]}
                    onChange={() =>
                      colIdx === 0 || colIdx === 1
                        ? autoToggleMainA(colIdx, optIdx, !statea()[colIdx][optIdx])
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
          <div
            key={colIdx}
            className={colIdx === question.columns2.length - 1 ? 'w-42 flex flex-col' : 'flex-1 flex flex-col'}
          >
            {/* Label */}
            <div className="font-medium text-gray-800 h-8">{col.label}</div>
            {/* Options */}
            <div className="flex flex-col gap-2">
              {col.options.map((option, optIdx) => (
                <label
                  key={optIdx}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="checkbox"
                    checked={stateb()[colIdx][optIdx]}
                    onChange={() =>
                      colIdx === 0 || colIdx === 1
                        ? autoToggleMainB(colIdx, optIdx, !stateb()[colIdx][optIdx])
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

  const question = {
    text: '10. Did the review authors report on the sources of funding for the studies included in the review?',
    columns: [
      {
        label: 'For Yes:',
        options: [
          'Must have reported on the sources of funding for individual studies included in the review. Note: Reporting that the reviewers looked for this information but it was not reported by study authors also qualifies',
        ],
      },
      {
        label: '',
        options: ['Yes', 'No'],
      },
    ],
  };

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
          <div
            key={colIdx}
            className={colIdx === question.columns.length - 1 ? 'w-42 flex flex-col' : 'flex-1 flex flex-col'}
          >
            {/* Label */}
            <div className="font-medium text-gray-800 h-8">{col.label}</div>
            {/* Options */}
            <div className="flex flex-col gap-2">
              {col.options.map((option, optIdx) => (
                <label
                  key={optIdx}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="checkbox"
                    checked={state()[colIdx][optIdx]}
                    onChange={() =>
                      colIdx === 0
                        ? autoToggleYesNo(colIdx, optIdx, !state()[colIdx][optIdx])
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

  const question = {
    text: '11. If meta-analysis was performed did the review authors use appropriate methods for statistical combination of results?',
    subtitle: 'RCTs',
    columns: [
      {
        label: 'For Yes:',
        options: [
          'The authors justified combining the data in a meta-analysis',
          'AND they used an appropriate weighted technique to combine study results and adjusted for heterogeneity if present.',
          'AND investigated the causes of any heterogeneity',
        ],
      },
      {
        label: '',
        options: ['Yes', 'No', 'No meta-analysis conducted'],
      },
    ],
    subtitle2: 'NRSI',
    columns2: [
      {
        label: 'For Yes:',
        options: [
          'The authors justified combining the data in a meta-analysis',
          'AND they used an appropriate weighted technique to combine study results, adjusting for heterogeneity if present',
          'AND they statistically combined effect estimates from NRSI that were adjusted for confounding, rather than combining raw data, or justified combining raw data when adjusted effect estimates were not available',
          'AND they reported separate summary estimates for RCTs and NRSI separately when both were included in the review',
        ],
      },
      {
        label: '',
        options: ['Yes', 'No', 'No meta-analysis conducted'],
      },
    ],
  };

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
          <div
            key={colIdx}
            className={colIdx === question.columns.length - 1 ? 'w-60 flex flex-col' : 'flex-1 flex flex-col'}
          >
            {/* Label */}
            <div className="font-medium text-gray-800 h-8">{col.label}</div>
            {/* Options */}
            <div className="flex flex-col gap-2">
              {col.options.map((option, optIdx) => (
                <label
                  key={optIdx}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="checkbox"
                    checked={statea()[colIdx][optIdx]}
                    onChange={() =>
                      colIdx === 0
                        ? autoToggleMainA(colIdx, optIdx, !statea()[colIdx][optIdx])
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
          <div
            key={colIdx}
            className={colIdx === question.columns2.length - 1 ? 'w-60 flex flex-col' : 'flex-1 flex flex-col'}
          >
            {/* Label */}
            <div className="font-medium text-gray-800 h-8">{col.label}</div>
            {/* Options */}
            <div className="flex flex-col gap-2">
              {col.options.map((option, optIdx) => (
                <label
                  key={optIdx}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="checkbox"
                    checked={stateb()[colIdx][optIdx]}
                    onChange={() =>
                      colIdx === 0
                        ? autoToggleMainB(colIdx, optIdx, !stateb()[colIdx][optIdx])
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

  const question = {
    text: '12. If meta-analysis was performed, did the review authors assess the potential impact of RoB in individual studies on the results of the meta-analysis or other evidence synthesis?',
    columns: [
      {
        label: 'For Yes:',
        options: [
          'included only low risk of bias RCTs',
          'OR, if the pooled estimate was based on RCTs and/or NRSI at variable RoB, the authors performed analyses to investigate possible impact of RoB on summary estimates of effect.',
        ],
      },
      {
        label: '',
        options: ['Yes', 'No', 'No meta-analysis conducted'],
      },
    ],
  };

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
          <div
            key={colIdx}
            className={colIdx === question.columns.length - 1 ? 'w-60 flex flex-col' : 'flex-1 flex flex-col'}
          >
            {/* Label */}
            <div className="font-medium text-gray-800 h-8">{col.label}</div>
            {/* Options */}
            <div className="flex flex-col gap-2">
              {col.options.map((option, optIdx) => (
                <label
                  key={optIdx}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="checkbox"
                    checked={state()[colIdx][optIdx]}
                    onChange={() =>
                      colIdx === 0
                        ? autoToggleMain(colIdx, optIdx, !state()[colIdx][optIdx])
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

  const question = {
    text: '13. Did the review authors account for RoB in individual studies when interpreting/ discussing the results of the review?',
    columns: [
      {
        label: 'For Yes:',
        options: [
          'included only low risk of bias RCTs',
          'OR, if RCTs with moderate or high RoB, or NRSI were included the review provided a discussion of the likely impact of RoB on the results',
        ],
      },
      {
        label: '',
        options: ['Yes', 'No'],
      },
    ],
  };

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
          <div
            key={colIdx}
            className={colIdx === question.columns.length - 1 ? 'w-42 flex flex-col' : 'flex-1 flex flex-col'}
          >
            {/* Label */}
            <div className="font-medium text-gray-800 h-8">{col.label}</div>
            {/* Options */}
            <div className="flex flex-col gap-2">
              {col.options.map((option, optIdx) => (
                <label
                  key={optIdx}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="checkbox"
                    checked={state()[colIdx][optIdx]}
                    onChange={() =>
                      colIdx === 0
                        ? autoToggleYesNo(colIdx, optIdx, !state()[colIdx][optIdx])
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

  const question = {
    text: '14. Did the review authors provide a satisfactory explanation for, and discussion of, any heterogeneity observed in the results of the review?',
    columns: [
      {
        label: 'For Yes:',
        options: [
          'There was no significant heterogeneity in the results',
          'OR if heterogeneity was present the authors performed an investigation of sources of any heterogeneity in the results and discussed the impact of this on the results of the review',
        ],
      },
      {
        label: '',
        options: ['Yes', 'No'],
      },
    ],
  };

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
          <div
            key={colIdx}
            className={colIdx === question.columns.length - 1 ? 'w-42 flex flex-col' : 'flex-1 flex flex-col'}
          >
            {/* Label */}
            <div className="font-medium text-gray-800 h-8">{col.label}</div>
            {/* Options */}
            <div className="flex flex-col gap-2">
              {col.options.map((option, optIdx) => (
                <label
                  key={optIdx}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="checkbox"
                    checked={state()[colIdx][optIdx]}
                    onChange={() =>
                      colIdx === 0
                        ? autoToggleYesNo(colIdx, optIdx, !state()[colIdx][optIdx])
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

  const question = {
    text: '15. If they performed quantitative synthesis did the review authors carry out an adequate investigation of publication bias (small study bias) and discuss its likely impact on the results of the review?',
    columns: [
      {
        label: 'For Yes:',
        options: [
          'performed graphical or statistical tests for publication bias and discussed the likelihood and magnitude of impact of publication bias',
        ],
      },
      {
        label: '',
        options: ['Yes', 'No', 'No meta-analysis conducted'],
      },
    ],
  };

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
          <div
            key={colIdx}
            className={colIdx === question.columns.length - 1 ? 'w-60 flex flex-col' : 'flex-1 flex flex-col'}
          >
            {/* Label */}
            <div className="font-medium text-gray-800 h-8">{col.label}</div>
            {/* Options */}
            <div className="flex flex-col gap-2">
              {col.options.map((option, optIdx) => (
                <label
                  key={optIdx}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="checkbox"
                    checked={state()[colIdx][optIdx]}
                    onChange={() =>
                      colIdx === 0
                        ? autoToggleMain(colIdx, optIdx, !state()[colIdx][optIdx])
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

  const question = {
    text: '16. Did the review authors report any potential sources of conflict of interest, including any funding they received for conducting the review?',
    options: ['Yes', 'Partial Yes', 'No'],
    columns: [
      {
        label: 'For Yes:',
        options: [
          'The authors reported no competing interests OR',
          'The authors described their funding sources and how they managed potential conflicts of interest',
        ],
      },
      {
        label: '',
        options: ['Yes', 'No'],
      },
    ],
  };

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
          <div
            key={colIdx}
            className={colIdx === question.columns.length - 1 ? 'w-42 flex flex-col' : 'flex-1 flex flex-col'}
          >
            {/* Label */}
            <div className="font-medium text-gray-800 h-8">{col.label}</div>
            {/* Options */}
            <div className="flex flex-col gap-2">
              {col.options.map((option, optIdx) => (
                <label
                  key={optIdx}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="checkbox"
                    checked={state()[colIdx][optIdx]}
                    onChange={() =>
                      colIdx === 0
                        ? autoToggleYesNo(colIdx, optIdx, !state()[colIdx][optIdx])
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
