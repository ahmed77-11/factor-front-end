import {createSlice} from "@reduxjs/toolkit";
import axios from "axios";

const initialState={
    prorogs: [],
    currentProrog:null,
    loading:false,
    error:null,
}

const prorogSlice=createSlice({
    name:'prorog',
    initialState,
    reducers: {
        addProrogStart: (state) => {
            state.loading = true;
        },
        addProrogSuccess: (state, action) => {
            state.loading = false;
            // state.prorogs.push(JSON.parse(action.payload));
        },
        addProrogFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        updateProrogStart: (state) => {
            state.loading = true;
        },
        updateProrogSuccess: (state, action) => {
            state.loading = false;
            const index = state.prorogs.findIndex((prorog) => prorog.id === action.payload.id);
            if (index !== -1) {
                state.prorogs[index] = action.payload;
            }
        },
        updateProrogFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        fetchProrogsStart: (state) => {
            state.loading = true;
        },
        fetchProrogsSuccess: (state, action) => {
            state.loading = false;
            state.prorogs = action.payload;
        },
        fetchProrogsFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        fetchProrogByIdStart: (state) => {
            state.loading = true;
        },
        fetchProrogByIdSuccess: (state, action) => {
            state.loading = false;
            state.currentProrog = action.payload;
        },
        fetchProrogByIdFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        deleteProrogStart: (state) => {
            state.loading = true;
        },
        deleteProrogSuccess: (state, action) => {
            state.loading = false;
            state.prorogs = state.prorogs.filter((prorog) => prorog.id !== action.payload);
        },
        deleteProrogFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        }
    }
})

export const addProrogAsync= (prorogData)=>async (dispatch)=>{
    dispatch(addProrogStart());
    try{
        console.log("prorogData",prorogData);
        const response=await axios.post("http://localhost:8083/factoring/contrat/api/prorog/add-prorog",prorogData,{
            withCredentials:true
        });
        if (response.status !== 200) {
            throw new Error('error dans l\'ajout de la prorogation');
        }
        dispatch(addProrogSuccess(response.data));
    }catch (error){
        dispatch(addProrogFailure(error.message));
    }
}

export const fetchProrogAsync=()=>async (dispatch)=>{
    dispatch(fetchProrogsStart());
    try {
        const response=await axios.get("http://localhost:8083/factoring/contrat/api/prorog/all-prorog",{
            withCredentials:true,
        });
        if (response.status !== 200) {
            throw new Error('Failed to fetch data');
        }
        dispatch(fetchProrogsSuccess(response.data));
    } catch (error) {
        dispatch(fetchProrogsFailure(error.message));
    }
}

export const {
    addProrogStart,
    addProrogSuccess,
    addProrogFailure,
    updateProrogStart,
    updateProrogSuccess,
    updateProrogFailure,
    fetchProrogsStart,
    fetchProrogsSuccess,
    fetchProrogsFailure,
    fetchProrogByIdStart,
    fetchProrogByIdSuccess,
    fetchProrogByIdFailure,
    deleteProrogStart,
    deleteProrogSuccess,
    deleteProrogFailure
} =prorogSlice.actions;

export default prorogSlice.reducer;