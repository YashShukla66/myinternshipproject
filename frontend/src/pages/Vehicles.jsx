import { useState } from "react";
import VehicleForm from "../components/vehicles/VehicleForm";
import VehicleTable from "../components/vehicles/VehicleTable";
import { FaCar, FaPlus, FaTimes } from "react-icons/fa";

export default function Vehicles() {
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [refresh, setRefresh] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSuccess = () => {
        setSelectedVehicle(null);
        setIsModalOpen(false);
        setRefresh(prev => !prev);
    };

    const handleEdit = (vehicle) => {
        setSelectedVehicle(vehicle);
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setSelectedVehicle(null);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase tracking-wider">
                            Fleet Inventory
                        </span>
                    </div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                        <FaCar className="text-blue-400" /> Vehicle Management
                    </h1>
                    <p className="text-slate-400 text-xs mt-1">
                        Track, inspect, and manage active vehicles, maintenance schedules, and assigned drivers.
                    </p>
                </div>

                <button
                    onClick={handleAddNew}
                    className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition-all active:scale-95 self-start md:self-auto"
                >
                    <FaPlus />
                    <span>Add New Vehicle</span>
                </button>
            </div>

            {/* Modal Dialog for Form */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
                    <div className="w-full max-w-3xl glass-card rounded-3xl p-6 border border-white/10 shadow-2xl animate-modal relative max-h-[90vh] overflow-y-auto my-8">
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <FaCar className="text-blue-400" />
                                {selectedVehicle ? "Edit Vehicle Details" : "Register New Vehicle"}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <VehicleForm
                            selectedVehicle={selectedVehicle}
                            onSuccess={handleSuccess}
                            onCancel={() => setIsModalOpen(false)}
                        />
                    </div>
                </div>
            )}

            {/* Vehicles Table Card */}
            <div className="glass-card rounded-3xl p-6 border border-slate-800">
                <VehicleTable
                    onEdit={handleEdit}
                    refresh={refresh}
                />
            </div>
        </div>
    );
}