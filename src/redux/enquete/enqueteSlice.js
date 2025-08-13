import {createSlice} from "@reduxjs/toolkit";
import axios from "axios";

const intialState = {
    enquetes:[],
    currentEnquete: null,
    loadingEnquete: false,
    errorEnquete: null,
};

const enqueteSlice = createSlice({
    name: "enquete",
    initialState: intialState,
    reducers: {
       // Fetch Enquetes
        fetchEnquetesStart: (state) => {
            state.loadingEnquete = true;
            state.errorEnquete = null;
        },
        fetchEnquetesSuccess: (state, action) => {
            state.loadingEnquete = false;
            state.enquetes = action.payload;
        },
        fetchEnquetesFailure: (state, action) => {
            state.loadingEnquete = false;
            state.errorEnquete = action.payload;
        },

        // Fetch Single Enquete
        fetchEnqueteStart: (state) => {
            state.loadingEnquete = true;
            state.errorEnquete = null;
        },
        fetchEnqueteSuccess: (state, action) => {
            state.loadingEnquete = false;
            state.currentEnquete = action.payload;
        },
        fetchEnqueteFailure: (state, action) => {
            state.loadingEnquete = false;
            state.errorEnquete = action.payload;
        },
        // Create Enquete
        createEnqueteStart: (state) => {
            state.loadingEnquete = true;
            state.errorEnquete = null;
        },
        createEnqueteSuccess: (state, action) => {
            state.loadingEnquete = false;
            state.enquetes.push(action.payload);
        },
        createEnqueteFailure: (state, action) => {
            state.loadingEnquete = false;
            state.errorEnquete = action.payload;
        },
        // Update Enquete
        updateEnqueteStart: (state) => {
            state.loadingEnquete = true;
            state.errorEnquete = null;
        },
        updateEnqueteSuccess: (state, action) => {
            state.loadingEnquete = false;
            const index = state.enquetes.findIndex(enquete => enquete.id === action.payload.id);
            if (index !== -1) {
                state.enquetes[index] = action.payload;
            }
        },
        updateEnqueteFailure: (state, action) => {
            state.loadingEnquete = false;
            state.errorEnquete = action.payload;
        },
        // Delete Enquete
        deleteEnqueteStart: (state) => {
            state.loadingEnquete = true;
            state.errorEnquete = null;
        },
        deleteEnqueteSuccess: (state, action) => {
            state.loadingEnquete = false;
            state.enquetes = state.enquetes.filter(enquete => enquete.id !== action.payload.id);
        },
        deleteEnqueteFailure: (state, action) => {
            state.loadingEnquete = false;
            state.errorEnquete = action.payload;
        },
    },
})


export const addEnquete=(data,navigate)=> async (dispatch) => {
    dispatch(createEnqueteStart());
    try{
        const res=await axios.post("http://localhost:8081/factoring/api/enquete/ajouter-enquete",data,{
            withCredentials:true
        });
        if(res.status!== 200){
            throw new Error("Failed to create enquete");
        }
        dispatch(createEnqueteSuccess(res.data));
        navigate("/list-enquetes");
    }catch (e) {
        console.error(e);
        dispatch(createEnqueteFailure(e.message || "Failed to create enquete"));
    }
}


export const getAllEnquetes=()=> async (dispatch) => {
    dispatch(fetchEnquetesStart());
    try{
        const res=await axios.get("http://localhost:8081/factoring/api/enquete/all-enquetes",{
            withCredentials:true
        });
        if(res.status!== 200){
            throw new Error("Failed to fetch enquetes");
        }
        dispatch(fetchEnquetesSuccess(res.data));
    }catch (e) {
        console.error(e);
        dispatch(fetchEnquetesFailure(e.message || "Failed to fetch enquetes"));
    }
}

export const getAllActiveEnquets=()=>async (dispatch)=>{
    dispatch(fetchEnquetesStart());
    try{
        const res=await axios.get("http://localhost:8081/factoring/api/enquete/all-active-enquetes",{
            withCredentials:true
        });
        if(res.status!== 200){
            throw new Error("Failed to fetch active enquetes");
        }
        dispatch(fetchEnquetesSuccess(res.data));
    }catch (e) {
        console.error(e);
        dispatch(fetchEnquetesFailure(e.message || "Failed to fetch active enquetes"));
    }
}

export const fetchEnqueteById = (id) => async (dispatch) => {
    dispatch(fetchEnqueteStart());
    try{
        const res=await axios.get(`http://localhost:8081/factoring/api/enquete/get-enquete/${id}`, {
            withCredentials: true,
        })
        if(res.status!== 200){
            throw new Error("Failed to fetch enquete");
        }
        dispatch(fetchEnqueteSuccess(res.data));
    }catch (e) {
        console.error(e);
        dispatch(fetchEnqueteFailure(e.message || "Failed to fetch enquete"));
    }
}

export const updateEnquete=(id,data,navigate)=> async (dispatch) => {
    dispatch(updateEnqueteStart());
    try{
        const res=await axios.post(`http://localhost:8081/factoring/api/enquete/modifier-enquete/${id}`,data,{
            withCredentials:true
        });
        if(res.status!== 200){
            throw new Error("Failed to update enquete");
        }
        dispatch(updateEnqueteSuccess(res.data));
        navigate("/list-enquetes");
    }catch (e) {
        console.error(e);
        dispatch(updateEnqueteFailure(e.message || "Failed to update enquete"));
    }
}
export const deleteEnquete=(id)=> async (dispatch) => {
    dispatch(deleteEnqueteStart());
    try{
        const res=await axios.delete(`http://localhost:8081/factoring/api/enquete/delete-enquete/${id}`,{
            withCredentials:true
        });
        if(res.status!== 200){
            throw new Error("Failed to delete enquete");
        }
        dispatch(deleteEnqueteSuccess({ id }));
    }catch (e) {
        console.error(e);
        dispatch(deleteEnqueteFailure(e.message || "Failed to delete enquete"));
    }
}

export const {
    fetchEnquetesStart,
    fetchEnquetesSuccess,
    fetchEnquetesFailure,
    fetchEnqueteStart,
    fetchEnqueteSuccess,
    fetchEnqueteFailure,
    createEnqueteStart,
    createEnqueteSuccess,
    createEnqueteFailure,
    updateEnqueteStart,
    updateEnqueteSuccess,
    updateEnqueteFailure,
    deleteEnqueteStart,
    deleteEnqueteSuccess,
    deleteEnqueteFailure
} = enqueteSlice.actions;

export default enqueteSlice.reducer;