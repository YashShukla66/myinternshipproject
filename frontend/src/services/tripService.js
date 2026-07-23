import api from "./api";

export const getTrips = (params = {}) => {
    return api.get("trips/", { params });
};

export const getTrip = (id) => {
    return api.get(`trips/${id}/`);
};

export const createTrip = (data) => {
    return api.post("trips/", data);
};

export const updateTrip = (id, data) => {
    return api.put(`trips/${id}/`, data);
};

export const deleteTrip = (id) => {
    return api.delete(`trips/${id}/`);
};
