import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { FaBell, FaSearch, FaClock } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function Navbar() {
    const { user } = useAuth();
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <header className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 px-8 py-4 flex items-center justify-between sticky top-0 z-30 shadow-md">
            {/* Left: Search Bar */}
            <div className="flex items-center gap-4 flex-1 max-w-md">
                <div className="relative w-full">
                    <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                    <input
                        type="text"
                        placeholder="Search vehicles, drivers, trips..."
                        className="w-full pl-10 pr-12 py-2 bg-slate-800/60 border border-slate-700/60 rounded-xl text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                    <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-slate-700/60 border border-slate-600/60 rounded">
                        ⌘K
                    </kbd>
                </div>
            </div>

            {/* Right: Actions, Live Clock, User Info */}
            <div className="flex items-center gap-6">
                {/* Live Clock Widget */}
                <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-slate-300 bg-slate-800/50 px-3 py-1.5 rounded-xl border border-slate-700/50">
                    <FaClock className="text-indigo-400 text-sm" />
                    <span>
                        {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-slate-400 font-normal">|</span>
                    <span className="text-slate-400 font-normal">
                        {currentTime.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                </div>

                {/* Notification Bell */}
                <Link
                    to="/notifications"
                    className="relative p-2.5 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-xl transition-all duration-200 group"
                    title="View Notifications"
                >
                    <FaBell className="text-base group-hover:scale-110 transition-transform" />
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-slate-900 animate-pulse"></span>
                </Link>

                {/* Divider */}
                <div className="h-6 w-[1px] bg-slate-800"></div>

                {/* Profile Pill */}
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-500/20">
                        {user?.username?.charAt(0)?.toUpperCase() || "A"}
                    </div>
                    <div className="hidden sm:block text-left">
                        <p className="text-sm font-bold text-slate-100 leading-tight">
                            {user?.username || "Admin User"}
                        </p>
                        <p className="text-[11px] font-semibold text-indigo-400">
                            {user?.role || "Fleet Manager"}
                        </p>
                    </div>
                </div>
            </div>
        </header>
    );
}