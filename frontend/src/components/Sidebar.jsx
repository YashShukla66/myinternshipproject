import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
    FaTachometerAlt,
    FaCar,
    FaUsers,
    FaRoute,
    FaTools,
    FaBell,
    FaChartBar,
    FaRobot,
    FaSignOutAlt,
    FaChevronRight,
} from "react-icons/fa";

const navItems = [
    { path: "/", icon: FaTachometerAlt, label: "Dashboard" },
    { path: "/vehicles", icon: FaCar, label: "Vehicles" },
    { path: "/drivers", icon: FaUsers, label: "Drivers" },
    { path: "/trips", icon: FaRoute, label: "Trips" },
    { path: "/maintenance", icon: FaTools, label: "Maintenance" },
    { path: "/notifications", icon: FaBell, label: "Notifications" },
    { path: "/reports", icon: FaChartBar, label: "Reports" },
    { path: "/prediction", icon: FaRobot, label: "ML Prediction", badge: "AI" },
];

export default function Sidebar() {
    const location = useLocation();
    const { user, logout } = useAuth();

    const isActive = (path) => {
        if (path === "/") return location.pathname === "/";
        return location.pathname.startsWith(path);
    };

    return (
        <aside className="w-20 hover:w-72 transition-[width] duration-300 ease-in-out group/sidebar fixed top-0 left-0 min-h-screen bg-slate-900 border-r border-slate-800 text-slate-100 flex flex-col justify-between shadow-2xl z-50 select-none overflow-hidden">
            {/* Brand Logo Header */}
            <div>
                <div className="px-5 py-6 border-b border-slate-800/80 flex items-center h-[88px]">
                    <Link to="/" className="flex items-center gap-4 group w-full">
                        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white text-lg shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-200">
                            <FaCar />
                        </div>
                        <div className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                            <span className="text-xl font-extrabold tracking-tight text-white block">
                                Fleet <span className="gradient-text">Core</span>
                            </span>
                            <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase block">
                                Management Suite
                            </span>
                        </div>
                    </Link>
                </div>

                {/* Navigation Links */}
                <div className="px-3 py-6">
                    <p className="px-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                        Main Menu
                    </p>
                    <nav className="flex flex-col gap-1.5">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.path);
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group relative ${
                                        active
                                            ? "bg-gradient-to-r from-blue-600/90 to-indigo-600/90 text-white shadow-lg shadow-indigo-500/20 border border-blue-400/20"
                                            : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                                    }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <Icon
                                            className={`flex-shrink-0 text-lg transition-transform duration-200 ${
                                                active
                                                    ? "text-white scale-110"
                                                    : "text-slate-400 group-hover:text-slate-200 group-hover:scale-105"
                                            }`}
                                        />
                                        <span className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                                            {item.label}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300">
                                        {item.badge && (
                                            <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 rounded-full">
                                                {item.badge}
                                            </span>
                                        )}
                                        {active && (
                                            <FaChevronRight className="text-xs text-white/70" />
                                        )}
                                    </div>
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* User Profile & Logout Footer */}
            <div className="p-3 m-3 bg-slate-800/50 border border-slate-700/50 rounded-2xl flex items-center justify-center group-hover/sidebar:justify-between transition-all duration-300">
                <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-indigo-500/30">
                        {user?.username?.charAt(0)?.toUpperCase() || "A"}
                    </div>
                    <div className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 w-0 group-hover/sidebar:w-auto overflow-hidden whitespace-nowrap">
                        <p className="text-sm font-bold text-white truncate">
                            {user?.username || "Admin"}
                        </p>
                        <span className="inline-block text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 uppercase">
                            {user?.role || "Manager"}
                        </span>
                    </div>
                </div>

                <button
                    onClick={logout}
                    title="Sign Out"
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200 opacity-0 group-hover/sidebar:opacity-100 absolute group-hover/sidebar:relative invisible group-hover/sidebar:visible"
                >
                    <FaSignOutAlt className="text-lg" />
                </button>
            </div>
        </aside>
    );
}