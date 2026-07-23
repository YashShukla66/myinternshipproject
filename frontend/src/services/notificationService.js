import api from "./api";

export const getNotifications = (params = {}) => {
    return api.get("notifications/", { params });
};

export const markAsRead = (id) => {
    return api.patch(`notifications/${id}/`, { is_read: true });
};

export const deleteNotification = (id) => {
    return api.delete(`notifications/${id}/`);
};
