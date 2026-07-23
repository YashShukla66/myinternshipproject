import React, { useState, useEffect } from "react";
import { getMaintenanceRecords, deleteMaintenanceRecord } from "../../services/maintenanceService";
import { toast } from "react-toastify";
import { FaEdit, FaTrash, FaSearch } from "react-icons/fa";

const MaintenanceTable = ({ onEdit, refresh }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [params, setParams] = useState({
    page: 1,
    search: "",
    status: "",
    maintenance_type: "",
    ordering: "-service_date",
  });
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchRecords();
  }, [params, refresh]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await getMaintenanceRecords(params);
      setRecords(res.data.results || []);
      setTotalPages(Math.ceil((res.data.count || 0) / 10) || 1);
    } catch (error) {
      toast.error("Failed to load maintenance records");
    } fontally: {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        await deleteMaintenanceRecord(id);
        toast.success("Record deleted!");
        fetchRecords();
      } catch (error) {
        toast.error("Failed to delete record");
      }
    }
  };

  const typeLabels = {
    OIL_CHANGE: "Oil Change",
    ENGINE: "Engine Service",
    BRAKE: "Brake Repair",
    TYRE: "Tyre Replacement",
    GENERAL: "General Service",
  };

  return (
    <div className="space-y-5">
      {/* Search & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
            <input
              type="text"
              placeholder="Search by workshop or service center..."
              className="w-full glass-input pl-10 pr-4 py-2 rounded-xl text-xs focus:outline-none"
              value={params.search}
              onChange={(e) => setParams({ ...params, search: e.target.value, page: 1 })}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <select
            className="glass-input px-3 py-2 rounded-xl bg-slate-900 text-slate-200"
            value={params.status}
            onChange={(e) => setParams({ ...params, status: e.target.value, page: 1 })}
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="COMPLETED">Completed</option>
          </select>

          <select
            className="glass-input px-3 py-2 rounded-xl bg-slate-900 text-slate-200"
            value={params.maintenance_type}
            onChange={(e) => setParams({ ...params, maintenance_type: e.target.value, page: 1 })}
          >
            <option value="">All Service Types</option>
            <option value="OIL_CHANGE">Oil Change</option>
            <option value="ENGINE">Engine Service</option>
            <option value="BRAKE">Brake Repair</option>
            <option value="TYRE">Tyre Replacement</option>
            <option value="GENERAL">General Service</option>
          </select>

          <select
            className="glass-input px-3 py-2 rounded-xl bg-slate-900 text-slate-200"
            value={params.ordering}
            onChange={(e) => setParams({ ...params, ordering: e.target.value, page: 1 })}
          >
            <option value="-service_date font-medium">Date (Newest)</option>
            <option value="service_date">Date (Oldest)</option>
            <option value="-cost">Cost (Highest)</option>
            <option value="cost">Cost (Lowest)</option>
          </select>
        </div>
      </div>

      {/* Table Display */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Vehicle</th>
                <th className="p-4">Service Type</th>
                <th className="p-4">Service Date</th>
                <th className="p-4">Workshop Center</th>
                <th className="p-4">Total Cost</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60 font-medium">
              {records.length > 0 ? (
                records.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-4 font-bold text-indigo-300">{r.vehicle_name || r.vehicle}</td>
                    <td className="p-4 text-slate-200 font-semibold">{typeLabels[r.maintenance_type] || r.maintenance_type}</td>
                    <td className="p-4">{r.service_date}</td>
                    <td className="p-4">{r.service_center}</td>
                    <td className="p-4 font-mono font-bold text-amber-300">₹{parseFloat(r.cost).toFixed(2)}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold ${
                        r.status === "COMPLETED"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}>
                        <span className={`pulse-dot ${r.status === "COMPLETED" ? "bg-emerald-400" : "bg-amber-400"}`}></span>
                        {r.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onEdit(r)}
                          className="p-2 text-indigo-400 hover:text-white bg-indigo-500/10 hover:bg-indigo-600 rounded-lg transition"
                          title="Edit Record"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="p-2 text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600 rounded-lg transition"
                          title="Delete Record"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-12 text-center text-slate-500">
                    🔧 No maintenance service records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between pt-2 text-xs text-slate-400">
        <p>Page <strong className="text-slate-200">{params.page}</strong> of <strong className="text-slate-200">{totalPages}</strong></p>
        <div className="flex gap-2">
          <button
            disabled={params.page <= 1}
            onClick={() => setParams({ ...params, page: params.page - 1 })}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-xl transition"
          >
            Previous
          </button>
          <button
            disabled={params.page >= totalPages}
            onClick={() => setParams({ ...params, page: params.page + 1 })}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white rounded-xl transition"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceTable;
