// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import useWebSocket from "../customeHooks/useWebSocket.jsx";
// import { useSelector } from "react-redux";
// import { timeAgo } from "../helpers/timeConvert.js";
// import { tokens } from "../theme.js";
// import { Box, Typography, List, ListItem, Paper, useTheme, Badge } from "@mui/material";
// import Header from "./Header.jsx";
// import { useNotification } from "../customeHooks/useNotification.jsx";
//
// const NotificationPanel = () => {
//     const theme = useTheme();
//     const colors = tokens(theme.palette.mode);
//     const navigate = useNavigate();
//     const { current } = useSelector((state) => state.user);
//     const userId = current.email;
//
//     // Fetch notifications from API
//     const { notifications: fetchedNotifications, loading, error, readNotification } = useNotification();
//     // Real-time notifications from WebSocket
//     const { notifications: socketNotifications,sendTaskAction } = useWebSocket(userId);
//
//     const [allNotifications, setAllNotifications] = useState([]);
//     console.log(socketNotifications)
//
//     // Normalize notifications from both sources
//     const normalizeNotification = (notification) => {
//         const rawDate = notification.payload ? notification.payload.createdAt : notification.notificationDate;
//         const createdAt = typeof rawDate === "number" ? new Date(rawDate) : new Date(rawDate);
//
//         return {
//             id: notification.payload?.id  || notification.id, // Ensure each notification has an ID for marking as read
//             title: notification.payload?.title || notification.notificationTitle,
//             message: notification.payload?.message || notification.notificationMessage,
//             createdAt,
//             taskId: notification?.taskId || notification.notificationTaskId,
//             notificationType: notification.payload?.eventType || notification.notificationType,
//             read: notification.notificationRead ?? false, // Default to false if undefined
//             util:notification.notificationBoolUtil ?? false,
//         };
//     };
//
//     useEffect(() => {
//         const normalizedFetched = fetchedNotifications.map(normalizeNotification);
//         const normalizedSocket = socketNotifications.map(normalizeNotification);
//         const combinedNotifications = [...normalizedFetched, ...normalizedSocket];
//
//         // Remove duplicates based on title, message, and createdAt
//         const uniqueNotifications = combinedNotifications.filter(
//             (notification, index, self) =>
//                 index === self.findIndex(
//                     (n) =>
//                         n.title === notification.title &&
//                         n.message === notification.message &&
//                         n.createdAt.getTime() === notification.createdAt.getTime()
//                 )
//         );
//
//         // ❗ Filter to only show util === false
//         const filteredNotifications = uniqueNotifications.filter((n) => !n.util);
//
//         // Sort notifications (newest first)
//         filteredNotifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
//
//         setAllNotifications(filteredNotifications);
//     }, [fetchedNotifications, socketNotifications]);
//
//
//     const handleNotificationClick = async (notification) => {
//
//         if (!notification.read) {
//             sendTaskAction({"taskId":notification.taskId,"actionType":"CLAIM","userId":current.id,"variables":{"token":current.token}}); // Mark as read in real-time
//
//             await readNotification(notification.id); // Mark as read first
//         }
//         if(notification.notificationType==="TASK_CREATED"){
//             navigate("/validation-validateur/"+notification.id); // Then navigate
//         }
//         if(notification.notificationType==="TASK_CREATED_JURIDIQUE"){
//             navigate("/validation-juridique/"+notification.id); // Then navigate
//         }
//         if(notification.notificationType==="TASK_CREATED_MODIFY"){
//             navigate("/update-contrat/"+notification.id); // Then navigate
//         }
//     };
//
//     return (
//         <Box sx={{ p: 4, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center" }}>
//             <Header title="Les Notifications" subtitle="Liste Des Notifications" />
//
//             {loading ? (
//                 <Typography color={colors.grey[300]}>Chargement des notifications...</Typography>
//             ) : error ? (
//                 <Typography color="error">Erreur: {error}</Typography>
//             ) : allNotifications.length === 0 ? (
//                 <Typography color={colors.grey[300]}>Aucune notification disponible.</Typography>
//             ) : (
//                 <List sx={{ width: "100%", maxWidth: 600 }}>
//                     {allNotifications.map((notification) => (
//                         <ListItem key={notification.id} sx={{ mb: 2 }} onClick={() => handleNotificationClick(notification)} style={{ cursor: "pointer" }}>
//                             <Paper
//                                 sx={{
//                                     p: 3,
//                                     width: "100%",
//                                     borderRadius: 2,
//                                     backgroundColor: colors.primary[400],
//                                     color: colors.grey[100],
//                                     boxShadow: "0px 4px 10px rgba(0,0,0,0.2)",
//                                     transition: "0.3s",
//                                     "&:hover": { boxShadow: "0px 6px 15px rgba(0,0,0,0.3)" },
//                                 }}
//                             >
//                                 {/* Title + Unread Badge */}
//                                 <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//                                     <Typography variant="h6" sx={{ fontWeight: notification.read ? "normal" : "bold" }}>
//                                         {notification.title}
//                                     </Typography>
//                                     <Badge
//                                         variant="dot"
//                                         color="error"
//                                         invisible={notification.read}
//                                         sx={{
//                                             "& .MuiBadge-badge": { width: 12, height: 12, borderRadius: "50%" },
//                                         }}
//                                     />
//                                 </Box>
//                                 {/* Message + Time */}
//                                 <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
//                                     <Typography variant="body1" sx={{ fontWeight: notification.read ? "normal" : "bold" }}>
//                                         {notification.message}
//                                     </Typography>
//                                     <Typography variant="caption" color={colors.grey[300]}>
//                                         {timeAgo(notification.createdAt)}
//                                     </Typography>
//                                 </Box>
//                             </Paper>
//                         </ListItem>
//                     ))}
//                 </List>
//             )}
//         </Box>
//     );
// };
//
// export default NotificationPanel;
import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useCombinedNotifications } from "../customeHooks/useCombinedNotifications";
import { tokens } from "../theme.js";
import { Box, Typography, List, ListItem, Paper, useTheme, Badge } from "@mui/material";
import Header from "./Header.jsx";
import {timeAgo} from "../helpers/timeConvert.js";

const NotificationPanel = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const navigate = useNavigate();
    const { current } = useSelector((state) => state.user);
    const { notifications, unreadCount, loading, error, markAsRead } = useCombinedNotifications(current.email);

    const handleNotificationClick = async (notification) => {
        if (!notification.read) {
            await markAsRead(notification.id);
        }

        const navMap = {
            "TASK_CREATED": `/validation-validateur/${notification.id}`,
            "TASK_CREATED_JURIDIQUE": `/validation-juridique/${notification.id}`,
            "TASK_CREATED_MODIFY": `/update-contrat/${notification.id}`
        };

        if (navMap[notification.notificationType]) {
            navigate(navMap[notification.notificationType]);
        }
        window.location.reload()

    };

    console.log(notifications)
    return (
        <Box sx={{ p: 4, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Header title="Les Notifications" subtitle="Liste Des Notifications" />

            {loading ? (
                <Typography color={colors.grey[300]}>Chargement des notifications...</Typography>
            ) : error ? (
                <Typography color="error">Erreur: {error}</Typography>
            ) : notifications.length === 0 ? (
                <Typography color={colors.grey[300]}>Aucune notification disponible.</Typography>
            ) : (
                <List sx={{ width: "100%", maxWidth: 600 }}>
                    {notifications.map((notification) => (
                        <ListItem key={notification.id} sx={{ mb: 2 }} onClick={() => handleNotificationClick(notification)} style={{ cursor: "pointer" }}>
                            <Paper
                                sx={{
                                    p: 3,
                                    width: "100%",
                                    borderRadius: 2,
                                    backgroundColor: colors.primary[400],
                                    color: colors.grey[100],
                                    boxShadow: "0px 4px 10px rgba(0,0,0,0.2)",
                                    transition: "0.3s",
                                    "&:hover": { boxShadow: "0px 6px 15px rgba(0,0,0,0.3)" },
                                }}
                            >
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <Typography variant="h6" sx={{ fontWeight: notification.read ? "normal" : "bold" }}>
                                        {notification.title}
                                    </Typography>
                                    <Badge
                                        variant="dot"
                                        color="error"
                                        invisible={notification.read}
                                        sx={{
                                            "& .MuiBadge-badge": { width: 12, height: 12, borderRadius: "50%" },
                                        }}
                                    />
                                </Box>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
                                    <Typography variant="body1" sx={{ fontWeight: notification.read ? "normal" : "bold" }}>
                                        {notification.message}
                                    </Typography>
                                    <Typography variant="caption" color={colors.grey[300]}>
                                        {timeAgo(notification.createdAt)}
                                    </Typography>
                                </Box>
                            </Paper>
                        </ListItem>
                    ))}
                </List>
            )}
        </Box>
    );
};

export default NotificationPanel;