import api from "./api";

export const getDashboard = () => {
    return api.get("dashboard/");
};

export const getVehicleChart = () => {
    return api.get("charts/vehicles/");
};

export const getDriverChart = () => {
    return api.get("charts/drivers/");
};

export const getTripChart = () => {
    return api.get("charts/trips/");
};

export const getMaintenanceChart = () => {
    return api.get("charts/maintenance/");
};
