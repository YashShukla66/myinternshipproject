import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";

import { AuthProvider, useAuth } from "./contexts/AuthContext";

import MainLayout from "./layouts/MainLayout";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Vehicles from "./pages/Vehicles";
import Drivers from "./pages/Drivers";
import Trips from "./pages/Trips";
import Maintenance from "./pages/Maintenance";
import Notifications from "./pages/Notifications";
import Reports from "./pages/Reports";
import Prediction from "./pages/Prediction";

function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />

            <Route
                element={
                    <ProtectedRoute>
                        <MainLayout />
                    </ProtectedRoute>
                }
            >
                <Route path="/" element={<Dashboard />} />
                <Route path="/vehicles" element={<Vehicles />} />
                <Route path="/drivers" element={<Drivers />} />
                <Route path="/trips" element={<Trips />} />
                <Route path="/maintenance" element={<Maintenance />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/prediction" element={<Prediction />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </BrowserRouter>
    );
}