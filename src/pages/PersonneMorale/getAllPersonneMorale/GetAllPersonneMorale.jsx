import { Box, Button, useTheme } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Edit, Delete } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../components/Header.jsx";
import { localeText, tokens } from "../../../theme.js";
import { useDispatch, useSelector } from "react-redux";
import { deletePM, getPM } from "../../../redux/personne/PersonneMoraleSlice.js";

const ListPm = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { personneMorales } = useSelector((state) => state.personneMorale);

    // State to manage column visibility
    const [columnVisibility, setColumnVisibility] = useState({
        id: false, // ID column always hidden
    });

    useEffect(() => {
        dispatch(getPM());
    }, [dispatch]);

    const handleDelete = async (actualId) => {
        await dispatch(deletePM(actualId, navigate));
        dispatch(getPM());
    };

    const columns = [
        { field: "id", headerName: "ID", flex: 0.5, hideable: false, disableColumnMenu: true },
        { field: "numeroPieceIdentite", headerName: "Numéro d'Identité", flex: 1 },
        { field: "raisonSocial", headerName: "Raison Sociale", flex: 1 },
        { field: "email", headerName: "Email", flex: 1 },
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
                        startIcon={<Edit />}
                        onClick={() => navigate(`/modifier-pm/${params.row.id}`, { state: { pm: params.row } })}
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
            <Header title="Personne Morale" subtitle="Liste Personnes Morales" />
            <Box display="flex" justifyContent="flex-end" mb={2}>
                <Button variant="contained" sx={{ backgroundColor: colors.greenAccent[500], color: colors.grey[900] }} onClick={() => navigate("/ajouter-pm")}>
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
                    rows={personneMorales || []}
                    rowCount={personneMorales?.length ?? 0}
                    getRowId={(row) => row.id}
                    columns={columns}
                    paginationMode="server"
                    pageSizeOptions={[5, 10, 20]}
                    slots={{ toolbar: GridToolbar }}
                    checkboxSelection
                    disableRowSelectionOnClick
                    localeText={localeText}
                    columnVisibilityModel={columnVisibility}
                    onColumnVisibilityModelChange={(newModel) =>
                        setColumnVisibility({ ...newModel, id: false }) // Keep ID column hidden
                    }
                />
            </Box>
        </Box>
    );
};

export default ListPm;
