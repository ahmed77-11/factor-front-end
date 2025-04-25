import {
    Box,
    Button,
    useTheme
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Edit, Delete } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header.jsx";
import { localeText, tokens } from "../../theme.js";
import { useDispatch, useSelector } from "react-redux";
import { deleteTraite, getAllTraites } from "../../redux/traite/traiteSlice.js";



const GetAllTraite = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { traites, loadingTraite, errorTraite } = useSelector((state) => state.traite);
    
    useEffect(() => {
        dispatch(getAllTraites());
    }, [dispatch]);
    
    const [rows, setRows] = useState(traites);
    const [columnVisibility, setColumnVisibility] = useState({
        id: false,
    });

    const handleDelete = async (actualId) => {
            await dispatch(deleteTraite(actualId, navigate));
            dispatch(getAllTraites());
        };
    console.log(traites)

    const columns = [
        {
            field: "id",
            headerName: "ID",
            flex: 0.5,
            hide: true,
            hideable: false,
            disableColumnMenu: true,
        },
        { field: "numero", headerName: "Numéro de Traite", flex: 1 },
        {
            field: "factorDate",
            headerName: "Date Factor",
            flex: 1,
            valueFormatter: (params) => {
                // Safely format the ISO date
                return params?.split("T")[0] || "";
            },
        },
        { field: "tireNom", headerName: "Nom du Tiré", flex: 1 },
        { field: "montant", headerName: "Montant", flex: 1 },
        {
            field: "devise",
            headerName: "Devise",
            flex: 1,
            valueGetter: (params) => {

                // Safely extract the nested 'dsg' from the devise object
                return params?.dsg || "";
            },
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
                <Box display="flex" alignItems="center" justifyContent="space-between" gap={1} mt="8px">
                    <Button
                        variant="outlined"
                        color="secondary"
                        startIcon={<Edit />}
                        onClick={() =>
                            navigate(`/modifier-traite/${params.row.id}`, { state: { traite: params.row } })
                        }
                    >
                        Modifier
                    </Button>
                    <Button
                        variant="outlined"
                        color="error"
                        startIcon={<Delete />}
                        onClick={() => handleDelete(params.row.id)}
                    >
                        Supprimer
                    </Button>
                </Box>
            ),
        },
    ];

    return (
        <Box m="20px">
            <Header title="Traites" subtitle="Liste des traites" />
            <Box display="flex" justifyContent="flex-end" mb={2}>
                <Button
                    variant="contained"
                    sx={{ backgroundColor: colors.greenAccent[500], color: colors.grey[900] }}
                    onClick={() => navigate("/ajouter-traite")}
                >
                    Ajouter
                </Button>
            </Box>
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
    rows={traites}
    loading={loadingTraite}
    error={errorTraite}
    getRowId={(row) => row.id}
    columns={columns}
    pageSizeOptions={[5, 10, 20]}
    slots={{ toolbar: GridToolbar }}
    checkboxSelection
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

export default GetAllTraite;
