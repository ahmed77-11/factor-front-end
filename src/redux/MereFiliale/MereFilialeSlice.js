import {createSlice}  from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
    mereFiliales: [],
    currentMereFiliale: null,
    loadingMereFiliale: false,
    errorMereFiliale: null,
}

const mereFilialeSlice = createSlice({
    name: "mereFiliale",
    initialState,
    reducers: {
        // Fetch all Mere Filiales by mere
        fetchMereFilialesStart: (state) => {
            state.loadingMereFiliale = true;
            state.errorMereFiliale = null;
        },
        fetchMereFilialesSuccess: (state, action) => {
            state.loadingMereFiliale = false;
            state.mereFiliales = action.payload;
        },
        fetchMereFilialesFailure: (state, action) => {
            state.loadingMereFiliale = false;
            state.errorMereFiliale = action.payload;
        },
        // Fetch single Mere Filiale by ID
        fetchMereFilialeByIdStart: (state) => {
            state.loadingMereFiliale = true;
            state.errorMereFiliale = null;
        },
        fetchMereFilialeByIdSuccess: (state, action) => {
            state.loadingMereFiliale = false;
            state.currentMereFiliale = action.payload;
        },
        fetchMereFilialeByIdFailure: (state, action) => {
            state.loadingMereFiliale = false;
            state.errorMereFiliale = action.payload;
        },
        // Create new Mere Filiale
        createMereFilialeStart: (state) => {
            state.loadingMereFiliale = true;
            state.errorMereFiliale = null;
        },
        createMereFilialeSuccess: (state, action) => {
            state.loadingMereFiliale = false;
            state.mereFiliales.push(action.payload);
        },
        createMereFilialeFailure: (state, action) => {
            state.loadingMereFiliale = false;
            state.errorMereFiliale = action.payload;
        },
        // Update existing Mere Filiale
        updateMereFilialeStart: (state) => {
            state.loadingMereFiliale = true;
            state.errorMereFiliale = null;
        },
        updateMereFilialeSuccess: (state, action) => {
            state.loadingMereFiliale = false;
            const index = state.mereFiliales.findIndex(mere => mere.id === action.payload.id);
            if (index !== -1) {
                state.mereFiliales[index] = action.payload;
            }
        },
        updateMereFilialeFailure: (state, action) => {
            state.loadingMereFiliale = false;
            state.errorMereFiliale = action.payload;
        },
        // Delete Mere Filiale
        deleteMereFilialeStart: (state) => {
            state.loadingMereFiliale = true;
            state.errorMereFiliale = null;
        },
        deleteMereFilialeSuccess: (state, action) => {
            state.loadingMereFiliale = false;
            state.mereFiliales = state.mereFiliales.filter(mere => mere.id !== action.payload);
        },
        deleteMereFilialeFailure: (state, action) => {
            state.loadingMereFiliale = false;
            state.errorMereFiliale = action.payload;
        },
    }
})

export const addMereFiliale =(data,navigate)=> async (dispatch) => {
    dispatch(createMereFilialeStart());
    try {
        const response = await axios.post("http://localhost:8081/factoring/api/pm-mere-filiale/add", data, {
            withCredentials: true
        });
        if (response.status !== 201) {
            throw new Error("Failed to create Mere Filiale");
        }
        dispatch(createMereFilialeSuccess(response.data));
        navigate("/societe-mere-filiale");
    } catch (error) {
        dispatch(createMereFilialeFailure(error.message));
    }
};


export const fetchAllMereFilialesByMere = (mereId) => async (dispatch) => {
    dispatch(fetchMereFilialesStart());
    try {
        const response = await axios.get(`http://localhost:8081/factoring/api/pm-mere-filiale/all-filiale-by-mere/${mereId}`, {
            withCredentials: true
        });
        if (response.status !== 200) {
            throw new Error("Failed to fetch Mere Filiales");
        }
        dispatch(fetchMereFilialesSuccess(response.data));
    } catch (error) {
        dispatch(fetchMereFilialesFailure(error.message));
    }
}

export const getMereFilialeById = (id) => async (dispatch) => {
    dispatch(fetchMereFilialeByIdStart());
    try {
        const response = await axios.get(`http://localhost:8081/factoring/api/pm-mere-filiale/get-pm-mere-filiale/${id}`, {
            withCredentials: true
        });
        if (response.status !== 200) {
            throw new Error("Failed to fetch Mere Filiale by ID");
        }
        dispatch(fetchMereFilialeByIdSuccess(response.data));
    } catch (error) {
        dispatch(fetchMereFilialeByIdFailure(error.message));
    }
}


export const updateMereFiliale = (data, id,navigate) => async (dispatch) => {
    dispatch(updateMereFilialeStart());
    try {
        const response = await axios.post(`http://localhost:8081/factoring/api/pm-mere-filiale/update-pm-mere-filiale/${id}`, data, {
            withCredentials: true
        });
        if (response.status !== 200) {
            throw new Error("Failed to update Mere Filiale");
        }
        dispatch(updateMereFilialeSuccess(response.data));
        navigate("/societe-mere-filiale");
    } catch (error) {
        dispatch(updateMereFilialeFailure(error.message));
    }
};

export const deleteMereFiliale = (id, navigate) => async (dispatch) => {
    dispatch(deleteMereFilialeStart());
    try {
        const response = await axios.delete(`http://localhost:8081/factoring/api/pm-mere-filiale/delete-pm-mere-filiale/${id}`, {
            withCredentials: true
        });
        if (response.status !== 200) {
            throw new Error("Failed to delete Mere Filiale");
        }
        dispatch(deleteMereFilialeSuccess(id));
        navigate("/societe-mere-filiale");
    } catch (error) {
        dispatch(deleteMereFilialeFailure(error.message));
    }
};

export const {
    fetchMereFilialesStart,
    fetchMereFilialesSuccess,
    fetchMereFilialesFailure,
    fetchMereFilialeByIdStart,
    fetchMereFilialeByIdSuccess,
    fetchMereFilialeByIdFailure,
    createMereFilialeStart,
    createMereFilialeSuccess,
    createMereFilialeFailure,
    updateMereFilialeStart,
    updateMereFilialeSuccess,
    updateMereFilialeFailure,
    deleteMereFilialeStart,
    deleteMereFilialeSuccess,
    deleteMereFilialeFailure
} = mereFilialeSlice.actions;

export default mereFilialeSlice.reducer;