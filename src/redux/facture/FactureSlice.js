import {createSlice} from "@reduxjs/toolkit";
import axios from "axios";


const initialState={
    factures: [],
    currentFacture:null,
    loading:false,
    error:null,
    nbFac:0,
}

const factureSlice=createSlice({
    name:'facture',
    initialState,
    reducers:{
        addFactureStart:(state)=>{
          state.loading=true;
        },
        addFactureSuccess:(state,action)=>{
            state.loading=false;
            state.factures.push(action.payload);
        },
        addFactureFailure:(state,action)=>{
            state.loading=false;
            state.error=action.payload;
        },
        updateFactureStart:(state)=>{
            state.loading=true;
        },
        updateFactureSuccess:(state,action)=>{
            state.loading=false;
            const index=state.factures.findIndex((facture)=>facture.id===action.payload.id);
            if (index!==-1){
                state.factures[index]=action.payload;
            }
        },
        updateFactureFailure:(state,action)=>{
            state.loading=false;
            state.error=action.payload;
        },
        validerFactureStart:(state)=>{
            state.loading=true;
        },
        validerFactureSuccess:(state,action)=>{
            state.loading=false;
            const index=state.factures.findIndex((facture)=>facture.id===action.payload.id);
            if (index!==-1){
                state.factures[index]=action.payload;
            }
        },
        validerFactureFailure:(state,action)=>{
            state.loading=false;
            state.error=action.payload;
        },
        getAllFactNonValiderStart:(state)=>{
            state.loading=true;
        },
        getAllFactNonValiderSuccess:(state,action)=>{
            state.loading=false;
            state.factures=action.payload;
        },
        getAllFactNonValiderFailure:(state,action)=>{
            state.loading=false;
            state.error=action.payload;
        },
        getAllFactValiderStart:(state)=>{
            state.loading=true;
        },
        getAllFactValiderSuccess:(state,action)=>{
            state.loading=false;
            state.factures=action.payload;
        },
        getAllFactValiderFailure:(state,action)=>{
            state.loading=false;
            state.error=action.payload;
        },
        getNbFacStart:(state)=>{
            state.loading=true;
        },
        getNbFacSuccess:(state,action)=>{
            state.loading=false;
            state.nbFac=action.payload;
        },
        getNbFacFailure:(state,action)=>{
            state.loading=false;
            state.error=action.payload;
        },
        getFactureByIdStart:(state)=>{
            state.loading=true;
            state.currentFacture=null;
        },
        getFactureByIdSuccess:(state,action)=>{
            state.loading=false;
            state.currentFacture=action.payload;
        },
        getFactureByIdFailure:(state,action)=>{
            state.loading=false;
            state.error=action.payload;
        },
        deleteFactureStart:(state)=>{
            state.loading=false;
        },
        deleteFactureSuccess:(state,action)=>{
            state.loading=false;
            const index=state.factures.findIndex((facture)=>facture.id===action.payload.id);
            if (index!==-1){
                state.factures.splice(index,1);
            }
        },
        deleteFactureFailure:(state,action)=>{
            state.loading=false;
            state.error=action.payload;
        },

    }
})

export const getAllFactNonValiderAsync=()=>async (dispatch)=>{
    dispatch(getAllFactNonValiderStart());
    try {
        const response=await axios.get("http://localhost:8083/factoring/contrat/api/bord-remises/all-non-valider",{
            withCredentials:true,
        });
        if (response.status !== 200) {
            throw new Error('Failed to fetch data');
        }
        dispatch(getAllFactNonValiderSuccess(response.data));
    } catch (error) {
        dispatch(getAllFactNonValiderFailure(error.message));
    }
}
export const getAllFactValiderAsync=()=>async (dispatch)=>{
    dispatch(getAllFactValiderStart());
    try {
        const response=await axios.get("http://localhost:8083/factoring/contrat/api/bord-remises/all-valider",{
            withCredentials:true,
        });
        if (response.status !== 200) {
            throw new Error('Failed to fetch data');
        }
        dispatch(getAllFactValiderSuccess(response.data));
    } catch (error) {
        dispatch(getAllFactValiderFailure(error.message));
    }
}

export const getNbFac=()=>async (dispatch)=>{
    dispatch(getNbFacStart());
    try {
        const response=await axios.get("http://localhost:8083/factoring/contrat/api/bord-remises/bord-remise-count",{
            withCredentials:true,
        });
        if (response.status !== 200) {
            throw new Error('Failed to fetch data');
        }
        dispatch(getNbFacSuccess(response.data));
    } catch (error) {
        dispatch(getNbFacFailure(error.message));
    }
}

export const addFacture=(data,navigate)=>async (dispatch)=>{
    dispatch(addFactureStart());
    try {
        const response=await axios.post("http://localhost:8083/factoring/contrat/api/bord-remises/ajouter-bord",data,{
            withCredentials:true,
        });
        if (response.status !== 200) {
            throw new Error('Failed to fetch data');
        }
        dispatch(addFactureSuccess(response.data));
        navigate("/factures");
    } catch (error) {
        dispatch(addFactureFailure(error.message));
    }
}

export const getFactureById=(id)=>async (dispatch)=>{
    dispatch(getFactureByIdStart());
    try {
        const response=await axios.get(`http://localhost:8083/factoring/contrat/api/bord-remises/bord-remise/${id}`,{
            withCredentials:true,
        });
        if (response.status !== 200) {
            throw new Error('Failed to fetch data');
        }
        dispatch(getFactureByIdSuccess(response.data));
    } catch (error) {
        dispatch(getFactureByIdFailure(error.message));
    }
}
export const updateFacture=(payload,navigate)=>async (dispatch)=>{
    dispatch(updateFactureStart());
    try {
        const response = await axios.post(`http://localhost:8083/factoring/contrat/api/bord-remises/modifier-bord`, payload, {
            withCredentials: true,
        })
        if (response.status !== 200) {
            throw new Error('Failed to update data');
        }
        dispatch(updateFactureSuccess(response.data));
        navigate("/factures");
    }catch (e){
        console.log(e);
        dispatch(updateFactureFailure(e.message));
    }
}

export const validerFacture=(payload,navigate)=>async (dispatch)=>{
    dispatch(validerFactureStart());
    try {
        const response = await axios.post(`http://localhost:8083/factoring/contrat/api/bord-remises/valider-bord`, payload, {
            withCredentials: true,
        })
        if (response.status !== 200) {
            throw new Error('Failed to update data');
        }
        dispatch(validerFactureSuccess(response.data));
        navigate("/factures");
    }catch (e){
        console.log(e);
        dispatch(validerFactureFailure(e.message));
    }
}

export const deleteFacture=(id)=>async (dispatch)=>{
    dispatch(deleteFactureStart());
    try{
        const response = await axios.delete(`http://localhost:8083/factoring/contrat/api/bord-remises/delete-bord/${id}`,  {
            withCredentials: true,
        })
        if (response.status !== 200) {
            throw new Error('Failed to delete data');
        }
        dispatch(validerFactureSuccess(response.data));
    }catch (e) {
        console.log(e);
        dispatch(deleteFactureFailure(e.message));
    }
}
export const {getNbFacStart,getNbFacSuccess,getNbFacFailure,addFactureStart,addFactureSuccess,addFactureFailure,getFactureByIdStart,getFactureByIdSuccess,getFactureByIdFailure,updateFactureStart,updateFactureSuccess,updateFactureFailure,getAllFactNonValiderStart,getAllFactNonValiderSuccess,getAllFactNonValiderFailure,validerFactureStart,validerFactureSuccess,validerFactureFailure,getAllFactValiderStart,getAllFactValiderSuccess,getAllFactValiderFailure,deleteFactureStart,deleteFactureSuccess,deleteFactureFailure}= factureSlice.actions;
export default factureSlice.reducer;