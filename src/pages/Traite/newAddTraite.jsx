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
            console.log(response.data);
            // console.log(response.data.extracted_data)
            const processedData = processOCRData(response.data.extracted_data,response.data.barcode_validates_traite,response.data.signature_detected);

            console.log(processedData);

            navigate("/ajouter-traite-extracter", { state: { extractedData: processedData } });
        } catch (error) {
            alert(`Erreur d'extraction: ${error.response?.data?.error || error.message}`);
        } finally {
            setLoading({ google: false, paddle: false });
        }
    };

    const processOCRData = (data,barcode_validates_traite,signature_detected) => (
        {
        numero: data.traite_num || "",
        tireEmisDate: formatDate(data.date_created) || "",
        tireEmisLieu: data.place_created || "",
        montant: parseFloat(data.amount_digits?.replace(',', '.')) || "",
        bankCode: data.rib?.slice(0, 2) || "",
        ribSuffix: data.rib?.slice(2) || "",
        tireNom: data.drawer_name || "",
        echFirst: formatDate(data.date_due) || "",
        factorDate: formatDate(data.date_created) || "",
        amount_words: data.amount_words,
            barcode_validates_traite:barcode_validates_traite,
        signature_detected:signature_detected,
        bank:data.bank
    });
    

    const formatDate = (dateStr) => {
        const monthMap = {
            'janvier': '01', 'février': '02', 'mars': '03', 'avril': '04',
            'mai': '05', 'juin': '06', 'juillet': '07', 'août': '08',
            'septembre': '09', 'octobre': '10', 'novembre': '11', 'décembre': '12'
        };

        const formats = [
            // DD/MM/YYYY
            {
                regex: /(\d{2})\/(\d{2})\/(\d{4})/,
                handler: (groups) => `${groups[2]}-${groups[1]}-${groups[0]}`
            },
            // YYYY-MM-DD
            {
                regex: /(\d{4})-(\d{2})-(\d{2})/,
                handler: (groups) => `${groups[0]}-${groups[1]}-${groups[2]}`
            },
            // Day Month Year (e.g., "10 mai 2024")
            {
                regex: /(\d{1,2})\s+([a-zA-Zûéèà]+)\s+(\d{4})/i,
                handler: (groups) => {
                    const month = monthMap[groups[1].toLowerCase()] || '00';
                    return `${groups[2]}-${month}-${groups[0].padStart(2, '0')}`;
                }
            },
            // Month Year (fallback)
            {
                regex: /(\d{4})-(\d{2})/,
                handler: (groups) => `${groups[0]}-${groups[1]}-01`
            }
        ];

        if (!dateStr) return '';

        for (const { regex, handler } of formats) {
            const match = dateStr.match(regex);
            if (match) {
                try {
                    return handler(match.slice(1));
                } catch {
                    continue;
                }
            }
        }
        return '';
    };
    return (
        <Box m="20px">
            <Header title="Nouvelle Traite" subtitle="Sélectionnez la méthode d'extraction" />

            <Box display="flex" gap={4} justifyContent="center" alignItems={"center"} pt={10} mt={4}>
                <Card
                    sx={ocrCardStyle(colors)}
                    onClick={() => !loading.google && document.getElementById("google-ocr").click()}
                >
                    <CardContent sx={{ textAlign: 'center', height: '100%' }}>
                        <Typography variant="h4" gutterBottom sx={{ color: colors.greenAccent[500], mb: 2 }}>
                            🌟 Extraction Premium
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                            Utilisation  une reconnaissance optimale des documents
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
                            Solution économique (open-source)
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