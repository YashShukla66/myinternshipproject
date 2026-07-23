import api from "./api";

export const predictByParams = (mileage, year) => {
    return api.get("predict-maintenance/", {
        params: { mileage, year },
    });
};

export const predictByVehicle = (vehicleId) => {
    return api.get(`vehicles/${vehicleId}/predict-maintenance/`);
};
