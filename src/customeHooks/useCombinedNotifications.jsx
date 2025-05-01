import { useState, useEffect } from "react";
import { useNotification } from "./useNotification";
import useWebSocket from "./useWebSocket";

export const useCombinedNotifications = (userId) => {
    const { notifications: apiNotifications, loading, error, readNotification } = useNotification();
    const { notifications: socketNotifications } = useWebSocket(userId);
    const [allNotifications, setAllNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const normalizeNotification = (notification) => {
        const isSocketNotification = !!notification.payload;

        return {
            id: isSocketNotification ? notification.payload.id : notification.id,
            title: isSocketNotification ? notification.payload.title : notification.notificationTitle,
            message: isSocketNotification ? notification.payload.message : notification.notificationMessage,
            createdAt: isSocketNotification ?
                new Date(notification.payload.createdAt) :
                new Date(notification.notificationDate),
            taskId: isSocketNotification ? notification.taskId : notification.notificationTaskId,
            notificationType: isSocketNotification ?
                notification.payload.eventType :
                notification.notificationType,
            read: isSocketNotification ? false : (notification.notificationRead ?? false),
            util: notification.notificationBoolUtil ?? false,
            source: isSocketNotification ? 'socket' : 'api'
        };
    };

    useEffect(() => {
        const normalizedApi = apiNotifications.map(normalizeNotification);
        const normalizedSocket = socketNotifications.map(normalizeNotification);

        const combined = [...normalizedApi, ...normalizedSocket];

        const uniqueNotifications = combined.reduce((acc, current) => {
            const exists = acc.find(item => item.id === current.id);
            if (!exists) return [...acc, current];
            if (exists.source === 'socket' && current.source === 'api') {
                return [...acc.filter(item => item.id !== current.id), current];
            }
            return acc;
        }, []);

        const filteredNotifications = uniqueNotifications.filter(n => !n.util);
        filteredNotifications.sort((a, b) => b.createdAt - a.createdAt);

        setAllNotifications(filteredNotifications);
        setUnreadCount(filteredNotifications.filter(n => !n.read).length);
    }, [apiNotifications, socketNotifications]);

    const markAsRead = async (id) => {
        const notification = allNotifications.find(n => n.id === id);
        if (!notification) return;

        if (notification.source === 'api') {
            await readNotification(id);
        }

        const updatedNotifications = allNotifications.map(n =>
            n.id === id ? { ...n, read: true } : n
        );

        setAllNotifications(updatedNotifications);
        setUnreadCount(updatedNotifications.filter(n => !n.read).length);
    };


    return {
        notifications: allNotifications,
        unreadCount,
        loading,
        error,
        markAsRead
    };
};