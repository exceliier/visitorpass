import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

/**
 * Helper function to get computed styles from a DOM element.
 * @param {HTMLElement} element - The DOM element to extract styles from.
 * @returns {object} - An object containing the relevant styles.
 */
const getComputedStyles = (element: HTMLElement) => {
  const styles = window.getComputedStyle(element);

  return {
    font: {
      name: 'DVOT-Surekh', // Corrected font name
      size: 11, // Set font size to 11
      bold: styles.fontWeight === 'bold' || parseInt(styles.fontWeight, 10) >= 700,
      italic: styles.fontStyle === 'italic',
    },
    alignment: {
      horizontal: styles.textAlign as ExcelJS.Alignment['horizontal'] || 'center',
      vertical: styles.verticalAlign as ExcelJS.Alignment['vertical'] || 'middle',
      wrapText: false, // Enable text wrapping
    },
    fill: {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFFF' }, // Override background color to white
    },
    // Borders will be overridden in the export logic
  };
};

/**
 * Generalized function to export a DOM table to an Excel file, handling page breaks and skipping "no-print" cells.
 * @param {string} tableId - The ID of the DOM table to export.
 * @param {string} fileName - The name of the exported Excel file.
 * @param {string} [defaultFont] - The font to use for all cells (e.g., "DVOT-Surekh").
 * @param {string} [title] - The title to add at the top of the Excel file.
 */
export const exportTableToExcel = async (
  tableId: string,
  fileName: string = 'ExportedTable.xlsx',
  defaultFont: string = 'DVOT-Surekh', // Default font if none is specified
  title: string = 'Report Title' // Default title
) => {
  const table = document.getElementById(tableId);
  if (!table) {
    console.error(`Table with ID "${tableId}" not found.`);
    return;
  }

  // Create a new workbook and worksheet
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sheet1');

  // Add title row
  const firstRow = table.querySelector('tr:first-child');
  const columnCount = Array.from(firstRow?.children || [])
    .reduce((count, cell) => count + parseInt(cell.getAttribute('colspan') || '1', 10), 0);
  const titleRow = worksheet.addRow([title]);
  titleRow.font = { name: defaultFont, size: 14, bold: true }; // Bold and font size 14
  titleRow.alignment = { horizontal: 'center', vertical: 'middle' }; // Centered alignment
  worksheet.mergeCells(1, 1, 1, columnCount); // Merge across all columns
  titleRow.border = {}; // No borders

  // Process each row in the table
  const rows = Array.from(table.querySelectorAll('tr'));
  rows.forEach((tr, rowIndex) => {
    const cells = Array.from(tr.children);
    const excelRow = worksheet.addRow([]);
    cells.forEach((cell, colIndex) => {
      // Skip cells or elements with the "no-print" class
      // if (cell.closest('.no-print')) {
      //   return; // Skip this cell
      // }

      const value = cell.textContent || '';
      const colspan = parseInt(cell.getAttribute('colspan') || '1', 10);
      const rowspan = parseInt(cell.getAttribute('rowspan') || '1', 10);

      // Add value to the cell
      const excelCell = worksheet.getCell(rowIndex + 2, colIndex + 1); // Start from row 2 (row 1 is the title)
      if (cell.closest('.no-print')) {
        excelCell.value = ""      
      }else{
        excelCell.value = value;
      }

      // Extract and apply styles
      const styles = getComputedStyles(cell as HTMLElement);
      excelCell.font = {
        name: defaultFont || styles.font.name, // Use default font if provided
        size: styles.font.size,
        bold: styles.font.bold,
        italic: styles.font.italic,
      };
      excelCell.alignment = styles.alignment;
      excelCell.fill = styles.fill;

      // Override borders
      excelCell.border = {
        top: { style: 'hair' }, // Horizontal border: dotted
        bottom: { style: 'hair' }, // Horizontal border: dotted
        left: { style: 'thin' }, // Vertical border: thin
        right: { style: 'thin' }, // Vertical border: thin
      };

      // Handle merged cells
      if (colspan > 1 || rowspan > 1) {
        worksheet.mergeCells(
          rowIndex + 2,
          colIndex + 1,
          rowIndex + rowspan + 1,
          colIndex + colspan
        );
      }
    });
  });

  // Align table header row to center
  const headerRow = worksheet.getRow(2); // Assuming the first row after the title is the header
  headerRow.eachCell((cell) => {
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = {
      top: { style: 'thin' }, // Horizontal border: hairline
      bottom: { style: 'thin' }, // Horizontal border: hairline
      left: { style: 'thin' }, // Vertical border: thin
      right: { style: 'thin' }, // Vertical border: thin
    };
  });

  // Repeat table header row on each page
  worksheet.pageSetup.printTitlesRow = '2:2'; // Repeat the second row (header row) on each page

  // Save the workbook as a file
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), fileName);
};