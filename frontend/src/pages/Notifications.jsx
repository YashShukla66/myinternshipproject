import React, { useState, useEffect } from "react";
import { getNotifications, markAsRead, deleteNotification } from "../services/notificationService";
import { toast } from "react-toastify";
import { FaTrash, FaCheck, FaBell, FaExclamationTriangle, FaInfoCircle } from "react-icons/fa";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [params, setParams] = useState({
    page: 1,
    priority: "",
    is_read: "",
  });
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchNotifications();
  }, [params]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await getNotifications(params);
      setNotifications(res.data.results || []);
      setTotalPages(Math.ceil((res.data.count || 0) / 10) || 1);
    } catch (error) {
      toast.error("Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      toast.success("Marked as read");
      fetchNotifications();
    } catch (error) {
      toast.error("Failed to mark as read");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this notification?")) {
      try {
        await deleteNotification(id);
        toast.success("Notification deleted");
        fetchNotifications();
      } catch (error) {
        toast.error("Failed to delete notification");
      }
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "HIGH":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1">
            <FaExclamationTriangle className="text-[10px]" /> HIGH PRIORITY
          </span>
        );
      case "MEDIUM":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            MEDIUM
          </span>
        );
      case "LOW":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            LOW
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
            {priority}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase tracking-wider">
              Alert Center
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <FaBell className="text-blue-400" /> Notifications & Alerts
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Stay updated with vehicle insurance expiries, maintenance deadlines, and trip dispatches.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-wrap gap-4 text-xs">
        <select
          className="glass-input px-3 py-2 rounded-xl bg-slate-900 text-slate-200 flex-1 min-w-[160px]"
          value={params.priority}
          onChange={(e) => setParams({ ...params, priority: e.target.value, page: 1 })}
        >
          <option value="">All Priorities</option>
          <option value="HIGH">High Priority</option>
          <option value="MEDIUM">Medium Priority</option>
          <option value="LOW">Low Priority</option>
        </select>
        <select
          className="glass-input px-3 py-2 rounded-xl bg-slate-900 text-slate-200 flex-1 min-w-[160px]"
          value={params.is_read}
          onChange={(e) => setParams({ ...params, is_read: e.target.value, page: 1 })}
        >
          <option value="">All Read Statuses</option>
          <option value="false">Unread Only</option>
          <option value="true">Read Only</option>
        </select>
      </div>

      {/* Notification List */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`glass-card p-5 rounded-2xl border transition-all duration-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                notif.is_read
                  ? "border-slate-800/60 opacity-60"
                  : "border-blue-500/30 bg-blue-950/20 shadow-lg shadow-blue-500/5"
              }`}
            >
              <div className="flex items-start gap-4 flex-1">
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700/60 flex items-center justify-center text-blue-400 text-base flex-shrink-0 mt-0.5">
                  <FaInfoCircle />
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-slate-100 text-sm">{notif.title}</h3>
                    {getPriorityBadge(notif.priority)}
                    {!notif.is_read && (
                      <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
                    )}
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed">{notif.message}</p>
                  <div className="text-[10px] text-slate-500 pt-1 flex items-center gap-4">
                    <span>{new Date(notif.created_at).toLocaleString()}</span>
                    {notif.vehicle && <span>Vehicle Ref ID: {notif.vehicle}</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-auto">
                {!notif.is_read && (
                  <button
                    onClick={() => handleMarkAsRead(notif.id)}
                    className="p-2.5 text-blue-400 hover:text-white bg-blue-500/10 hover:bg-blue-600 rounded-xl transition text-xs flex items-center gap-1.5 font-semibold"
                    title="Mark as read"
                  >
                    <FaCheck /> Mark Read
                  </button>
                )}
                <button
                  onClick={() => handleDelete(notif.id)}
                  className="p-2.5 text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600 rounded-xl transition text-xs"
                  title="Delete"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-16 rounded-3xl border border-slate-800 text-center flex flex-col items-center justify-center">
          <FaBell className="text-6xl text-slate-700 mb-4 animate-bounce" />
          <h2 className="text-lg font-bold text-slate-300">No Notifications Found</h2>
          <p className="text-xs text-slate-500 mt-1">All telemetry systems are operating normally.</p>
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
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl transition"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Notifications;