import {Box, Button, useTheme} from "@mui/material";
import {DataGrid, GridToolbar} from "@mui/x-data-grid";
import {Edit, Delete} from "@mui/icons-material";
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import Header from "../../../../components/Header.jsx";
import {localeText, tokens} from "../../../../theme.js";
import {deleteUser, fetchAllUsers} from "../../../../redux/user/usersSlice.js";

const Users = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const {users,loading,error} = useSelector((state) => state.users); // Assuming you have a users slice in your Redux store

    // Mock data - in a real app, you would fetch this from your API/Redux store
   useEffect(() => {
       dispatch(fetchAllUsers())
   },[dispatch])

    const [columnVisibility, setColumnVisibility] = useState({
        id: false,
    });

    const handleDelete = async (id) => {
        // Implement delete functionality
        console.log("Delete user with id:", id);
        await dispatch(deleteUser(id));
        // Then refresh the user list
        dispatch(fetchAllUsers());
    };

    const availableRoles = [
        { label: "Admin", value: "ROLE_ADMIN" },
        { label: "Responsable Commercial", value: "ROLE_RES_COMERCIAL" },
        { label: "Responsable Achat", value: "ROLE_RES_ACHAT" },
        { label: "Responsable Financement", value: "ROLE_RES_FINANCEMENT" },
        { label: "Responsable Juridique", value: "ROLE_RES_JURIDIQUE" },
        { label: "Validateur Du Contrat", value: "ROLE_VALIDATEUR" },
        { label: "Signateur Du Contrat", value: "ROLE_SIGNATAIRE" }
    ];

    const columns = [
        {
            field: "id",
            headerName: "ID",
            flex: 0.5,
            hide: true,
            hideable: false,
            disableColumnMenu: true
        },
        {field: "cin", headerName: "CIN", flex: 0.5},
        {field: "firstName", headerName: "Prénom", flex: 0.5},
        {field: "lastName", headerName: "Nom", flex: 0.5},
        {field: "email", headerName: "Email", flex: 1},
        {
            field: "roles",
            headerName: "Rôles",
            flex: 2,
            renderCell: (params) => {
                // Map each role to its corresponding label from availableRoles
                const roleLabels = params.row.roles.map(roleObj => {
                    const foundRole = availableRoles.find(r => r.value === roleObj.role);
                    return foundRole ? foundRole.label : roleObj.role.replace('ROLE_', '');
                });
                return roleLabels.join('/'); // Join with line break for display');
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
                <Box display="flex" alignItems="center" justifyContent="space-between" marginTop="8px" gap={1}>
                    <Button
                        variant="outlined"
                        color="secondary"
                        startIcon={<Edit/>}
                        onClick={() => navigate(`/modifier-utilisateur/${params.row.id}`, {state: {user: params.row}})}
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

    return (
        <Box m="20px">
            <Header title="Utilisateurs" subtitle="Liste des Utilisateurs"/>
            <Box display="flex" justifyContent="flex-end" mb={2}>
                <Button
                    variant="contained"
                    sx={{
                        backgroundColor: colors.greenAccent[500],
                        color: colors.grey[900],
                        '&:hover': {
                            backgroundColor: colors.greenAccent[600]
                        }
                    }}
                    onClick={() => navigate("/ajouter-utilisateur")}
                >
                    Ajouter Utilisateur
                </Button>
            </Box>
            <Box
                height="75vh"
                sx={{
                    "& .MuiDataGrid-root": {border: "none"},
                    "& .MuiDataGrid-cell": {borderBottom: "none"},
                    "& .MuiDataGrid-columnHeaders": {
                        backgroundColor: colors.blueAccent[700],
                        fontSize: "16px"
                    },
                    "& .MuiDataGrid-footerContainer": {
                        backgroundColor: colors.blueAccent[700],
                        borderTop: "none"
                    },
                    "& .MuiCheckbox-root": {color: `${colors.greenAccent[200]} !important`},
                    "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
                        color: `${colors.grey[100]} !important`
                    },
                    "& .MuiDataGrid-virtualScroller": {
                        backgroundColor: colors.primary[400]
                    },
                }}
            >
                <DataGrid
                    rows={users}
                    loading={loading}
                    rowCount={users?.length ?? 0}
                    getRowId={(row) => row.id}
                    columns={columns}
                    paginationMode="server"
                    pageSizeOptions={[5, 10, 20]}
                    slots={{toolbar: GridToolbar}}
                    checkboxSelection
                    disableRowSelectionOnClick
                    localeText={localeText}
                    columnVisibilityModel={columnVisibility}
                    onColumnVisibilityModelChange={(newModel) =>
                        setColumnVisibility({ ...newModel, id: false })
                    }
                    sx={{
                        '& .MuiDataGrid-cell': {
                            padding: '8px 16px',
                        },
                        '& .MuiDataGrid-columnHeader': {
                            fontWeight: 'bold',
                        },
                    }}
                />
            </Box>
        </Box>
    );
};

export default Users;