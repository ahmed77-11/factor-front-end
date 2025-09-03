import {createSlice} from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
    inCheques: [],
    inChequeEnAttente: [],
    inChequeEncaisse: [],
    inChequePaye: [],
    inChequeRejete: [],
    currentInCheque: null, // store a single inCheque record
    errorInCheque: null,
    loadingInCheque: false,
}

const inChequeSlice = createSlice({
    name: "inCheque",
    initialState,
    reducers:{
        fetchInChequesStart: (state) => {
            state.loadingInCheque = true;
            state.errorInCheque = null;
        },
        fetchInChequesSuccess: (state, action) => {
            state.loadingInCheque = false;
            state.inCheques = action.payload;
        },
        fetchInChequesFailure: (state, action) => {
            state.loadingInCheque = false;
            state.errorInCheque = action.payload;
        },
        fetchInChequeEnAttenteStart: (state) => {
            state.loadingInCheque = true;
            state.errorInCheque = null;
        },
        fetchInChequeEnAttenteSuccess: (state, action) => {
            state.loadingInCheque = false;
            state.inChequeEnAttente = action.payload;
        },
        fetchInChequeEnAttenteFailure: (state, action) => {
            state.loadingInCheque = false;
            state.errorInCheque = action.payload;
        },
        fetchInChequeEncaisseStart: (state) => {
            state.loadingInCheque = true;
            state.errorInCheque = null;
        },
        fetchInChequeEncaisseSuccess: (state, action) => {
            state.loadingInCheque = false;
            state.inChequeEncaisse = action.payload;
        },
        fetchInChequeEncaisseFailure: (state, action) => {
            state.loadingInCheque = false;
            state.errorInCheque = action.payload;
        },
        fetchInChequePayeStart: (state) => {
            state.loadingInCheque = true;
            state.errorInCheque = null;
        },
        fetchInChequePayeSuccess: (state, action) => {
            state.loadingInCheque = false;
            state.inChequePaye = action.payload;
        },
        fetchInChequePayeFailure: (state, action) => {
            state.loadingInCheque = false;
            state.errorInCheque = action.payload;
        },
        fetchInChequeRejeteStart: (state) => {
            state.loadingInCheque = true;
            state.errorInCheque = null;
        },
        fetchInChequeRejeteSuccess: (state, action) => {
            state.loadingInCheque = false;
            state.inChequeRejete = action.payload;
        },
        fetchInChequeRejeteFailure: (state, action) => {
            state.loadingInCheque = false;
            state.errorInCheque = action.payload;
        },
        fetchInChequeByIdStart: (state) => {
            state.loadingInCheque = true;
            state.errorInCheque = null;
        },
        fetchInChequeByIdSuccess: (state, action) => {
            state.loadingInCheque = false;
            state.currentInCheque = action.payload;
        },
        fetchInChequeByIdFailure: (state, action) => {
            state.loadingInCheque = false;
            state.errorInCheque = action.payload;
        },
        createInChequeStart: (state) => {
            state.loadingInCheque = true;
            state.errorInCheque = null;
        },
        createInChequeSuccess: (state, action) => {
            state.loadingInCheque = false;
            state.inCheques.push(action.payload);
        },
        createInChequeFailure: (state, action) => {
            state.loadingInCheque = false;
            state.errorInCheque = action.payload;
        },
        updateInChequeStart: (state) => {
            state.loadingInCheque = true;
            state.errorInCheque = null;
        },
        updateInChequeSuccess: (state, action) => {
            state.loadingInCheque = false;
            const index = state.inCheques.findIndex(inCheque => inCheque.id === action.payload.id);
            if (index !== -1) {
                state.inCheques[index] = action.payload;
            }
        },
        updateInChequeFailure: (state, action) => {
            state.loadingInCheque = false;
            state.errorInCheque = action.payload;
        },
        deleteInChequeStart: (state) => {
            state.loadingInCheque = true;
        },
        deleteInChequeSuccess: (state, action) => {
            state.loading = false;
            const id = action.payload;
            // remove from all lists where it could appear
            state.inChequeEnAttente = state.inChequeEnAttente?.filter(c => c.id !== id) || [];
            state.inChequeEncaisse = state.inChequeEncaisse?.filter(c => c.id !== id) || [];
            state.inChequePaye = state.inChequePaye?.filter(c => c.id !== id) || [];
            state.inChequeRejete = state.inChequeRejete?.filter(c => c.id !== id) || [];
            // also optionally remove from a "allInCheques" list if you have one
        },
        deleteInChequeFailure: (state, action) => {
            state.loadingInCheque = false;
            state.errorInCheque = action.payload;
        },
    }
})
export const addInCheque = (data, navigate) => async (dispatch) => {
    dispatch(createInChequeStart());
    try {
        const response = await axios.post("http://localhost:8083/factoring/contrat/api/in-cheque/add-in-cheque", data, {
            withCredentials: true,
        });
        if(response.status !== 200) {
           throw new Error("Une Erreur s'est produite lors du la creation du inCheque");
        }
        dispatch(createInChequeSuccess(response.data));
        navigate("/in-cheque");

    } catch (error) {
        dispatch(createInChequeFailure(error.response.data));
    }
}


export const getAllInChequeEnAttente=(contratId) => async (dispatch) => {
    dispatch(fetchInChequeEnAttenteStart());
    try {
        const response = await axios.get(`http://localhost:8083/factoring/contrat/api/in-cheque/get-in-cheque-en-attente-by-contrat/${contratId}`, {
            withCredentials: true,
        });
        if(response.status !== 200) {
            throw new Error("Une erreur s'est produite lors du chargement des chèques en attente.");
        }
        dispatch(fetchInChequeEnAttenteSuccess(response.data));
    } catch (error) {
        dispatch(fetchInChequeEnAttenteFailure(error.response.data));
    }
}
export const getAllInChequeEncaisse=(contratId) => async (dispatch) => {
    dispatch(fetchInChequeEncaisseStart());
    try {
        const response = await axios.get(`http://localhost:8083/factoring/contrat/api/in-cheque/get-in-cheque-encaisse-by-contrat/${contratId}`, {
            withCredentials: true,
        });
        if(response.status !== 200) {
            throw new Error("Une erreur s'est produite lors du chargement des chèques encaissés.");
        }
        dispatch(fetchInChequeEncaisseSuccess(response.data));
    } catch (error) {
        dispatch(fetchInChequeEncaisseFailure(error.response.data));
    }
}

export const getAllInChequePaye=(contratId) => async (dispatch) => {
    dispatch(fetchInChequePayeStart());
    try {
        const response = await axios.get(`http://localhost:8083/factoring/contrat/api/in-cheque/get-in-cheque-paye-by-contrat/${contratId}`, {
            withCredentials: true,
        });
        if(response.status !== 200) {
            throw new Error("Une erreur s'est produite lors du chargement des chèques payés.");
        }
        dispatch(fetchInChequePayeSuccess(response.data));
    } catch (error) {
        dispatch(fetchInChequePayeFailure(error.response.data));
    }
}
export const getAllInChequeRejete=(contratId) => async (dispatch) => {
    dispatch(fetchInChequeRejeteStart());
    try {
        const response = await axios.get(`http://localhost:8083/factoring/contrat/api/in-cheque/get-in-cheque-rejetee-by-contrat/${contratId}`, {
            withCredentials: true,
        });
        if(response.status !== 200) {
            throw new Error("Une erreur s'est produite lors du chargement des chèques rejetés.");
        }
        dispatch(fetchInChequeRejeteSuccess(response.data));
    } catch (error) {
        dispatch(fetchInChequeRejeteFailure(error.response.data));
    }
}

export const fetchInChequeByIdAsync = (id) => async (dispatch) => {
    dispatch(fetchInChequeByIdStart());
    try {
        const response = await axios.get(`http://localhost:8083/factoring/contrat/api/in-cheque/get-in-cheque/${id}`, {
            withCredentials: true,
        });
        if(response.status !== 200) {
            throw new Error("Une erreur s'est produite lors du chargement du chèque.");
        }
        dispatch(fetchInChequeByIdSuccess(response.data));
    } catch (error) {
        dispatch(fetchInChequeByIdFailure(error.response.data));
    }
}


export const fetchInChequesByAchetEnAttente = (contratId,AcehtCode) => async (dispatch) => {
    dispatch(fetchInChequeEnAttenteStart());
    console.log(contratId,AcehtCode)
    try {
        const response = await axios.get(`http://localhost:8083/factoring/contrat/api/in-cheque/get-in-cheque-en-attente-by-tireur-factor-acheteur/${contratId}/${AcehtCode}`, {
            withCredentials: true,
        });
        if(response.status !== 200) {
            throw new Error("Une erreur s'est produite lors du chargement des chèques.");
        }
        dispatch(fetchInChequeEnAttenteSuccess(response.data));
    } catch (error) {
        dispatch(fetchInChequeEnAttenteFailure(error.response.data));
    }
}
export const fetchInChequesByAchetEncaisse = (contratId,AcehtCode) => async (dispatch) => {
    dispatch(fetchInChequeEncaisseStart());
    try {
        const response = await axios.get(`http://localhost:8083/factoring/contrat/api/in-cheque/get-in-cheque-encaisse-by-tireur-factor-acheteur/${contratId}/${AcehtCode}`, {
            withCredentials: true,
        });
        if(response.status !== 200) {
            throw new Error("Une erreur s'est produite lors du chargement des chèques.");
        }
        dispatch(fetchInChequeEncaisseSuccess(response.data));
    } catch (error) {
        dispatch(fetchInChequeEncaisseFailure(error.response.data));
    }
}
export const fetchInChequesByAchetPaye = (contratId,AcehtCode) => async (dispatch) => {
    dispatch(fetchInChequePayeStart());
    try {
        const response = await axios.get(`http://localhost:8083/factoring/contrat/api/in-cheque/get-in-cheque-paye-by-tireur-factor-acheteur/${contratId}/${AcehtCode}`, {
            withCredentials: true,
        });
        if(response.status !== 200) {
            throw new Error("Une erreur s'est produite lors du chargement des chèques.");
        }
        dispatch(fetchInChequePayeSuccess(response.data));
    } catch (error) {
        dispatch(fetchInChequePayeFailure(error.response.data));
    }
}
export const fetchInChequesByAchetRejete = (contratId,AcehtCode) => async (dispatch) => {
    dispatch(fetchInChequeRejeteStart());
    try {
        const response = await axios.get(`http://localhost:8083/factoring/contrat/api/in-cheque/get-in-cheque-rejetee-by-tireur-factor-acheteur/${contratId}/${AcehtCode}`, {
            withCredentials: true,
        });
        if(response.status !== 200) {
            throw new Error("Une erreur s'est produite lors du chargement des chèques.");
        }
        dispatch(fetchInChequeRejeteSuccess(response.data));
    } catch (error) {
        dispatch(fetchInChequeRejeteFailure(error.response.data));
    }
}
export const updateInChequeAsync = (id, data, navigate) => async (dispatch) => {
    dispatch(updateInChequeStart());
    try {
        const response = await axios.post(`http://localhost:8083/factoring/contrat/api/in-cheque/update-in-cheque/${id}`, data, {
            withCredentials: true,
        });
        if(response.status !== 200) {
            throw new Error("Une erreur s'est produite lors de la mise à jour du chèque.");
        }
        dispatch(updateInChequeSuccess(response.data));
        navigate("/in-cheque");
    } catch (error) {
        dispatch(updateInChequeFailure(error.response.data));
    }
}
export const deleteInChequeAsync = (id, navigate) => async (dispatch) => {
    dispatch(deleteInChequeStart());
    try {
        const response = await axios.delete(`http://localhost:8083/factoring/contrat/api/in-cheque/delete-in-cheque/${id}`, {
            withCredentials: true,
        });
        if(response.status !== 200) {
            throw new Error("Une erreur s'est produite lors de la suppression du chèque.");
        }
        dispatch(deleteInChequeSuccess(id));
        navigate("/in-cheque");
    } catch (error) {
        dispatch(deleteInChequeFailure(error.response.data));
    }
}

export const {
    fetchInChequesStart,
    fetchInChequesSuccess,
    fetchInChequesFailure,
    fetchInChequeEnAttenteStart,
    fetchInChequeEnAttenteSuccess,
    fetchInChequeEnAttenteFailure,
    fetchInChequeEncaisseStart,
    fetchInChequeEncaisseSuccess,
    fetchInChequeEncaisseFailure,
    fetchInChequePayeStart,
    fetchInChequePayeSuccess,
    fetchInChequePayeFailure,
    fetchInChequeRejeteStart,
    fetchInChequeRejeteSuccess,
    fetchInChequeRejeteFailure,
    fetchInChequeByIdStart,
    fetchInChequeByIdSuccess,
    fetchInChequeByIdFailure,
    createInChequeStart,
    createInChequeSuccess,
    createInChequeFailure,
    updateInChequeStart,
    updateInChequeSuccess,
    updateInChequeFailure,
    deleteInChequeStart,
    deleteInChequeSuccess,
    deleteInChequeFailure
} = inChequeSlice.actions;

export default inChequeSlice.reducer;