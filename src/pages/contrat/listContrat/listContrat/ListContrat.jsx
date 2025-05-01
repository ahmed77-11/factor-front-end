import React from 'react';
import {useTheme} from "@mui/material";
import {tokens} from "../../../../theme.js";
import {useDispatch, useSelector} from "react-redux";
import {useNavigate} from "react-router-dom";

const ListContrat = () => {
    const theme=useTheme();
    const colors=tokens(theme.palette.mode);
    const dispatch=useDispatch();
    const navigate=useNavigate();
    const {contrats,loading,error}=useSelector((state)=>state.contrat);



    return (
        <div>

        </div>
    );
};

export default ListContrat;