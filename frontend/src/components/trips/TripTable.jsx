import React, { useState, useEffect } from 'react';
import { getTrips, deleteTrip } from '../../services/tripService';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash, FaSearch, FaArrowRight } from 'react-icons/fa';

export default function TripTable({ onEdit, refresh }) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [ordering, setOrdering] = useState('-created_at');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const params = { search, status, ordering, page };
      const response = await getTrips(params);
      setTrips(response.data?.results || response.data || []);
      if (response.data?.count) {
        setTotalCount(response.data.count);
        setTotalPages(Math.ceil(response.data.count / 10));
      }
    } catch (error) {
      toast.error('Failed to load trips');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, [refresh, search, status, ordering, page]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      try {
        await deleteTrip(id);
        toast.success('Trip deleted successfully');
        fetchTrips();
      } catch (error) {
        toast.error('Failed to delete trip');
      }
    }
  };

  const getStatusBadge = (statusValue) => {
    switch (statusValue) {
      case 'SCHEDULED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <span className="pulse-dot bg-blue-400"></span> SCHEDULED
          </span>
        );
      case 'ONGOING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <span className="pulse-dot bg-amber-400"></span> ONGOING
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="pulse-dot bg-emerald-400"></span> COMPLETED
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <span className="pulse-dot bg-rose-400"></span> CANCELLED
          </span>
        );
      default:
        return <span className="text-xs text-slate-400">{statusValue}</span>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
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
              placeholder="Search Trip ID, source or destination..."
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
            <option value="SCHEDULED">Scheduled</option>
            <option value="ONGOING">Ongoing</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <select
            value={ordering}
            onChange={(e) => setOrdering(e.target.value)}
            className="glass-input px-3 py-2 rounded-xl bg-slate-900 text-slate-200"
          >
            <option value="-created_at">Newest First</option>
            <option value="created_at">Oldest First</option>
            <option value="-start_time">Start Time (Newest)</option>
            <option value="start_time">Start Time (Oldest)</option>
          </select>
        </div>
      </div>

      {/* Table Display */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Trip Code</th>
                <th className="p-4">Driver</th>
                <th className="p-4">Vehicle</th>
                <th className="p-4">Route Path</th>
                <th className="p-4">Start Time</th>
                <th className="p-4">Status</th>
                <th className="p-4">Distance</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60 font-medium">
              {trips.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-12 text-center text-slate-500">
                    🛣️ No trip dispatches found.
                  </td>
                </tr>
              ) : (
                trips.map((trip) => (
                  <tr key={trip.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-4 font-bold text-white font-mono">{trip.trip_id}</td>
                    <td className="p-4 text-slate-200">{trip.driver_name || trip.driver}</td>
                    <td className="p-4 text-indigo-300">{trip.vehicle_number || trip.vehicle}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 font-semibold text-slate-200">
                        <span>{trip.source}</span>
                        <FaArrowRight className="text-[10px] text-purple-400" />
                        <span className="text-purple-300">{trip.destination}</span>
                      </div>
                    </td>
                    <td className="p-4">{formatDate(trip.start_time)}</td>
                    <td className="p-4">{getStatusBadge(trip.status)}</td>
                    <td className="p-4 font-semibold text-slate-200">
                      {trip.distance !== null && trip.distance !== undefined ? `${trip.distance} km` : 'N/A'}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onEdit(trip)}
                          className="p-2 text-indigo-400 hover:text-white bg-indigo-500/10 hover:bg-indigo-600 rounded-lg transition"
                          title="Edit Trip"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(trip.id)}
                          className="p-2 text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600 rounded-lg transition"
                          title="Delete Trip"
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
          <p>Showing <strong className="text-slate-200">{trips.length}</strong> of <strong className="text-slate-200">{totalCount}</strong> dispatches</p>
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
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white rounded-xl transition"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
