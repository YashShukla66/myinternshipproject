import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FaEdit, FaTrash, FaSearch, FaFilter, FaRedo } from "react-icons/fa";
import { getVehicles, deleteVehicle } from "../../services/vehicleService";

export default function VehicleTable({ onEdit, refresh }) {
    const [status, setStatus] = useState("");
    const [vehicleType, setVehicleType] = useState("");
    const [fuelType, setFuelType] = useState("");
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [ordering, setOrdering] = useState("-created_at");
    const [search, setSearch] = useState("");
    const [nextPage, setNextPage] = useState(null);
    const [previousPage, setPreviousPage] = useState(null);
    const [count, setCount] = useState(0);

    const fetchVehicles = async (url = null) => {
        try {
            setLoading(true);
            let response;
            if (url) {
                const res = await fetch(url, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("access")}` }
                });
                response = await res.json();
            } else {
                response = (await getVehicles({
                    search,
                    status,
                    vehicle_type: vehicleType,
                    fuel_type: fuelType,
                    ordering,
                })).data;
            }

            setVehicles(response.results || []);
            setNextPage(response.next);
            setPreviousPage(response.previous);
            setCount(response.count || 0);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load vehicles");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVehicles();
    }, [refresh]);

    const handleSearch = () => {
        fetchVehicles();
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this vehicle?")) {
            try {
                await deleteVehicle(id);
                toast.success("Vehicle deleted successfully");
                fetchVehicles();
            } catch (error) {
                console.error(error);
                toast.error("Failed to delete vehicle");
            }
        }
    };

    const getStatusBadge = (statusValue) => {
        switch (statusValue) {
            case "ACTIVE":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <span className="pulse-dot bg-emerald-400"></span> ACTIVE
                    </span>
                );
            case "MAINTENANCE":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <span className="pulse-dot bg-amber-400"></span> MAINTENANCE
                    </span>
                );
            case "INACTIVE":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        <span className="pulse-dot bg-rose-400"></span> INACTIVE
                    </span>
                );
            default:
                return <span className="text-xs text-slate-400">{statusValue}</span>;
        }
    };

    return (
        <div className="space-y-5">
            {/* Filter and Search Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-3 flex-1 min-w-[240px]">
                    <div className="relative flex-1">
                        <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                        <input
                            type="text"
                            placeholder="Search registration or vehicle name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            className="w-full glass-input pl-10 pr-4 py-2 rounded-xl text-xs focus:outline-none"
                        />
                    </div>
                    <button
                        onClick={handleSearch}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow transition"
                    >
                        Search
                    </button>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs">
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="glass-input px-3 py-2 rounded-xl bg-slate-900 text-slate-200"
                    >
                        <option value="">All Status</option>
                        <option value="ACTIVE">Active</option>
                        <option value="MAINTENANCE">Maintenance</option>
                        <option value="INACTIVE">Inactive</option>
                    </select>

                    <select
                        value={vehicleType}
                        onChange={(e) => setVehicleType(e.target.value)}
                        className="glass-input px-3 py-2 rounded-xl bg-slate-900 text-slate-200"
                    >
                        <option value="">All Categories</option>
                        <option value="CAR">Car</option>
                        <option value="BIKE">Bike</option>
                        <option value="BUS">Bus</option>
                        <option value="TRUCK">Truck</option>
                    </select>

                    <select
                        value={fuelType}
                        onChange={(e) => setFuelType(e.target.value)}
                        className="glass-input px-3 py-2 rounded-xl bg-slate-900 text-slate-200"
                    >
                        <option value="">All Fuel Types</option>
                        <option value="PETROL">Petrol</option>
                        <option value="DIESEL">Diesel</option>
                        <option value="CNG">CNG</option>
                        <option value="ELECTRIC">Electric</option>
                    </select>

                    <select
                        value={ordering}
                        onChange={(e) => setOrdering(e.target.value)}
                        className="glass-input px-3 py-2 rounded-xl bg-slate-900 text-slate-200"
                    >
                        <option value="-created_at">Newest First</option>
                        <option value="created_at">Oldest First</option>
                        <option value="mileage">Mileage ↑</option>
                        <option value="-mileage">Mileage ↓</option>
                    </select>

                    <button
                        onClick={handleSearch}
                        className="p-2 bg-indigo-600/80 hover:bg-indigo-500 text-white rounded-xl shadow transition"
                        title="Apply Filters"
                    >
                        <FaFilter />
                    </button>

                    <button
                        onClick={() => {
                            setSearch("");
                            setStatus("");
                            setVehicleType("");
                            setFuelType("");
                            setOrdering("-created_at");
                            fetchVehicles();
                        }}
                        className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
                        title="Reset Filters"
                    >
                        <FaRedo />
                    </button>
                </div>
            </div>

            {/* Table Display */}
            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-800">
                    <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                            <tr>
                                <th className="p-4">Photo</th>
                                <th className="p-4">Registration</th>
                                <th className="p-4">Vehicle Name</th>
                                <th className="p-4">Type</th>
                                <th className="p-4">Manufacturer</th>
                                <th className="p-4">Year</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Mileage</th>
                                <th className="p-4">Driver</th>
                                <th className="p-4 text-center">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-800/60 font-medium">
                            {vehicles.length === 0 ? (
                                <tr>
                                    <td colSpan="10" className="p-12 text-center text-slate-500">
                                        🚗 No vehicles matched your filter parameters.
                                    </td>
                                </tr>
                            ) : (
                                vehicles.map((v) => (
                                    <tr key={v.id} className="hover:bg-slate-800/40 transition">
                                        <td className="p-4">
                                            {v.image ? (
                                                <img
                                                    src={v.image}
                                                    alt={v.vehicle_name}
                                                    className="w-10 h-10 rounded-xl object-cover border border-slate-700 shadow"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700/60 flex items-center justify-center text-[10px] text-slate-500">
                                                    N/A
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4 font-bold text-slate-100">{v.registration_number}</td>
                                        <td className="p-4 text-indigo-300 font-semibold">{v.vehicle_name}</td>
                                        <td className="p-4">{v.vehicle_type}</td>
                                        <td className="p-4">{v.manufacturer}</td>
                                        <td className="p-4">{v.manufacturing_year}</td>
                                        <td className="p-4">{getStatusBadge(v.status)}</td>
                                        <td className="p-4">{v.mileage} km</td>
                                        <td className="p-4 text-slate-300">{v.assigned_driver_name || "Unassigned"}</td>
                                        <td className="p-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => onEdit(v)}
                                                    className="p-2 text-indigo-400 hover:text-white bg-indigo-500/10 hover:bg-indigo-600 rounded-lg transition"
                                                    title="Edit Vehicle"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(v.id)}
                                                    className="p-2 text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600 rounded-lg transition"
                                                    title="Delete Vehicle"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination Controls */}
            <div className="flex items-center justify-between pt-2 text-xs text-slate-400">
                <p>Total Registered Units: <strong className="text-slate-200">{count}</strong></p>
                <div className="flex gap-2">
                    <button
                        disabled={!previousPage}
                        onClick={() => fetchVehicles(previousPage)}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-xl transition"
                    >
                        Previous
                    </button>
                    <button
                        disabled={!nextPage}
                        onClick={() => fetchVehicles(nextPage)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl transition"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}