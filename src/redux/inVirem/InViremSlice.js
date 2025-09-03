import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
    inVirems: [],
    inViremEnAttente: [],
    inViremEncaisse: [],
    inViremPaye: [],
    inViremRejete: [],
    currentInVirem: null, // single virement record
    errorInVirem: null,
    loadingInVirem: false,
};

const inViremSlice = createSlice({
    name: "inVirem",
    initialState,
    reducers: {
        fetchInViremsStart: (state) => {
            state.loadingInVirem = true;
            state.errorInVirem = null;
        },
        fetchInViremsSuccess: (state, action) => {
            state.loadingInVirem = false;
            state.inVirems = action.payload;
        },
        fetchInViremsFailure: (state, action) => {
            state.loadingInVirem = false;
            state.errorInVirem = action.payload;
        },

        fetchInViremEnAttenteStart: (state) => {
            state.loadingInVirem = true;
            state.errorInVirem = null;
        },
        fetchInViremEnAttenteSuccess: (state, action) => {
            state.loadingInVirem = false;
            state.inViremEnAttente = action.payload;
        },
        fetchInViremEnAttenteFailure: (state, action) => {
            state.loadingInVirem = false;
            state.errorInVirem = action.payload;
        },

        fetchInViremEncaisseStart: (state) => {
            state.loadingInVirem = true;
            state.errorInVirem = null;
        },
        fetchInViremEncaisseSuccess: (state, action) => {
            state.loadingInVirem = false;
            state.inViremEncaisse = action.payload;
        },
        fetchInViremEncaisseFailure: (state, action) => {
            state.loadingInVirem = false;
            state.errorInVirem = action.payload;
        },

        fetchInViremPayeStart: (state) => {
            state.loadingInVirem = true;
            state.errorInVirem = null;
        },
        fetchInViremPayeSuccess: (state, action) => {
            state.loadingInVirem = false;
            state.inViremPaye = action.payload;
        },
        fetchInViremPayeFailure: (state, action) => {
            state.loadingInVirem = false;
            state.errorInVirem = action.payload;
        },

        fetchInViremRejeteStart: (state) => {
            state.loadingInVirem = true;
            state.errorInVirem = null;
        },
        fetchInViremRejeteSuccess: (state, action) => {
            state.loadingInVirem = false;
            state.inViremRejete = action.payload;
        },
        fetchInViremRejeteFailure: (state, action) => {
            state.loadingInVirem = false;
            state.errorInVirem = action.payload;
        },

        fetchInViremByIdStart: (state) => {
            state.loadingInVirem = true;
            state.errorInVirem = null;
        },
        fetchInViremByIdSuccess: (state, action) => {
            state.loadingInVirem = false;
            state.currentInVirem = action.payload;
        },
        fetchInViremByIdFailure: (state, action) => {
            state.loadingInVirem = false;
            state.errorInVirem = action.payload;
        },

        createInViremStart: (state) => {
            state.loadingInVirem = true;
            state.errorInVirem = null;
        },
        createInViremSuccess: (state, action) => {
            state.loadingInVirem = false;
            state.inVirems.push(action.payload);
        },
        createInViremFailure: (state, action) => {
            state.loadingInVirem = false;
            state.errorInVirem = action.payload;
        },

        updateInViremStart: (state) => {
            state.loadingInVirem = true;
            state.errorInVirem = null;
        },
        updateInViremSuccess: (state, action) => {
            state.loadingInVirem = false;
            const index = state.inVirems.findIndex(v => v.id === action.payload.id);
            if (index !== -1) {
                state.inVirems[index] = action.payload;
            }
        },
        updateInViremFailure: (state, action) => {
            state.loadingInVirem = false;
            state.errorInVirem = action.payload;
        },

        deleteInViremStart: (state) => {
            state.loadingInVirem = true;
        },
        deleteInViremSuccess: (state, action) => {
            state.loadingInVirem = false;
            const id = action.payload;
            state.inVirems = state.inVirems.filter(v => v.id !== id);
            state.inViremEnAttente = state.inViremEnAttente.filter(v => v.id !== id);
            state.inViremEncaisse = state.inViremEncaisse.filter(v => v.id !== id);
            state.inViremPaye = state.inViremPaye.filter(v => v.id !== id);
            state.inViremRejete = state.inViremRejete.filter(v => v.id !== id);
        },
        deleteInViremFailure: (state, action) => {
            state.loadingInVirem = false;
            state.errorInVirem = action.payload;
        },
    }
});

// ---------- THUNKS ----------

const BASE_URL = "http://localhost:8083/factoring/contrat/api/in-virem";

export const addInVirem = (data, navigate) => async (dispatch) => {
    dispatch(createInViremStart());
    try {
        const res = await axios.post(`${BASE_URL}/add-in-virem`, data, { withCredentials: true });
        if (res.status !== 200) throw new Error("Erreur lors de la création du virement");
        dispatch(createInViremSuccess(res.data));
        navigate("/in-virems");
    } catch (err) {
        dispatch(createInViremFailure(err.response?.data || err.message));
    }
};

export const updateInViremAsync = (id, data, navigate) => async (dispatch) => {
    dispatch(updateInViremStart());
    try {
        const res = await axios.post(`${BASE_URL}/update-in-virem/${id}`, data, { withCredentials: true });
        if (res.status !== 200) throw new Error("Erreur lors de la mise à jour du virement");
        dispatch(updateInViremSuccess(res.data));
        navigate("/in-virems");
    } catch (err) {
        dispatch(updateInViremFailure(err.response?.data || err.message));
    }
};

export const deleteInViremAsync = (id, navigate) => async (dispatch) => {
    dispatch(deleteInViremStart());
    try {
        const res = await axios.delete(`${BASE_URL}/delete-in-virem/${id}`, { withCredentials: true });
        if (res.status !== 200) throw new Error("Erreur lors de la suppression du virement");
        dispatch(deleteInViremSuccess(id));
        navigate("/in-virem");
    } catch (err) {
        dispatch(deleteInViremFailure(err.response?.data || err.message));
    }
};

export const fetchInViremByIdAsync = (id) => async (dispatch) => {
    dispatch(fetchInViremByIdStart());
    try {
        const res = await axios.get(`${BASE_URL}/get-in-virem/${id}`, { withCredentials: true });
        if (res.status !== 200) throw new Error("Erreur lors du chargement du virement");
        dispatch(fetchInViremByIdSuccess(res.data));
    } catch (err) {
        dispatch(fetchInViremByIdFailure(err.response?.data || err.message));
    }
};

export const getAllInViremsByContrat = (contratId) => async (dispatch) => {
    dispatch(fetchInViremsStart());
    try {
        const res = await axios.get(`${BASE_URL}/get-in-virem-by-contrat/${contratId}`, { withCredentials: true });
        if (res.status !== 200) throw new Error("Erreur lors du chargement des virements");
        dispatch(fetchInViremsSuccess(res.data));
    } catch (err) {
        dispatch(fetchInViremsFailure(err.response?.data || err.message));
    }
};

// ---- STATUS-BASED FETCH ----

export const getAllInViremEnAttente = (contratId) => async (dispatch) => {
    dispatch(fetchInViremEnAttenteStart());
    try {
        const res = await axios.get(`${BASE_URL}/get-in-virem-en-attente-by-contrat/${contratId}`, { withCredentials: true });
        if (res.status !== 200) throw new Error("Erreur lors du chargement des virements en attente");
        dispatch(fetchInViremEnAttenteSuccess(res.data));
    } catch (err) {
        dispatch(fetchInViremEnAttenteFailure(err.response?.data || err.message));
    }
};

export const getAllInViremEncaisse = (contratId) => async (dispatch) => {
    dispatch(fetchInViremEncaisseStart());
    try {
        const res = await axios.get(`${BASE_URL}/get-in-virem-encaisse-by-contrat/${contratId}`, { withCredentials: true });
        if (res.status !== 200) throw new Error("Erreur lors du chargement des virements encaissés");
        dispatch(fetchInViremEncaisseSuccess(res.data));
    } catch (err) {
        dispatch(fetchInViremEncaisseFailure(err.response?.data || err.message));
    }
};

export const getAllInViremPaye = (contratId) => async (dispatch) => {
    dispatch(fetchInViremPayeStart());
    try {
        const res = await axios.get(`${BASE_URL}/get-in-virem-paye-by-contrat/${contratId}`, { withCredentials: true });
        if (res.status !== 200) throw new Error("Erreur lors du chargement des virements payés");
        dispatch(fetchInViremPayeSuccess(res.data));
    } catch (err) {
        dispatch(fetchInViremPayeFailure(err.response?.data || err.message));
    }
};

export const getAllInViremRejete = (contratId) => async (dispatch) => {
    dispatch(fetchInViremRejeteStart());
    try {
        const res = await axios.get(`${BASE_URL}/get-in-virem-rejetee-by-contrat/${contratId}`, { withCredentials: true });
        if (res.status !== 200) throw new Error("Erreur lors du chargement des virements rejetés");
        dispatch(fetchInViremRejeteSuccess(res.data));
    } catch (err) {
        dispatch(fetchInViremRejeteFailure(err.response?.data || err.message));
    }
};

// ---- DO-FACTOR + ACHETEUR FILTERS ----

export const fetchInViremByAchetEnAttente = (contratId, achetCode) => async (dispatch) => {
    dispatch(fetchInViremEnAttenteStart());
    try {
        const res = await axios.get(`${BASE_URL}/get-in-virem-en-attente-do-factor-achet-code/${contratId}/${achetCode}`, { withCredentials: true });
        if (res.status !== 200) throw new Error("Erreur lors du chargement");
        dispatch(fetchInViremEnAttenteSuccess(res.data));
    } catch (err) {
        dispatch(fetchInViremEnAttenteFailure(err.response?.data || err.message));
    }
};

export const fetchInViremByAchetEncaisse = (contratId, achetCode) => async (dispatch) => {
    dispatch(fetchInViremEncaisseStart());
    try {
        const res = await axios.get(`${BASE_URL}/get-in-virem-encaisse-do-factor-achet-code/${contratId}/${achetCode}`, { withCredentials: true });
        if (res.status !== 200) throw new Error("Erreur lors du chargement");
        dispatch(fetchInViremEncaisseSuccess(res.data));
    } catch (err) {
        dispatch(fetchInViremEncaisseFailure(err.response?.data || err.message));
    }
};

export const fetchInViremByAchetPaye = (contratId, achetCode) => async (dispatch) => {
    dispatch(fetchInViremPayeStart());
    try {
        const res = await axios.get(`${BASE_URL}/get-in-virem-paye-do-factor-achet-code/${contratId}/${achetCode}`, { withCredentials: true });
        if (res.status !== 200) throw new Error("Erreur lors du chargement");
        dispatch(fetchInViremPayeSuccess(res.data));
    } catch (err) {
        dispatch(fetchInViremPayeFailure(err.response?.data || err.message));
    }
};

export const fetchInViremByAchetRejete = (contratId, achetCode) => async (dispatch) => {
    dispatch(fetchInViremRejeteStart());
    try {
        const res = await axios.get(`${BASE_URL}/get-in-virem-rejetee-do-factor-achet-code/${contratId}/${achetCode}`, { withCredentials: true });
        if (res.status !== 200) throw new Error("Erreur lors du chargement");
        dispatch(fetchInViremRejeteSuccess(res.data));
    } catch (err) {
        dispatch(fetchInViremRejeteFailure(err.response?.data || err.message));
    }
};

export const {
    fetchInViremsStart,
    fetchInViremsSuccess,
    fetchInViremsFailure,
    fetchInViremEnAttenteStart,
    fetchInViremEnAttenteSuccess,
    fetchInViremEnAttenteFailure,
    fetchInViremEncaisseStart,
    fetchInViremEncaisseSuccess,
    fetchInViremEncaisseFailure,
    fetchInViremPayeStart,
    fetchInViremPayeSuccess,
    fetchInViremPayeFailure,
    fetchInViremRejeteStart,
    fetchInViremRejeteSuccess,
    fetchInViremRejeteFailure,
    fetchInViremByIdStart,
    fetchInViremByIdSuccess,
    fetchInViremByIdFailure,
    createInViremStart,
    createInViremSuccess,
    createInViremFailure,
    updateInViremStart,
    updateInViremSuccess,
    updateInViremFailure,
    deleteInViremStart,
    deleteInViremSuccess,
    deleteInViremFailure
} = inViremSlice.actions;

export default inViremSlice.reducer;
