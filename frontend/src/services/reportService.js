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

export const downloadAIPredictionPDF = () => {
    return api.get("reports/ai-predictions/pdf/", {
        responseType: "blob",
    });
};

export const downloadAIPredictionExcel = () => {
    return api.get("reports/ai-predictions/excel/", {
        responseType: "blob",
    });
};
