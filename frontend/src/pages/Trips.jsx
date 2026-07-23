import React, { useState } from 'react';
import TripForm from '../components/trips/TripForm';
import TripTable from '../components/trips/TripTable';
import { FaRoute, FaPlus, FaTimes } from 'react-icons/fa';

export default function Trips() {
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSuccess = () => {
    setSelectedTrip(null);
    setIsModalOpen(false);
    setRefresh(!refresh);
  };

  const handleEdit = (trip) => {
    setSelectedTrip(trip);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setSelectedTrip(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-wider">
              Dispatch Operations
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <FaRoute className="text-purple-400" /> Trip Management
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Schedule route dispatches, track active transit status, distance metrics, and driver assignments.
          </p>
        </div>

        <button
          onClick={handleAddNew}
          className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-purple-600/30 transition-all active:scale-95 self-start md:self-auto"
        >
          <FaPlus />
          <span>Schedule New Trip</span>
        </button>
      </div>

      {/* Modal Dialog for Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-2xl glass-card rounded-3xl p-6 border border-white/10 shadow-2xl animate-modal relative max-h-[90vh] overflow-y-auto my-8">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FaRoute className="text-purple-400" />
                {selectedTrip ? "Edit Trip Details" : "Schedule New Trip"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition"
              >
                <FaTimes />
              </button>
            </div>

            <TripForm
              selectedTrip={selectedTrip}
              onSuccess={handleSuccess}
              onCancel={() => setIsModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Trips Table Card */}
      <div className="glass-card rounded-3xl p-6 border border-slate-800">
        <TripTable onEdit={handleEdit} refresh={refresh} />
      </div>
    </div>
  );
}