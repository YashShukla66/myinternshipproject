import React, { useState, useEffect } from "react";
import { getDashboard, getVehicleChart, getDriverChart, getTripChart, getMaintenanceChart } from "../services/dashboardService";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { FaCar, FaUsers, FaRoute, FaTools, FaArrowUp, FaSyncAlt } from "react-icons/fa";
import { toast } from "react-toastify";

const COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444"];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const val = payload[0].value;
    const name = label || payload[0].name || payload[0].payload?.status;
    return (
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700 p-3 rounded-xl shadow-xl text-xs">
        <p className="font-bold text-slate-200 mb-1">{name}</p>
        <p className="text-indigo-400 font-semibold">
          Total: <span className="text-white font-bold">{val}</span>
        </p>
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [vehicleChart, setVehicleChart] = useState([]);
  const [driverChart, setDriverChart] = useState([]);
  const [tripChart, setTripChart] = useState([]);
  const [maintenanceChart, setMaintenanceChart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const processChartData = (resData) => {
    const list = Array.isArray(resData) ? resData : (resData?.results || []);
    return list.map((item) => ({
      ...item,
      total: item.total !== undefined ? item.total : (item.count || 0),
      count: item.total !== undefined ? item.total : (item.count || 0),
    }));
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dashRes, vehChart, drvChart, trpChart, maintChart] = await Promise.all([
        getDashboard(),
        getVehicleChart(),
        getDriverChart(),
        getTripChart(),
        getMaintenanceChart()
      ]);
      setStats(dashRes.data);
      setVehicleChart(processChartData(vehChart.data));
      setDriverChart(processChartData(drvChart.data));
      setTripChart(processChartData(trpChart.data));
      setMaintenanceChart(processChartData(maintChart.data));
    } catch (error) {
      console.error(error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          <p className="text-xs font-semibold text-slate-400">Loading Fleet Telemetry...</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="pulse-dot bg-emerald-400"></span> COMPLETED
          </span>
        );
      case "IN_PROGRESS":
      case "ONGOING":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <span className="pulse-dot bg-blue-400"></span> ONGOING
          </span>
        );
      case "SCHEDULED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <span className="pulse-dot bg-amber-400"></span> SCHEDULED
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <span className="pulse-dot bg-rose-400"></span> CANCELLED
          </span>
        );
      default:
        return <span className="text-xs text-slate-400">{status}</span>;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
              Live Fleet Overview
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Dashboard Analytics
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Real-time status tracking for vehicles, drivers, trips, and scheduled maintenance.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="relative z-10 inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold rounded-xl border border-slate-700/80 transition-all shadow-md active:scale-95 self-start md:self-auto"
        >
          <FaSyncAlt />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Vehicles KPI */}
        <div className="glass-card glass-card-hover p-6 rounded-3xl relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Vehicles</p>
              <h2 className="text-3xl font-extrabold text-white mt-1">{stats?.total_vehicles || 0}</h2>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform">
              <FaCar />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">{stats?.active_vehicles || 0} Active Units</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <FaArrowUp className="text-[10px]" /> +12%
            </span>
          </div>
        </div>

        {/* Drivers KPI */}
        <div className="glass-card glass-card-hover p-6 rounded-3xl relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Drivers</p>
              <h2 className="text-3xl font-extrabold text-white mt-1">{stats?.total_drivers || 0}</h2>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform">
              <FaUsers />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">{stats?.available_drivers || 0} Available</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <FaArrowUp className="text-[10px]" /> +8%
            </span>
          </div>
        </div>

        {/* Trips KPI */}
        <div className="glass-card glass-card-hover p-6 rounded-3xl relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Trips</p>
              <h2 className="text-3xl font-extrabold text-white mt-1">{stats?.total_trips || 0}</h2>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform">
              <FaRoute />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">{stats?.ongoing_trips || 0} Active Dispatches</span>
            <span className="text-purple-400 font-semibold">Active</span>
          </div>
        </div>

        {/* Maintenance KPI */}
        <div className="glass-card glass-card-hover p-6 rounded-3xl relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Maintenance</p>
              <h2 className="text-3xl font-extrabold text-white mt-1">{stats?.total_maintenance || 0}</h2>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform">
              <FaTools />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-amber-400 font-semibold">{stats?.pending_maintenance || 0} Pending Service</span>
            <span className="text-slate-400">Action Req.</span>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vehicle Status Pie */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800">
          <h3 className="text-base font-bold text-slate-100 mb-4 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Vehicle Status Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={vehicleChart} dataKey="total" nameKey="status" cx="50%" cy="50%" outerRadius={80} innerRadius={40} paddingAngle={4}>
                  {vehicleChart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(value) => <span className="text-xs text-slate-300 font-medium">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trip Status Bar Chart */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800">
          <h3 className="text-base font-bold text-slate-100 mb-4 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Trip Status Overview
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tripChart}>
                <XAxis dataKey="status" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="total" fill="#818cf8" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Driver Status Chart */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800">
          <h3 className="text-base font-bold text-slate-100 mb-4 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Driver Availability
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={driverChart} dataKey="total" nameKey="status" cx="50%" cy="50%" outerRadius={80} innerRadius={40} paddingAngle={4}>
                  {driverChart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(value) => <span className="text-xs text-slate-300 font-medium">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Maintenance Status Chart */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800">
          <h3 className="text-base font-bold text-slate-100 mb-4 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Maintenance Breakdown
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={maintenanceChart} dataKey="total" nameKey="status" cx="50%" cy="50%" outerRadius={80} innerRadius={40} paddingAngle={4}>
                  {maintenanceChart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(value) => <span className="text-xs text-slate-300 font-medium">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Trips Timeline Table */}
      <div className="glass-card rounded-3xl border border-slate-800 p-6 overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <FaRoute className="text-purple-400" /> Recent Dispatch Activity
          </h3>
          <span className="text-xs font-semibold text-slate-400 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700">
            Latest 5 Trips
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Trip Code</th>
                <th className="p-4">Assigned Driver</th>
                <th className="p-4">Vehicle</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {stats?.recent_trips?.length > 0 ? (
                stats.recent_trips.map((trip, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition">
                    <td className="p-4 text-slate-100 font-bold">#{trip.trip_id}</td>
                    <td className="p-4">{trip.driver || "Unassigned"}</td>
                    <td className="p-4 text-indigo-300 font-medium">{trip.vehicle}</td>
                    <td className="p-4">{getStatusBadge(trip.status)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-500">
                    🚗 No recent trip dispatches recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;