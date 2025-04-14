import { Box, Button, useTheme } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { fetchContratsAsyncByStatus } from "../../../../redux/contrat/ContratSlice";
import Header from "../../../../components/Header";
import { localeText, tokens } from "../../../../theme";
import { useNavigate } from "react-router-dom";
import CustomNoRowsOverlay from "../../../../helpers/CustomNoRowsOverlay"; // optional

const ListJuridique = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { contrats: notifications, loading } = useSelector((state) => state.contrat);
    const [rows, setRows] = useState([]);
    const [columnVisibility, setColumnVisibility] = useState({ id: false });
    const [hasFetched, setHasFetched] = useState(false);

    // Fetch only once
    useEffect(() => {
        if (!hasFetched) {
            dispatch(fetchContratsAsyncByStatus("juridique"));
            setHasFetched(true);
        }
    }, [dispatch, hasFetched]);

    const processData = useCallback(async () => {
        if (!notifications) return;

        if (notifications.length === 0) {
            setRows([]);
            return;
        }

        const processedRows = [];

        for (const notification of notifications) {
            let contrat = notification.notificationContratId;
            contrat = { ...contrat, notifId: notification.id };
            let adherent = { sigle: "—" };

            try {
                if (contrat.adherent) {
                    const response = await axios.get(
                        `http://localhost:8081/factoring/api/pm/get-pm/${contrat.adherent}`,
                        { withCredentials: true }
                    );
                    if (response.status === 200) {
                        adherent = response.data;
                    }
                }
            } catch (error) {
                console.error("Error fetching adherent:", error);
            }

            processedRows.push({
                ...contrat,
                adherentSigle: adherent.sigle || "—",
                deviseLabel: contrat.devise?.dsg || "—",
                typeFactoringLabel: contrat.typeFactoring?.dsg || "—",
            });
        }

        setRows(processedRows);
    }, [notifications]);

    useEffect(() => {
        processData();
    }, [notifications, processData]);

    const columns = [
        {
            field: "id",
            headerName: "ID",
            flex: 0.5,
            hideable: false,
            disableColumnMenu: true,
        },
        {
            field: "contratNo",
            headerName: "N° Contrat",
            flex: 1,
        },
        {
            field: "contratBoolRecours",
            headerName: "Recours",
            flex: 1,
            renderCell: (params) =>
                params.value ? "Avec recours" : "Sans recours",
        },
        {
            field: "deviseLabel",
            headerName: "Devise",
            flex: 1,
        },
        {
            field: "typeFactoringLabel",
            headerName: "Type Factoring",
            flex: 1,
        },
        {
            field: "adherentSigle",
            headerName: "Adhérent",
            flex: 1,
        },
        {
            field: "actions",
            headerName: "Actions",
            flex: 1,
            sortable: false,
            filterable: false,
            hideable: false,
            disableColumnMenu: true,
            renderCell: (params) => (
                <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    mt="8px"
                    gap={1}
                >
                    <Button
                        variant="outlined"
                        startIcon={<CheckCircleIcon />}
                        sx={{
                            color: colors.greenAccent[700],
                            ":hover": { backgroundColor: colors.greenAccent[100] },
                        }}
                        onClick={() =>
                            navigate(`/validation-juridique/${params.row.notifId}`, {
                                state: { contrat: params.row },
                            })
                        }
                    >
                        Valider
                    </Button>
                </Box>
            ),
        },
    ];

    return (
        <Box m="20px">
            <Header
                title="Contrats à valider par le juridique"
                subtitle="Liste des contrats en attente de validation par le juridique"
            />


            <Box
                height="75vh"
                sx={{
                    "& .MuiDataGrid-root": { border: "none" },
                    "& .MuiDataGrid-cell": { borderBottom: "none" },
                    "& .MuiDataGrid-columnHeader": {
                        backgroundColor: colors.blueAccent[700],
                    },
                    "& .MuiDataGrid-footerContainer": {
                        backgroundColor: colors.blueAccent[700],
                    },
                    "& .MuiCheckbox-root": {
                        color: `${colors.greenAccent[200]} !important`,
                    },
                    "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
                        color: `${colors.grey[100]} !important`,
                    },
                }}
            >
                <DataGrid
                    rows={rows}
                    columns={columns}
                    loading={loading}
                    getRowId={(row) => row.id}
                    pageSizeOptions={[5, 10, 20]}
                    slots={{
                        toolbar: GridToolbar,
                        noRowsOverlay: CustomNoRowsOverlay, // optional
                    }}
                    checkboxSelection
                    paginationMode="server"
                    disableRowSelectionOnClick
                    localeText={localeText}
                    columnVisibilityModel={columnVisibility}
                    onColumnVisibilityModelChange={(newModel) =>
                        setColumnVisibility({ ...newModel, id: false })
                    }
                />
            </Box>
        </Box>
    );
};

export default ListJuridique;
