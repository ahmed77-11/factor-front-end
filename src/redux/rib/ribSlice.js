import {createSlice} from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
    ribs: [],
    currentRib: null,
    loadingRib: false,
    errorRib: null,
}

const ribSlice=createSlice({
    name: "rib",
    initialState,
    reducers:{
        fetchRibsStart: (state) => {
            state.loadingRib = true;
            state.errorRib = null;
        },
        fetchRibsSuccess: (state, action) => {
            state.loadingRib = false;
            state.ribs= action.payload;
        },
        fetchRibsFailure: (state, action) => {
            state.loadingRib = false;
            state.errorRib = action.payload;
        },
        fetchRibByIdStart: (state) => {
            state.loadingRib = true;
            state.errorRib = null;
        },
        fetchRibByIdSuccess: (state, action) => {
            state.loadingRib = false;
            state.currentRib = action.payload;
        },
        fetchRibByIdFailure: (state, action) => {
            state.loadingRib = false;
            state.errorRib = action.payload;
        },
        createRibStart: (state) => {
            state.loadingRib = true;
            state.errorRib = null;
        },
        createRibSuccess: (state, action) => {
            state.loadingRib = false;
            state.ribs.push(action.payload);
        },
        createRibFailure: (state, action) => {
            state.loadingRib = false;
            state.errorRib = action.payload;
        },
        updateRibStart: (state) => {
            state.loadingRib = true;
            state.errorRib = null;
        },
        updateRibSuccess: (state, action) => {
            state.loadingRib = false;
            const index = state.ribs.findIndex(rib => rib.id === action.payload.id);
            if (index !== -1) {
                state.ribs[index] = action.payload;
            }
        },
        updateRibFailure: (state, action) => {
            state.loadingRib = false;
            state.errorRib = action.payload;
        },
        deleteRibStart: (state) => {
            state.loadingRib = true;
            state.errorRib = null;
        },
        deleteRibSuccess: (state, action) => {
            state.loadingRib = false;
            state.ribs = state.ribs.filter(rib => rib.id !== action.payload);
        },
        deleteRibFailure: (state, action) => {
            state.loadingRib = false;
            state.errorRib = action.payload;
        },
    }
})

export const addRib = (data,navigate) => async (dispatch) => {
    dispatch(createRibStart());
    try {
        const response = await axios.post("http://localhost:8083/factoring/contrat/api/rib/add", data,
            { withCredentials: true }
        );
        if (response.status !== 200) {
            throw new Error("Une erreur s'est produite lors de la création du RIB.");
        }
        dispatch(createRibSuccess(response.data));
        navigate("/list-ribs");

    } catch (error) {
        console.error(error);
        dispatch(createRibFailure(error.message.data));
    }
};


export const allAdherRibs=(contratId)=>async (dispatch)=>{
    dispatch(fetchRibsStart());
    try {
        const response = await axios.get("http://localhost:8083/factoring/contrat/api/rib/get-all-adher-ribs/"+contratId, { withCredentials: true });
        if (response.status !== 200) {
            throw new Error("Une erreur s'est produite lors de la récupération des RIBs.");
        }
        dispatch(fetchRibsSuccess(response.data));
    } catch (error) {
        console.error(error);
        dispatch(fetchRibsFailure(error.message.data));
    }
}
export const allAchetPmRibs=(contratId,pmAchet)=>async (dispatch)=>{
    dispatch(fetchRibsStart());
    try {
        const response = await axios.get("http://localhost:8083/factoring/contrat/api/rib/get-all-adher-ribs-achet-pm/"+contratId+"/"+pmAchet, { withCredentials: true });
        if (response.status !== 200) {
            throw new Error("Une erreur s'est produite lors de la récupération des RIBs.");
        }
        dispatch(fetchRibsSuccess(response.data));
    } catch (error) {
        console.error(error);
        dispatch(fetchRibsFailure(error.message.data));
    }
}
export const allAchetPpRibs=(contratId,ppAchet)=>async (dispatch)=>{
    dispatch(fetchRibsStart());
    try {
        const response = await axios.get("http://localhost:8083/factoring/contrat/api/rib/get-all-adher-ribs-achet-pp/"+contratId+"/"+ppAchet, { withCredentials: true });
        if (response.status !== 200) {
            throw new Error("Une erreur s'est produite lors de la récupération des RIBs.");
        }
        dispatch(fetchRibsSuccess(response.data));
    } catch (error) {
        console.error(error);
        dispatch(fetchRibsFailure(error.message.data));
    }
}
export const allFournPmRibs=(contratId,pmFourn)=>async (dispatch)=>{
    dispatch(fetchRibsStart());
    try {
        const response = await axios.get("http://localhost:8083/factoring/contrat/api/rib/get-all-adher-ribs-fourn-pm/"+contratId+"/"+pmFourn, { withCredentials: true });
        if (response.status !== 200) {
            throw new Error("Une erreur s'est produite lors de la récupération des RIBs.");
        }
        dispatch(fetchRibsSuccess(response.data));
    } catch (error) {
        console.error(error);
        dispatch(fetchRibsFailure(error.message.data));
    }
}
export const allFournPpRibs=(contratId,ppFourn)=>async (dispatch)=>{
    dispatch(fetchRibsStart());
    try {
        const response = await axios.get("http://localhost:8083/factoring/contrat/api/rib/get-all-adher-ribs-fourn-pp/"+contratId+"/"+ppFourn, { withCredentials: true });
        if (response.status !== 200) {
            throw new Error("Une erreur s'est produite lors de la récupération des RIBs.");
        }
        dispatch(fetchRibsSuccess(response.data));
    } catch (error) {
        console.error(error);
        dispatch(fetchRibsFailure(error.message.data));
    }
}


export const fetchRibByIdAsync = (ribId) => async (dispatch) => {
    dispatch(fetchRibByIdStart());
    try {
        const response = await axios.get(`http://localhost:8083/factoring/contrat/api/rib/get-rib/${ribId}`, { withCredentials: true });
        if (response.status !== 200) {
            throw new Error("Une erreur s'est produite lors de la récupération du RIB.");
        }
        dispatch(fetchRibByIdSuccess(response.data));
    } catch (error) {
        console.error(error);
        dispatch(fetchRibByIdFailure(error.message.data));
    }
}
export const updateRib= (ribId, data, navigate) => async (dispatch) => {
    dispatch(updateRibStart());
    try {
        const response = await axios.post(`http://localhost:8083/factoring/contrat/api/rib/update/${ribId}`, data, { withCredentials: true });
        if (response.status !== 200) {
            throw new Error("Une erreur s'est produite lors de la mise à jour du RIB.");
        }
        dispatch(updateRibSuccess(response.data));
        navigate("/list-ribs");
    } catch (error) {
        console.error(error);
        dispatch(updateRibFailure(error.message.data));
    }
}
export const deleteRibByIdAsync = (ribId) => async (dispatch) => {
    dispatch(deleteRibStart());
    try {
        const response = await axios.delete(`http://localhost:8083/factoring/contrat/api/rib/delete/${ribId}`, { withCredentials: true });
        if (response.status !== 200) {
            throw new Error("Une erreur s'est produite lors de la suppression du RIB.");
        }
        dispatch(deleteRibSuccess(ribId));
    } catch (error) {
        console.error(error);
        dispatch(deleteRibFailure(error.message.data));
    }
}
export const {
    fetchRibsStart,
    fetchRibsSuccess,
    fetchRibsFailure,
    fetchRibByIdStart,
    fetchRibByIdSuccess,
    fetchRibByIdFailure,
    createRibStart,
    createRibSuccess,
    createRibFailure,
    updateRibStart,
    updateRibSuccess,
    updateRibFailure,
    deleteRibStart,
    deleteRibSuccess,
    deleteRibFailure
} = ribSlice.actions;

export default ribSlice.reducer;