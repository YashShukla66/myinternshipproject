import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";
import {
    FaCar,
    FaUser,
    FaLock,
    FaSignInAlt,
    FaEye,
    FaEyeSlash,
    FaShieldAlt,
    FaUserCheck,
    FaUserPlus,
    FaGoogle,
    FaTimes,
    FaEnvelope,
    FaRedo,
    FaCheckCircle,
    FaArrowLeft,
} from "react-icons/fa";

const OTP_LENGTH = 6;
const OTP_EXPIRY_SECONDS = 5 * 60; // 5 minutes

export default function Login() {
    const [form, setForm] = useState({ username: "", password: "" });
    const [registerForm, setRegisterForm] = useState({
        username: "",
        email: "",
        password: "",
        role: "MANAGER",
        phone: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);

    // OTP State
    const [otpStep, setOtpStep] = useState(false); // true = show OTP input
    const [otpEmail, setOtpEmail] = useState("");
    const [otpValues, setOtpValues] = useState(Array(OTP_LENGTH).fill(""));
    const [otpTimer, setOtpTimer] = useState(OTP_EXPIRY_SECONDS);
    const [otpVerified, setOtpVerified] = useState(false);
    const [resending, setResending] = useState(false);
    const otpInputRefs = useRef([]);
    const timerRef = useRef(null);

    const { loginUser, registerUser, verifyOtp, resendOtp, googleLoginUser } =
        useAuth();
    const navigate = useNavigate();

    // ----- OTP Countdown Timer -----
    useEffect(() => {
        if (otpStep && otpTimer > 0 && !otpVerified) {
            timerRef.current = setInterval(() => {
                setOtpTimer((prev) => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timerRef.current);
    }, [otpStep, otpVerified]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, "0")}`;
    };

    const timerPercent = (otpTimer / OTP_EXPIRY_SECONDS) * 100;

    // ----- Google Login -----
    useEffect(() => {
        if (window.google?.accounts?.id) {
            try {
                window.google.accounts.id.initialize({
                    client_id:
                        "1059293154812-demo-client-id.apps.googleusercontent.com",
                    callback: handleGoogleCallback,
                });
                window.google.accounts.id.renderButton(
                    document.getElementById("googleBtnDiv"),
                    {
                        theme: "filled_dark",
                        size: "large",
                        width: "100%",
                        shape: "circle",
                    }
                );
            } catch (e) {
                console.log("Google SDK load warning", e);
            }
        }
    }, []);

    const handleGoogleCallback = async (response) => {
        if (response.credential) {
            setLoading(true);
            try {
                await googleLoginUser({ credential: response.credential });
                navigate("/");
            } catch (err) {
                toast.error("Google sign in failed");
            } finally {
                setLoading(false);
            }
        }
    };

    const handleCustomGoogleLogin = async () => {
        if (window.google?.accounts?.id) {
            window.google.accounts.id.prompt();
        } else {
            setLoading(true);
            try {
                await googleLoginUser({
                    email: "demo.user@gmail.com",
                    name: "Google Account User",
                });
                navigate("/");
            } catch (err) {
                toast.error("Google Authentication error");
            } finally {
                setLoading(false);
            }
        }
    };

    // ----- Login Form -----
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await loginUser(form);
            navigate("/");
        } catch (error) {
            toast.error(
                error.response?.data?.detail || "Invalid username or password"
            );
        } finally {
            setLoading(false);
        }
    };

    // ----- Registration Form -----
    const handleRegisterChange = (e) => {
        setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });
    };

    const formatApiError = (data) => {
        if (!data) return "Registration failed";
        if (typeof data === "string") return data;
        if (data.error) return data.error;
        if (typeof data === "object") {
            const firstKey = Object.keys(data)[0];
            const firstVal = data[firstKey];
            if (Array.isArray(firstVal))
                return `${firstKey.toUpperCase()}: ${firstVal[0]}`;
            if (typeof firstVal === "string")
                return `${firstKey.toUpperCase()}: ${firstVal}`;
        }
        return "Registration failed";
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const result = await registerUser(registerForm);
            // Step 1 complete: OTP sent, switch to OTP input
            setOtpEmail(result.email);
            setOtpStep(true);
            setOtpValues(Array(OTP_LENGTH).fill(""));
            setOtpTimer(OTP_EXPIRY_SECONDS);
            setOtpVerified(false);
            // Auto-focus first OTP input after render
            setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
        } catch (error) {
            const msg = formatApiError(error.response?.data);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    // ----- OTP Input Handlers -----
    const handleOtpChange = useCallback(
        (index, value) => {
            // Only allow digits
            if (value && !/^\d$/.test(value)) return;

            const newValues = [...otpValues];
            newValues[index] = value;
            setOtpValues(newValues);

            // Auto-advance to next input
            if (value && index < OTP_LENGTH - 1) {
                otpInputRefs.current[index + 1]?.focus();
            }

            // Auto-submit when all digits filled
            if (value && index === OTP_LENGTH - 1) {
                const fullOtp = newValues.join("");
                if (fullOtp.length === OTP_LENGTH) {
                    handleOtpSubmit(fullOtp);
                }
            }
        },
        [otpValues]
    );

    const handleOtpKeyDown = useCallback(
        (index, e) => {
            if (e.key === "Backspace" && !otpValues[index] && index > 0) {
                otpInputRefs.current[index - 1]?.focus();
            }
            if (e.key === "ArrowLeft" && index > 0) {
                otpInputRefs.current[index - 1]?.focus();
            }
            if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
                otpInputRefs.current[index + 1]?.focus();
            }
        },
        [otpValues]
    );

    const handleOtpPaste = useCallback((e) => {
        e.preventDefault();
        const pastedData = e.clipboardData
            .getData("text")
            .replace(/\D/g, "")
            .slice(0, OTP_LENGTH);
        if (pastedData.length > 0) {
            const newValues = Array(OTP_LENGTH).fill("");
            pastedData.split("").forEach((char, i) => {
                newValues[i] = char;
            });
            setOtpValues(newValues);
            const focusIdx = Math.min(pastedData.length, OTP_LENGTH - 1);
            otpInputRefs.current[focusIdx]?.focus();

            if (pastedData.length === OTP_LENGTH) {
                handleOtpSubmit(pastedData);
            }
        }
    }, []);

    const handleOtpSubmit = async (otp) => {
        if (!otp || otp.length !== OTP_LENGTH) {
            toast.error("Please enter the complete 6-digit OTP.");
            return;
        }
        setLoading(true);
        try {
            await verifyOtp(otpEmail, otp);
            setOtpVerified(true);
            clearInterval(timerRef.current);
            // Short delay to show success animation, then navigate
            setTimeout(() => {
                setIsRegisterOpen(false);
                setOtpStep(false);
                navigate("/");
            }, 1500);
        } catch (error) {
            const msg = formatApiError(error.response?.data);
            toast.error(msg);
            // Clear OTP and refocus
            setOtpValues(Array(OTP_LENGTH).fill(""));
            setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setResending(true);
        try {
            await resendOtp(otpEmail);
            setOtpTimer(OTP_EXPIRY_SECONDS);
            setOtpValues(Array(OTP_LENGTH).fill(""));
            setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
        } catch (error) {
            const msg = formatApiError(error.response?.data);
            toast.error(msg);
        } finally {
            setResending(false);
        }
    };

    const handleBackToRegister = () => {
        setOtpStep(false);
        setOtpValues(Array(OTP_LENGTH).fill(""));
        clearInterval(timerRef.current);
    };

    const handleCloseRegister = () => {
        setIsRegisterOpen(false);
        setOtpStep(false);
        setOtpValues(Array(OTP_LENGTH).fill(""));
        setOtpEmail("");
        clearInterval(timerRef.current);
    };

    // ----- Quick Login -----
    const handleQuickLogin = async (username, password) => {
        setForm({ username, password });
        setLoading(true);
        try {
            await loginUser({ username, password });
            navigate("/");
        } catch (error) {
            toast.error("Quick login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden p-4 selection:bg-indigo-500 selection:text-white">
            {/* Ambient Background Glow Orbs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px] pointer-events-none animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-indigo-600/20 rounded-full blur-[140px] pointer-events-none"></div>

            {/* Grid Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none"></div>

            <div className="w-full max-w-md relative z-10 my-8">
                {/* Brand Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white text-3xl mb-4 shadow-2xl shadow-indigo-500/40 ring-1 ring-white/20">
                        <FaCar />
                    </div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">
                        Fleet <span className="gradient-text">Core</span>
                    </h1>
                    <p className="text-slate-400 mt-2 text-sm font-medium">
                        Real ID & Password Login • Google Authentication
                    </p>
                </div>

                {/* Main Login Card */}
                <div className="glass-card rounded-3xl p-8 border border-white/10 shadow-2xl backdrop-blur-2xl">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                                Username / User ID
                            </label>
                            <div className="relative">
                                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                                <input
                                    name="username"
                                    placeholder="Enter your username"
                                    value={form.username}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-11 pr-4 py-3.5 glass-input rounded-xl text-sm placeholder-slate-500 text-white focus:outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-11 pr-11 py-3.5 glass-input rounded-xl text-sm placeholder-slate-500 text-white focus:outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                                >
                                    {showPassword ? (
                                        <FaEyeSlash />
                                    ) : (
                                        <FaEye />
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all duration-200 active:scale-[0.99]"
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            ) : (
                                <>
                                    <FaSignInAlt />
                                    <span>Sign In with ID & Password</span>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Google OAuth Section */}
                    <div className="mt-6 pt-5 border-t border-slate-800">
                        <p className="text-center text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                            Or Continue With
                        </p>

                        <div id="googleBtnDiv" className="w-full mb-2"></div>

                        <button
                            type="button"
                            onClick={handleCustomGoogleLogin}
                            disabled={loading}
                            className="w-full py-3 bg-white text-slate-900 hover:bg-slate-100 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow transition active:scale-[0.99]"
                        >
                            <FaGoogle className="text-rose-500 text-base" />
                            <span>Sign in with Google Account</span>
                        </button>
                    </div>

                    {/* Registration & Demo Options Footer */}
                    <div className="mt-6 pt-5 border-t border-white/10 text-center space-y-4">
                        <p className="text-xs text-slate-400">
                            Don't have an account?{" "}
                            <button
                                onClick={() => setIsRegisterOpen(true)}
                                className="text-indigo-400 hover:text-indigo-300 font-bold underline cursor-pointer"
                            >
                                Register New User
                            </button>
                        </p>

                        <div className="pt-2">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                                ⚡ Quick Dev Logins
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleQuickLogin("admin", "admin123")
                                    }
                                    className="px-3 py-2 bg-slate-800/80 hover:bg-slate-700 text-blue-300 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 border border-blue-500/20"
                                >
                                    <FaShieldAlt className="text-blue-400" />{" "}
                                    Admin
                                </button>
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleQuickLogin("yash", "admin123")
                                    }
                                    className="px-3 py-2 bg-slate-800/80 hover:bg-slate-700 text-purple-300 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 border border-purple-500/20"
                                >
                                    <FaUserCheck className="text-purple-400" />{" "}
                                    Manager
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════
                REGISTER + OTP VERIFICATION MODAL
            ═══════════════════════════════════════════ */}
            {isRegisterOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
                    <div className="w-full max-w-md glass-card rounded-3xl p-6 border border-white/10 shadow-2xl animate-modal relative">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                {otpStep ? (
                                    <>
                                        <FaEnvelope className="text-emerald-400" />
                                        Verify Your Email
                                    </>
                                ) : (
                                    <>
                                        <FaUserPlus className="text-indigo-400" />
                                        Create New Account
                                    </>
                                )}
                            </h2>
                            <button
                                onClick={handleCloseRegister}
                                className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl transition"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        {/* ─── Registration Form (Step 1) ─── */}
                        {!otpStep && (
                            <form
                                onSubmit={handleRegisterSubmit}
                                className="space-y-4 text-xs"
                            >
                                <div>
                                    <label className="block text-slate-300 font-semibold mb-1">
                                        Username *
                                    </label>
                                    <input
                                        name="username"
                                        placeholder="Choose a new username"
                                        value={registerForm.username}
                                        onChange={handleRegisterChange}
                                        required
                                        className="w-full glass-input p-3 rounded-xl focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-slate-300 font-semibold mb-1">
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="user@gmail.com"
                                        value={registerForm.email}
                                        onChange={handleRegisterChange}
                                        required
                                        className="w-full glass-input p-3 rounded-xl focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-slate-300 font-semibold mb-1">
                                        Password *
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        placeholder="Create password"
                                        value={registerForm.password}
                                        onChange={handleRegisterChange}
                                        required
                                        className="w-full glass-input p-3 rounded-xl focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-slate-300 font-semibold mb-1">
                                        Role *
                                    </label>
                                    <select
                                        name="role"
                                        value={registerForm.role}
                                        onChange={handleRegisterChange}
                                        className="w-full glass-input p-3 rounded-xl focus:outline-none bg-slate-900"
                                    >
                                        <option value="ADMIN">Admin</option>
                                        <option value="MANAGER">
                                            Fleet Manager
                                        </option>
                                        <option value="DRIVER">Driver</option>
                                    </select>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            <span>Sending OTP...</span>
                                        </>
                                    ) : (
                                        <>
                                            <FaEnvelope />
                                            <span>
                                                Send Verification Code
                                            </span>
                                        </>
                                    )}
                                </button>
                            </form>
                        )}

                        {/* ─── OTP Verification (Step 2) ─── */}
                        {otpStep && (
                            <div className="text-center">
                                {/* Success State */}
                                {otpVerified ? (
                                    <div className="py-8 animate-otp-success">
                                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-green-400 text-white text-4xl mb-4 shadow-2xl shadow-emerald-500/40 animate-bounce">
                                            <FaCheckCircle />
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2">
                                            Email Verified!
                                        </h3>
                                        <p className="text-emerald-400 text-sm font-medium">
                                            Account created successfully.
                                            Redirecting...
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Email indicator */}
                                        <div className="mb-6">
                                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white text-2xl mb-3 shadow-xl shadow-indigo-500/30">
                                                <FaEnvelope />
                                            </div>
                                            <p className="text-slate-400 text-xs mb-1">
                                                We sent a 6-digit code to
                                            </p>
                                            <p className="text-white font-bold text-sm">
                                                {otpEmail}
                                            </p>
                                        </div>

                                        {/* OTP Input Boxes */}
                                        <div className="flex justify-center gap-2 sm:gap-3 mb-6">
                                            {otpValues.map((digit, index) => (
                                                <input
                                                    key={index}
                                                    ref={(el) =>
                                                        (otpInputRefs.current[
                                                            index
                                                        ] = el)
                                                    }
                                                    type="text"
                                                    inputMode="numeric"
                                                    maxLength={1}
                                                    value={digit}
                                                    onChange={(e) =>
                                                        handleOtpChange(
                                                            index,
                                                            e.target.value
                                                        )
                                                    }
                                                    onKeyDown={(e) =>
                                                        handleOtpKeyDown(
                                                            index,
                                                            e
                                                        )
                                                    }
                                                    onPaste={
                                                        index === 0
                                                            ? handleOtpPaste
                                                            : undefined
                                                    }
                                                    disabled={loading}
                                                    className={`
                                                        w-11 h-14 sm:w-12 sm:h-16
                                                        text-center text-xl sm:text-2xl font-bold
                                                        rounded-xl border-2 transition-all duration-200
                                                        focus:outline-none
                                                        ${
                                                            digit
                                                                ? "border-indigo-500 bg-indigo-500/10 text-white shadow-lg shadow-indigo-500/20"
                                                                : "border-slate-700 bg-slate-900/50 text-slate-300"
                                                        }
                                                        focus:border-indigo-400 focus:bg-indigo-500/15 focus:shadow-lg focus:shadow-indigo-500/30
                                                        disabled:opacity-50
                                                        placeholder-slate-600
                                                    `}
                                                    style={{
                                                        caretColor:
                                                            "transparent",
                                                    }}
                                                />
                                            ))}
                                        </div>

                                        {/* Timer with progress bar */}
                                        <div className="mb-5">
                                            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mb-2">
                                                <div
                                                    className="h-full rounded-full transition-all duration-1000 ease-linear"
                                                    style={{
                                                        width: `${timerPercent}%`,
                                                        background:
                                                            otpTimer > 60
                                                                ? "linear-gradient(90deg, #6366f1, #8b5cf6)"
                                                                : otpTimer > 30
                                                                ? "linear-gradient(90deg, #f59e0b, #ef4444)"
                                                                : "#ef4444",
                                                    }}
                                                />
                                            </div>
                                            <p
                                                className={`text-xs font-mono font-bold ${
                                                    otpTimer > 60
                                                        ? "text-slate-400"
                                                        : otpTimer > 30
                                                        ? "text-amber-400"
                                                        : "text-red-400 animate-pulse"
                                                }`}
                                            >
                                                {otpTimer > 0
                                                    ? `⏱ Code expires in ${formatTime(otpTimer)}`
                                                    : "⚠️ Code has expired"}
                                            </p>
                                        </div>

                                        {/* Verify Button */}
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleOtpSubmit(
                                                    otpValues.join("")
                                                )
                                            }
                                            disabled={
                                                loading ||
                                                otpValues.join("").length !==
                                                    OTP_LENGTH ||
                                                otpTimer === 0
                                            }
                                            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-4"
                                        >
                                            {loading ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                    <span>Verifying...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <FaCheckCircle />
                                                    <span>
                                                        Verify & Create Account
                                                    </span>
                                                </>
                                            )}
                                        </button>

                                        {/* Resend & Back */}
                                        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                                            <button
                                                type="button"
                                                onClick={handleBackToRegister}
                                                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition"
                                            >
                                                <FaArrowLeft className="text-[10px]" />
                                                Back
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleResendOtp}
                                                disabled={
                                                    resending || otpTimer > 0
                                                }
                                                className="text-xs text-indigo-400 hover:text-indigo-300 disabled:text-slate-600 disabled:cursor-not-allowed flex items-center gap-1 font-semibold transition"
                                            >
                                                <FaRedo
                                                    className={`text-[10px] ${
                                                        resending
                                                            ? "animate-spin"
                                                            : ""
                                                    }`}
                                                />
                                                {resending
                                                    ? "Sending..."
                                                    : "Resend OTP"}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ─── Inline Styles for OTP animations ─── */}
            <style>{`
                @keyframes otpSuccessPop {
                    0% { transform: scale(0.5); opacity: 0; }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); opacity: 1; }
                }
                .animate-otp-success {
                    animation: otpSuccessPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                }
            `}</style>
        </div>
    );
}