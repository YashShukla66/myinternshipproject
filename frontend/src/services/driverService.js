import api from "./api";

export const getDrivers = (params = {}) => {
    return api.get("drivers/", { params });
};

export const getDriver = (id) => {
    return api.get(`drivers/${id}/`);
};

export const createDriver = (formData) => {
    return api.post("drivers/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
};

export const updateDriver = (id, formData) => {
    return api.put(`drivers/${id}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
};

export const deleteDriver = (id) => {
    return api.delete(`drivers/${id}/`);
};