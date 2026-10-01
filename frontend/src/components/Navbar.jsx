import { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { FaBell, FaSearch, FaClock } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

const searchOptions = [
    { name: "Dashboard", path: "/" },
    { name: "Vehicles", path: "/vehicles" },
    { name: "Drivers", path: "/drivers" },
    { name: "Trips", path: "/trips" },
    { name: "Maintenance", path: "/maintenance" },
    { name: "Notifications", path: "/notifications" },
    { name: "Reports", path: "/reports" },
    { name: "ML Prediction", path: "/prediction" },
];

export default function Navbar() {
    const { user } = useAuth();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const searchInputRef = useRef(null);
    const searchContainerRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "k") {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
                setIsSearchOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredOptions = searchOptions.filter((option) =>
        option.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSearchKeyDown = (e) => {
        if (!isSearchOpen) return;
        
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : prev));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (filteredOptions[selectedIndex]) {
                navigate(filteredOptions[selectedIndex].path);
                setSearchQuery("");
                setIsSearchOpen(false);
                searchInputRef.current?.blur();
            }
        } else if (e.key === "Escape") {
            setIsSearchOpen(false);
            searchInputRef.current?.blur();
        }
    };

    return (
        <header className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 px-8 py-4 flex items-center justify-between sticky top-0 z-30 shadow-md">
            {/* Left: Search Bar */}
            <div className="flex items-center gap-4 flex-1 max-w-md relative" ref={searchContainerRef}>
                <div className="relative w-full">
                    <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search vehicles, drivers, trips..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setIsSearchOpen(true);
                            setSelectedIndex(0);
                        }}
                        onFocus={() => setIsSearchOpen(true)}
                        onKeyDown={handleSearchKeyDown}
                        className="w-full pl-10 pr-12 py-2 bg-slate-800/60 border border-slate-700/60 rounded-xl text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                    <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-slate-700/60 border border-slate-600/60 rounded cursor-pointer" onClick={() => searchInputRef.current?.focus()}>
                        ⌘K
                    </kbd>
                </div>

                {/* Dropdown Results */}
                {isSearchOpen && searchQuery && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden z-50">
                        {filteredOptions.length > 0 ? (
                            <ul className="max-h-60 overflow-y-auto py-1">
                                {filteredOptions.map((option, index) => (
                                    <li
                                        key={option.path}
                                        className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                                            index === selectedIndex
                                                ? "bg-indigo-600/20 text-indigo-300 border-l-2 border-indigo-500"
                                                : "text-slate-300 hover:bg-slate-700/50"
                                        }`}
                                        onClick={() => {
                                            navigate(option.path);
                                            setSearchQuery("");
                                            setIsSearchOpen(false);
                                        }}
                                        onMouseEnter={() => setSelectedIndex(index)}
                                    >
                                        <div className="flex items-center gap-2">
                                            <FaSearch className="text-[10px] opacity-50" />
                                            {option.name}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="px-4 py-3 text-sm text-slate-400 text-center">
                                No results found for "{searchQuery}"
                            </div>
                        )}
                    </div>
                )}
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