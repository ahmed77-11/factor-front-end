import {createSlice} from "@reduxjs/toolkit";
import axios from "axios";


const initialState = {
    contrats: [],
    loading: false,
    error: null,
    currentContrat: null,
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
        getContratByIdStart: (state) => {
            state.loading = true;
            state.currentContrat = null;
        },
        getContratByIdSuccess: (state, action) => {
            state.loading = false;
            state.error = null;
            state.currentContrat = action.payload;
        },
        getContratByIdFailure: (state, action) => {
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
        updateContratStart: (state) => {
            state.loading = true;
        },
        updateContratSuccess: (state, action) => {
            state.contrats = state.contrats.map((contrat) => contrat.id === action.payload.id ? action.payload : contrat);
            state.loading = false;
            state.error = null;
        },
        updateContratFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
    }
});

export const fetchContratByIdAsync = (id) => async (dispatch) => {
    try {
        dispatch(getContratByIdStart());
        const res = await axios.get(`http://localhost:8083/factoring/contrat/api/contrat/${id}`, {
            withCredentials: true,
        });
        if (res.status !== 200) {
            throw new Error("Une erreur s'est produite");
        }
        dispatch(getContratByIdSuccess(res.data));
    } catch (error) {
        console.log(error);
        dispatch(getContratByIdFailure(error.message));
    }
}

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

export const updateContratAsync = (contratData,navigate,taskId) => async (dispatch) => {
    try{
        dispatch(updateContratStart() )
        const res=await axios.post(`http://localhost:8083/factoring/contrat/api/update-contrat/${taskId}`,contratData,{
            withCredentials:true,
        });
        if(res.status!==200){
            throw new Error("Une erreur s'est produite");
        }
        dispatch(updateContratSuccess(res.data));
        navigate("/");
    }catch (error){
        console.log(error);
        dispatch(updateContratFailure(error.message));
    }
}

export const { fetchContrats, fetchContratsSuccess, fetchContratsFailure,addContratStart,addContratSuccess,addContratFailure ,updateContratStart,updateContratSuccess,updateContratFailure,getContratByIdStart,getContratByIdSuccess,getContratByIdFailure} = contratSlice.actions;
export default contratSlice.reducer;