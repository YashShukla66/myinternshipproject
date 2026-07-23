import api from "./api";
import axios from "axios";

export const login = (credentials) => {
    return axios.post("http://127.0.0.1:8000/api/accounts/login/", credentials);
};

export const register = (userData) => {
    return axios.post("http://127.0.0.1:8000/api/accounts/register/", userData);
};

export const verifyOTP = (email, otp) => {
    return axios.post("http://127.0.0.1:8000/api/accounts/verify-otp/", { email, otp });
};

export const resendOTP = (email) => {
    return axios.post("http://127.0.0.1:8000/api/accounts/resend-otp/", { email });
};

export const googleLogin = (payload) => {
    return axios.post("http://127.0.0.1:8000/api/accounts/google-login/", payload);
};

export const refreshToken = (refresh) => {
    return axios.post("http://127.0.0.1:8000/api/accounts/refresh/", { refresh });
};

export const getProfile = () => {
    return api.get("accounts/profile/");
};
