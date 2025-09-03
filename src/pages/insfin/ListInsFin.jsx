// src/pages/InFin/ListInsFin.jsx

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  useTheme,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Delete, Edit } from "@mui/icons-material";
import {useEffect, useState} from "react";
import { tokens, localeText } from "../../theme";
import Header from "../../components/Header";
import { useNavigate } from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {fetchInsfinsAsync} from "../../redux/insfin/InsfinSlice.js";

const ListInsFin = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const dispatch = useDispatch();
    // Remplacer par l'appel API réel pour récupérer les données
    const { insfins, loading, error } = useSelector((state) => state.insfin);
    // Si vous utilisez Redux, décommentez la ligne ci-dessous


  useEffect(() => {
    dispatch(fetchInsfinsAsync())
  }, [dispatch]);
  // Données fictives corrigées pour test (mimique API réelle)
  // const fakeData = [
  //   {
  //     id: 1,
  //     typeInsfin: {
  //       id: 2,
  //       code: "INS",
  //       dsg: "Insurance Company",
  //       sysUser: "admin",
  //       sysAction: "INSERT",
  //       sysAdresseIp: "192.168.1.11",
  //       sysDate: "2025-08-16T02:26:50.161+00:00",
  //     },
  //     codeNum: "147",
  //     codeAlpha: "sk",
  //     dsg: "fejbzj",
  //     telFixeNo: "22073999",
  //     siteWeb: "http://localhost:5173/ajouter-insfis",
  //     adresse: "adr",
  //     sysUser: "admin2@gmail.com",
  //     sysAction: "CREATE",
  //     sysAdresseIp: "0:0:0:0:0:0:0:1",
  //     sysDate: "2025-08-16T02:43:13.789+00:00",
  //     archiver: false,
  //   },
  // ];

  const [columnVisibility, setColumnVisibility] = useState({ id: false });
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const handleOpenDialog = (id) => {
    setSelectedId(id);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedId(null);
  };

  const handleConfirmDelete = () => {
    console.log(`Suppression de l'élément ID: ${selectedId}`);
    handleCloseDialog();
  };

  const columns = [
    { field: "id", headerName: "ID", flex: 0.5, hide: true },
    {
      field: "typeInsfin",
      headerName: "Type",
      flex: 1,
      renderCell: (params) => params.row.typeInsfin?.dsg || "-",
    },
    { field: "codeNum", headerName: "Code Numérique", flex: 1 },
    { field: "codeAlpha", headerName: "Code Alpha", flex: 1 },
    { field: "dsg", headerName: "Désignation", flex: 1.5 },
    { field: "telFixeNo", headerName: "Téléphone Fixe", flex: 1 },
    { field: "siteWeb", headerName: "Site Web", flex: 1 },
    { field: "adresse", headerName: "Adresse", flex: 1.5 },
    { field: "sysUser", headerName: "Utilisateur", flex: 1 },
    { field: "sysAction", headerName: "Action", flex: 1 },
    { field: "sysAdresseIp", headerName: "Adresse IP", flex: 1 },
    {
      field: "sysDate",
      headerName: "Date Système",
      flex: 1,
      renderCell: ({ row }) => row.sysDate?.slice(0, 10) || "-",
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 2,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: ({ row }) => (
          <Box display="flex" gap={1}>
            <Button
                variant="outlined"
                color="secondary"
                startIcon={<Edit />}
                onClick={() =>
                    navigate(`/modifier-insfin/${row.id}`, { state: { insFin: row } })
                }
            >
              Modifier
            </Button>
            <Button
                variant="outlined"
                color="error"
                startIcon={<Delete />}
                onClick={() => handleOpenDialog(row.id)}
            >
              Supprimer
            </Button>
          </Box>
      ),
    },
  ];

  return (
      <Box m="20px">
        <Header
            title="Institutions Financières"
            subtitle="Liste des institutions financières (statique corrigée)"
        />

        <Box display="flex" justifyContent="flex-end" mb={2}>
          <Button
              variant="contained"
              sx={{
                backgroundColor: colors.greenAccent[500],
                color: colors.grey[900],
              }}
              onClick={() => navigate("/ajouter-insfin")}
          >
            Ajouter Institution Financière
          </Button>
        </Box>

        <Box
            height="75vh"
            sx={{
              "& .MuiDataGrid-root": { border: "none" },
              "& .MuiDataGrid-cell": {
                borderBottom: `1px solid ${colors.blueAccent[500]}`,
                fontSize: "13px",
              },
              "& .MuiDataGrid-columnHeader": {
                backgroundColor: colors.blueAccent[700],
                fontSize: "13px",
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
              rows={insfins}
              getRowId={(row) => row.id}
              columns={columns}
              loading={ loading}
              pagination
              pageSizeOptions={[5, 10, 20]}
              checkboxSelection
              disableRowSelectionOnClick
              localeText={localeText}
              columnVisibilityModel={columnVisibility}
              onColumnVisibilityModelChange={(newModel) =>
                  setColumnVisibility({ ...newModel, id: false })
              }
              slots={{ toolbar: GridToolbar }}
          />
        </Box>

        {/* Dialog de confirmation */}
        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Êtes-vous sûr de vouloir supprimer cette institution financière ?
              Cette action est irréversible.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="primary">
              Annuler
            </Button>
            <Button onClick={handleConfirmDelete} color="error" variant="contained">
              Supprimer
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
  );
};

export default ListInsFin;
