import {createSlice} from "@reduxjs/toolkit";
import axios from "axios";


const initialState = {
    adherents: [],
    currentAdherent: null,
    acheteurs: [],
    currentAcheteur: null,
    relations: [],
    currentRelation: null,
    error: null,
    loading: false,
}

const relationsSlice = createSlice({
    name: "relations",
    initialState,
    reducers: {
        allAdherentStart: (state) => {
            state.loading = true;
        },
        allAdherentSuccess: (state, action) => {
            state.loading = false;
            state.adherents = action.payload;
        },
        allAdherentFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        allAcheteurStart: (state) => {
            state.loading = true;
        },
        allAcheteurSuccess: (state, action) => {
            state.loading = false;
            state.acheteurs = action.payload;
        },
        allAcheteurFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        fetchPerAcheteurByIdStart: (state) => {
            state.loading = true;
            state.currentAcheteur = null;
        },
        fetchPerAcheteurByIdSuccess: (state, action) => {
            state.loading = false;
            state.currentAcheteur = action.payload;
        },
        fetchPerAcheteurByIdFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        allRelationsStart: (state) => {
            state.loading = true;
        },
        allRelationsSuccess: (state, action) => {
            state.loading = false;
            state.relations = action.payload;
        },
        allRelationsFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        addRelationStart: (state) => {
            state.loading = true;
        },
        addRelationSuccess: (state, action) => {
            state.loading = false;
            // state.relations=state.relations.push(action.payload);
        },
        addRelationFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        allAdherentByAcheteurStart: (state) => {
            state.loading = true;
        },
        allAdherentByAcheteurSuccess: (state, action) => {
            state.loading = false;
            state.adherents = action.payload;
        },
        allAdherentByAcheteurFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

    }
});


export const {
    allAcheteurStart,
    allAcheteurSuccess,
    allAcheteurFailure,
    allAdherentStart,
    allAdherentSuccess,
    allAdherentFailure,
    allRelationsStart,
    allRelationsSuccess,
    allRelationsFailure,
    addRelationStart,
    addRelationSuccess,
    addRelationFailure,
    fetchPerAcheteurByIdStart,
    fetchPerAcheteurByIdSuccess,
    fetchPerAcheteurByIdFailure,
    allAdherentByAcheteurStart,
    allAdherentByAcheteurSuccess,
    allAdherentByAcheteurFailure
} = relationsSlice.actions;


export default relationsSlice.reducer;


export const fetchAdherentsAsync = () => async (dispatch) => {
    dispatch(allAdherentStart());
    try {
       const response = await axios.get(
            `http://localhost:8081/factoring/api/relations/adherants`,
            { withCredentials: true }
        );
        if (response.status!==200) {
            throw new Error("Une erreur s'est produite");
        }

        dispatch(allAdherentSuccess(response.data));
    } catch (error) {
        dispatch(allAdherentFailure(error.message));
    }
}

export const fetchAcheteursAsync = () => async (dispatch) => {
    dispatch(allAcheteurStart());
    try {
        const response = await axios.get(
            `http://localhost:8081/factoring/api/relations/acheteurs`,
            { withCredentials: true }
        );
        if (response.status!==200) {
            throw new Error("Une erreur s'est produite");
        }

        dispatch(allAcheteurSuccess(response.data));
    } catch (error) {
        dispatch(allAcheteurFailure(error.message));
    }
}

export const addRelationAsync=(data)=>async (dispatch) => {
    dispatch(addRelationStart());
    const {adherentId,acheteurPhysiqueId,acheteurMoraleId}=data;
    const url = acheteurMoraleId ? `http://localhost:8081/factoring/api/relations/adherants/${adherentId}/acheteurs?acheteurMoraleId=${acheteurMoraleId}` : `http://localhost:8081/factoring/api/relations/adherants/${adherentId}/acheteurs?acheteurPhysiqueId=${acheteurPhysiqueId}`;
    try {
        const response = await axios.post(
            url,
            data,
            {withCredentials: true}
        );
        if (response.status !== 200) {
            throw new Error("Une erreur s'est produite");
        }

        dispatch(addRelationSuccess(response.data));
    } catch (error) {
        dispatch(addRelationFailure(error.message));
    }
}

export const fetchRelationsAsync=(adherId)=>async (dispatch) => {
    dispatch(allRelationsStart());
    try {
        const response = await axios.get(
            `http://localhost:8081/factoring/api/relations/acheteurs/${adherId}`,
            { withCredentials: true }
        );
        if (response.status!==200) {
            throw new Error("Une erreur s'est produite");
        }

        dispatch(allRelationsSuccess(response.data));
    } catch (error) {
        dispatch(allRelationsFailure(error.message));
    }
}
export const fetchPerAcheteurByIdAsync=(id)=>async (dispatch) => {
    dispatch(fetchPerAcheteurByIdStart());
    try {
        const response = await axios.get(
            `http://localhost:8081/factoring/api/per-acheteur/acheteur/${id}`,
            { withCredentials: true }
        );
        if (response.status!==200) {
            throw new Error("Une erreur s'est produite");
        }

        dispatch(fetchPerAcheteurByIdSuccess(response.data));
    } catch (error) {
        dispatch(fetchPerAcheteurByIdFailure(error.message));
    }
}


export const fetchAdherentsByAcheteur=(id)=>async (dispatch)=>{
    dispatch(allAdherentByAcheteurStart());
    try {
        const response = await axios.get(
            `http://localhost:8081/factoring/api/relations/adherents/${id}`,
            { withCredentials: true }
        );
        if (response.status!==200) {
            throw new Error("Une erreur s'est produite");
        }

        dispatch(allAdherentByAcheteurSuccess(response.data));
    } catch (error) {
        dispatch(allAdherentByAcheteurFailure(error.message));
    }
}