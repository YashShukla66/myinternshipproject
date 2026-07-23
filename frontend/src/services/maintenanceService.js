import api from "./api";

export const getMaintenanceRecords = (params = {}) => {
    return api.get("maintenance/", { params });
};

export const getMaintenanceRecord = (id) => {
    return api.get(`maintenance/${id}/`);
};

export const createMaintenanceRecord = (data) => {
    return api.post("maintenance/", data);
};

export const updateMaintenanceRecord = (id, data) => {
    return api.put(`maintenance/${id}/`, data);
};

export const deleteMaintenanceRecord = (id) => {
    return api.delete(`maintenance/${id}/`);
};
