import * as XLSX from 'xlsx';

/**
 * Common data preparation for both Excel and CSV
 */
const prepareExportData = (data, columns) => {
  const headers = columns.map(col => String(col.headerName || col.field || ""));
  const rows = data.map(item => {
    return columns.map(col => {
      const field = col.field;
      const value = item[field];
      let formattedValue = value;

      try {
        // 1. Try valueGetter
        if (typeof col.valueGetter === 'function') {
          // Standard MUI DataGrid v5/v6/v7 expects a single params object
          // But our components are using (value, row). We'll try to be extremely flexible:
          formattedValue = col.valueGetter(value, item, col.field);
          
          // If they followed standard MUI (params) and we passed 'value' as the first arg, 
          // they might be getting '[object Object]' if they tried to access params.row.
          // BUT, looking at BookingReport.jsx, they use (value, row) => row.x
          // So passing (value, item) matches their signature.
        } 
        // 2. Try valueFormatter
        else if (typeof col.valueFormatter === 'function') {
          formattedValue = col.valueFormatter(value, item);
        }
      } catch (err) {
        console.warn(`Export formatting error for field ${field}:`, err);
        formattedValue = value;
      }

      // Ensure we return a primitive (string, number, or boolean)
      if (formattedValue === null || formattedValue === undefined) return "";
      if (typeof formattedValue === 'object') return String(formattedValue);
      return formattedValue;
    });
  });
  return { headers, rows };
};

/**
 * Advanced Excel Export with Auto-sizing and Formatted Numbers
 */
export const exportToExcel = ({ 
  fileName = 'report', 
  reportTitle = 'Report', 
  data = [], 
  columns = [], 
  summaryData = [] 
}) => {
  const { headers, rows } = prepareExportData(data, columns);
  const worksheetData = [];
  
  // 1. Layout Structure
  worksheetData.push([String(reportTitle).toUpperCase()]);
  worksheetData.push([]); 

  if (summaryData && summaryData.length > 0) {
    worksheetData.push(['REPORT SUMMARY']);
    summaryData.forEach(s => {
      worksheetData.push([String(s.label), s.value]);
    });
    worksheetData.push([]); 
  }

  worksheetData.push(headers);
  rows.forEach(row => worksheetData.push(row));

  // 2. Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(worksheetData);

  // 3. Auto-calculate column widths
  const colWidths = [];
  worksheetData.forEach(row => {
    row.forEach((cell, i) => {
      const cellLen = cell ? String(cell).length : 0;
      if (!colWidths[i] || colWidths[i] < cellLen) {
        colWidths[i] = cellLen;
      }
    });
  });
  ws['!cols'] = colWidths.map(w => ({ wch: Math.min(w + 5, 50) })); // Standard character width

  // 4. Apply Excel accounting/number formats
  Object.keys(ws).forEach(cell => {
    if (cell[0] === '!') return;
    let entry = ws[cell];
    if (!entry) return;
    
    const value = entry.v;
    if (typeof value === 'string') {
      // Currency detection
      if (value.startsWith('$')) {
        const numValue = parseFloat(value.replace(/[$,]/g, ''));
        if (!isNaN(numValue)) {
          entry.v = numValue;
          entry.t = 'n';
          entry.z = '$#,##0.00';
        }
      } 
      // Numeric string detection
      else if (value.trim() !== "" && !isNaN(value)) {
        entry.v = parseFloat(value);
        entry.t = 'n';
      }
    }
  });
  
  // 5. Create Workbook and save
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Report");
  XLSX.writeFile(wb, `${fileName}.xlsx`);
};

/**
 * Standard CSV Export
 */
export const exportToCSV = ({ 
  fileName = 'report', 
  data = [], 
  columns = [],
  summaryData = []
}) => {
  const { headers, rows } = prepareExportData(data, columns);
  let csvContent = "";

  if (summaryData && summaryData.length > 0) {
    summaryData.forEach(s => {
      csvContent += `"${String(s.label).replace(/"/g, '""')}","${String(s.value).replace(/"/g, '""')}"\n`;
    });
    csvContent += "\n";
  }

  csvContent += headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(",") + "\n";
  
  rows.forEach(row => {
    csvContent += row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(",") + "\n";
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${fileName}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
