import React, { useState, useEffect } from "react";
import { predictByParams, predictByVehicle } from "../services/predictionService";
import { getVehicles } from "../services/vehicleService";
import { downloadAIPredictionPDF, downloadAIPredictionExcel } from "../services/reportService";
import { toast } from "react-toastify";
import {
  FaRobot,
  FaBrain,
  FaExclamationTriangle,
  FaCheckCircle,
  FaSearch,
  FaBolt,
  FaInfoCircle,
  FaDownload,
  FaFilePdf,
  FaFileExcel,
  FaTools,
  FaDollarSign,
  FaTachometerAlt
} from "react-icons/fa";

const Prediction = () => {
  const [vehicles, setVehicles] = useState([]);
  const [paramsData, setParamsData] = useState({ mileage: "", year: "" });
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [paramsResult, setParamsResult] = useState(null);
  const [vehicleResult, setVehicleResult] = useState(null);
  const [loadingParams, setLoadingParams] = useState(false);
  const [loadingVehicle, setLoadingVehicle] = useState(false);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const res = await getVehicles({});
      setVehicles(res.data.results || res.data || []);
    } catch (error) {
      toast.error("Failed to fetch vehicles");
    }
  };

  const handleParamsSubmit = async (e) => {
    e.preventDefault();
    if (!paramsData.mileage || !paramsData.year) {
      toast.error("Please enter both mileage and manufacturing year");
      return;
    }
    setLoadingParams(true);
    try {
      const res = await predictByParams(paramsData.mileage, paramsData.year);
      setParamsResult(res.data);
    } catch (error) {
      toast.error("Prediction model failed to process inputs");
    } finally {
      setLoadingParams(false);
    }
  };

  const handleVehicleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedVehicle) {
      toast.error("Please select a vehicle from the fleet roster");
      return;
    }
    setLoadingVehicle(true);
    try {
      const res = await predictByVehicle(selectedVehicle);
      setVehicleResult(res.data);
    } catch (error) {
      toast.error("Prediction failed for selected vehicle");
    } finally {
      setLoadingVehicle(false);
    }
  };

  const handleReportDownload = async (downloadFn, filename) => {
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
      toast.error("Report download failed");
    }
  };

  const applyPreset = (mileage, year) => {
    setParamsData({ mileage: String(mileage), year: String(year) });
  };

  const ResultIndicator = ({ result }) => {
    if (!result) return null;
    const prob = result.failure_probability ?? (result.prediction === "Maintenance Required" ? 82.5 : 18.0);
    const risk = result.risk_level || (prob >= 75 ? "Critical" : prob >= 50 ? "High" : prob >= 25 ? "Moderate" : "Optimal");
    const isMaintenanceRequired = result.prediction === "Maintenance Required" || prob >= 50;

    let badgeBg = "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
    let progressBg = "bg-emerald-500";
    let badgeText = "OPTIMAL HEALTH";

    if (risk === "Critical") {
      badgeBg = "bg-rose-500/15 border-rose-500/40 text-rose-400 shadow-rose-500/10";
      progressBg = "bg-rose-500";
      badgeText = "CRITICAL WEAR RISK";
    } else if (risk === "High") {
      badgeBg = "bg-amber-500/15 border-amber-500/40 text-amber-400 shadow-amber-500/10";
      progressBg = "bg-amber-500";
      badgeText = "HIGH MAINTENANCE RISK";
    } else if (risk === "Moderate") {
      badgeBg = "bg-yellow-500/15 border-yellow-500/40 text-yellow-400 shadow-yellow-500/10";
      progressBg = "bg-yellow-500";
      badgeText = "MODERATE WEAR RISK";
    }

    return (
      <div className="space-y-4 mt-5">
        {/* Risk Level Badge & Probability Bar */}
        <div className={`p-5 rounded-2xl border ${badgeBg}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-bold text-sm mb-3">
            <div className="flex items-center gap-3">
              {isMaintenanceRequired ? (
                <FaExclamationTriangle className="text-xl text-rose-400 animate-pulse flex-shrink-0" />
              ) : (
                <FaCheckCircle className="text-xl text-emerald-400 flex-shrink-0" />
              )}
              <div>
                <p className="text-[10px] uppercase tracking-wider font-semibold opacity-80">AI Model Verdict</p>
                <p className="text-base font-extrabold mt-0.5 tracking-wide">
                  {result.prediction ? result.prediction.toUpperCase() : "EVALUATION COMPLETE"}
                </p>
              </div>
            </div>
            <div className="flex-shrink-0">
              <span className="px-3.5 py-1.5 rounded-full text-[11px] uppercase tracking-wider font-extrabold border bg-slate-950/80 whitespace-nowrap shadow-sm">
                {risk} Risk Tier
              </span>
            </div>
          </div>

          {/* Failure Probability Progress Bar */}
          <div className="space-y-1.5 pt-2 border-t border-white/10">
            <div className="flex justify-between text-xs font-semibold">
              <span className="opacity-90">Failure Probability Score:</span>
              <span className="font-extrabold text-sm">{prob}%</span>
            </div>
            <div className="w-full bg-slate-950/60 rounded-full h-2.5 overflow-hidden p-0.5 border border-white/10">
              <div
                className={`h-full rounded-full transition-all duration-500 ${progressBg}`}
                style={{ width: `${Math.min(100, Math.max(5, prob))}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Actionable Recommendations & Estimated Cost */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 flex items-start gap-2.5">
            <FaTools className="text-indigo-400 mt-0.5 text-sm flex-shrink-0" />
            <div>
              <p className="font-bold text-slate-200">Recommended Action:</p>
              <p className="text-slate-400 mt-0.5 text-[11px] leading-relaxed">
                {result.recommended_action || result.reason}
              </p>
            </div>
          </div>
          <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 flex items-start gap-2.5">
            <FaDollarSign className="text-emerald-400 mt-0.5 text-sm flex-shrink-0" />
            <div>
              <p className="font-bold text-slate-200">Estimated Service Cost:</p>
              <p className="text-emerald-400 font-extrabold text-sm mt-0.5">
                {result.estimated_cost ? `$${result.estimated_cost}` : "$150 - $400"}
              </p>
            </div>
          </div>
        </div>

        {/* Analysis Details Note */}
        {result.reason && (
          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
            <FaInfoCircle className="text-purple-400 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-semibold text-slate-200">AI Diagnostic Reason: </span>
              <span className="text-slate-400">{result.reason}</span>
            </div>
          </div>
        )}

        {/* Feature Wear Breakdown */}
        {result.wear_breakdown && (
          <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 text-xs">
            <p className="font-bold text-slate-300 mb-2 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
              <FaTachometerAlt className="text-purple-400" /> Wear Factor Distribution:
            </p>
            <div className="grid grid-cols-3 gap-2 text-[11px] text-center">
              <div className="p-2 bg-slate-950/60 rounded-lg border border-slate-800">
                <span className="block text-slate-400 text-[10px]">Mileage Wear</span>
                <span className="font-bold text-purple-300">{result.wear_breakdown.mileage_impact}%</span>
              </div>
              <div className="p-2 bg-slate-950/60 rounded-lg border border-slate-800">
                <span className="block text-slate-400 text-[10px]">Age Deprec.</span>
                <span className="font-bold text-indigo-300">{result.wear_breakdown.age_impact}%</span>
              </div>
              <div className="p-2 bg-slate-950/60 rounded-lg border border-slate-800">
                <span className="block text-slate-400 text-[10px]">Service Gap</span>
                <span className="font-bold text-amber-300">{result.wear_breakdown.service_gap_impact}%</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-purple-950/60 to-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-wider flex items-center gap-1">
              <FaBolt className="text-amber-400 text-[10px]" /> Predictive Analytics Scikit-Learn ML
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <FaRobot className="text-purple-400" /> Maintenance Intelligence & AI Diagnostics
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Machine learning Random Forest algorithm assessing failure probability, wear factors, and estimated service costs.
          </p>
        </div>

        {/* Quick Report Download Shortcuts */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleReportDownload(downloadAIPredictionPDF, "ai_predictive_maintenance_report.pdf")}
            className="px-3.5 py-2.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-xs font-bold rounded-xl border border-purple-500/30 flex items-center gap-2 transition"
          >
            <FaFilePdf /> AI PDF Report
          </button>
          <button
            onClick={() => handleReportDownload(downloadAIPredictionExcel, "ai_predictive_maintenance_audit.xlsx")}
            className="px-3.5 py-2.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-bold rounded-xl border border-indigo-500/30 flex items-center gap-2 transition"
          >
            <FaFileExcel /> AI Excel Sheet
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Section 1: Parameter-Based Prediction */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 relative flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center text-lg">
                <FaBrain />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Predict by Custom Parameters</h2>
                <p className="text-xs text-slate-400">Run model inference for custom mileage and year</p>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="mb-4">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Quick Parameter Presets:</p>
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => applyPreset(25000, 2023)}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
                >
                  🚗 Low Mileage (25k / 2023)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset(120000, 2005)}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
                >
                  🚚 High Wear (120k / 2005)
                </button>
              </div>
            </div>

            <form onSubmit={handleParamsSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Mileage (km) *</label>
                <input
                  type="number"
                  value={paramsData.mileage}
                  onChange={(e) => setParamsData({ ...paramsData, mileage: e.target.value })}
                  className="w-full glass-input p-3 rounded-xl focus:outline-none"
                  placeholder="e.g. 75000"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Manufacturing Year *</label>
                <input
                  type="number"
                  value={paramsData.year}
                  onChange={(e) => setParamsData({ ...paramsData, year: e.target.value })}
                  className="w-full glass-input p-3 rounded-xl focus:outline-none"
                  placeholder="e.g. 2019"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loadingParams}
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/30 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loadingParams ? "Running AI Inference..." : "Execute ML AI Prediction"}
              </button>
            </form>
          </div>

          {paramsResult && (
            <div className="mt-6 pt-4 border-t border-slate-800">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Analysis Results:</h3>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <div>Evaluated Mileage: <span className="text-white font-bold">{paramsResult.mileage} km</span></div>
                <div>Evaluated Year: <span className="text-white font-bold">{paramsResult.manufacturing_year || paramsResult.year}</span></div>
              </div>
              <ResultIndicator result={paramsResult} />
            </div>
          )}
        </div>

        {/* Section 2: Vehicle-Based Prediction */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 relative flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-lg">
                <FaSearch />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Predict for Registered Unit</h2>
                <p className="text-xs text-slate-400">Select an existing vehicle from the active database</p>
              </div>
            </div>

            <form onSubmit={handleVehicleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Select Fleet Vehicle *</label>
                <select
                  value={selectedVehicle}
                  onChange={(e) => setSelectedVehicle(e.target.value)}
                  className="w-full glass-input p-3.5 rounded-xl focus:outline-none bg-slate-900 text-slate-200"
                  required
                >
                  <option value="">-- Choose a Vehicle --</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.registration_number} - {v.vehicle_name} ({v.mileage} km)
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={loadingVehicle}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loadingVehicle ? "Evaluating Vehicle Telemetry..." : "Evaluate Vehicle Health"}
              </button>
            </form>
          </div>

          {vehicleResult && (
            <div className="mt-6 pt-4 border-t border-slate-800">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Vehicle Diagnostic Summary:</h3>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <div>Reg No: <span className="text-white font-bold">{vehicleResult.registration_number}</span></div>
                <div>Name: <span className="text-white font-bold">{vehicleResult.vehicle_name}</span></div>
                <div>Recorded Mileage: <span className="text-white font-bold">{vehicleResult.mileage} km</span></div>
                <div>Mfg Year: <span className="text-white font-bold">{vehicleResult.manufacturing_year || vehicleResult.year}</span></div>
              </div>
              <ResultIndicator result={vehicleResult} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Prediction;