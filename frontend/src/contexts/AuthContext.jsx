import { createContext, useContext, useState, useEffect } from "react";
import {
    login as loginAPI,
    register as registerAPI,
    verifyOTP as verifyOTPAPI,
    resendOTP as resendOTPAPI,
    googleLogin as googleLoginAPI,
    getProfile,
} from "../services/authService";
import { toast } from "react-toastify";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("access");
        if (token) {
            fetchProfile();
        } else {
            setLoading(false);
        }
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await getProfile();
            setUser(res.data);
        } catch {
            localStorage.removeItem("access");
            localStorage.removeItem("refresh");
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const loginUser = async (credentials) => {
        const res = await loginAPI(credentials);
        localStorage.setItem("access", res.data.access);
        localStorage.setItem("refresh", res.data.refresh);
        await fetchProfile();
        toast.success("Welcome back! Login successful.");
        return true;
    };

    const registerUser = async (userData) => {
        // Step 1: Sends registration data → backend sends OTP email
        // Returns { message, email } — no tokens yet
        const res = await registerAPI(userData);
        toast.success("OTP sent to your email! Check your inbox.");
        return res.data; // { message, email }
    };

    const verifyOtp = async (email, otp) => {
        // Step 2: Verify OTP → backend creates user & returns tokens
        const res = await verifyOTPAPI(email, otp);
        localStorage.setItem("access", res.data.access);
        localStorage.setItem("refresh", res.data.refresh);
        if (res.data.user) {
            setUser(res.data.user);
        } else {
            await fetchProfile();
        }
        toast.success("🎉 Account verified & created successfully!");
        return true;
    };

    const resendOtp = async (email) => {
        const res = await resendOTPAPI(email);
        toast.success("New OTP sent to your email!");
        return res.data;
    };

    const googleLoginUser = async (googlePayload) => {
        const res = await googleLoginAPI(googlePayload);
        localStorage.setItem("access", res.data.access);
        localStorage.setItem("refresh", res.data.refresh);
        if (res.data.user) {
            setUser(res.data.user);
        } else {
            await fetchProfile();
        }
        toast.success("Logged in with Google!");
        return true;
    };

    const logout = () => {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        setUser(null);
        toast.info("Logged out");
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isAuthenticated: !!user,
                loginUser,
                registerUser,
                verifyOtp,
                resendOtp,
                googleLoginUser,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
