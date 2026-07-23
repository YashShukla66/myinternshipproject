import React, { useState, useEffect } from "react";
import { predictByParams, predictByVehicle } from "../services/predictionService";
import { getVehicles } from "../services/vehicleService";
import { toast } from "react-toastify";
import { FaRobot, FaBrain, FaExclamationTriangle, FaCheckCircle, FaSearch, FaBolt, FaInfoCircle } from "react-icons/fa";

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

  const applyPreset = (mileage, year) => {
    setParamsData({ mileage: String(mileage), year: String(year) });
  };

  const ResultIndicator = ({ prediction, reason }) => {
    const isMaintenanceRequired = prediction === "Maintenance Required" || prediction === 1 || prediction === true;
    
    return (
      <div className="space-y-3 mt-5">
        <div className={`p-5 rounded-2xl border flex items-center justify-between font-bold text-sm ${
          isMaintenanceRequired
            ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
            : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
        }`}>
          <div className="flex items-center gap-3">
            {isMaintenanceRequired ? (
              <FaExclamationTriangle className="text-xl text-rose-400 animate-pulse" />
            ) : (
              <FaCheckCircle className="text-xl text-emerald-400" />
            )}
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold opacity-75">AI Prediction Verdict</p>
              <p className="text-base font-extrabold mt-0.5">
                {isMaintenanceRequired ? "MAINTENANCE REQUIRED" : "NO IMMEDIATE MAINTENANCE NEEDED"}
              </p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold border ${
            isMaintenanceRequired ? "bg-rose-500/20 border-rose-500/40 text-rose-300" : "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
          }`}>
            {isMaintenanceRequired ? "High Wear Risk" : "Optimal Health"}
          </span>
        </div>

        {reason && (
          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
            <FaInfoCircle className="text-indigo-400 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-semibold text-slate-200">Analysis Details: </span>
              <span>{reason}</span>
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
              <FaBolt className="text-amber-400 text-[10px]" /> Predictive Analytics AI v2
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <FaRobot className="text-purple-400" /> Maintenance Intelligence
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Machine learning algorithm assessing wear probability based on cumulative mileage, vehicle age, and maintenance logs.
          </p>
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
                  onClick={() => applyPreset(25000, 2023)}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
                >
                  🚗 Low Mileage (25k / 2023)
                </button>
                <button
                  onClick={() => applyPreset(120000, 2017)}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
                >
                  🚚 High Mileage (120k / 2017)
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
                {loadingParams ? "Running AI Inference..." : "Execute AI Prediction"}
              </button>
            </form>
          </div>

          {paramsResult && (
            <div className="mt-6 pt-4 border-t border-slate-800">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Analysis Results:</h3>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <div>Evaluated Mileage: <span className="text-white font-bold">{paramsResult.mileage} km</span></div>
                <div>Evaluated Year: <span className="text-white font-bold">{paramsResult.year}</span></div>
              </div>
              <ResultIndicator prediction={paramsResult.prediction} reason={paramsResult.reason} />
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
                <div>Mfg Year: <span className="text-white font-bold">{vehicleResult.manufacturing_year}</span></div>
              </div>
              <ResultIndicator prediction={vehicleResult.prediction} reason={vehicleResult.reason} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Prediction;