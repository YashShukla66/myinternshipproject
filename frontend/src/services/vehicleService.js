import api from "./api";

// Get Vehicles
export const getVehicles = (params = {}) => {
    return api.get("vehicles/", {
        params,
    });
};

// Get Single Vehicle
export const getVehicle = (id) => {
    return api.get(`vehicles/${id}/`);
};

// Create Vehicle
export const createVehicle = (formData) => {
    return api.post("vehicles/", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};

// Update Vehicle
export const updateVehicle = (id, formData) => {
    return api.put(`vehicles/${id}/`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};

// Delete Vehicle
export const deleteVehicle = (id) => {
    return api.delete(`vehicles/${id}/`);
};