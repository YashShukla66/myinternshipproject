import React, { useState } from "react";
import MaintenanceForm from "../components/maintenance/MaintenanceForm";
import MaintenanceTable from "../components/maintenance/MaintenanceTable";
import { FaTools, FaPlus, FaTimes } from "react-icons/fa";

const Maintenance = () => {
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [refreshToggle, setRefreshToggle] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEdit = (record) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const handleSuccess = () => {
    setSelectedRecord(null);
    setIsModalOpen(false);
    setRefreshToggle(!refreshToggle);
  };

  const handleAddNew = () => {
    setSelectedRecord(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
              Fleet Service Logs
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <FaTools className="text-amber-400" /> Maintenance Management
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Log servicing records, oil changes, engine repairs, tyre replacements, and servicing costs.
          </p>
        </div>

        <button
          onClick={handleAddNew}
          className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-amber-600/30 transition-all active:scale-95 self-start md:self-auto"
        >
          <FaPlus />
          <span>Add Maintenance Record</span>
        </button>
      </div>

      {/* Modal Dialog for Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-2xl glass-card rounded-3xl p-6 border border-white/10 shadow-2xl animate-modal relative max-h-[90vh] overflow-y-auto my-8">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FaTools className="text-amber-400" />
                {selectedRecord ? "Edit Maintenance Record" : "Add Maintenance Record"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition"
              >
                <FaTimes />
              </button>
            </div>

            <MaintenanceForm
              selectedRecord={selectedRecord}
              onSuccess={handleSuccess}
              onCancel={() => setIsModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Maintenance Table Card */}
      <div className="glass-card rounded-3xl p-6 border border-slate-800">
        <MaintenanceTable onEdit={handleEdit} refresh={refreshToggle} />
      </div>
    </div>
  );
}

export default Maintenance;