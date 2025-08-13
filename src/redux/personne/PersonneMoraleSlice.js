import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
    personneMorales: [],
    currentPM: null, // store a single personne morale record
    errorPM: null,
    loadingPM: false,
};

const pmSlice = createSlice({
    name: "personneMorale",
    initialState,
    reducers: {
        // Get all personnes morales
        allPMStart: (state) => {
            state.loadingPM = true;
        },
        allPMSuccess: (state, action) => {
            state.loadingPM = false;
            state.personneMorales = action.payload;
        },
        allPMFailure: (state, action) => {
            state.loadingPM = false;
            state.errorPM = action.payload;
        },

        // Add personne morale
        addPMStart: (state) => {
            state.loadingPM = true;
        },
        addMPSuccess: (state) => {
            state.loadingPM = false;
        },
        addPMFailure: (state, action) => {
            state.loadingPM = false;
            state.errorPM = action.payload;
        },

        // Get personne morale by ID
        findPMByIdStart: (state) => {
            state.loadingPM = true;
        },
        findPMByIdSuccess: (state, action) => {
            state.loadingPM = false;
            state.currentPM = action.payload;
        },
        findPMByIdFailure: (state, action) => {
            state.loadingPM = false;
            state.errorPM = action.payload;
        },

        // Update personne morale
        updatePMStart: (state) => {
            state.loadingPM = true;
        },
        updateMPSuccess: (state) => {
            state.loadingPM = false;
        },
        updatePMFailure: (state, action) => {
            state.loadingPM = false;
            state.errorPM = action.payload;
        },
        deletePMStart: (state) => {
            state.loadingPM = true;
        },
        deletePMSuccess: (state,action) => {
            state.loadingPM = false;
            state.personneMorales=state.personneMorales.filter(pm=>pm.id!==action.payload);

        },
        deletePMFailure: (state, action) => {
            state.loadingPM = false;
            state.errorPM = action.payload;
        }
    },
});

export const {
    addPMStart,
    addMPSuccess,
    addPMFailure,
    allPMStart,
    allPMSuccess,
    allPMFailure,
    findPMByIdStart,
    findPMByIdSuccess,
    findPMByIdFailure,
    updatePMStart,
    updateMPSuccess,
    updatePMFailure,
    deletePMStart,
    deletePMSuccess,
    deletePMFailure
} = pmSlice.actions;

export default pmSlice.reducer;

// Thunk for adding a personne morale
export const addPM = (data, navigate) => async (dispatch) => {
    dispatch(addPMStart());
    try {
        const response = await axios.post("http://localhost:8081/factoring/api/pm/add-pm", data, {
            withCredentials: true,
        });
        if (response.status !== 200) {
            throw new Error("Une erreur s'est produite");
        }
        dispatch(addMPSuccess());
        navigate("/all-pm");
    } catch (e) {
        console.log(e);
        dispatch(addPMFailure(e.response.data));
    }
};

// Thunk for getting all personnes morales
export const getPM = () => async (dispatch) => {
    dispatch(allPMStart());
    try {
        const response = await axios.get("http://localhost:8081/factoring/api/pm/all", {
            withCredentials: true,
        });
        if (response.status !== 200) {
            throw new Error("Une erreur s'est produite");
        }
        dispatch(allPMSuccess(response.data));
    } catch (e) {
        dispatch(allPMFailure(e.response.data));
    }
};

// Thunk for getting a personne morale by its ID
export const getPMById = (id) => async (dispatch) => {
    dispatch(findPMByIdStart());
    try {
        const response = await axios.get(`http://localhost:8081/factoring/api/pm/get-pm/${id}`, {
            withCredentials: true,
        });
        if (response.status !== 200) {
            throw new Error("Une erreur s'est produite");
        }
        dispatch(findPMByIdSuccess(response.data));
    } catch (e) {
        dispatch(findPMByIdFailure(e.response.data));
    }
};

// Thunk for updating a personne morale
export const updatePM = (id, data, navigate) => async (dispatch) => {
    dispatch(updatePMStart());
    try {
        const response = await axios.post(`http://localhost:8081/factoring/api/pm/update-pm/${id}`, data, {
            withCredentials: true,
        });
        if (response.status !== 200) {
            throw new Error("Une erreur s'est produite");
        }
        dispatch(updateMPSuccess());
        navigate("/all-pm");
    } catch (e) {
        dispatch(updatePMFailure(e.response.data));
    }
};
export const deletePM=(id,navigate)=>async (dispatch)=>{
    dispatch(deletePMStart());
    try {
        const response = await axios.delete(`http://localhost:8081/factoring/api/pm/delete-pm/${id}`, {
            withCredentials: true,
        });
        if (response.status !== 200) {
            throw new Error("Une erreur s'est produite");
        }
        dispatch(deletePMSuccess());
        navigate("/all-pm");
    } catch (e) {
        dispatch(deletePMFailure(e.response.data));
    }
}

export const fetchAllAdherSansAccord = () => async (dispatch) => {
    dispatch(allPMStart());
    try {
        const response = await axios.get("http://localhost:8081/factoring/api/pm/all-by-adher-sans-accord", {
            withCredentials: true,
        });
        if (response.status !== 200) {
            throw new Error("Une erreur s'est produite");
        }
        dispatch(allPMSuccess(response.data));
    } catch (e) {
        dispatch(allPMFailure(e.response.data));
    }
}

export const fetchAllAchetSansAccord = () => async (dispatch) => {
    dispatch(allPMStart());
    try {
        const response = await axios.get("http://localhost:8081/factoring/api/pm/all-by-achet-sans-accord", {
            withCredentials: true,
        });
        if (response.status !== 200) {
            throw new Error("Une erreur s'est produite");
        }
        console.log(response.data);
        dispatch(allPMSuccess(response.data));
    } catch (e) {
        dispatch(allPMFailure(e.response.data));
    }
}