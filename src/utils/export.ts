import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export interface ExportOptions {
  filename?: string;
  columns?: string[];
  format: "csv" | "excel" | "pdf";
  includeHeaders?: boolean;
  data: any[];
}

export interface ColumnDefinition {
  key: string;
  title: string;
  visible?: boolean;
  formatter?: (value: any, row: any) => string;
}

/**
 * Export data to CSV format
 */
export function exportToCSV(
  data: any[],
  columns: ColumnDefinition[],
  filename: string = "data",
): void {
  try {
    // Filter visible columns and get headers
    const visibleColumns = columns.filter((col) => col.visible !== false);
    const headers = visibleColumns.map((col) => col.title);

    // Convert data to CSV rows
    const csvRows = data.map((row) => {
      return visibleColumns.map((col) => {
        let value = row[col.key];

        // Apply formatter if provided
        if (col.formatter) {
          value = col.formatter(value, row);
        }

        // Handle special characters and commas
        if (
          typeof value === "string" &&
          (value.includes(",") || value.includes('"') || value.includes("\n"))
        ) {
          value = `"${value.replace(/"/g, '""')}"`;
        }

        return value ?? "";
      });
    });

    // Combine headers and rows
    const csvContent = [headers, ...csvRows]
      .map((row) => row.join(","))
      .join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const fullFilename = `${filename}_${getTimestamp()}.csv`;
    saveAs(blob, fullFilename);
  } catch (error) {
    console.error("CSV export failed:", error);
    throw new Error("Failed to export CSV file");
  }
}

/**
 * Export data to Excel format
 */
export async function exportToExcel(
  data: any[],
  columns: ColumnDefinition[],
  filename: string = "data",
): Promise<void> {
  try {
    // Filter visible columns
    const visibleColumns = columns.filter((col) => col.visible !== false);

    // Prepare worksheet data
    const headers = visibleColumns.map((col) => col.title);
    const worksheetData = data.map((row) => {
      const rowData: any = {};
      visibleColumns.forEach((col) => {
        let value = row[col.key];

        // Apply formatter if provided
        if (col.formatter) {
          value = col.formatter(value, row);
        }

        rowData[col.title] = value ?? "";
      });
      return rowData;
    });

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);

    // Set column widths based on content
    const colWidths = visibleColumns.map((col) => ({
      wch: Math.max(
        col.title.length,
        ...data.map((row) => {
          let value = row[col.key];
          if (col.formatter) {
            value = col.formatter(value, row);
          }
          return String(value ?? "").length;
        }),
      ),
    }));
    worksheet["!cols"] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

    // Generate and download file
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const fullFilename = `${filename}_${getTimestamp()}.xlsx`;
    saveAs(blob, fullFilename);
  } catch (error) {
    console.error("Excel export failed:", error);
    throw new Error("Failed to export Excel file");
  }
}

/**
 * Export table to PDF format
 */
export async function exportToPDF(
  tableElement: HTMLElement,
  filename: string = "data",
  title: string = "Export",
): Promise<void> {
  try {
    // Create canvas from table element
    const canvas = await html2canvas(tableElement, {
      scale: 2,
      useCORS: true,
      logging: false,
    });

    // Create PDF
    const pdf = new jsPDF("landscape", "mm", "a4");
    const imgWidth = 290;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Add title
    pdf.setFontSize(16);
    pdf.text(title, 14, 15);

    // Add date
    pdf.setFontSize(10);
    pdf.text(`Exported on: ${new Date().toLocaleDateString()}`, 14, 22);

    // Add image
    const imgData = canvas.toDataURL("image/png");
    pdf.addImage(imgData, "PNG", 10, 30, imgWidth, imgHeight);

    // Download PDF
    const fullFilename = `${filename}_${getTimestamp()}.pdf`;
    pdf.save(fullFilename);
  } catch (error) {
    console.error("PDF export failed:", error);
    throw new Error("Failed to export PDF file");
  }
}

/**
 * Export selected rows only
 */
export function exportSelectedRows(
  data: any[],
  selectedRows: any[],
  columns: ColumnDefinition[],
  format: "csv" | "excel",
  filename: string = "data",
): void {
  const rowsToExport = selectedRows.length > 0 ? selectedRows : data;
  const exportFilename =
    selectedRows.length > 0 ? `${filename}_selected` : filename;

  if (format === "csv") {
    exportToCSV(rowsToExport, columns, exportFilename);
  } else {
    exportToExcel(rowsToExport, columns, exportFilename);
  }
}

/**
 * Get formatted timestamp for filenames
 */
function getTimestamp(): string {
  const now = new Date();
  return (
    now.toISOString().split("T")[0] + "_" + now.getTime().toString().slice(-6)
  );
}

/**
 * Format date for export
 */
export function formatDateForExport(dateString: string): string {
  if (!dateString) return "";

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}

/**
 * Format status for export
 */
export function formatStatusForExport(status: string): string {
  const statusMap: Record<string, string> = {
    active: "Active",
    inactive: "Inactive",
    pending: "Pending",
    completed: "Completed",
  };
  return statusMap[status] || status;
}
