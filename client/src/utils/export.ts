import * as XLSX from 'xlsx';
import dayjs from '../config/dayjs';

/**
 * Export data to Excel file
 * @param data Array of objects to export
 * @param filename Base filename (without extension and date)
 * @param sheetName Name of the Excel sheet
 * @param includeDateTime Whether to include date time in filename (format: filename_YYYYMMDD_HHmmss)
 */
export const exportToExcel = (
  data: any[],
  filename: string,
  sheetName: string = 'Sheet1',
  includeDateTime: boolean = false
) => {
  if (!data || data.length === 0) {
    alert('Không có dữ liệu để xuất');
    return;
  }

  // Create workbook and worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Generate filename with date time if needed
  let finalFilename = filename;
  if (includeDateTime) {
    const dateTime = dayjs().format('YYYYMMDD_HHmmss');
    finalFilename = `${filename}_${dateTime}`;
  }

  // Write file
  XLSX.writeFile(workbook, `${finalFilename}.xlsx`);
};

/**
 * Export data to CSV file
 * @param data Array of objects to export
 * @param filename Base filename (without extension and date)
 * @param includeDateTime Whether to include date time in filename
 */
export const exportToCSV = (
  data: any[],
  filename: string,
  includeDateTime: boolean = false
) => {
  if (!data || data.length === 0) {
    alert('Không có dữ liệu để xuất');
    return;
  }

  // Convert to CSV
  const worksheet = XLSX.utils.json_to_sheet(data);
  const csv = XLSX.utils.sheet_to_csv(worksheet);

  // Generate filename with date time if needed
  let finalFilename = filename;
  if (includeDateTime) {
    const dateTime = dayjs().format('YYYYMMDD_HHmmss');
    finalFilename = `${filename}_${dateTime}`;
  }

  // Create blob and download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${finalFilename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

