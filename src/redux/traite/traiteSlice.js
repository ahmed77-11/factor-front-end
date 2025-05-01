import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
    traites: [],
    currentTraite: null,
    errorTraite: null,
    loadingTraite: false,
};

const traiteSlice = createSlice({
    name: "traite",
    initialState,
    reducers: {
        // GET ALL
        allTraiteStart: (state) => {
            state.loadingTraite = true;
        },
        allTraiteSuccess: (state, action) => {
            state.loadingTraite = false;
            state.traites = action.payload;
        },
        allTraiteFailure: (state, action) => {
            state.loadingTraite = false;
            state.errorTraite = action.payload;
        },

        // ADD
        addTraiteStart: (state) => {
            state.loadingTraite = true;
        },
        addTraiteSuccess: (state) => {
            state.loadingTraite = false;
        },
        addTraiteFailure: (state, action) => {
            state.loadingTraite = false;
            state.errorTraite = action.payload;
        },

        // GET BY ID
        findTraiteByIdStart: (state) => {
            state.loadingTraite = true;
        },
        findTraiteByIdSuccess: (state, action) => {
            state.loadingTraite = false;
            state.currentTraite = action.payload;
        },
        findTraiteByIdFailure: (state, action) => {
            state.loadingTraite = false;
            state.errorTraite = action.payload;
        },

        // UPDATE
        updateTraiteStart: (state) => {
            state.loadingTraite = true;
        },
        updateTraiteSuccess: (state) => {
            state.loadingTraite = false;
        },
        updateTraiteFailure: (state, action) => {
            state.loadingTraite = false;
            state.errorTraite = action.payload;
        },

        // DELETE
        deleteTraiteStart: (state) => {
            state.loadingTraite = true;
        },
        deleteTraiteSuccess: (state, action) => {
            state.loadingTraite = false;
            state.traites = state.traites.filter(t => t.id !== action.payload);
        },
        deleteTraiteFailure: (state, action) => {
            state.loadingTraite = false;
            state.errorTraite = action.payload;
        },
    },
});

export const {
    allTraiteStart,
    allTraiteSuccess,
    allTraiteFailure,
    addTraiteStart,
    addTraiteSuccess,
    addTraiteFailure,
    findTraiteByIdStart,
    findTraiteByIdSuccess,
    findTraiteByIdFailure,
    updateTraiteStart,
    updateTraiteSuccess,
    updateTraiteFailure,
    deleteTraiteStart,
    deleteTraiteSuccess,
    deleteTraiteFailure
} = traiteSlice.actions;

export default traiteSlice.reducer;

// ============ THUNKS ============

// 🔄 Get all traites
export const getAllTraites = () => async (dispatch) => {
    dispatch(allTraiteStart());
    try {
        const response = await axios.get("http://localhost:8083/factoring/contrat/api/traite/all-traite", {
            withCredentials: true,
        });
        if (response.status !== 200) {
            throw new Error("Une erreur s'est produite");
        }
        dispatch(allTraiteSuccess(response.data));
    } catch (e) {
        dispatch(allTraiteFailure(e.message));
    }
};

export const getAllTraitesByContrat=(id)=>async (dispatch)=>{
    dispatch(allTraiteStart())
    try {
        const response = await axios.get(`http://localhost:8083/factoring/contrat/api/traite/all-traite-by-contrat/${id}`, {
            withCredentials: true,
        });
        if (response.status !== 200) {
            throw new Error("Une erreur s'est produite");
        }
        dispatch(allTraiteSuccess(response.data));
    }catch (e) {
        dispatch(allTraiteFailure(e.message));
    }
}

// ➕ Add traite
export const addTraite = (data, navigate) => async (dispatch) => {
    dispatch(addTraiteStart());
    try {
        const response = await axios.post("http://localhost:8083/factoring/contrat/api/traite/add-traite", data, {
            withCredentials: true,
        });
        if (response.status !== 200) {
            throw new Error("Une erreur s'est produite");
        }
        dispatch(addTraiteSuccess());
        navigate("/all-traites");
    } catch (e) {
        dispatch(addTraiteFailure(e.message));
    }
};

// 🔍 Get traite by ID
export const getTraiteById = (id) => async (dispatch) => {
    dispatch(findTraiteByIdStart());
    try {
        const response = await axios.get(`http://localhost:8083/factoring/contrat/api/traite/get-traite/${id}`, {
            withCredentials: true,
        });
        if (response.status !== 200) {
            throw new Error("Une erreur s'est produite");
        }
        dispatch(findTraiteByIdSuccess(response.data));
    } catch (e) {
        dispatch(findTraiteByIdFailure(e.message));
    }
};

// ✏️ Update traite
export const updateTraite = (id, data, navigate) => async (dispatch) => {
    dispatch(updateTraiteStart());
    try {
        const response = await axios.post(`http://localhost:8083/factoring/contrat/api/traite/update-traite/${id}`, data, {
            withCredentials: true,
        });
        if (response.status !== 200) {
            throw new Error("Une erreur s'est produite");
        }
        dispatch(updateTraiteSuccess());
        navigate("/all-traite");
    } catch (e) {
        dispatch(updateTraiteFailure(e.message));
    }
};

// ❌ Delete traite
export const deleteTraite = (id, navigate) => async (dispatch) => {
    dispatch(deleteTraiteStart());
    try {
        const response = await axios.delete(`http://localhost:8083/factoring/contrat/api/traite/delete-traite/${id}`, {
            withCredentials: true,
        });
        if (response.status !== 200) {
            throw new Error("Une erreur s'est produite");
        }
        dispatch(deleteTraiteSuccess(id));
        navigate("/all-traite");
    } catch (e) {
        dispatch(deleteTraiteFailure(e.message));
    }
};
