import React, { useState } from 'react';
import DriverForm from '../components/drivers/DriverForm';
import DriverTable from '../components/drivers/DriverTable';
import { FaUsers, FaPlus, FaTimes } from 'react-icons/fa';

export default function Drivers() {
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSuccess = () => {
    setSelectedDriver(null);
    setIsModalOpen(false);
    setRefresh(!refresh);
  };

  const handleEdit = (driver) => {
    setSelectedDriver(driver);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setSelectedDriver(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
              Personnel Roster
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <FaUsers className="text-emerald-400" /> Driver Management
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Manage driver profiles, license verifications, status availability, and vehicle assignments.
          </p>
        </div>

        <button
          onClick={handleAddNew}
          className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all active:scale-95 self-start md:self-auto"
        >
          <FaPlus />
          <span>Add New Driver</span>
        </button>
      </div>

      {/* Modal Dialog for Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-2xl glass-card rounded-3xl p-6 border border-white/10 shadow-2xl animate-modal relative max-h-[90vh] overflow-y-auto my-8">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FaUsers className="text-emerald-400" />
                {selectedDriver ? "Edit Driver Profile" : "Register New Driver"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition"
              >
                <FaTimes />
              </button>
            </div>

            <DriverForm
              selectedDriver={selectedDriver}
              onSuccess={handleSuccess}
              onCancel={() => setIsModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Drivers Table Card */}
      <div className="glass-card rounded-3xl p-6 border border-slate-800">
        <DriverTable onEdit={handleEdit} refresh={refresh} />
      </div>
    </div>
  );
}