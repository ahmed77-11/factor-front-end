import {Box, Button, useTheme} from "@mui/material";
import {DataGrid, GridToolbar} from "@mui/x-data-grid";
import {Edit, Delete} from "@mui/icons-material";
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {deletePP, getPP} from "../../../redux/personne/PersonnePhysiqueSlice.js";
import Header from "../../../components/Header.jsx";
import {localeText, tokens} from "../../../theme.js";

const ListPp = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const {personnePhysiques} = useSelector((state) => state.personnePhysique);
    const [columnVisibility, setColumnVisibility] = useState({
        id: false,
    })

    useEffect(() => {
        dispatch(getPP());
    }, [dispatch]);

    const handleDelete = async (id) => {
        await dispatch(deletePP(id, navigate));
        dispatch(getPP());
    };

    const columns = [
        {
            field: "id", headerName: "ID", flex: 0.5, hide: true,hideable: false, disableColumnMenu: true
        },
        {field: "numeroPieceIdentite", headerName: "Numéro d'Identité", flex: 1},
        {field: "nom", headerName: "Nom", flex: 1},
        {field: "prenom", headerName: "Prénom", flex: 1},
        {field: "adresse", headerName: "Adresse", flex: 1},
        {
            field: "actions",
            headerName: "Actions",
            flex: 1,
            sortable: false,  // Cannot be sorted
            filterable: false, // Cannot be filtered
            hideable: false,   // Cannot be hidden
            disableColumnMenu: true, // Hides column menu
            renderCell: (params) => (
                <Box display="flex" alignItems="center" justifyContent="space-between" marginTop="8px" gap={1}>
                    <Button
                        variant="outlined"
                        color="secondary"
                        startIcon={<Edit/>}
                        onClick={() => navigate(`/modifier-pp/${params.row.id}`, {state: {pp: params.row}})}
                    >
                        Modifier
                    </Button>
                    <Button
                        variant="outlined"
                        color="error"
                        startIcon={<Delete/>}
                        onClick={() => handleDelete(params.row.id)}
                    >
                        Supprimer
                    </Button>
                </Box>
            ),
        },
    ];

    // ✅ Full French translations for all tooltips, filters, and pagination


    return (
        <Box m="20px">
            <Header title="Personne Physique" subtitle="Liste des Personnes Physiques"/>
            <Box display="flex" justifyContent="flex-end" mb={2}>
                <Button variant="contained" sx={{backgroundColor: colors.greenAccent[500], color: colors.grey[900]}}
                        onClick={() => navigate("/ajouter-pp")}>
                    Ajouter
                </Button>
            </Box>
            <Box
                height="75vh"
                sx={{
                    "& .MuiDataGrid-root": {border: "none"},
                    "& .MuiDataGrid-cell": {borderBottom: "none"},
                    "& .MuiDataGrid-columnHeader": {backgroundColor: colors.blueAccent[700]},
                    "& .MuiDataGrid-footerContainer": {backgroundColor: colors.blueAccent[700]},
                    "& .MuiCheckbox-root": {color: `${colors.greenAccent[200]} !important`},
                    "& .MuiDataGrid-toolbarContainer .MuiButton-text": {color: `${colors.grey[100]} !important`},
                }}
            >
                <DataGrid
                    rows={personnePhysiques || []}
                    rowCount={personnePhysiques?.length ?? 0}
                    getRowId={(row) => row.id}
                    columns={columns}
                    paginationMode="server"
                    pageSizeOptions={[5, 10, 20]}
                    slots={{toolbar: GridToolbar}}
                    checkboxSelection
                    disableRowSelectionOnClick
                    localeText={localeText} // ✅ Fully translated UI
                    columnVisibilityModel={columnVisibility}
                    onColumnVisibilityModelChange={(newModel) =>
                        setColumnVisibility({ ...newModel, id: false }) // Prevent ID from being shown
                    } // 👈 Forces ID column to be hidden

                />
            </Box>
        </Box>
    );
};

export default ListPp;
