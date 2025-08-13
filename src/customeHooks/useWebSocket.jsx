    // useWebSocket.jsx
import { useEffect, useState, useRef } from "react";
import SockJS from "sockjs-client";
import Stomp from "stompjs";

const useWebSocket = (userId) => {
    const [notifications, setNotifications] = useState([]);
    const [taskActionResponse, setTaskActionResponse] = useState(null);
    const stompClientRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const socket = new SockJS("http://localhost:8083/factoring/contrat/ws",userId,{
            withCredentials:true,
        });

        const stompClient = Stomp.over(socket);
        stompClient.debug = (str) => console.log("STOMP DEBUG:", str);
        stompClient.connect({}, () => {
            console.log("WebSocket connected");
            console.log(userId)
            setIsConnected(true);

            // Subscribe to user-specific notifications
            stompClient.subscribe(`/user/queue/task-events`, (message) => {
                console.log(message)
                const event = JSON.parse(message.body);
                setNotifications((prev) => [...prev, event]);
            });

            // Subscribe to task action responses
            stompClient.subscribe("/topic/task-actions-response", (message) => {
                setTaskActionResponse(message.body);
            });

        }, (error) => {
            console.error("WebSocket connection error:", error);
        });

        stompClientRef.current = stompClient;

        // Cleanup: Only disconnect if connection is established
        return () => {
            if (stompClientRef.current && stompClientRef.current.connected) {
                stompClientRef.current.disconnect(() => {
                    console.log("WebSocket disconnected");
                });
            }
        };
    }, [userId]);

    const sendTaskAction = (taskAction) => {
        if (stompClientRef.current && stompClientRef.current.connected) {
            stompClientRef.current.send("/app/task-action", {}, JSON.stringify(taskAction));
        } else {
            console.error("Cannot send task action. WebSocket is not connected.");
        }
    };

    return { notifications, sendTaskAction, taskActionResponse };
};

export default useWebSocket;
