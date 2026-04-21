"use client";
import React, { useRef, useState } from "react";
import * as XLSX from "xlsx";
import { DownloadCloud, UploadCloud, Loader2, FileSpreadsheet } from "lucide-react";
import toast from "react-hot-toast";

export default function DataExportImport({ 
  title = "Records", 
  data = [], 
  exportMapping = {}, 
  onImport = async (parsedData) => {}, 
  isLoading = false 
}) {
  const fileInputRef = useRef(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });

  // Handle Export with specified mapping
  const handleExport = () => {
    if (!data || data.length === 0) {
      toast.error("No data available to export.", {
        style: { borderRadius: '16px', background: '#333', color: '#fff', fontSize: '12px', fontWeight: 'bold' },
      });
      return;
    }

    try {
      const exportData = data.map((item) => {
        let mappedItem = {};
        if (typeof exportMapping === 'function') {
           mappedItem = exportMapping(item);
        } else if (Object.keys(exportMapping).length > 0) {
          for (const key in exportMapping) {
            mappedItem[exportMapping[key]] = item[key];
          }
        } else {
          mappedItem = { ...item };
        }
        return mappedItem;
      });

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, title);
      XLSX.writeFile(workbook, `${title}_Export_${new Date().toISOString().split("T")[0]}.xlsx`);

      toast.success(`${title} exported successfully!`, {
        style: { borderRadius: '16px', background: '#1e293b', color: '#fff', fontSize: '11px', fontWeight: 'bold' },
        iconTheme: { primary: '#22c55e', secondary: '#fff' }
      });
    } catch (error) {
      console.error("Export error:", error);
      toast.error("An error occurred during export.");
    }
  };

  // Handle Import
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // reset input so the same file can be re-selected later
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }

    // Pre-flight type check. The <input accept> attribute is advisory only —
    // users can still pick an image via the "All files" filter, and passing a
    // PNG to xlsx throws a cryptic "not a spreadsheet" error inside readSync.
    // Reject anything that isn't a known spreadsheet before we even read it.
    const ALLOWED_EXT = ["xlsx", "xls", "csv", "ods"];
    const ALLOWED_MIME = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
      "application/csv",
      "application/vnd.oasis.opendocument.spreadsheet",
    ];
    const ext = (file.name.split(".").pop() || "").toLowerCase();
    const mimeLooksOk = file.type === "" || ALLOWED_MIME.includes(file.type);
    if (!ALLOWED_EXT.includes(ext) || !mimeLooksOk) {
      toast.error(
        `“${file.name}” isn't a spreadsheet. Please upload a .xlsx, .xls, or .csv file.`,
        { style: { borderRadius: '16px', background: '#7f1d1d', color: '#fff', fontSize: '11px', fontWeight: 'bold' } }
      );
      return;
    }

    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const binaryStr = event.target.result;
        let workbook;
        try {
          workbook = XLSX.read(binaryStr, { type: "binary" });
        } catch (parseErr) {
          console.error("Spreadsheet parse error:", parseErr);
          throw new Error("This file couldn't be read as a spreadsheet. Make sure it's a valid .xlsx, .xls, or .csv file.");
        }
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const parsedData = XLSX.utils.sheet_to_json(worksheet);

        if (parsedData.length === 0) {
          toast.error("The selected spreadsheet is empty.");
          return;
        }

        setIsImporting(true);
        setImportProgress({ current: 0, total: parsedData.length });

        toast.loading(`Importing ${parsedData.length} records...`, { id: "import-toast" });

        // User provided onImport logic
        await onImport(parsedData, (currentIndex) => {
            setImportProgress({ current: currentIndex, total: parsedData.length });
        });

        toast.success(`Successfully imported ${parsedData.length} records!`, { id: "import-toast" });
      } catch (error) {
        console.error("Import error:", error);
        toast.error(error.message || "Failed to process the spreadsheet.", { id: "import-toast" });
      } finally {
        setIsImporting(false);
        setImportProgress({ current: 0, total: 0 });
      }
    };

    reader.onerror = () => {
      toast.error("Error reading file.");
    };

    reader.readAsBinaryString(file);
  };

  return (
    <div className="flex items-center gap-3">
      {/* Hidden File Input */}
      <input
        type="file"
        accept=".xlsx, .xls, .csv"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileUpload}
      />

      {/* Upload Button */}
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isLoading || isImporting}
        className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border-2 border-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50"
      >
        {isImporting ? <Loader2 size={15} className="animate-spin text-emerald-500" /> : <UploadCloud size={15} className="text-emerald-500" />}
        {isImporting ? `Importing (${importProgress.current}/${importProgress.total})` : "Import Excel"}
      </button>

      {/* Export Button */}
      <button
        onClick={handleExport}
        disabled={isLoading || isImporting || !data || data.length === 0}
        className="flex items-center gap-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border-2 border-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50"
      >
        <FileSpreadsheet size={15} />
        Export Excel
      </button>
    </div>
  );
}
