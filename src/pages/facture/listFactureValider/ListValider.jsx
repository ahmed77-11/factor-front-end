import {Alert, Box, Button, useTheme} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import Header from "../../../components/Header.jsx";
import { localeText, tokens } from "../../../theme.js";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {deleteFacture, getAllFactValiderAsync} from "../../../redux/facture/FactureSlice.js";

const ListNonValider = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { factures,loading,error } = useSelector((state) => state.facture);

    console.log(factures)
    const [columnVisibility, setColumnVisibility] = useState({
        id: false,
    });

    useEffect(() => {
        dispatch(getAllFactValiderAsync());
    }, [dispatch]);

    const handleDelete=async (id)=> {
        await dispatch(deleteFacture(id))
        dispatch(getAllFactValiderAsync());

    }

    const columns = [
        {
            field: "id",
            headerName: "ID",
            flex: 0.5,
            hideable: false,
            disableColumnMenu: true
        },
        {
            field: "contratNo",
            headerName: "Contrat N°",
            flex: 1,
            renderCell: (params) => {
                return (params?.row?.contrat?.contratNo || 'N/A')}
        },
        {
            field: "bordRemiseNo",
            headerName: "Bordereau N°",
            flex: 1,
            renderCell: (params) => params?.row?.bordRemiseNo || 'N/A'
        },
        {
            field: "devise",
            headerName: "Devise",
            flex: 1,
            renderCell: (params) => params?.row?.devise?.dsg || 'N/A'
        },
        {
            field: "montantBrut",
            headerName: "Montant Brut",
            flex: 1,
            renderCell: (params) => {
                const value = params?.row?.bordRemiseMontantBrut || 0;
                const deviseCode = params?.row?.devise?.codeAlpha || '';
                return `${value} ${deviseCode}`;
            }
        },
        {
            field: "docRemisesCount",
            headerName: "Nbr Documents",
            flex: 1,
            renderCell: (params) => params?.row?.docRemises?.length || 0
        },
        {
            field: "bordRemiseFactorDate1v",
            headerName: "Date Création",
            flex: 1,
            renderCell: (params) => {
                if (!params?.value) return 'N/A';
                try {
                    return new Date(params.value).toLocaleDateString();
                } catch {
                    return 'Invalid Date';
                }
            }
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
                <Box display="flex" alignItems="center" gap={1} marginTop="8px">
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => navigate(`/modifier-facture/${params.row.id}`, { state: { bordereau: params.row } })}
                    >
                        modifier
                    </Button>
                    <Button
                        variant="outlined"
                        color="error"
                        onClick={()=>handleDelete(params.row.id)}
                    >
                        supprimer
                    </Button>
                </Box>
            ),
        },
    ];

    return (
        <Box m="20px">
            <Header title="Bordereaux" subtitle="Liste des Bordereaux  Validés" />

            {loading && (
                <div className="loader-overlay">
                    <div className="loader"></div>
                </div>
            )}
            <Box display="flex" justifyContent="flex-end" mb={2}>
                <Button variant="contained" sx={{ backgroundColor: colors.greenAccent[500], color: colors.grey[900] }} onClick={() => navigate("/ajouter-facture")}>
                    Ajouter
                </Button>
            </Box>
            <Box
                height="75vh"
                sx={{
                    "& .MuiDataGrid-root": { border: "none" },
                    "& .MuiDataGrid-cell": {
                        borderBottom: `1px solid ${colors.blueAccent[500]}`,
                        fontSize: "14px"
                    },
                    "& .MuiDataGrid-columnHeader": {
                        backgroundColor: colors.blueAccent[700],
                        fontSize: "14px"
                    },
                    "& .MuiDataGrid-footerContainer": {
                        backgroundColor: colors.blueAccent[700]
                    },
                    "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
                        color: `${colors.grey[100]} !important`
                    },
                }}
            >
                {error && (
                    <Box  my={2}>
                        <Alert  severity="error" sx={{fontSize:"14px"}}>
                            {error || "Une erreur s'est produite lors de la création de la personne physique !"}
                        </Alert>
                    </Box>
                )}
                <DataGrid
                    rows={factures}
                    rowCount={factures?.length ?? 0}
                    getRowId={(row) => row.id}
                    loading={loading}
                    columns={columns}
                    paginationMode="server"
                    pageSizeOptions={[5, 10, 20]}
                    slots={{ toolbar: GridToolbar }}
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

export default ListNonValider;