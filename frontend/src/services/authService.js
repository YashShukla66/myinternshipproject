import api from "./api";
import axios from "axios";

export const login = (credentials) => {
    return api.post("accounts/login/", credentials);
};

export const register = (userData) => {
    return api.post("accounts/register/", userData);
};

export const verifyOTP = (email, otp) => {
    return api.post("accounts/verify-otp/", { email, otp });
};

export const resendOTP = (email) => {
    return api.post("accounts/resend-otp/", { email });
};

export const googleLogin = (payload) => {
    return api.post("accounts/google-login/", payload);
};

export const refreshToken = (refresh) => {
    return api.post("accounts/refresh/", { refresh });
};

export const getProfile = () => {
    return api.get("accounts/profile/");
};
