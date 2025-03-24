import { useState, useEffect } from "react";
import axios from "axios";

export const useNotification = () => {
    const [notifications, setNotifications] = useState([]);
    const [notification, setNotification] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const response = await axios.get("http://localhost:8083/factoring/contrat/api/notifications-all", {
                withCredentials: true,
            });
            if (response.status !== 200) {
                throw new Error("Une erreur s'est produite");
            }
            setNotifications(response.data);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const readNotification = async (id) => {
        setLoading(true);
        try {
            const response = await axios.post(
                `http://localhost:8083/factoring/contrat/api/notifications-read/${id}`,
                {},
                { withCredentials: true }
            );
            if (response.status !== 200) {
                throw new Error("Une erreur s'est produite");
            }
            // Refresh the notifications after marking as read
            await fetchNotifications();
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const findNotificationById = async (id) => {
        setLoading(true);
        try {
            const response = await axios.get(
                `http://localhost:8083/factoring/contrat/api/notification/${id}`,
                { withCredentials: true }
            );
            if (response.status !== 200) {
                throw new Error("Une erreur s'est produite");
            }
            setNotification(response.data);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    // On mount, only fetch all notifications
    useEffect(() => {
        fetchNotifications();
    }, []);

    return { notifications, notification, loading, error, readNotification, findNotificationById };
};
