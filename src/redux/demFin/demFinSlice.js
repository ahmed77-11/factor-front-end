import {createSlice} from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
    demFin: [],
    demFinEnCours:[],
    demFinRejeter:[],
    currentDemfin: null,
    errorDemFin: null,
    loadingDemFin: false,
};

const demFinSlice = createSlice({
    name: "demFin",
    initialState,
    reducers: {
        // GET ALL
        allDemFinStart: (state) => {
            state.loadingDemFin = true;
        },
        allDemFinSuccess: (state, action) => {
            state.loadingDemFin = false;
            state.demFin = action.payload;
        },
        allDemFinFailure: (state, action) => {
            state.loadingDemFin = false;
            state.errorDemFin = action.payload;
        },
        allEnAttenteStart: (state) => {
            state.loadingDemFin = true;
        },
        allEnAttenteSuccess: (state, action) => {
            state.loadingDemFin = false;
            state.demFin = action.payload;
        },
        allEnAttenteFailure: (state, action) => {
            state.loadingDemFin = false;
            state.errorDemFin = action.payload;
        },
        // GET ALL DEM FIN EN COURS
        allDemFinEnCoursStart: (state) => {
            state.loadingDemFin = true;
        },
        allDemFinEnCoursSuccess: (state, action) => {
            state.loadingDemFin = false;
            state.demFinEnCours = action.payload;
        },
        allDemFinEnCoursFailure:(state,action)=>{
            state.loadingDemFin = false;
            state.errorDemFin = action.payload;
        },
        allDemFinRejeterStart: (state) => {
            state.loadingDemFin=true;
        },
        allDemFinRejeterSuccess:(state,action)=>{
            state.loadingDemFin=false;
            state.demFinRejeter=action.payload;
        },
        allDemFinRejeterFailure:(state,action)=>{
            state.loadingDemFin=false;
            state.errorDemFin=action.payload;
        },
        // ADD
        addDemFinStart: (state) => {
            state.loadingDemFin = true;
        },
        addDemFinSuccess: (state) => {
            state.loadingDemFin = false;
        },
        addDemFinFailure: (state, action) => {
            state.loadingDemFin = false;
            state.errorDemFin = action.payload;
        },

        acceptDemFinStart: (state) => {
            state.loadingDemFin = true;
        },
        acceptDemFinSuccess: (state,action) => {
            state.loadingDemFin = false;
            state.demFinEnCours= state.demFinEnCours.filter(d => d.id !== action.payload);
            state.demFin= [...state.demFin, action.payload];
        },
        acceptDemFinFailure: (state, action) => {
            state.loadingDemFin = false;
            state.errorDemFin = action.payload;
        },
        rejectDemFinStart:(state)=>{
            state.loadingDemFin=true;
        },
        rejectDemFinSucces:(state)=>{
            state.loadingDemFin=false;
            state.demFinEnCours= state.demFinEnCours.filter(d => d.id !== action.payload);
        },
        rejectDemFinFailure:(state,action)=>{
            state.loadingDemFin = false;
            state.errorDemFin = action.payload;
        },
        // GET BY ID
        findDemFinByIdStart: (state) => {
            state.loadingDemFin = true;
        },
        findDemFinByIdSuccess: (state, action) => {
            state.loadingDemFin = false;
            state.currentDemfin = action.payload;
        },
        findDemFinByIdFailure: (state, action) => {
            state.loadingDemFin = false;
            state.errorDemFin = action.payload;
        },

        // UPDATE
        updateDemFinStart: (state) => {
            state.loadingDemFin = true;
        },
        updateDemFinSuccess: (state) => {
            state.loadingDemFin = false;
        },
        updateDemFinFailure: (state, action) => {
            state.loadingDemFin = false;
            state.errorDemFin = action.payload;
        },

        // DELETE
        deleteDemFinStart: (state) => {
            state.loadingDemFin = true;
        },
        deleteDemFinSuccess: (state, action) => {
            state.loadingDemFin = false;
            state.demFin = state.demFin.filter(d => d.id !== action.payload);
        },
        deleteDemFinFailure: (state, action) => {
            state.loadingDemFin = false;
            state.errorDemFin = action.payload;
        },
    },
});

export const getAllDemFinAsync = () => async (dispatch) => {
    dispatch(allDemFinStart());
    try {
        const res = await axios.get("http://localhost:8083/factoring/contrat/api/demfin/all-demfins", {
            withCredentials: true,
        });
        if (res.status !== 200) {
            throw new Error("Une erreur s'est produite");
        }
        dispatch(allDemFinSuccess(res.data));
    } catch (e) {
        dispatch(allDemFinFailure(e.message));
    }
}

export const getAllDemFinEnAttenteAsync = () => async (dispatch) => {
    dispatch(allEnAttenteStart());
    try {
        const res = await axios.get("http://localhost:8083/factoring/contrat/api/demfin/all-demfins-encours", {
            withCredentials: true,
        });
        if (res.status !== 200) {
            throw new Error("Une erreur s'est produite");
        }
        dispatch(allEnAttenteSuccess(res.data));
    } catch (e) {
        dispatch(allEnAttenteFailure(e.message));
    }
}
export const getAllDemFinAccepterByContratAsync = (id) => async (dispatch) => {
    dispatch(allEnAttenteStart());
    try {
        const res = await axios.get(`http://localhost:8083/factoring/contrat/api/demfin/all-demfins-by-contrat/${id}`, {
            withCredentials: true,
        });
        if (res.status !== 200) {
            throw new Error("Une erreur s'est produite");
        }
        dispatch(allEnAttenteSuccess(res.data));
    } catch (e) {
        dispatch(allEnAttenteFailure(e.message));
    }
}


export const getAllDemFinEnAttenteByContratAsync=(id)=>async (dispatch)=>{
    dispatch(allDemFinEnCoursStart());
    try{
            const res=await axios.get(`http://localhost:8083/factoring/contrat/api/demfin/all-demfins-encours-by-contrat/${id}`,{
            withCredentials:true,
        })
        if (res.status !== 200) {
            throw new Error("Une erreur s'est produite");
        }
        dispatch(allDemFinEnCoursSuccess(res.data));


    }catch (e) {
        dispatch(allDemFinEnCoursFailure(e.message));
    }
}

export const getAllDemFinRejeterByContratAsync=(id)=>async (dispatch)=>{
    dispatch(allDemFinRejeterStart());
    try{
        const res=await axios.get(`http://localhost:8083/factoring/contrat/api/demfin/all-demfins-rejeter-by-contrat/${id}`,{
            withCredentials:true,
        })
        if (res.status !== 200) {
            throw new Error("Une erreur s'est produite");
        }
        dispatch(allDemFinRejeterSuccess(res.data));


    }catch (e) {
        dispatch(allDemFinRejeterFailure(e.message));
    }
}
export const addDemfinAsync = (data, navigate) => async (dispatch) => {
    dispatch(addDemFinStart());
    try {
        const res = await axios.post("http://localhost:8083/factoring/contrat/api/demfin/add-demfin", data, {
            withCredentials: true
        })
        if (res.status !== 200) {
            throw new Error("Une erreur s'est produite");
        }
        dispatch(addDemFinSuccess());
        navigate("/all-demFin");

    } catch (e) {
        addDemFinFailure(e.message)
    }
}
export const updateDemFinAsync = (id, data, navigate) => async (dispatch) => {
    dispatch(updateDemFinStart());
    try {
        const payload = {
            ...data, id
        }
        const res = await axios.post(`http://localhost:8083/factoring/contrat/api/demfin/update-demfin`, payload, {
            withCredentials: true
        })
        if (res.status !== 200) {
            throw new Error("Une erreur s'est produite");
        }
        dispatch(updateDemFinSuccess());
        navigate("/all-demFin");

    } catch (e) {
        updateDemFinFailure(e.message)
    }
}
export const demFinByIdAsync = (id) => async (dispatch) => {
    dispatch(findDemFinByIdStart())
    try {
        const res = await axios.get(`http://localhost:8083/factoring/contrat/api/demfin/get-demfin/${id}`, {
            withCredentials: true
        })
        if (res.status !== 200) {
            throw new Error("Une erreur s'est produite");
        }
        dispatch(findDemFinByIdSuccess(res.data));
    } catch (e) {
        findDemFinByIdFailure(e.message);
    }

}

export const deleteFinByIdAsync = (id) => async (dispatch) => {
    dispatch(deleteDemFinStart())
    try {
        const res = await axios.delete(`http://localhost:8083/factoring/contrat/api/demfin/delete-demfin/${id}`, {
            withCredentials: true
        })
        if (res.status !== 200) {
            throw new Error("Une erreur s'est produite");
        }
        dispatch(deleteDemFinSuccess(id));
    } catch (e) {
        deleteDemFinFailure(e.message);
    }
}
export const acceptDemFinAsync = (id,values) => async (dispatch) => {
    dispatch(acceptDemFinStart())
    try {
        const res = await axios.post(`http://localhost:8083/factoring/contrat/api/demfin/accept-demfin/${id}`,values, {
            withCredentials: true
        })
        if (res.status !== 200) {
            throw new Error("Une erreur s'est produite");
        }
        dispatch(acceptDemFinSuccess(res.data));
    } catch (e) {
        acceptDemFinFailure(e.message);
    }
}

export const rejectDemFinAsync=(id,values)=>async (dispatch)=>{
    dispatch(rejectDemFinStart())
    try {
        const res = await axios.post(`http://localhost:8083/factoring/contrat/api/demfin/reject-demfin/${id}`,values, {
            withCredentials: true
        })
        if (res.status !== 200) {
            throw new Error("Une erreur s'est produite");
        }
        dispatch(rejectDemFinSucces(res.data));
    } catch (e) {
        rejectDemFinFailure(e.message);
    }
}
export const {
    allDemFinStart,
    allDemFinSuccess,
    allDemFinFailure,
    allEnAttenteStart,
    allEnAttenteSuccess,
    allEnAttenteFailure,
    addDemFinStart,
    addDemFinSuccess,
    addDemFinFailure,
    findDemFinByIdStart,
    findDemFinByIdSuccess,
    findDemFinByIdFailure,
    updateDemFinStart,
    updateDemFinSuccess,
    updateDemFinFailure,
    deleteDemFinStart,
    deleteDemFinSuccess,
    deleteDemFinFailure,
    allDemFinEnCoursStart,
    allDemFinEnCoursSuccess,
    allDemFinEnCoursFailure,
    acceptDemFinStart,
    acceptDemFinSuccess,
    acceptDemFinFailure,
    rejectDemFinStart,
    rejectDemFinSucces,
    rejectDemFinFailure,
    allDemFinRejeterStart,
    allDemFinRejeterSuccess,
    allDemFinRejeterFailure,
} = demFinSlice.actions;

export default demFinSlice.reducer;
