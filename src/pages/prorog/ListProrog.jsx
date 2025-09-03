// src/pages/prorog/GetAllProrog.jsx
import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    useTheme,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { CheckCircle, Cancel } from "@mui/icons-material";
import Header from "../../components/Header.jsx";
import { localeText, tokens } from "../../theme.js";
import { useDispatch, useSelector } from "react-redux";
import { fetchProrogAsync } from "../../redux/prorog/prorogSlice";

const GetAllProrog = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const dispatch = useDispatch();
    const { prorogs, loading } = useSelector((state) => state.prorog);

    const [columnVisibility, setColumnVisibility] = useState({ id: false });
    const [openAccept, setOpenAccept] = useState(false);
    const [openRefuse, setOpenRefuse] = useState(false);
    const [currentRow, setCurrentRow] = useState(null);

    // Accept modal fields (factor)
    const [acceptDate, setAcceptDate] = useState("");
    const [acceptNo, setAcceptNo] = useState("");
    const [acceptEch, setAcceptEch] = useState("");

    // Refuse modal fields
    const [refusMotif, setRefusMotif] = useState("");
    const [refusInfo, setRefusInfo] = useState("");

    useEffect(() => {
        dispatch(fetchProrogAsync());
    }, [dispatch]);

    const openAcceptModal = (row) => {
        setCurrentRow(row);
        setAcceptDate(row.factorDate ? row.factorDate.split("T")[0] : new Date().toISOString().split("T")[0]);
        setAcceptNo(row.factorNo || (row.traite && row.traite.traiteNo) || "");
        setAcceptEch(row.factorEchProrog || (row.adherDemEch ? row.adherDemEch.split("T")[0] : ""));
        setOpenAccept(true);
    };

    const openRefuseModal = (row) => {
        setCurrentRow(row);
        setRefusMotif("");
        setRefusInfo("");
        setOpenRefuse(true);
    };

    const handleAccept = async () => {
        if (!currentRow) return;
        const payload = {
            id: currentRow.id,
            factorDate: acceptDate, // expecting backend to accept this field name
            factorNo: acceptNo,
            factorEchProrog: acceptEch,
            sysAction: "ACCEPT", // optional meta
        };
        // dispatch(updateProrogAsync(payload));
        setOpenAccept(false);
    };

    const handleRefuse = async () => {
        if (!currentRow) return;
        const payload = {
            id: currentRow.id,
            factorRejetMotif: refusMotif,
            factorInfoLibre: refusInfo,
            sysAction: "REFUSE",
        };
        // dispatch(updateProrogAsync(payload));
        setOpenRefuse(false);
    };
    console.log("prorogs", prorogs);

    const columns = [
        {
            field: "docRemiseNo",
            headerName: "Num DocRemise",
            flex: 1,
            valueGetter: (_,params) => params.docRemise?.docRemiseNo || "",
        },
        {
            field: "traiteNo",
            headerName: "Num Traite",
            flex: 1,
            valueGetter: (_,params) => params.traite?.numero || "",
        },
        {
            field: "adherEmisDate",
            headerName: "Date Émission",
            flex: 1,
            valueGetter: (_,params) => {
                const d = params.adherEmisDate;
                return d ? d.split("T")[0] : "";
            },
        },
        { field: "adherEmisNo", headerName: "Num Émission", flex: 1 },
        {
            field: "adherDemEch",
            headerName: "Demande Échéance",
            flex: 1,
            valueGetter: (_,params) => {
                const d = params.adherDemEch;
                return d ? d.split("T")[0] : "";
            },
        },
        { field: "adherLibelle", headerName: "Libellé", flex: 1 },
        {
            field: "actions",
            headerName: "Actions",
            flex: 1.5,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <Box display="flex" justifyContent="center" gap={1}>
                    <IconButton color="success" onClick={() => openAcceptModal(params.row)}>
                        <CheckCircle />
                    </IconButton>
                    <IconButton color="error" onClick={() => openRefuseModal(params.row)}>
                        <Cancel />
                    </IconButton>
                </Box>
            ),
        },
    ];

    return (
        <Box m="20px">
            <Header title="Prorogations" subtitle="Liste des demandes de prorogation" />

            <Box
                height="75vh"
                sx={{
                    "& .MuiDataGrid-root": { border: "none" },
                    "& .MuiDataGrid-cell": { borderBottom: "none" },
                    "& .MuiDataGrid-columnHeader": { backgroundColor: colors.blueAccent[700] },
                    "& .MuiDataGrid-footerContainer": { backgroundColor: colors.blueAccent[700] },
                    "& .MuiCheckbox-root": { color: `${colors.greenAccent[200]} !important` },
                    "& .MuiDataGrid-toolbarContainer .MuiButton-text": { color: `${colors.grey[100]} !important` },
                }}
            >
                <DataGrid
                    rows={prorogs}
                    getRowId={(row) => row.id}
                    columns={columns}
                    pageSizeOptions={[5, 10, 20]}
                    slots={{ toolbar: GridToolbar }}
                    checkboxSelection
                    disableRowSelectionOnClick
                    localeText={localeText}
                    loading={loading}
                    columnVisibilityModel={columnVisibility}
                    onColumnVisibilityModelChange={(newModel) => setColumnVisibility({ ...newModel, id: false })}
                />
            </Box>

            {/* Accept modal */}
            <Dialog open={openAccept} onClose={() => setOpenAccept(false)}>
                <DialogTitle>Accepter la prorogation</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label="Date (factorDate)"
                        type="date"
                        fullWidth
                        value={acceptDate}
                        onChange={(e) => setAcceptDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                    />
                    <TextField margin="dense" label="Numéro (factorNo)" fullWidth value={acceptNo} onChange={(e) => setAcceptNo(e.target.value)} />
                    <TextField
                        margin="dense"
                        label="Échéance (factorEchProrog)"
                        type="date"
                        fullWidth
                        value={acceptEch}
                        onChange={(e) => setAcceptEch(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenAccept(false)}>Annuler</Button>
                    <Button onClick={handleAccept} variant="contained" color="success">
                        Valider
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Refuse modal */}
            <Dialog open={openRefuse} onClose={() => setOpenRefuse(false)}>
                <DialogTitle>Refuser la prorogation</DialogTitle>
                <DialogContent>
                    <TextField margin="dense" label="Motif de refus (factorRejetMotif)" fullWidth value={refusMotif} onChange={(e) => setRefusMotif(e.target.value)} />
                    <TextField margin="dense" label="Info libre (factorInfoLibre)" fullWidth value={refusInfo} onChange={(e) => setRefusInfo(e.target.value)} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenRefuse(false)}>Annuler</Button>
                    <Button onClick={handleRefuse} variant="contained" color="error">
                        Valider
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default GetAllProrog;
