import { toCSV, downloadCSV, exportToCSV } from './exportUtils';

// Mock document methods used in downloadCSV
beforeEach(() => {
  // Mock URL.createObjectURL and revokeObjectURL
  global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
  global.URL.revokeObjectURL = jest.fn();

  // Mock document.createElement for the anchor element
  const mockLink = {
    href: '',
    setAttribute: jest.fn(),
    click: jest.fn(),
  };
  jest.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink);
  jest.spyOn(document.body, 'removeChild').mockImplementation(() => {});
  jest.spyOn(document, 'createElement').mockReturnValue(mockLink);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('toCSV', () => {
  test('returns empty string for empty rows array', () => {
    expect(toCSV([])).toBe('');
  });

  test('returns empty string for null/undefined input', () => {
    expect(toCSV(null)).toBe('');
    expect(toCSV(undefined)).toBe('');
  });

  test('auto-detects columns from row keys', () => {
    const rows = [{ name: 'Alice', age: 30 }];
    const csv = toCSV(rows);
    expect(csv).toContain('"name"');
    expect(csv).toContain('"age"');
    expect(csv).toContain('"Alice"');
    expect(csv).toContain('"30"');
  });

  test('uses provided column definitions', () => {
    const rows = [{ patient_name: 'Bob', severity: 'High' }];
    const cols = [
      { key: 'patient_name', label: 'Patient Name' },
      { key: 'severity', label: 'Severity' },
    ];
    const csv = toCSV(rows, cols);
    expect(csv).toContain('"Patient Name"');
    expect(csv).toContain('"Severity"');
    expect(csv).toContain('"Bob"');
    expect(csv).toContain('"High"');
  });

  test('escapes double quotes in values', () => {
    const rows = [{ note: 'She said "hello"' }];
    const csv = toCSV(rows);
    expect(csv).toContain('She said ""hello""');
  });

  test('handles null/undefined field values as empty string', () => {
    const rows = [{ name: 'Alice', score: null, date: undefined }];
    const csv = toCSV(rows);
    expect(csv).toContain('"Alice"');
    // null and undefined become empty strings
    const lines = csv.split('\n');
    expect(lines[1]).toBe('"Alice","",""');
  });

  test('generates correct number of lines (header + rows)', () => {
    const rows = [
      { a: 1 },
      { a: 2 },
      { a: 3 },
    ];
    const csv = toCSV(rows);
    expect(csv.split('\n')).toHaveLength(4); // 1 header + 3 data rows
  });
});

describe('exportToCSV', () => {
  test('calls alert when rows array is empty', () => {
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    exportToCSV([], [], 'test-file');
    expect(alertMock).toHaveBeenCalledWith('No data available to export.');
    alertMock.mockRestore();
  });

  test('triggers download for non-empty data', () => {
    const rows = [{ condition: 'AMD', count: 10 }];
    const cols = [{ key: 'condition', label: 'Condition' }, { key: 'count', label: 'Count' }];
    exportToCSV(rows, cols, 'test-export');
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(document.createElement).toHaveBeenCalledWith('a');
  });
});
