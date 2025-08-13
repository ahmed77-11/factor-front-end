// src/pages/Blacklist/ListBlackList.jsx
import  { useEffect, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Card,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    useTheme,
    CircularProgress,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Edit, Delete } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import Header from "../../components/Header.jsx";
import { tokens, localeText } from "../../theme.js";
import {
    fetchBlackLists,
    deleteBlackList,
} from "../../redux/blacklist/blackListSlice.js";

const ListBlackList = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { blackList, loadingBlackList, errorBlackList } = useSelector(
        (state) => state.blackList
    );

    // ID column always hidden
    const [columnVisibility, setColumnVisibility] = useState({ id: false });

    // Dialog state
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [toDeleteId, setToDeleteId] = useState(null);

    useEffect(() => {
        dispatch(fetchBlackLists());
    }, [dispatch]);

    const handleDeleteClick = (id) => {
        setToDeleteId(id);
        setConfirmOpen(true);
    };

    const handleConfirmClose = () => {
        setConfirmOpen(false);
        setToDeleteId(null);
    };

    const handleConfirmDelete = async () => {
        await dispatch(deleteBlackList(toDeleteId));
        dispatch(fetchBlackLists());
        setConfirmOpen(false);
        setToDeleteId(null);
    };

    const columns = [
        {
            field: "id",
            headerName: "ID",
            hideable: false,
            disableColumnMenu: true,
        },
        {
            field: "typePieceId",
            headerName: "Type pièce",
            flex: 1,
            valueGetter: (_,row) => row.typePieceId?.dsg || "—",
            renderCell: (params) => params.row.typePieceId?.dsg || "—",
        },
        {
            field: "pieceIdentiteNo",
            headerName: "N° pièce",
            flex: 1.2,
        },
        { field: "nom", headerName: "Nom", flex: 1 },
        { field: "prenom", headerName: "Prénom", flex: 1 },
        {
            field: "nationalite",
            headerName: "Nationalité",
            flex: 1,
            valueGetter: (_,row) => row.nationalite?.codeDsg || "—",
            renderCell: (params) => params.row.nationalite?.codeDsg || "—",
        },
        {
            field: "decision",
            headerName: "Décision",
            flex: 1,
        },
        {
            field: "actions",
            headerName: "Actions",
            flex: 1.2,
            sortable: false,
            filterable: false,
            hideable: false,
            disableColumnMenu: true,
            renderCell: (params) => (
                <Box display="flex" alignItems="center" gap={1} mt={1}>
                    <Button
                        size="small"
                        variant="outlined"
                        color="secondary"
                        startIcon={<Edit />}
                        onClick={() =>
                            navigate(`/modifier-blacklist/${params.row.id}`, {
                                state: { item: params.row },
                            })
                        }
                    >
                        Modifier
                    </Button>
                    <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<Delete />}
                        onClick={() => handleDeleteClick(params.row.id)}
                    >
                        Supprimer
                    </Button>
                </Box>
            ),
        },
    ];

    return (
        <Box m="20px">
            <Header title="Blacklist" subtitle="Liste des Blacklists" />

            <Box display="flex" justifyContent="flex-end" mb={2}>
                <Button
                    variant="contained"
                    sx={{
                        backgroundColor: colors.greenAccent[500],
                        color: colors.grey[900],
                    }}
                    onClick={() => navigate("/ajouter-blacklist")}
                >
                    Ajouter
                </Button>
            </Box>

            {loadingBlackList && (
                <Box display="flex" justifyContent="center" my={4}>
                    <CircularProgress />
                </Box>
            )}

            {errorBlackList && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {errorBlackList}
                </Alert>
            )}

            <Card
                sx={{
                    height: "75vh",
                    bgcolor: colors.primary[900],
                    "& .MuiDataGrid-root": { border: "none" },
                    "& .MuiDataGrid-cell": {
                        borderBottom: `1px solid ${colors.blueAccent[500]}`,
                        fontSize: "13px",
                    },
                    "& .MuiDataGrid-columnHeader": {
                        bgcolor: colors.blueAccent[700],
                        fontSize: "13px",
                    },
                    "& .MuiDataGrid-footerContainer": {
                        bgcolor: colors.blueAccent[700],
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
                    rows={blackList || []}
                    rowCount={blackList?.length ?? 0}
                    getRowId={(row) => row.id}
                    columns={columns}
                    paginationMode="server"
                    pageSizeOptions={[5, 10, 20]}
                    slots={{ toolbar: GridToolbar }}
                    checkboxSelection
                    disableRowSelectionOnClick
                    localeText={localeText}
                    columnVisibilityModel={columnVisibility}
                    onColumnVisibilityModelChange={(model) =>
                        setColumnVisibility({ ...model, id: false })
                    }
                />
            </Card>

            <Dialog
                open={confirmOpen}
                onClose={handleConfirmClose}
            >
                <DialogTitle>Confirmer la suppression</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Êtes-vous sûr de vouloir supprimer cet enregistrement ?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleConfirmClose}>Annuler</Button>
                    <Button color="error" onClick={handleConfirmDelete}>
                        Supprimer
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ListBlackList;
