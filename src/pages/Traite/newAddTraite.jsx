import { Box, Card, CardContent, Typography, useTheme, CircularProgress } from "@mui/material";
import { tokens } from "../../theme";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import Header from "../../components/Header";

const NewAddTraite = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const navigate = useNavigate();
    const [loading, setLoading] = useState({ google: false, paddle: false });

    const handleFileUpload = (apiEndpoint) => async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setLoading({ google: apiEndpoint.includes('google'), paddle: apiEndpoint.includes('paddle') });

        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await axios.post(`http://localhost:5000/${apiEndpoint}`, formData);
            const processedData = processOCRData(response.data.extracted_data);

            navigate("/ajouter-traite-extracter", { state: { extractedData: processedData } });
        } catch (error) {
            alert(`Erreur d'extraction: ${error.response?.data?.error || error.message}`);
        } finally {
            setLoading({ google: false, paddle: false });
        }
    };

    const processOCRData = (data) => ({
        numero: data.traite_num || "",
        tireEmisDate: formatDate(data.date_created) || "",
        tireEmisLieu: data.place_created || "",
        montant: parseFloat(data.amount_digits?.replace(',', '.')) || "",
        bankCode: data.rib?.slice(0, 2) || "",
        ribSuffix: data.rib?.slice(2) || "",
        tireNom: data.drawer_name || "",
        echFirst: formatDate(data.date_due) || "",
        factorDate: formatDate(data.date_created) || ""
    });

    const formatDate = (dateStr) => {
        const formats = [
            { regex: /(\d{2})\/(\d{2})\/(\d{4})/, parts: [3, 2, 1] },
            { regex: /(\d{4})-(\d{2})-(\d{2})/, parts: [1, 2, 3] },
            { regex: /(\d{1,2})\s+([a-zA-Z]+)\s+(\d{4})/, parts: [2, 1, 3] }
        ];

        for (const { regex, parts } of formats) {
            const match = dateStr?.match(regex);
            if (match) {
                const [_, ...groups] = match;
                return `${groups[parts[0]]}-${groups[parts[1]]}-${groups[parts[2]]}`;
            }
        }
        return "";
    };

    return (
        <Box m="20px">
            <Header title="Nouvelle Traite" subtitle="Sélectionnez la méthode d'extraction" />

            <Box display="flex" gap={4} justifyContent="center" mt={4}>
                <Card
                    sx={ocrCardStyle(colors)}
                    onClick={() => !loading.google && document.getElementById("google-ocr").click()}
                >
                    <CardContent sx={{ textAlign: 'center', height: '100%' }}>
                        <Typography variant="h4" gutterBottom sx={{ color: colors.greenAccent[500], mb: 2 }}>
                            🌟 Extraction Premium
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                            Utilisation de Google Vision API pour une reconnaissance optimale des documents
                        </Typography>
                        {loading.google ? (
                            <CircularProgress size={24} />
                        ) : (
                            <Typography variant="caption" sx={{ color: colors.grey[300] }}>
                                Cliquez pour télécharger un PDF ou image
                            </Typography>
                        )}
                        <input
                            type="file"
                            id="google-ocr"
                            hidden
                            onChange={handleFileUpload('/api/ocr/google')}
                            accept=".pdf,.jpg,.jpeg,.png"
                        />
                    </CardContent>
                </Card>

                <Card
                    sx={ocrCardStyle(colors)}
                    onClick={() => !loading.paddle && document.getElementById("paddle-ocr").click()}
                >
                    <CardContent sx={{ textAlign: 'center', height: '100%' }}>
                        <Typography variant="h4" gutterBottom sx={{ color: colors.blueAccent[500], mb: 2 }}>
                            🛠️ Extraction Standard
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                            Solution économique avec PaddleOCR (open-source)
                        </Typography>
                        {loading.paddle ? (
                            <CircularProgress size={24} />
                        ) : (
                            <Typography variant="caption" sx={{ color: colors.grey[300] }}>
                                Cliquez pour télécharger un PDF ou image
                            </Typography>
                        )}
                        <input
                            type="file"
                            id="paddle-ocr"
                            hidden
                            onChange={handleFileUpload('/api/ocr/paddle')}
                            accept=".pdf,.jpg,.jpeg,.png"
                        />
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
};

const ocrCardStyle = (colors) => ({
    width: 400,
    height: 300,
    cursor: 'pointer',
    backgroundColor: colors.primary[400],
    transition: 'transform 0.3s, box-shadow 0.3s',
    '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: `0 8px 24px ${colors.primary[700]}`
    },
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
});

export default NewAddTraite;