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
        getByAdherentStart: (state) => {
            state.loading = true;
            state.currentContrat = null;
        },
        getByAdherentSuccess: (state, action) => {
            state.loading = false;
            state.error = null;
            state.currentContrat = action.payload;
        },
        getByAdherentFailure: (state, action) => {
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
        signerContratStart: (state) => {
            state.loading = true;
        },
        signerContratSuccess: (state, action) => {
            state.contrats = state.contrats.map((contrat) => contrat.id === action.payload.id ? action.payload : contrat);
            state.loading = false;
            state.error = null;
        },
        signerContratFailure: (state, action) => {
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

export const fetchContratByAdherentIdAsync = (id) => async (dispatch) => {
    try {
        dispatch(getByAdherentStart());
        const res = await axios.get(`http://localhost:8083/factoring/contrat/api/find-by-adherent/${id}`, {
            withCredentials: true,
        });
        if (res.status !== 200) {
            throw new Error("Une erreur s'est produite");
        }
        dispatch(getByAdherentSuccess(res.data));
    } catch (error) {
        console.log(error);
        dispatch(getByAdherentFailure(error.message));
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


export const fetchContratsAsyncByStatus= (status) => async (dispatch) => {
    dispatch(fetchContrats());
    try{
        const res=await axios.get("http://localhost:8083/factoring/contrat/api/all-contrats-"+status,{
            withCredentials:true
        });
        if(res.status!==200){
            throw new Error("Une erreur s'est produite");
        }
        dispatch(fetchContratsSuccess(res.data));
    }catch (e){
        console.log(e);
        dispatch(fetchContratsFailure(e.message));

    }
}

export const signerContratAsync = (contratId,navigate) => async (dispatch) => {
    try{
        dispatch(signerContratStart() )
        const res=await axios.post("http://localhost:8083/factoring/contrat/api/signer-contrat/"+contratId,null,{
            withCredentials:true,
        });
        if(res.status!==200){
            throw new Error("Une erreur s'est produite");
        }
        dispatch(signerContratSuccess(res.data));
        navigate("/");
    }catch (e) {
        console.log(e);
        dispatch(signerContratFailure(e.message));

    }
}

export const { fetchContrats, fetchContratsSuccess, fetchContratsFailure,addContratStart,addContratSuccess,addContratFailure ,updateContratStart,updateContratSuccess,updateContratFailure,getContratByIdStart,getContratByIdSuccess,getContratByIdFailure,signerContratStart,signerContratSuccess,signerContratFailure,getByAdherentStart,getByAdherentSuccess,getByAdherentFailure} = contratSlice.actions;
export default contratSlice.reducer;