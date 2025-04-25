import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
} from "@mui/material";

// eslint-disable-next-line react/prop-types
const DeletePopup = ({ open, onClose, onConfirm }) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            aria-labelledby="delete-dialog-title"
            aria-describedby="delete-dialog-description"
        >
            <DialogTitle id="delete-dialog-title">Confirmer la suppression</DialogTitle>
            <DialogContent>
                <DialogContentText id="delete-dialog-description">
                    Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Annuler
                </Button>
                <Button onClick={onConfirm} color="error" variant="contained">
                    Supprimer
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DeletePopup;
