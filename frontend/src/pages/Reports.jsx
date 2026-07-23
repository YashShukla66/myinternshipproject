import React from "react";
import {
  downloadVehiclePDF,
  downloadVehicleExcel,
  downloadAIPredictionPDF,
  downloadAIPredictionExcel,
} from "../services/reportService";
import { toast } from "react-toastify";
import { FaFilePdf, FaFileExcel, FaChartBar, FaDownload, FaRobot, FaBrain, FaShieldAlt } from "react-icons/fa";

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
    } catch (error) {
      toast.error("Download failed. Please check network connection.");
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider flex items-center gap-1">
              <FaShieldAlt className="text-indigo-400" /> Data Exports & Audits
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <FaChartBar className="text-indigo-400" /> Executive Reports & AI Intelligence
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Export comprehensive fleet manifests, machine learning predictive telemetry, and maintenance risk audits in PDF or Excel formats.
          </p>
        </div>
      </div>

      {/* AI & Predictive Intelligence Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <FaBrain className="text-purple-400 text-lg" />
          <h2 className="text-lg font-bold text-white tracking-tight">AI Predictive Maintenance Reports</h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">
            ML v2 Powered
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* AI PDF Report Card */}
          <div className="glass-card glass-card-hover p-8 rounded-3xl border border-purple-500/20 bg-gradient-to-b from-purple-950/20 to-slate-900/90 flex flex-col items-center text-center group relative overflow-hidden">
            <div className="w-20 h-20 rounded-3xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center text-4xl mb-6 shadow-inner group-hover:scale-110 transition-transform">
              <FaRobot />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">AI Maintenance Prediction PDF Report</h3>
            <p className="text-xs text-slate-400 mb-8 leading-relaxed max-w-sm">
              Download an executive PDF report containing fleet health probability scores, failure risk tier distribution, and actionable maintenance recommendations for all vehicles.
            </p>
            <button
              onClick={() => handleDownload(downloadAIPredictionPDF, "ai_predictive_maintenance_report.pdf")}
              className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition active:scale-95"
            >
              <FaDownload /> Download AI Prediction PDF
            </button>
          </div>

          {/* AI Excel Report Card */}
          <div className="glass-card glass-card-hover p-8 rounded-3xl border border-indigo-500/20 bg-gradient-to-b from-indigo-950/20 to-slate-900/90 flex flex-col items-center text-center group relative overflow-hidden">
            <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center text-4xl mb-6 shadow-inner group-hover:scale-110 transition-transform">
              <FaFileExcel />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">AI Maintenance Audit Spreadsheet (XLSX)</h3>
            <p className="text-xs text-slate-400 mb-8 leading-relaxed max-w-sm">
              Download an exhaustive Excel audit sheet detailing multi-feature telemetry (mileage, service gap, trip distance, failure risk probability %, risk classification, and estimated service costs).
            </p>
            <button
              onClick={() => handleDownload(downloadAIPredictionExcel, "ai_predictive_maintenance_audit.xlsx")}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition active:scale-95"
            >
              <FaDownload /> Download AI Audit Excel Sheet
            </button>
          </div>
        </div>
      </div>

      {/* Standard Fleet Manifest Reports Section */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <FaChartBar className="text-slate-400 text-lg" />
          <h2 className="text-lg font-bold text-white tracking-tight">Standard Fleet Operations Reports</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* PDF Card */}
          <div className="glass-card glass-card-hover p-8 rounded-3xl border border-slate-800 flex flex-col items-center text-center group">
            <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center text-4xl mb-6 shadow-inner group-hover:scale-110 transition-transform">
              <FaFilePdf />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Vehicle Manifest PDF</h3>
            <p className="text-xs text-slate-400 mb-8 leading-relaxed max-w-sm">
              Generate a printable PDF report listing all active fleet vehicles, assigned drivers, registration numbers, and insurance expiry dates.
            </p>
            <button
              onClick={() => handleDownload(downloadVehiclePDF, "vehicles_manifest_report.pdf")}
              className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition active:scale-95"
            >
              <FaDownload /> Download Manifest PDF
            </button>
          </div>

          {/* Excel Card */}
          <div className="glass-card glass-card-hover p-8 rounded-3xl border border-slate-800 flex flex-col items-center text-center group">
            <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-4xl mb-6 shadow-inner group-hover:scale-110 transition-transform">
              <FaFileExcel />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Fleet Roster Spreadsheet (XLSX)</h3>
            <p className="text-xs text-slate-400 mb-8 leading-relaxed max-w-sm">
              Export complete fleet telemetry records to Microsoft Excel format for operational analysis, accounting, and registration management.
            </p>
            <button
              onClick={() => handleDownload(downloadVehicleExcel, "vehicles_manifest_report.xlsx")}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition active:scale-95"
            >
              <FaDownload /> Download Manifest Excel Sheet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;