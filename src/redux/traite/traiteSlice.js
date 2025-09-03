import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
    traites: [],
    inTraiteEnAttente: [],
    inTraiteEncaisee: [],
    inTraitePaye: [],
    inTraiteRejetee: [],
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
        allTraiteEnAttenteStart: (state) => {
            state.loadingTraite = true;
        },
        allTraiteEnAttenteSuccess: (state, action) => {
            state.loadingTraite = false;
            state.inTraiteEnAttente = action.payload;
        },
        allTraiteEnAttenteFailure: (state, action) => {
            state.loadingTraite = false;
            state.errorTraite = action.payload;
        },
        allTraiteEncaiseeStart: (state) => {
            state.loadingTraite = true;
        },
        allTraiteEncaiseeSuccess: (state, action) => {
            state.loadingTraite = false;
            state.inTraiteEncaisee = action.payload;
        },
        allTraiteEncaiseeFailure: (state, action) => {
            state.loadingTraite = false;
            state.errorTraite = action.payload;
        },
        allTraitePayeStart: (state) => {
            state.loadingTraite = true;
        },
        allTraitePayeSuccess: (state, action) => {
            state.loadingTraite = false;
            state.inTraitePaye = action.payload;
        },
        allTraitePayeFailure: (state, action) => {
            state.loadingTraite = false;
            state.errorTraite = action.payload;
        },
        allTraiteRejeteeStart: (state) => {
            state.loadingTraite = true;
        },
        allTraiteRejeteeSuccess: (state, action) => {
            state.loadingTraite = false;
            state.inTraiteRejetee = action.payload;
        },
        allTraiteRejeteeFailure: (state, action) => {
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
            state.inTraiteEnAttente = state.inTraiteEnAttente.filter((traite) => traite.id !== action.payload);
            state.inTraiteEncaisee = state.inTraiteEncaisee.filter((traite) => traite.id !== action.payload);
            state.inTraitePaye = state.inTraitePaye.filter((traite) => traite.id !== action.payload);
            state.inTraiteRejetee = state.inTraiteRejetee.filter((traite) => traite.id !== action.payload);
            state.traites = state.traites.filter((traite) => traite.id !== action.payload);
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
    allTraiteEnAttenteStart,
    allTraiteEnAttenteSuccess,
    allTraiteEnAttenteFailure,
    allTraiteEncaiseeStart,
    allTraiteEncaiseeSuccess,
    allTraiteEncaiseeFailure,
    allTraitePayeStart,
    allTraitePayeSuccess,
    allTraitePayeFailure,
    allTraiteRejeteeStart,
    allTraiteRejeteeSuccess,
    allTraiteRejeteeFailure,
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
export const getAllTraitesEnAttente = (contratId) => async (dispatch) => {
    dispatch(allTraiteEnAttenteStart());
    try {
        const response = await axios.get(`http://localhost:8083/factoring/contrat/api/traite/all-en-attente-traite-by-contrat/${contratId}`, {
            withCredentials: true,
        });
        if (response.status !== 200) {
            throw new Error("Une erreur s'est produite");
        }
        dispatch(allTraiteEnAttenteSuccess(response.data));
    } catch (e) {
        dispatch(allTraiteEnAttenteFailure(e.message));
    }
}
export const getAllTraitesEncaisee = (contratId) => async (dispatch) => {
    dispatch(allTraiteEncaiseeStart());
    try {
        const response = await axios.get(`http://localhost:8083/factoring/contrat/api/traite/all-encaisee-traite-by-contrat/${contratId}`, {
            withCredentials: true,
        });
        if (response.status !== 200) {
            throw new Error("Une erreur s'est produite");
        }
        dispatch(allTraiteEncaiseeSuccess(response.data));
    } catch (e) {
        dispatch(allTraiteEncaiseeFailure(e.message));
    }
}
export const getAllTraitesPaye = (contratId) => async (dispatch) => {
    dispatch(allTraitePayeStart());
    try {
        const response = await axios.get(`http://localhost:8083/factoring/contrat/api/traite/all-paye-traite-by-contrat/${contratId}`, {
            withCredentials: true,
        });
        if (response.status !== 200) {
            throw new Error("Une erreur s'est produite");
        }
        dispatch(allTraitePayeSuccess(response.data));
    } catch (e) {
        dispatch(allTraitePayeFailure(e.message));
    }
}
export const getAllTraitesRejetee = (contratId) => async (dispatch) => {
    dispatch(allTraiteRejeteeStart());
    try {
        const response = await axios.get(`http://localhost:8083/factoring/contrat/api/traite/all-rejetee-traite-by-contrat/${contratId}`, {
            withCredentials: true,
        });
        if (response.status !== 200) {
            throw new Error("Une erreur s'est produite");
        }
        dispatch(allTraiteRejeteeSuccess(response.data));
    } catch (e) {
        dispatch(allTraiteRejeteeFailure(e.message));
    }   
}

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
export const getAllTraitesByContratAndAchetCode=(id,code)=>async (dispatch)=>{
    dispatch(allTraiteStart())
    try {
        const response = await axios.get(`http://localhost:8083/factoring/contrat/api/traite/all-traite-by-contrat-and-achet/${id}/${code}`, {
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
export const getAllTraitesEnAttenteByContratAndAchetCode=(id,code)=>async (dispatch)=>{
    dispatch(allTraiteEnAttenteStart())
    try {
        const response = await axios.get(`http://localhost:8083/factoring/contrat/api/traite/all-traites-en-attente-by-contrat-and-achet/${id}/${code}`, {
            withCredentials: true,
        });
        if (response.status !== 200) {
            throw new Error("Une erreur s'est produite");
        }
        dispatch(allTraiteEnAttenteSuccess(response.data));
    }catch (e) {
        dispatch(allTraiteEnAttenteFailure(e.message));
    }
}
export const getAllTraitesEncaiseeByContratAndAchetCode=(id,code)=>async (dispatch)=>{
    dispatch(allTraiteEncaiseeStart())
    try {
        const response = await axios.get(`http://localhost:8083/factoring/contrat/api/traite/all-traites-encaisee-by-contrat-and-achet/${id}/${code}`, {
            withCredentials: true,
        });
        if (response.status !== 200) {
            throw new Error("Une erreur s'est produite");
        }
        dispatch(allTraiteEncaiseeSuccess(response.data));
    }catch (e) {
        dispatch(allTraiteEncaiseeFailure(e.message));
    }
}
export const getAllTraitesPayeByContratAndAchetCode=(id,code)=>async (dispatch)=>{
    dispatch(allTraitePayeStart())
    try {
        const response = await axios.get(`http://localhost:8083/factoring/contrat/api/traite/all-traites-paye-by-contrat-and-achet/${id}/${code}`, {
            withCredentials: true,
        });
        if (response.status !== 200) {
            throw new Error("Une erreur s'est produite");
        }
        dispatch(allTraitePayeSuccess(response.data));
    }catch (e) {
        dispatch(allTraitePayeFailure(e.message));
    }
}
export const getAllTraitesRejeteeByContratAndAchetCode=(id,code)=>async (dispatch)=>{
    dispatch(allTraiteRejeteeStart())
    try {
        const response = await axios.get(`http://localhost:8083/factoring/contrat/api/traite/all-traites-rejetee-by-contrat-and-achet/${id}/${code}`, {
            withCredentials: true,
        });
        if (response.status !== 200) {
            throw new Error("Une erreur s'est produite");
        }
        dispatch(allTraiteRejeteeSuccess(response.data));
    }catch (e) {
        dispatch(allTraiteRejeteeFailure(e.message));
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
        navigate("/all-traites");
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
