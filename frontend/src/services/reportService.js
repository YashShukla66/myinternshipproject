import api from "./api";

export const downloadVehiclePDF = () => {
    return api.get("reports/vehicles/pdf/", {
        responseType: "blob",
    });
};

export const downloadVehicleExcel = () => {
    return api.get("reports/vehicles/excel/", {
        responseType: "blob",
    });
};
