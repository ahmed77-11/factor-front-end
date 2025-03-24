import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; // For example, to get an ID from the URL
import {TextField, Container, Typography, Box, Button, useTheme} from "@mui/material";
import WebSocketService from "../../../../helpers/WebSocketService.jsx";
import { useNotification } from "../../../../customeHooks/useNotification.jsx";
import {tokens} from "../../../../theme.js";
import useWebSocket from "../../../../customeHooks/useWebSocket.jsx";
import {useSelector} from "react-redux";

const ValidValidateur = () => {
    const {current}=useSelector((state)=>state.user);
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [description, setDescription] = useState("");
    const [pdfUrl, setPdfUrl] = useState("");
    const [taskEvent, setTaskEvent] = useState(null);
    // Destructure both notification and findNotificationById from the hook
    const { notification, findNotificationById } = useNotification();
    const {sendTaskAction}=useWebSocket();

    // Example: assume notification id comes from the URL (or you can set it from other logic)
    const { notifId } = useParams();

    // Call findNotificationById when the component mounts or when the id changes
    useEffect(() => {
        if (notifId) {
            findNotificationById(notifId);
        }
    }, []);

    useEffect(() => {
        // When notification is loaded, build the PDF URL if available
        if (notification && notification.notificationContratNo) {
            const urlFromDatabase = `http://localhost:8083/factoring/contrat/Contract_PDF/contract_${notification.notificationContratNo}.pdf`;
            setPdfUrl(urlFromDatabase);
        }
    }, [notification]);

    const openPdfInNewTab = () => {
        if (pdfUrl) {
            window.open(pdfUrl, "_blank");
        }
    };

    // Handle incoming task event from WebSocket
    const handleTaskEvent = (decision) => {
        sendTaskAction({"taskId":notification.notificationTaskId,"actionType":"COMPLETE","variables":{"token":current.token,"validatorDecision":decision,"validatorId":"1","notes":description}}); // Mark as read in real-time


    };
    console.log(description)
    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>
                Contrat PDF
            </Typography>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    border: "1px solid #ccc",
                    borderRadius: 2,
                    p: 2,
                    mb: 3,
                }}
            >
                {pdfUrl ? (
                    <embed
                        src={pdfUrl}
                        type="application/pdf"
                        width="100%"
                        height="600px"
                    />
                ) : (
                    <Typography variant="body1" color="textSecondary">
                        Chargement du PDF...
                    </Typography>
                )}
            </Box>

            <Button
                variant="contained"
                color="secondary"
                fullWidth
                sx={{color:colors.grey[100],mb:3}}
                onClick={openPdfInNewTab}
            >
                Ouvrir dans un nouvel onglet
            </Button>

            <Typography variant="h6" gutterBottom>
                Description
            </Typography>
            <TextField
                label="Ajouter une description"
                multiline
                rows={6}
                variant="outlined"
                fullWidth
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                sx={{ mb: 3 }}
            />

            <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2,mb:6 }}>
                <Button variant="contained" onClick={()=>handleTaskEvent("accept")} sx={{backgroundColor:colors.greenAccent[500],color:colors.grey[100]}} fullWidth>
                    Valider
                </Button>
                <Button variant="contained" onClick={()=>handleTaskEvent("reject")} color="error" sx={{color:colors.grey[100]}} fullWidth>
                    Rejeter
                </Button>
            </Box>

            {/* Display task event notification */}
            {taskEvent && (
                <Box sx={{ mt: 4, p: 2, border: "1px solid #ccc", borderRadius: 2 }}>
                    <Typography variant="h6">Task Event:</Typography>
                    <Typography variant="body1">
                        {JSON.stringify(taskEvent, null, 2)}
                    </Typography>
                </Box>
            )}

        </Container>
    );
};

export default ValidValidateur;