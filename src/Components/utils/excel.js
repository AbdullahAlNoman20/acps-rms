import * as XLSX from "xlsx";

export function exportRows(filename, rows, sheet = "Sheet1") {
  const ws = XLSX.utils.json_to_sheet(rows.length ? rows : [{ Note: "No data" }]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheet.slice(0, 30));
  XLSX.writeFile(wb, filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`);
}

// Reads .xlsx / .xls / .csv / .json and returns an array of row objects.
export async function readRows(file) {
  if (file.name.toLowerCase().endsWith(".json")) {
    const data = JSON.parse(await file.text());
    return Array.isArray(data) ? data : data.students || data.items || [];
  }
  const wb = XLSX.read(await file.arrayBuffer(), { type: "array" });
  return XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: "" });
}

export function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = filename; a.click();
  URL.revokeObjectURL(a.href);
}
