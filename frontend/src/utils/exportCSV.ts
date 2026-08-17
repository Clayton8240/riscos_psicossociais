export function exportToCSV(filename: string, headers: string[], data: any[][]) {
  const csvContent = [
    headers.join(','), // Header row
    ...data.map(row => 
      row.map(cell => {
        const cellString = cell === null || cell === undefined ? '' : String(cell);
        // Escape quotes and wrap in quotes if there's a comma, quote, or newline
        if (cellString.includes(',') || cellString.includes('"') || cellString.includes('\n')) {
          return `"${cellString.replace(/"/g, '""')}"`;
        }
        return cellString;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
