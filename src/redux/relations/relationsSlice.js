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
            state.relations.push(action.payload);
        },
        addRelationFailure: (state, action) => {
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
    addRelationFailure
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

export const addRelationAsync=(adherId,acheteurPPId,acheteurPMId)=>async (dispatch) => {
    dispatch(addRelationStart());
    const url = acheteurPMId ? `http://localhost:8081/factoring/api/relations/adherants/${adherId}/acheteurs?acheteurMoraleId=${acheteurPMId}` : `http://localhost:8081/factoring/api/relations/adherants/${adherId}/acheteurs?acheteurPhysiqueId=${acheteurPPId}`;
    try {
        const response = await axios.post(
            url,
            null,
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