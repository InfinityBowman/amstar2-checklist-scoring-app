export function ExportChecklist(state) {
  const flat = typeof state.exportFlat === 'function' ? state.exportFlat() : state;

  let titleRow = [];
  if (flat.title) {
    titleRow = [['Title', `${String(flat.title).replace(/"/g, '""')}`]];
    delete flat.title;
  }

  const maxAnswers = Math.max(...Object.values(flat).map((arr) => (Array.isArray(arr) ? arr.length : 0)));

  // Prepare CSV header: Question, A1, A2, ...
  const header = ['Question'];
  for (let i = 1; i <= maxAnswers; i++) {
    header.push(`A${i}`);
  }

  // Prepare CSV rows
  const rows = [header];
  Object.entries(flat).forEach(([question, answers]) => {
    const padded = Array.isArray(answers) ? [...answers, ...Array(maxAnswers - answers.length).fill('')] : [];
    rows.push([question, ...padded]);
  });

  const allRows = titleRow.length ? [...titleRow, [], ...rows] : rows;
  const csv = allRows.map((row) => row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(',')).join('\r\n');

  // Download as file
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'checklist.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function ImportChecklist(csvString) {
  const lines = csvString.split(/\r?\n/).filter((line) => line.trim() !== '');
  let flat = {};
  let header = [];
  let title = null;

  for (let i = 0; i < lines.length; i++) {
    const row = lines[i].split(',').map((cell) => cell.replace(/^"|"$/g, '').replace(/""/g, '"'));
    if (row[0] === 'Title') {
      title = row[1];
    } else if (row[0] === 'Question') {
      header = row;
    } else if (/^q\d+[a-z]*$/i.test(row[0])) {
      flat[row[0]] = row
        .slice(1)
        .filter((x) => x !== '')
        .map((x) => (x === '1' ? '1' : '0'));
    }
  }
  if (title) flat.title = title;
  return flat;
}
