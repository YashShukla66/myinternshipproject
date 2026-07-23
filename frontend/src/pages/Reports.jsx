import React from "react";
import { downloadVehiclePDF, downloadVehicleExcel } from "../services/reportService";
import { toast } from "react-toastify";
import { FaFilePdf, FaFileExcel, FaChartBar, FaDownload } from "react-icons/fa";

const Reports = () => {
  const handleDownload = async (downloadFn, filename) => {
    try {
      toast.info(`Generating ${filename}...`);
      const res = await downloadFn();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`${filename} downloaded successfully!`);
    } catch {
      toast.error("Download failed");
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
              Data Exports & Audits
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <FaChartBar className="text-indigo-400" /> Executive Reports
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Export comprehensive fleet manifests, vehicle maintenance logs, and financial records in PDF or Excel.
          </p>
        </div>
      </div>

      {/* Download Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PDF Card */}
        <div className="glass-card glass-card-hover p-8 rounded-3xl border border-slate-800 flex flex-col items-center text-center group">
          <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center text-4xl mb-6 shadow-inner group-hover:scale-110 transition-transform">
            <FaFilePdf />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Vehicle Manifest PDF</h2>
          <p className="text-xs text-slate-400 mb-8 leading-relaxed max-w-sm">
            Generate a high-resolution, printable PDF report listing all active vehicles, assigned drivers, and insurance expiry dates.
          </p>
          <button
            onClick={() => handleDownload(downloadVehiclePDF, "vehicles_report.pdf")}
            className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition active:scale-95"
          >
            <FaDownload /> Download PDF Document
          </button>
        </div>

        {/* Excel Card */}
        <div className="glass-card glass-card-hover p-8 rounded-3xl border border-slate-800 flex flex-col items-center text-center group">
          <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-4xl mb-6 shadow-inner group-hover:scale-110 transition-transform">
            <FaFileExcel />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Fleet Audit Spreadsheet (XLSX)</h2>
          <p className="text-xs text-slate-400 mb-8 leading-relaxed max-w-sm">
            Download full fleet telemetry in Microsoft Excel format for custom data analysis, accounting, and operational audits.
          </p>
          <button
            onClick={() => handleDownload(downloadVehicleExcel, "vehicles_report.xlsx")}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition active:scale-95"
          >
            <FaDownload /> Download Excel Sheet
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reports;