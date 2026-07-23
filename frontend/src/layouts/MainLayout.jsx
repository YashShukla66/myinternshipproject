import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function MainLayout() {
    return (
        <div className="flex min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
            <Sidebar />
            <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
                <Navbar />
                <main className="flex-1 p-8 overflow-y-auto bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
                    <div className="max-w-7xl mx-auto space-y-8">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}