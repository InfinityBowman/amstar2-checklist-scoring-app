import { useState } from 'preact/hooks';

function Question1({ answer, onAnswerChange }) {
  const handleChange = (option) => {
    onAnswerChange(option);
  };

  const question = {
    text: '1. Did the research questions and inclusion criteria for the review include the components of PICO?',
    columns: [
      {
        label: 'For Yes:',
        description: '',
        options: ['Population', 'Intervention', 'Comparator group', 'Outcome'],
      },
      {
        label: 'Optional (recommended):',
        description: '',
        options: ['Timeframe for follow-up'],
      },
      {
        label: '',
        description: '',
        options: ['Yes', 'No'],
      },
    ],
  };

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
              {col.options.map((option) => (
                <label
                  key={option}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="checkbox"
                    onChange={() => handleChange(option)}
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

function Question2({ answer, onAnswerChange }) {
  const [checked, setChecked] = useState({
    Population: false,
    Intervention: false,
    'Comparator group': false,
    Outcome: false,
    'Timeframe for follow-up': false,
    Yes: false,
    No: false,
  });

  const handleChange = (option) => {
    setChecked((prev) => ({
      ...prev,
      [option]: !prev[option],
    }));
  };

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
              {col.options.map((option) => (
                <label
                  key={option}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="checkbox"
                    checked={checked[option]}
                    onChange={() => handleChange(option)}
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

function Question3({ answer, onAnswerChange }) {
  const [checked, setChecked] = useState({
    Population: false,
    Intervention: false,
    'Comparator group': false,
    Outcome: false,
    'Timeframe for follow-up': false,
    Yes: false,
    No: false,
  });

  const handleChange = (option) => {
    setChecked((prev) => ({
      ...prev,
      [option]: !prev[option],
    }));
  };

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
              {col.options.map((option) => (
                <label
                  key={option}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="checkbox"
                    checked={checked[option]}
                    onChange={() => handleChange(option)}
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

function Question4({ answer, onAnswerChange }) {
  const [checked, setChecked] = useState({
    Population: false,
    Intervention: false,
    'Comparator group': false,
    Outcome: false,
    'Timeframe for follow-up': false,
    Yes: false,
    No: false,
  });

  const handleChange = (option) => {
    setChecked((prev) => ({
      ...prev,
      [option]: !prev[option],
    }));
  };

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
              {col.options.map((option) => (
                <label
                  key={option}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="checkbox"
                    checked={checked[option]}
                    onChange={() => handleChange(option)}
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

function Question5({ answer, onAnswerChange }) {
  const [checked, setChecked] = useState({
    Population: false,
    Intervention: false,
    'Comparator group': false,
    Outcome: false,
    'Timeframe for follow-up': false,
    Yes: false,
    No: false,
  });

  const handleChange = (option) => {
    setChecked((prev) => ({
      ...prev,
      [option]: !prev[option],
    }));
  };

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
              {col.options.map((option) => (
                <label
                  key={option}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="checkbox"
                    checked={checked[option]}
                    onChange={() => handleChange(option)}
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

function Question6({ answer, onAnswerChange }) {
  const [checked, setChecked] = useState({
    Population: false,
    Intervention: false,
    'Comparator group': false,
    Outcome: false,
    'Timeframe for follow-up': false,
    Yes: false,
    No: false,
  });

  const handleChange = (option) => {
    setChecked((prev) => ({
      ...prev,
      [option]: !prev[option],
    }));
  };

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
              {col.options.map((option) => (
                <label
                  key={option}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="checkbox"
                    checked={checked[option]}
                    onChange={() => handleChange(option)}
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

function Question7({ answer, onAnswerChange }) {
  const [checked, setChecked] = useState({
    Population: false,
    Intervention: false,
    'Comparator group': false,
    Outcome: false,
    'Timeframe for follow-up': false,
    Yes: false,
    No: false,
  });

  const handleChange = (option) => {
    setChecked((prev) => ({
      ...prev,
      [option]: !prev[option],
    }));
  };

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
              {col.options.map((option) => (
                <label
                  key={option}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="checkbox"
                    checked={checked[option]}
                    onChange={() => handleChange(option)}
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

function Question8({ answer, onAnswerChange }) {
  const [checked, setChecked] = useState({
    Population: false,
    Intervention: false,
    'Comparator group': false,
    Outcome: false,
    'Timeframe for follow-up': false,
    Yes: false,
    No: false,
  });

  const handleChange = (option) => {
    setChecked((prev) => ({
      ...prev,
      [option]: !prev[option],
    }));
  };

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
              {col.options.map((option) => (
                <label
                  key={option}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="checkbox"
                    checked={checked[option]}
                    onChange={() => handleChange(option)}
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

function Question9({ answer, onAnswerChange }) {
  const [checked, setChecked] = useState({
    Population: false,
    Intervention: false,
    'Comparator group': false,
    Outcome: false,
    'Timeframe for follow-up': false,
    Yes: false,
    No: false,
  });

  const handleChange = (option) => {
    setChecked((prev) => ({
      ...prev,
      [option]: !prev[option],
    }));
  };

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
              {col.options.map((option) => (
                <label
                  key={option}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="checkbox"
                    checked={checked[option]}
                    onChange={() => handleChange(option)}
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
              {col.options.map((option) => (
                <label
                  key={option}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="checkbox"
                    checked={checked[option]}
                    onChange={() => handleChange(option)}
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

function Question10({ answer, onAnswerChange }) {
  const [checked, setChecked] = useState({
    Population: false,
    Intervention: false,
    'Comparator group': false,
    Outcome: false,
    'Timeframe for follow-up': false,
    Yes: false,
    No: false,
  });

  const handleChange = (option) => {
    setChecked((prev) => ({
      ...prev,
      [option]: !prev[option],
    }));
  };

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
              {col.options.map((option) => (
                <label
                  key={option}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="checkbox"
                    checked={checked[option]}
                    onChange={() => handleChange(option)}
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

function Question11({ answer, onAnswerChange }) {
  const [checked, setChecked] = useState({
    Population: false,
    Intervention: false,
    'Comparator group': false,
    Outcome: false,
    'Timeframe for follow-up': false,
    Yes: false,
    No: false,
  });

  const handleChange = (option) => {
    setChecked((prev) => ({
      ...prev,
      [option]: !prev[option],
    }));
  };

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
    columns: [
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
              {col.options.map((option) => (
                <label
                  key={option}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="checkbox"
                    checked={checked[option]}
                    onChange={() => handleChange(option)}
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

function Question12({ answer, onAnswerChange }) {
  const [checked, setChecked] = useState({
    Population: false,
    Intervention: false,
    'Comparator group': false,
    Outcome: false,
    'Timeframe for follow-up': false,
    Yes: false,
    No: false,
  });

  const handleChange = (option) => {
    setChecked((prev) => ({
      ...prev,
      [option]: !prev[option],
    }));
  };

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
              {col.options.map((option) => (
                <label
                  key={option}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="checkbox"
                    checked={checked[option]}
                    onChange={() => handleChange(option)}
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

function Question13({ answer, onAnswerChange }) {
  const [checked, setChecked] = useState({
    Population: false,
    Intervention: false,
    'Comparator group': false,
    Outcome: false,
    'Timeframe for follow-up': false,
    Yes: false,
    No: false,
  });

  const handleChange = (option) => {
    setChecked((prev) => ({
      ...prev,
      [option]: !prev[option],
    }));
  };

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
              {col.options.map((option) => (
                <label
                  key={option}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="checkbox"
                    checked={checked[option]}
                    onChange={() => handleChange(option)}
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

function Question14({ answer, onAnswerChange }) {
  const [checked, setChecked] = useState({
    Population: false,
    Intervention: false,
    'Comparator group': false,
    Outcome: false,
    'Timeframe for follow-up': false,
    Yes: false,
    No: false,
  });

  const handleChange = (option) => {
    setChecked((prev) => ({
      ...prev,
      [option]: !prev[option],
    }));
  };

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
              {col.options.map((option) => (
                <label
                  key={option}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="checkbox"
                    checked={checked[option]}
                    onChange={() => handleChange(option)}
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

function Question15({ answer, onAnswerChange }) {
  const [checked, setChecked] = useState({
    Population: false,
    Intervention: false,
    'Comparator group': false,
    Outcome: false,
    'Timeframe for follow-up': false,
    Yes: false,
    No: false,
  });

  const handleChange = (option) => {
    setChecked((prev) => ({
      ...prev,
      [option]: !prev[option],
    }));
  };

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
              {col.options.map((option) => (
                <label
                  key={option}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="checkbox"
                    checked={checked[option]}
                    onChange={() => handleChange(option)}
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

function Question16({ answer, onAnswerChange }) {
  const [checked, setChecked] = useState({
    Population: false,
    Intervention: false,
    'Comparator group': false,
    Outcome: false,
    'Timeframe for follow-up': false,
    Yes: false,
    No: false,
  });

  const handleChange = (option) => {
    setChecked((prev) => ({
      ...prev,
      [option]: !prev[option],
    }));
  };

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
              {col.options.map((option) => (
                <label
                  key={option}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="checkbox"
                    checked={checked[option]}
                    onChange={() => handleChange(option)}
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

function scoreChecklist() {
  const criticalItems = [1, 3, 6, 8, 9, 11, 13];
  let criticalFlaws = 0;
  let nonCriticalFlaws = 0;

  answers.forEach((val, i) => {
    if (val !== 'Yes') {
      if (criticalItems.includes(i)) {
        criticalFlaws++;
      } else {
        nonCriticalFlaws++;
      }
    }
  });

  if (criticalFlaws > 1) return 'Critically Low';
  if (criticalFlaws === 1) return 'Low';
  if (nonCriticalFlaws > 1) return 'Moderate';
  return 'High';
}

export default function AMSTAR2Checklist() {
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [reviewDate, setReviewDate] = useState('');
  const [answers, setAnswers] = useState(Array(16).fill(''));

  function scoreChecklist() {
    const criticalItems = [1, 3, 6, 8, 9, 11, 13];
    let criticalFlaws = 0;
    let nonCriticalFlaws = 0;

    answers.forEach((val, i) => {
      if (val !== 'Yes') {
        if (criticalItems.includes(i)) {
          criticalFlaws++;
        } else {
          nonCriticalFlaws++;
        }
      }
    });

    if (criticalFlaws > 1) return 'Critically Low';
    if (criticalFlaws === 1) return 'Low';
    if (nonCriticalFlaws > 1) return 'Moderate';
    return 'High';
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AMSTAR 2 Critical Appraisal Tool</h1>
          <p className="text-gray-600 mb-6">
            A critical appraisal tool for systematic reviews that include randomised or non-randomised studies of healthcare interventions,
            or both
          </p>

          {/* Review Details */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Review Title</label>
              <input
                type="text"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter review title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reviewer Name</label>
              <input
                type="text"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Review Date</label>
              <input
                type="date"
                value={reviewDate}
                onChange={(e) => setReviewDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-6">
          <Question1
            answer={answers[0]}
            onAnswerChange={(val) => {
              const newAnswers = [...answers];
              newAnswers[0] = val;
              setAnswers(newAnswers);
            }}
          />
          <Question2
            answer={answers[1]}
            onAnswerChange={(val) => {
              const newAnswers = [...answers];
              newAnswers[1] = val;
              setAnswers(newAnswers);
            }}
          />
          <Question3
            answer={answers[2]}
            onAnswerChange={(val) => {
              const newAnswers = [...answers];
              newAnswers[2] = val;
              setAnswers(newAnswers);
            }}
          />
          <Question4
            answer={answers[3]}
            onAnswerChange={(val) => {
              const newAnswers = [...answers];
              newAnswers[3] = val;
              setAnswers(newAnswers);
            }}
          />
          <Question5
            answer={answers[4]}
            onAnswerChange={(val) => {
              const newAnswers = [...answers];
              newAnswers[4] = val;
              setAnswers(newAnswers);
            }}
          />
          <Question6
            answer={answers[5]}
            onAnswerChange={(val) => {
              const newAnswers = [...answers];
              newAnswers[5] = val;
              setAnswers(newAnswers);
            }}
          />
          <Question7
            answer={answers[6]}
            onAnswerChange={(val) => {
              const newAnswers = [...answers];
              newAnswers[6] = val;
              setAnswers(newAnswers);
            }}
          />
          <Question8
            answer={answers[7]}
            onAnswerChange={(val) => {
              const newAnswers = [...answers];
              newAnswers[7] = val;
              setAnswers(newAnswers);
            }}
          />
          <Question9
            answer={answers[8]}
            onAnswerChange={(val) => {
              const newAnswers = [...answers];
              newAnswers[8] = val;
              setAnswers(newAnswers);
            }}
          />
          <Question10
            answer={answers[9]}
            onAnswerChange={(val) => {
              const newAnswers = [...answers];
              newAnswers[9] = val;
              setAnswers(newAnswers);
            }}
          />
          <Question11
            answer={answers[10]}
            onAnswerChange={(val) => {
              const newAnswers = [...answers];
              newAnswers[10] = val;
              setAnswers(newAnswers);
            }}
          />
          <Question12
            answer={answers[11]}
            onAnswerChange={(val) => {
              const newAnswers = [...answers];
              newAnswers[11] = val;
              setAnswers(newAnswers);
            }}
          />
          <Question13
            answer={answers[12]}
            onAnswerChange={(val) => {
              const newAnswers = [...answers];
              newAnswers[12] = val;
              setAnswers(newAnswers);
            }}
          />
          <Question14
            answer={answers[13]}
            onAnswerChange={(val) => {
              const newAnswers = [...answers];
              newAnswers[13] = val;
              setAnswers(newAnswers);
            }}
          />
          <Question15
            answer={answers[14]}
            onAnswerChange={(val) => {
              const newAnswers = [...answers];
              newAnswers[14] = val;
              setAnswers(newAnswers);
            }}
          />
          <Question16
            answer={answers[15]}
            onAnswerChange={(val) => {
              const newAnswers = [...answers];
              newAnswers[15] = val;
              setAnswers(newAnswers);
            }}
          />
        </div>

        {/* Export Button */}
        <div className="mt-8 text-center">
          <button
            // onClick={exportToPDF}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transition-colors duration-200 inline-flex items-center space-x-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span>Export as PDF</span>
          </button>
        </div>

        {/* Citation */}
        {/* <div className="mt-12 bg-gray-50 rounded-lg p-6">
          <h4 className="font-semibold text-gray-900 mb-2">Citation</h4>
          <p className="text-sm text-gray-600 italic">
            To cite this tool: Shea BJ, Reeves BC, Wells G, Thuku M, Hamel C, Moran J, Moher D, Tugwell P, Welch V, Kristjansson E, Henry
            DA. AMSTAR 2: a critical appraisal tool for systematic reviews that include randomised or non-randomised studies of healthcare
            interventions, or both. BMJ. 2017 Sep 21;358:j4008.
          </p>
        </div> */}
      </div>
    </div>
  );
}
