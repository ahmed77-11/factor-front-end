import {createSlice} from "@reduxjs/toolkit";
import axios from "axios";


const initialState = {
    contrats: [],
    loading: false,
    error: null,
}

const contratSlice = createSlice({
    name: 'contrat',
    initialState,
    reducers: {
        fetchContrats: (state) => {
            state.loading = true;
        },
        fetchContratsSuccess: (state, action) => {
            state.contrats = action.payload;
            state.loading = false;
            state.error = null;
        },
        fetchContratsFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        addContratStart: (state) => {
            state.loading = true;
        },
        addContratSuccess: (state, action) => {
            state.contrats.push(action.payload);
            state.loading = false;
            state.error = null;
        },
        addContratFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
    }
});

export const addContratAsync = (contratData,navigate) => async (dispatch) => {
    try{
        dispatch(addContratStart() )
        const res=await axios.post("http://localhost:8083/factoring/contrat/api/create-contrat",contratData,{
            withCredentials:true,
        });
        if(res.status!==200){
            throw new Error("Une erreur s'est produite");
        }
        dispatch(addContratSuccess(res.data));
        navigate("/");
    }catch (error){
        console.log(error);
        dispatch(addContratFailure(error.message));
    }
}

export const { fetchContrats, fetchContratsSuccess, fetchContratsFailure,addContratStart,addContratSuccess,addContratFailure } = contratSlice.actions;
export default contratSlice.reducer;