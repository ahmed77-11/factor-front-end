import { Box, Button, useTheme } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { fetchContratsAsyncByStatus } from "../../../../redux/contrat/ContratSlice";
import Header from "../../../../components/Header";
import { localeText, tokens } from "../../../../theme";
import { useNavigate } from "react-router-dom";
import EditNoteIcon from '@mui/icons-material/EditNote';
import CustomNoRowsOverlay from "../../../../helpers/CustomNoRowsOverlay";

const ListSigner = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { contrats, loading } = useSelector((state) => state.contrat);
    const [rows, setRows] = useState([]);
    const [columnVisibility] = useState({ id: false });

    useEffect(() => {
        dispatch(fetchContratsAsyncByStatus("signer")); // Fetch validated contracts
    }, [dispatch]);

    const processData = useCallback(async () => {
        if (!contrats) return;

        const processedRows = await Promise.all(contrats
            .filter(contrat => contrat.contratValider && !contrat.contratSigner)
            .map(async (contrat) => {
                let adherent = { sigle: "—" };

                try {
                    const response = await axios.get(
                        `http://localhost:8081/factoring/api/pm/get-pm/${contrat.adherent}`,
                        { withCredentials: true }
                    );
                    if (response.status === 200) adherent = response.data;
                } catch (error) {
                    console.error("Error fetching adherent:", error);
                }

                return {
                    ...contrat,
                    adherentSigle: adherent.sigle || "—",
                    deviseLabel: contrat.devise?.dsg || "—",
                    typeFactoringLabel: contrat.typeFactoring?.dsg || "—",
                };
            })
        );

        setRows(processedRows);
    }, [contrats]);

    useEffect(() => {
        processData();
    }, [contrats, processData]);

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
            field: "adherentSigle",
            headerName: "Adhérent",
            flex: 1,
        },
        {
            field: "typeFactoringLabel",
            headerName: "Type Factoring",
            flex: 1,
        },
        {
            field: "deviseLabel",
            headerName: "Devise",
            flex: 1,
        },
        {
            field: "contratPrevChiffreTotal",
            headerName: "Montant Total",
            flex: 1,
            valueFormatter: ({ value }) => `$${value?.toLocaleString() || 0}`
        },
        {
            field: "actions",
            headerName: "Actions",
            flex: 1,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <Button
                    variant="contained"
                    startIcon={<EditNoteIcon />}
                    sx={{
                        backgroundColor: colors.blueAccent[600],
                        ":hover": { backgroundColor: colors.blueAccent[400] },
                    }}
                    onClick={() => navigate(`/signer-contrat/${params.row.id}`)}
                >
                    Signer le contrat
                </Button>
            ),
        },
    ];

    return (
        <Box m="20px">
            <Header
                title="Contrats à Signer"
                subtitle="Liste des contrats validés prêts pour signature"
            />

            <Box height="75vh" sx={{
                "& .MuiDataGrid-root": { border: "none" },
                "& .MuiDataGrid-columnHeader": {
                    backgroundColor: colors.blueAccent[700],
                },
                "& .MuiDataGrid-footerContainer": {
                    backgroundColor: colors.blueAccent[700],
                },
            }}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    loading={loading}
                    getRowId={(row) => row.id}
                    pageSizeOptions={[5, 10, 25]}
                    slots={{
                        toolbar: GridToolbar,
                        noRowsOverlay: CustomNoRowsOverlay,
                    }}
                    disableRowSelectionOnClick
                    localeText={localeText}
                    columnVisibilityModel={columnVisibility}
                />
            </Box>
        </Box>
    );
};

export default ListSigner;