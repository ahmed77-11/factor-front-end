import { useEffect } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

// eslint-disable-next-line react/prop-types
const WebSocketService = ({ onTaskEvent }) => {
    useEffect(() => {
        const client = new Client({
            brokerURL: "ws://localhost:8080/ws", // Your WebSocket endpoint
            connectHeaders: {
                // You can add cookies here or use a specific cookie name
                "Cookie": `JWT_TOKEN=${document.cookie}`  // For example, using document.cookie to get the JWT token
            },
            debug: (str) => {
                console.log(str);
            },
            onConnect: () => {
                console.log("Connected to WebSocket");
                client.subscribe("/topic/task-events", (message) => {
                    const taskEvent = JSON.parse(message.body);
                    onTaskEvent(taskEvent); // Trigger the callback to handle task events
                });
            },
            onStompError: (frame) => {
                console.error("STOMP error", frame);
            },
        });

        client.activate();

        return () => {
            client.deactivate(); // Cleanup on unmount
        };
    }, [onTaskEvent]);

    return null;
};

export default WebSocketService;
