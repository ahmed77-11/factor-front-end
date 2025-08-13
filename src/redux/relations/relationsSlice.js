import {createSlice} from "@reduxjs/toolkit";
import axios from "axios";


const initialState = {
    adherents: [],
    currentAdherent: null,
    acheteurs: [],
    currentAcheteur: null,
    fournisseurs: [],
    currentFournisseur: null,
    relations: [],
    currentRelation: null,
    relationsFourns: [],
    currentRelationFourn: null,
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
        allFournisseurStart: (state) => {
            state.loading = true;
        },
        allFournisseurSuccess: (state, action) => {
            state.loading = false;
            state.fournisseurs = action.payload;
        },
        allFournisseurFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        fetchRelationsStart: (state) => {
            state.loading = true;
        },
        fetchRelationsSuccess: (state, action) => {
            state.loading = false;
            state.currentRelation = action.payload;
        },
        fetchRelationsFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        fetchRelationsFournStart: (state) => {
            state.loading = true;
        },
        fetchRelationsFournSuccess: (state, action) => {
            state.loading = false;
            state.currentRelationFourn = action.payload;
        },
        fetchRelationsFournFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        updateRelationStart: (state) => {
            state.loading = true;
        },
        updateRelationSuccess: (state, action) => {
            state.loading = false;
            // Update the specific relation in the state
            // const index = state.relations.findIndex(relation => relation.id === action.payload.id);
            // if (index !== -1) {
            //     state.relations[index] = action.payload;
            // }
        },
        updateRelationFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        updateRelationFournStart: (state) => {
            state.loading = true;
        },
        updateRelationFournSuccess: (state, action) => {
            state.loading = false;
            // Update the specific relation in the state
            // const index = state.relationsFourns.findIndex(relation => relation.id === action.payload.id);
            // if (index !== -1) {
            //     state.relationsFourns[index] = action.payload;
            // }
        },
        updateRelationFournFailure: (state, action) => {
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
        fetchPerFournByIdStart: (state) => {
            state.loading = true;
            state.currentFournisseur = null;
        },
        fetchPerFournByIdSuccess: (state, action) => {
            state.loading = false;
            state.currentFournisseur = action.payload;
        },
        fetchPerFournByIdFailure: (state, action) => {
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
        allRelationsFournStart: (state) => {
            state.loading = true;
        },
        allRelationsFournSuccess: (state, action) => {
            state.loading = false;
            state.relationsFourns = action.payload;
        },
        allRelationsFournFailure: (state, action) => {
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
        addRelationFournStart: (state) => {
            state.loading = true;
        },
        addRelationFournSuccess: (state, action) => {
            state.loading = false;
            // state.relationsFourns=state.relationsFourns.push(action.payload);
        },
        addRelationFournFailure: (state, action) => {
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
        allAdherentByFournisseur: (state) => {
            state.loading = true;
        },
        allAdherentByFournisseurSuccess: (state, action) => {
            state.loading = false;
            state.adherents = action.payload;
        },
        allAdherentByFournisseurFailure: (state, action) => {
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
    allAdherentByAcheteurFailure,
    fetchRelationsStart,
    fetchRelationsSuccess,
    fetchRelationsFailure,
    updateRelationStart,
    updateRelationSuccess,
    updateRelationFailure,
    fetchPerFournByIdStart,
    fetchPerFournByIdSuccess,
    fetchPerFournByIdFailure,
    allFournisseurStart,
    allFournisseurSuccess,
    allFournisseurFailure,
    fetchRelationsFournStart,
    fetchRelationsFournSuccess,
    fetchRelationsFournFailure,
    updateRelationFournStart,
    updateRelationFournSuccess,
    updateRelationFournFailure,
    addRelationFournStart,
    addRelationFournSuccess,
    addRelationFournFailure,
    allRelationsFournStart,
    allRelationsFournSuccess,
    allRelationsFournFailure,
    allAdherentByFournisseur,
    allAdherentByFournisseurSuccess,
    allAdherentByFournisseurFailure,
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
export const fetchFournisseursAsync = () => async (dispatch) => {
    dispatch(allFournisseurStart());
    try {
        const response = await axios.get(
            `http://localhost:8081/factoring/api/relations/fournisseurs`,
            { withCredentials: true }
        );
        if (response.status!==200) {
            throw new Error("Une erreur s'est produite");
        }

        dispatch(allFournisseurSuccess(response.data));
    } catch (error) {
        dispatch(allFournisseurFailure(error.message));
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
export const addRelationFournAsync=(data)=>async (dispatch) => {
    dispatch(addRelationFournStart());
    const {adherentId,fournisseurPhysiqueId,fournisseurMoraleId}=data;
    const url = fournisseurMoraleId ? `http://localhost:8081/factoring/api/relations/adherants/${adherentId}/fournisseurs?fournisseurMoraleId=${fournisseurMoraleId}` : `http://localhost:8081/factoring/api/relations/adherants/${adherentId}/fournisseurs?fournisseurPhysiqueId=${fournisseurPhysiqueId}`;
    try {
        const response = await axios.post(
            url,
            data,
            {withCredentials: true}
        );
        if (response.status !== 200) {
            throw new Error("Une erreur s'est produite");
        }

        dispatch(addRelationFournSuccess(response.data));
    } catch (error) {
        dispatch(addRelationFournFailure(error.message));
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

export const fetchAdherentsByFournisseur=(id)=>async (dispatch)=>{
    dispatch(allAdherentByFournisseur());
    try {
        const response = await axios.get(
            `http://localhost:8081/factoring/api/relations/adherents-fournisseur/${id}`,
            { withCredentials: true }
        );
        if (response.status!==200) {
            throw new Error("Une erreur s'est produite");
        }

        dispatch(allAdherentByFournisseurSuccess(response.data));
    } catch (error) {
        dispatch(allAdherentByFournisseurFailure(error.message));
    }
}
export const fetchRelationAsync = (id) => async (dispatch) => {
    dispatch(fetchRelationsStart());
    try {
        const response = await axios.get(
            `http://localhost:8081/factoring/api/relations/${id}`,
            { withCredentials: true }
        );
        if (response.status !== 200) {
            throw new Error("Une erreur s'est produite");
        }
        console.log(response)

        dispatch(fetchRelationsSuccess(response.data));
    } catch (error) {
        dispatch(fetchRelationsFailure(error.message));
    }
}

export const fetchRelationFournByIdAsync = (id) => async (dispatch) => {
    dispatch(fetchRelationsFournStart());
    try {
        const response = await axios.get(
            `http://localhost:8081/factoring/api/relations/fournisseurs/${id}`,
            { withCredentials: true }
        );
        if (response.status !== 200) {
            throw new Error("Une erreur s'est produite");
        }
        console.log(response)

        dispatch(fetchRelationsFournSuccess(response.data));
    } catch (error) {
        dispatch(fetchRelationsFournFailure(error.message));
    }
}
export const fetchRelationsFournAsync = (id) => async (dispatch) => {
    dispatch(allRelationsFournStart());
    try {
        const response = await axios.get(
            `http://localhost:8081/factoring/api/relations/fournisseurs-by-adher/${id}`,
            { withCredentials: true }
        );
        if (response.status !== 200) {
            throw new Error("Une erreur s'est produite");
        }

        console.log(response.data)
        dispatch(allRelationsFournSuccess(response.data));
    } catch (error) {
        dispatch(allRelationsFournFailure(error.message));
    }
}
export const updateRelationAsync = (data) => async (dispatch) => {
    dispatch(updateRelationStart());
    try {
        const response = await axios.post(
            `http://localhost:8081/factoring/api/relations/modifier-relations`,
            data,
            { withCredentials: true }
        );
        if (response.status !== 200) {
            throw new Error("Une erreur s'est produite");
        }

        dispatch(updateRelationSuccess(response.data));
    } catch (error) {
        dispatch(updateRelationFailure(error.message));
    }
}
export const updateRelationFournAsync = (data) => async (dispatch) => {
    dispatch(updateRelationFournStart());
    try {
        const response = await axios.post(
            `http://localhost:8081/factoring/api/relations/modifier-relations-fournisseurs`,
            data,
            { withCredentials: true }
        );
        if (response.status !== 200) {
            throw new Error("Une erreur s'est produite");
        }

        dispatch(updateRelationFournSuccess(response.data));
    } catch (error) {
        dispatch(updateRelationFournFailure(error.message));
    }
}