import React, { useState, useEffect, useRef } from "react";
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
  FaFilePdf,
  FaFileExcel,
  FaTools,
  FaRupeeSign,
  FaTachometerAlt,
  FaGoogle,
  FaMagic,
  FaSpinner,
  FaCopy,
  FaSync,
} from "react-icons/fa";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const GEMINI_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.7-flash",
  "gemini-3.5-flash",
  "gemini-3.1-flash-lite",
];

async function callGeminiModel(model, prompt) {
  const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `HTTP ${res.status}`);
  }
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
}

async function callGemini(prompt) {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  for (const model of GEMINI_MODELS) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        return await callGeminiModel(model, prompt);
      } catch (err) {
        const isOverloaded = err.message?.toLowerCase().includes("high demand") ||
          err.message?.toLowerCase().includes("overloaded") ||
          err.message?.toLowerCase().includes("503") ||
          err.message?.includes("429");
        const isUnavailable = err.message?.toLowerCase().includes("no longer available") ||
          err.message?.toLowerCase().includes("not found");
        if (isUnavailable) break; // try next model immediately
        if (isOverloaded && attempt < 3) {
          await sleep(attempt * 1500); // 1.5s, 3s backoff
          continue;
        }
        if (attempt === 3) break; // move to next model
        throw err;
      }
    }
  }
  throw new Error("All Gemini models are currently busy. Please try again in a moment.");
}

function buildPrompt(paramsResult, vehicleResult) {
  const sections = [];
  if (paramsResult) {
    const prob = paramsResult.failure_probability ?? (paramsResult.prediction === "Maintenance Required" ? 82.5 : 18);
    sections.push(
      "**Custom Parameter Analysis:**\n" +
      "- Fuel Efficiency: " + paramsResult.mileage + " km/L\n" +
      "- Manufacturing Year: " + (paramsResult.manufacturing_year || paramsResult.year) + "\n" +
      "- Failure Probability: " + prob + "%\n" +
      "- Risk Level: " + (paramsResult.risk_level || "N/A") + "\n" +
      "- Prediction: " + paramsResult.prediction + "\n" +
      "- Recommended Action: " + (paramsResult.recommended_action || paramsResult.reason || "N/A") + "\n" +
      "- Estimated Service Cost: " + (paramsResult.estimated_cost != null ? "Rs." + paramsResult.estimated_cost.toLocaleString("en-IN") : "Rs.5,000 - Rs.15,000")
    );
  }
  if (vehicleResult) {
    const prob2 = vehicleResult.failure_probability ?? (vehicleResult.prediction === "Maintenance Required" ? 82.5 : 18);
    sections.push(
      "**Registered Vehicle Analysis:**\n" +
      "- Vehicle: " + (vehicleResult.vehicle_name || "N/A") + " (" + (vehicleResult.registration_number || "N/A") + ")\n" +
      "- Fuel Efficiency: " + vehicleResult.mileage + " km/L\n" +
      "- Manufacturing Year: " + (vehicleResult.manufacturing_year || vehicleResult.year) + "\n" +
      "- Failure Probability: " + prob2 + "%\n" +
      "- Risk Level: " + (vehicleResult.risk_level || "N/A") + "\n" +
      "- Prediction: " + vehicleResult.prediction + "\n" +
      "- Recommended Action: " + (vehicleResult.recommended_action || vehicleResult.reason || "N/A") + "\n" +
      "- Estimated Service Cost: " + (vehicleResult.estimated_cost != null ? "Rs." + vehicleResult.estimated_cost.toLocaleString("en-IN") : "Rs.5,000 - Rs.15,000")
    );
  }
  return (
    "You are a senior fleet maintenance engineer AI. Analyze the ML prediction data below and generate a detailed diagnostic report.\n\n" +
    "=== VEHICLE DATA ===\n" +
    sections.join("\n\n") + "\n\n" +
    "=== REPORT REQUIRED ===\n" +
    "Produce a structured report with EXACTLY these 5 sections. Use plain text only — no markdown symbols like #, *, or **. Use CAPS for section headings.\n\n" +
    "SECTION 1 — VEHICLE HEALTH OVERVIEW\n" +
    "2-3 sentences summarising the overall condition based on the data above.\n\n" +
    "SECTION 2 — IDENTIFIED PROBLEMS\n" +
    "List every problem detected. For each problem write:\n" +
    "  Problem: [clear description of the issue]\n" +
    "  Severity: [Critical / High / Moderate / Low]\n" +
    "  Root Cause: [why this problem is occurring]\n\n" +
    "SECTION 3 — SOLUTIONS & RECOMMENDED ACTIONS\n" +
    "For every problem listed above, provide a matching solution:\n" +
    "  Solution: [specific actionable fix]\n" +
    "  Timeline: [immediate / within 1 week / within 1 month]\n" +
    "  Estimated Cost: [cost in Rs.]\n\n" +
    "SECTION 4 — PREVENTIVE MAINTENANCE TIPS\n" +
    "3-5 bullet points of preventive steps to avoid recurrence and extend vehicle lifespan.\n\n" +
    "SECTION 5 — LONG-TERM FLEET OUTLOOK\n" +
    "2-3 sentences on what these metrics indicate for future fleet performance and reliability.\n\n" +
    "Be specific, data-driven, and use Indian Rupee (Rs.) for all cost figures."
  );
}

function GeminiSummaryCard({ paramsResult, vehicleResult }) {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const cardRef = useRef(null);
  const hasData = paramsResult || vehicleResult;

  const generate = async () => {
    if (!hasData) { toast.warning("Run at least one prediction above first."); return; }
    if (!GEMINI_API_KEY || GEMINI_API_KEY === "your_gemini_api_key_here") {
      setError("Gemini API key not configured. Add VITE_GEMINI_API_KEY to your .env file.");
      return;
    }
    setLoading(true); setError(""); setSummary("");
    try {
      const text = await callGemini(buildPrompt(paramsResult, vehicleResult));
      setSummary(text);
      setTimeout(() => cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch (err) {
      setError(err.message || "Failed to connect to Gemini API.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderSummary = (text) =>
    text.split("\n").map((line, i) => {
      const t = line.trim();
      if (!t) return <div key={i} className="h-1" />;
      // SECTION heading
      if (/^SECTION\s+\d+/i.test(t))
        return (
          <div key={i} className="flex items-center gap-3 mt-6 mb-2">
            <span className="flex-shrink-0 px-2 py-0.5 bg-purple-500/20 border border-purple-500/30 rounded text-[10px] font-extrabold text-purple-300 uppercase tracking-widest">
              {t.match(/SECTION\s+\d+/i)?.[0]}
            </span>
            <p className="text-sm font-extrabold text-white">{t.replace(/^SECTION\s+\d+\s*[—\-]\s*/i, "")}</p>
            <div className="flex-1 h-px bg-slate-700/60" />
          </div>
        );
      // Problem:
      if (/^Problem:/i.test(t))
        return (
          <div key={i} className="flex items-start gap-2 mt-3 ml-3">
            <span className="flex-shrink-0 mt-0.5 px-1.5 py-0.5 bg-rose-500/20 border border-rose-500/30 text-rose-400 text-[9px] font-extrabold rounded uppercase tracking-wide">Problem</span>
            <p className="text-xs text-rose-300 font-semibold leading-relaxed">{t.replace(/^Problem:\s*/i, "")}</p>
          </div>
        );
      // Severity:
      if (/^Severity:/i.test(t)) {
        const val = t.replace(/^Severity:\s*/i, "");
        const c = /critical/i.test(val) ? "text-rose-400" : /high/i.test(val) ? "text-amber-400" : /moderate/i.test(val) ? "text-yellow-400" : "text-emerald-400";
        return (
          <div key={i} className="flex items-center gap-2 ml-3 mt-0.5">
            <span className="text-[10px] text-slate-500 font-medium">Severity:</span>
            <span className={`text-xs font-extrabold uppercase ${c}`}>{val}</span>
          </div>
        );
      }
      // Root Cause:
      if (/^Root Cause:/i.test(t))
        return (
          <div key={i} className="flex items-start gap-2 ml-3 mt-0.5">
            <span className="flex-shrink-0 text-[10px] text-slate-500 font-medium mt-0.5">Root Cause:</span>
            <p className="text-xs text-slate-400 leading-relaxed">{t.replace(/^Root Cause:\s*/i, "")}</p>
          </div>
        );
      // Solution:
      if (/^Solution:/i.test(t))
        return (
          <div key={i} className="flex items-start gap-2 mt-3 ml-3">
            <span className="flex-shrink-0 mt-0.5 px-1.5 py-0.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[9px] font-extrabold rounded uppercase tracking-wide">Solution</span>
            <p className="text-xs text-emerald-300 font-semibold leading-relaxed">{t.replace(/^Solution:\s*/i, "")}</p>
          </div>
        );
      // Timeline:
      if (/^Timeline:/i.test(t))
        return (
          <div key={i} className="flex items-center gap-2 ml-3 mt-0.5">
            <span className="text-[10px] text-slate-500 font-medium">Timeline:</span>
            <span className="text-xs text-indigo-300 font-semibold">{t.replace(/^Timeline:\s*/i, "")}</span>
          </div>
        );
      // Estimated Cost:
      if (/^Estimated Cost:/i.test(t))
        return (
          <div key={i} className="flex items-center gap-2 ml-3 mt-0.5 mb-1">
            <span className="text-[10px] text-slate-500 font-medium">Est. Cost:</span>
            <span className="text-xs text-amber-300 font-extrabold">{t.replace(/^Estimated Cost:\s*/i, "")}</span>
          </div>
        );
      // Bullet points
      if (t.startsWith("- ") || t.startsWith("* "))
        return (
          <p key={i} className="text-xs text-slate-300 ml-4 mt-1 flex items-start gap-2 leading-relaxed">
            <span className="text-indigo-400 mt-0.5 flex-shrink-0">›</span>{t.slice(2)}
          </p>
        );
      return <p key={i} className="text-xs text-slate-400 leading-relaxed ml-1 mt-0.5">{t}</p>;
    });

  return (
    <div ref={cardRef} className="glass-card p-6 rounded-3xl border border-purple-500/20 relative overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(88,28,135,0.08) 0%, rgba(15,23,42,0.95) 50%, rgba(49,46,129,0.08) 100%)" }}>
      <div className="absolute top-0 left-0 w-64 h-64 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800 relative">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600/30 to-indigo-600/30 border border-purple-500/30 flex items-center justify-center text-purple-400 text-xl shadow-lg shadow-purple-500/10">
            <FaMagic />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h2 className="text-lg font-extrabold text-white">Gemini AI Fleet Intelligence</h2>
              <span className="px-2 py-0.5 text-[9px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full uppercase tracking-widest flex items-center gap-1">
                <FaGoogle className="text-[8px]" /> Gemini 3.8 Flash
              </span>
            </div>
            <p className="text-xs text-slate-400">Google Gemini analyzes your ML prediction results and generates an actionable fleet maintenance summary.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {summary && (
            <button onClick={handleCopy} className="px-3 py-2 text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition flex items-center gap-1.5">
              <FaCopy className="text-[10px]" />{copied ? "Copied!" : "Copy"}
            </button>
          )}
          <button onClick={generate} disabled={loading || !hasData} className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/20 transition flex items-center gap-2">
            {loading ? <><FaSpinner className="animate-spin" /> Generating…</> : summary ? <><FaSync /> Regenerate</> : <><FaMagic /> Generate Summary</>}
          </button>
        </div>
      </div>

      {!hasData && !loading && !summary && (
        <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-3xl text-slate-600"><FaRobot /></div>
          <p className="text-sm font-semibold text-slate-400">No prediction data yet</p>
          <p className="text-xs text-slate-500 max-w-xs leading-relaxed">Run a <span className="text-purple-400 font-semibold">Parameter Prediction</span> or <span className="text-indigo-400 font-semibold">Vehicle Evaluation</span> above, then click <span className="text-white font-semibold">Generate Summary</span>.</p>
        </div>
      )}

      {hasData && !loading && !summary && !error && (
        <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600/20 to-indigo-600/20 border border-purple-500/30 flex items-center justify-center text-3xl text-purple-400 animate-pulse"><FaMagic /></div>
          <p className="text-sm font-semibold text-white">Prediction data ready!</p>
          <p className="text-xs text-slate-400 max-w-sm leading-relaxed">Click <span className="text-purple-300 font-bold">Generate Summary</span> to get a comprehensive fleet maintenance intelligence report powered by Google Gemini.</p>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-10 gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-full border-2 border-purple-500/30 flex items-center justify-center text-2xl text-purple-400"><FaGoogle /></div>
            <div className="absolute inset-0 rounded-full border-t-2 border-purple-500 animate-spin" />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-white">Gemini is analyzing your fleet data…</p>
            <p className="text-xs text-slate-400 mt-1">Processing ML results and generating insights</p>
          </div>
          <div className="flex gap-1.5 mt-1">
            {[0, 1, 2].map((i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs text-rose-300 flex items-start gap-3">
          <FaExclamationTriangle className="text-rose-400 mt-0.5 flex-shrink-0 text-sm" />
          <div>
            <p className="font-bold text-rose-300 mb-0.5">Gemini API Error</p>
            <p className="text-rose-400">{error}</p>
            {error.includes("API key") && (
              <p className="mt-2 text-slate-400 leading-relaxed">Get a free key at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-blue-400 underline">aistudio.google.com</a> and add it to <code className="bg-slate-800 px-1 rounded text-slate-300">.env</code> as <code className="bg-slate-800 px-1 rounded text-slate-300">VITE_GEMINI_API_KEY</code>.</p>
            )}
          </div>
        </div>
      )}

      {summary && !loading && (
        <div className="space-y-1 max-h-[480px] overflow-y-auto pr-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1 h-px bg-gradient-to-r from-purple-500/40 via-indigo-500/40 to-transparent" />
            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Gemini Analysis Report</span>
            <div className="flex-1 h-px bg-gradient-to-l from-indigo-500/40 via-purple-500/40 to-transparent" />
          </div>
          <div className="space-y-0.5">{renderSummary(summary)}</div>
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2 text-[10px] text-slate-500">
            <FaGoogle className="text-blue-400" />
            <span>Generated by Google Gemini 3.8 Flash · Not a substitute for professional inspection</span>
          </div>
        </div>
      )}
    </div>
  );
}

const Prediction = () => {
  const [vehicles, setVehicles] = useState([]);
  const [paramsData, setParamsData] = useState({ mileage: "", year: "" });
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [paramsResult, setParamsResult] = useState(null);
  const [vehicleResult, setVehicleResult] = useState(null);
  const [loadingParams, setLoadingParams] = useState(false);
  const [loadingVehicle, setLoadingVehicle] = useState(false);

  useEffect(() => { fetchVehicles(); }, []);

  const fetchVehicles = async () => {
    try {
      const res = await getVehicles({});
      setVehicles(res.data.results || res.data || []);
    } catch { toast.error("Failed to fetch vehicles"); }
  };

  const handleParamsSubmit = async (e) => {
    e.preventDefault();
    if (!paramsData.mileage || !paramsData.year) { toast.error("Please enter both mileage and manufacturing year"); return; }
    setLoadingParams(true);
    try {
      const res = await predictByParams(paramsData.mileage, paramsData.year);
      setParamsResult(res.data);
    } catch { toast.error("Prediction model failed to process inputs"); }
    finally { setLoadingParams(false); }
  };

  const handleVehicleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedVehicle) { toast.error("Please select a vehicle from the fleet roster"); return; }
    setLoadingVehicle(true);
    try {
      const res = await predictByVehicle(selectedVehicle);
      setVehicleResult(res.data);
    } catch { toast.error("Prediction failed for selected vehicle"); }
    finally { setLoadingVehicle(false); }
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
    } catch { toast.error("Report download failed"); }
  };

  const applyPreset = (mileage, year) => setParamsData({ mileage: String(mileage), year: String(year) });

  const ResultIndicator = ({ result }) => {
    if (!result) return null;
    const prob = result.failure_probability ?? (result.prediction === "Maintenance Required" ? 82.5 : 18.0);
    const risk = result.risk_level || (prob >= 75 ? "Critical" : prob >= 50 ? "High" : prob >= 25 ? "Moderate" : "Optimal");
    const isMaintenanceRequired = result.prediction === "Maintenance Required" || prob >= 50;

    let badgeBg = "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
    let progressBg = "bg-emerald-500";
    if (risk === "Critical") { badgeBg = "bg-rose-500/15 border-rose-500/40 text-rose-400"; progressBg = "bg-rose-500"; }
    else if (risk === "High") { badgeBg = "bg-amber-500/15 border-amber-500/40 text-amber-400"; progressBg = "bg-amber-500"; }
    else if (risk === "Moderate") { badgeBg = "bg-yellow-500/15 border-yellow-500/40 text-yellow-400"; progressBg = "bg-yellow-500"; }

    return (
      <div className="space-y-4 mt-5">
        <div className={`p-5 rounded-2xl border ${badgeBg}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-bold text-sm mb-3">
            <div className="flex items-center gap-3">
              {isMaintenanceRequired ? <FaExclamationTriangle className="text-xl text-rose-400 animate-pulse flex-shrink-0" /> : <FaCheckCircle className="text-xl text-emerald-400 flex-shrink-0" />}
              <div>
                <p className="text-[10px] uppercase tracking-wider font-semibold opacity-80">AI Model Verdict</p>
                <p className="text-base font-extrabold mt-0.5 tracking-wide">{result.prediction ? result.prediction.toUpperCase() : "EVALUATION COMPLETE"}</p>
              </div>
            </div>
            <span className="px-3.5 py-1.5 rounded-full text-[11px] uppercase tracking-wider font-extrabold border bg-slate-950/80 whitespace-nowrap shadow-sm">{risk} Risk Tier</span>
          </div>
          <div className="space-y-1.5 pt-2 border-t border-white/10">
            <div className="flex justify-between text-xs font-semibold">
              <span className="opacity-90">Failure Probability Score:</span>
              <span className="font-extrabold text-sm">{prob}%</span>
            </div>
            <div className="w-full bg-slate-950/60 rounded-full h-2.5 overflow-hidden p-0.5 border border-white/10">
              <div className={`h-full rounded-full transition-all duration-500 ${progressBg}`} style={{ width: `${Math.min(100, Math.max(5, prob))}%` }} />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 flex items-start gap-2.5">
            <FaTools className="text-indigo-400 mt-0.5 text-sm flex-shrink-0" />
            <div><p className="font-bold text-slate-200">Recommended Action:</p><p className="text-slate-400 mt-0.5 text-[11px] leading-relaxed">{result.recommended_action || result.reason}</p></div>
          </div>
          <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 flex items-start gap-2.5">
            <FaRupeeSign className="text-emerald-400 mt-0.5 text-sm flex-shrink-0" />
            <div>
              <p className="font-bold text-slate-200">Estimated Service Cost:</p>
              <p className="text-emerald-400 font-extrabold text-sm mt-0.5">{result.estimated_cost != null ? `Rs.${result.estimated_cost.toLocaleString("en-IN")}` : "Rs.5,000 - Rs.15,000"}</p>
            </div>
          </div>
        </div>
        {result.reason && (
          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
            <FaInfoCircle className="text-purple-400 mt-0.5 flex-shrink-0" />
            <div><span className="font-semibold text-slate-200">AI Diagnostic Reason: </span><span className="text-slate-400">{result.reason}</span></div>
          </div>
        )}
        {result.wear_breakdown && (
          <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 text-xs">
            <p className="font-bold text-slate-300 mb-2 flex items-center gap-1.5 text-[11px] uppercase tracking-wider"><FaTachometerAlt className="text-purple-400" /> Wear Factor Distribution:</p>
            <div className="grid grid-cols-3 gap-2 text-[11px] text-center">
              <div className="p-2 bg-slate-950/60 rounded-lg border border-slate-800"><span className="block text-slate-400 text-[10px]">Efficiency Wear</span><span className="font-bold text-purple-300">{result.wear_breakdown.mileage_impact}%</span></div>
              <div className="p-2 bg-slate-950/60 rounded-lg border border-slate-800"><span className="block text-slate-400 text-[10px]">Age Deprec.</span><span className="font-bold text-indigo-300">{result.wear_breakdown.age_impact}%</span></div>
              <div className="p-2 bg-slate-950/60 rounded-lg border border-slate-800"><span className="block text-slate-400 text-[10px]">Service Gap</span><span className="font-bold text-amber-300">{result.wear_breakdown.service_gap_impact}%</span></div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-purple-950/60 to-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-wider flex items-center gap-1">
              <FaBolt className="text-amber-400 text-[10px]" /> Predictive Analytics Scikit-Learn ML
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <FaRobot className="text-purple-400" /> Maintenance Intelligence &amp; AI Diagnostics
          </h1>
          <p className="text-slate-400 text-xs mt-1">Scikit-Learn Random Forest ML pipeline (StandardScaler to RandomForestClassifier) assessing failure probability, wear factors, and estimated service costs.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => handleReportDownload(downloadAIPredictionPDF, "ai_predictive_maintenance_report.pdf")} className="px-3.5 py-2.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-xs font-bold rounded-xl border border-purple-500/30 flex items-center gap-2 transition">
            <FaFilePdf /> AI PDF Report
          </button>
          <button onClick={() => handleReportDownload(downloadAIPredictionExcel, "ai_predictive_maintenance_audit.xlsx")} className="px-3.5 py-2.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-bold rounded-xl border border-indigo-500/30 flex items-center gap-2 transition">
            <FaFileExcel /> AI Excel Sheet
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-6 rounded-3xl border border-slate-800 relative flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center text-lg"><FaBrain /></div>
              <div><h2 className="text-lg font-bold text-white">Predict by Custom Parameters</h2><p className="text-xs text-slate-400">Run model inference for fuel efficiency (km/L) and year</p></div>
            </div>
            <div className="mb-4">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Quick Parameter Presets:</p>
              <div className="flex flex-wrap gap-2 text-xs">
                <button type="button" onClick={() => applyPreset(45, 2023)} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition">🚗 Good Efficiency (45 km/L / 2023)</button>
                <button type="button" onClick={() => applyPreset(12, 2008)} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition">🚚 Poor Efficiency (12 km/L / 2008)</button>
                <button type="button" onClick={() => applyPreset(70, 2021)} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition">🏍️ High Efficiency (70 km/L / 2021)</button>
              </div>
            </div>
            <form onSubmit={handleParamsSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Fuel Efficiency (km/L) *</label>
                <input type="number" min="10" max="100" step="0.1" value={paramsData.mileage} onChange={(e) => setParamsData({ ...paramsData, mileage: e.target.value })} className="w-full glass-input p-3 rounded-xl focus:outline-none" placeholder="e.g. 45 (range: 10-100)" required />
                <p className="text-[10px] text-slate-500 mt-1">Enter vehicle fuel efficiency between 10 and 100 km/L</p>
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Manufacturing Year *</label>
                <input type="number" value={paramsData.year} onChange={(e) => setParamsData({ ...paramsData, year: e.target.value })} className="w-full glass-input p-3 rounded-xl focus:outline-none" placeholder="e.g. 2019" required />
              </div>
              <button type="submit" disabled={loadingParams} className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/30 transition disabled:opacity-50 flex items-center justify-center gap-2">
                {loadingParams ? "Running AI Inference..." : "Execute ML AI Prediction"}
              </button>
            </form>
          </div>
          {paramsResult && (
            <div className="mt-6 pt-4 border-t border-slate-800">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Analysis Results:</h3>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <div>Fuel Efficiency: <span className="text-white font-bold">{paramsResult.mileage} km/L</span></div>
                <div>Evaluated Year: <span className="text-white font-bold">{paramsResult.manufacturing_year || paramsResult.year}</span></div>
              </div>
              <ResultIndicator result={paramsResult} />
            </div>
          )}
        </div>

        <div className="glass-card p-6 rounded-3xl border border-slate-800 relative flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-lg"><FaSearch /></div>
              <div><h2 className="text-lg font-bold text-white">Predict for Registered Unit</h2><p className="text-xs text-slate-400">Select an existing vehicle from the active database</p></div>
            </div>
            <form onSubmit={handleVehicleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Select Fleet Vehicle *</label>
                <select value={selectedVehicle} onChange={(e) => setSelectedVehicle(e.target.value)} className="w-full glass-input p-3.5 rounded-xl focus:outline-none bg-slate-900 text-slate-200" required>
                  <option value="">-- Choose a Vehicle --</option>
                  {vehicles.map((v) => <option key={v.id} value={v.id}>{v.registration_number} - {v.vehicle_name} ({v.mileage} km/L)</option>)}
                </select>
              </div>
              <button type="submit" disabled={loadingVehicle} className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition disabled:opacity-50 flex items-center justify-center gap-2">
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
                <div>Fuel Efficiency: <span className="text-white font-bold">{vehicleResult.mileage} km/L</span></div>
                <div>Mfg Year: <span className="text-white font-bold">{vehicleResult.manufacturing_year || vehicleResult.year}</span></div>
              </div>
              <ResultIndicator result={vehicleResult} />
            </div>
          )}
        </div>
      </div>

      <GeminiSummaryCard paramsResult={paramsResult} vehicleResult={vehicleResult} />
    </div>
  );
};

export default Prediction;
