/**
 * Export utilities for PreciseOptics reports
 * Provides CSV download without external dependencies
 */

/**
 * Convert an array of objects to a CSV string
 * @param {Array} rows - Array of plain objects
 * @param {Array} columns - [{key, label}] column definitions (optional, auto-detected if omitted)
 * @returns {string} CSV string
 */
export function toCSV(rows, columns) {
  if (!rows || rows.length === 0) return '';

  const cols = columns || Object.keys(rows[0]).map(k => ({ key: k, label: k }));
  const header = cols.map(c => `"${c.label}"`).join(',');
  const body = rows.map(row =>
    cols.map(c => {
      const val = row[c.key] ?? '';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    }).join(',')
  );

  return [header, ...body].join('\n');
}

/**
 * Trigger a browser CSV download
 * @param {string} csvContent - CSV string
 * @param {string} filename - filename without extension
 */
export function downloadCSV(csvContent, filename) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export a dataset as CSV file
 * @param {Array} rows - Data rows
 * @param {Array} columns - [{key, label}] column definitions (optional)
 * @param {string} filename - filename without extension
 */
export function exportToCSV(rows, columns, filename) {
  const csv = toCSV(rows, columns);
  if (!csv) {
    alert('No data available to export.');
    return;
  }
  downloadCSV(csv, filename);
}
