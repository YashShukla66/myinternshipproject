import React, { useState, useEffect } from 'react';
import { getDrivers, deleteDriver } from '../../services/driverService';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash, FaSearch, FaFilter } from 'react-icons/fa';

export default function DriverTable({ onEdit, refresh }) {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [ordering, setOrdering] = useState('-created_at');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const params = { search, status, ordering, page };
      const response = await getDrivers(params);
      setDrivers(response.data.results || response.data || []);
      if (response.data.count) {
        setTotalCount(response.data.count);
        setTotalPages(Math.ceil(response.data.count / 10));
      }
    } catch (error) {
      toast.error('Failed to load drivers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, [refresh, search, status, ordering, page]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this driver?')) {
      try {
        await deleteDriver(id);
        toast.success('Driver deleted successfully');
        fetchDrivers();
      } catch (error) {
        toast.error('Failed to delete driver');
      }
    }
  };

  const getStatusBadge = (statusValue) => {
    switch (statusValue) {
      case 'AVAILABLE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="pulse-dot bg-emerald-400"></span> AVAILABLE
          </span>
        );
      case 'ON_TRIP':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <span className="pulse-dot bg-blue-400"></span> ON TRIP
          </span>
        );
      case 'LEAVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <span className="pulse-dot bg-amber-400"></span> ON LEAVE
          </span>
        );
      default:
        return <span className="text-xs text-slate-400">{statusValue}</span>;
    }
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
              placeholder="Search driver name or license..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full glass-input pl-10 pr-4 py-2 rounded-xl text-xs focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="glass-input px-3 py-2 rounded-xl bg-slate-900 text-slate-200"
          >
            <option value="">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="ON_TRIP">On Trip</option>
            <option value="LEAVE">Leave</option>
          </select>

          <select
            value={ordering}
            onChange={(e) => setOrdering(e.target.value)}
            className="glass-input px-3 py-2 rounded-xl bg-slate-900 text-slate-200"
          >
            <option value="-created_at">Newest First</option>
            <option value="created_at">Oldest First</option>
            <option value="-joining_date">Joining Date (Newest)</option>
            <option value="joining_date">Joining Date (Oldest)</option>
          </select>
        </div>
      </div>

      {/* Table Display */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Avatar</th>
                <th className="p-4">Full Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Phone</th>
                <th className="p-4">License No.</th>
                <th className="p-4">Status</th>
                <th className="p-4">Assigned Vehicle</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60 font-medium">
              {drivers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-12 text-center text-slate-500">
                    👤 No drivers found matching your search.
                  </td>
                </tr>
              ) : (
                drivers.map((driver) => (
                  <tr key={driver.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-4">
                      {driver.image ? (
                        <img src={driver.image} alt={driver.full_name} className="w-9 h-9 rounded-full object-cover border border-slate-700 shadow" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700/60 flex items-center justify-center font-bold text-slate-400">
                          {driver.full_name?.charAt(0) || "D"}
                        </div>
                      )}
                    </td>
                    <td className="p-4 font-bold text-slate-100">{driver.full_name}</td>
                    <td className="p-4 text-slate-300">{driver.email}</td>
                    <td className="p-4">{driver.phone}</td>
                    <td className="p-4 font-mono text-emerald-300">{driver.license_number}</td>
                    <td className="p-4">{getStatusBadge(driver.status)}</td>
                    <td className="p-4 text-indigo-300">{driver.assigned_vehicle || 'Unassigned'}</td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onEdit(driver)}
                          className="p-2 text-indigo-400 hover:text-white bg-indigo-500/10 hover:bg-indigo-600 rounded-lg transition"
                          title="Edit Driver"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(driver.id)}
                          className="p-2 text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600 rounded-lg transition"
                          title="Delete Driver"
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

      {/* Pagination */}
      {totalCount > 0 && (
        <div className="flex items-center justify-between pt-2 text-xs text-slate-400">
          <p>Showing <strong className="text-slate-200">{drivers.length}</strong> of <strong className="text-slate-200">{totalCount}</strong> drivers</p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-xl transition"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= totalPages}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-xl transition"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
