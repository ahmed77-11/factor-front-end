import {
    Box,
    Button,
    IconButton,
    useTheme,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { DoneOutline, CancelOutlined} from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header.jsx";
import { localeText, tokens } from "../../theme.js";
import { useDispatch, useSelector } from "react-redux";
import {deleteFinByIdAsync, getAllDemFinAsync, getAllDemFinEnAttenteAsync} from "../../redux/demFin/demFinSlice.js";
import DeletePopup from "../../components/DeletePopup.jsx";

const GetAllDemFinEnAttente = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { demFin, loading, error } = useSelector((state) => state.demFin);

    const [columnVisibility, setColumnVisibility] = useState({
        id: false,
    });

    const [openDelete, setOpenDelete] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    useEffect(() => {
        dispatch(getAllDemFinEnAttenteAsync());
    }, [dispatch]);

    const handleDeleteClick = (id) => {
        setSelectedId(id);
        setOpenDelete(true);
    };

    const handleConfirmDelete = () => {
        console.log("Confirmed delete for ID:", selectedId);
        setOpenDelete(false);
        // Here you would dispatch the delete action
        // For example:
        dispatch(deleteFinByIdAsync(selectedId));
        dispatch(getAllDemFinAsync());
    };

    const columns = [
        {
            field: "contrat",
            headerName: "Numéro Contrat",
            flex: 1,
            renderCell: (params) => params.row.contrat?.contratNo || "",
        },
        {
            field: "adherEmisNo",
            headerName: "Fin Adhérent Emission Num",
            flex: 1,
        },
        {
            field: "adherEmisDate",
            headerName: "Date Emission",
            flex: 1,
            renderCell: (params) => params.row.adherEmisDate?.split("T")[0] || "",
        },
        {
            field: "adherRib",
            headerName: "RIB Fin Adhérent",
            flex: 1,
        },
        {
            field: "adherMontant",
            headerName: "Montant",
            flex: 1,
        },
        {
            field: "devise",
            headerName: "Devise",
            flex: 1,
            renderCell: (params) => params.row.devise?.codeAlpha || "",
        },
        {
            field: "adherLibelle",
            headerName: "Libelle",
            flex: 1,
        },
        {
            field: "adherInfoLibre",
            headerName: "Info Libre",
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
                <Box display="flex" justifyContent="center" width="100%" gap={1}>
                    <IconButton
                        color="secondary"
                        onClick={() =>
                            navigate(`/modifier-demfin/${params.row.id}`, {
                                state: { demande: params.row },
                            })
                        }
                    >
                        <DoneOutline />
                    </IconButton>
                    <IconButton
                        color="error"
                        onClick={() => handleDeleteClick(params.row.id)}
                    >
                        <CancelOutlined />
                    </IconButton>
                </Box>
            ),
        },
    ];

    return (
        <Box m="20px">
            <Header title="Demandes de Financement" subtitle="Liste des demandes" />
            <Box display="flex" justifyContent="flex-end" mb={2}>
                <Button
                    variant="contained"
                    sx={{
                        backgroundColor: colors.greenAccent[500],
                        color: colors.grey[900],
                    }}
                    onClick={() => navigate("/ajouter-demfin")}
                >
                    Ajouter
                </Button>
            </Box>
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
                    rows={demFin || []}
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

            {/* 🧨 Delete Confirmation Popup */}
            <DeletePopup
                open={openDelete}
                onClose={() => setOpenDelete(false)}
                onConfirm={handleConfirmDelete}
            />
        </Box>
    );
};

export default GetAllDemFinEnAttente;
