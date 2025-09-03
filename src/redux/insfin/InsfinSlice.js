import {createSlice} from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
    insfins: [],
    currentInsfin: null, // store a single insfin record
    errorInsfin: null,
    loadingInsfin: false,
}

const insfinSlice = createSlice({
    name: "insfin",
    initialState,
    reducers: {
        fetchInsfinsStart: (state) => {
            state.loadingInsfin = true;
            state.errorInsfin = null;
        },
        fetchInsfinsSuccess: (state, action) => {
            state.loadingInsfin = false;
            state.insfins = action.payload;
        },
        fetchInsfinsFailure: (state, action) => {
            state.loadingInsfin = false;
            state.errorInsfin = action.payload;
        },
        fetchInsfinByIdStart: (state) => {
            state.loadingInsfin = true;
            state.errorInsfin = null;
        },
        fetchInsfinByIdSuccess: (state, action) => {
            state.loadingInsfin = false;
            state.currentInsfin = action.payload;
        },
        fetchInsfinByIdFailure: (state, action) => {
            state.loadingInsfin = false;
            state.errorInsfin = action.payload;
        },
    }
});

// Async actions
export const addInsfinAsync=(insfinSlice,navigate) => async (dispatch) => {
    dispatch(fetchInsfinsStart());
    try {
        const response=await axios.post("http://localhost:8083/factoring/contrat/api/insfin/add-insfin", insfinSlice,{
            withCredentials: true,
        });
        if(response.status !== 200) {
            throw new Error("Erreur en la creation du insfin");
        }
        dispatch(fetchInsfinsSuccess(response.data));
        navigate("/insfins");
    } catch (error) {
        console.log(error)

        dispatch(fetchInsfinsFailure(error.response.data));
    }
}
export const fetchInsfinsAsync = () => async (dispatch) => {
    dispatch(fetchInsfinsStart());
    try {
        const response = await axios.get("http://localhost:8083/factoring/contrat/api/insfin/all-insfin", {
            withCredentials: true,
        });
        if (response.status !== 200) {
            throw new Error("Erreur lors de la récupération des Insfins");
        }
        dispatch(fetchInsfinsSuccess(response.data));
    } catch (error) {
        dispatch(fetchInsfinsFailure(error.message));
    }
};
export const fetchInsfinByIdAsync = (id) => async (dispatch) => {
    dispatch(fetchInsfinByIdStart());
    try {
        const response = await axios.get(`http://localhost:8083/factoring/contrat/api/insfin/get-insfin/${id}`, {
            withCredentials: true,
        });
        if (response.status !== 200) {
            throw new Error("Erreur lors de la récupération de l'Insfin");
        }
        dispatch(fetchInsfinByIdSuccess(response.data));
    } catch (error) {
        console.log(error)

        dispatch(fetchInsfinByIdFailure(error.message));
    }
};

export const updateInsfinAsync = (id, insfinData,navigate) => async (dispatch) => {
    dispatch(fetchInsfinByIdStart());
    try {
        const response = await axios.post(`http://localhost:8083/factoring/contrat/api/insfin/update-insfin/${id}`, insfinData, {
            withCredentials: true,
        });
        if (response.status !== 200) {
            throw new Error("Erreur lors de la mise à jour de l'Insfin");
        }
        dispatch(fetchInsfinByIdSuccess(response.data));
        navigate("/insfins");
    } catch (error) {
        console.log(error)
        dispatch(fetchInsfinByIdFailure(error.message));
    }
};


export const {
    fetchInsfinsStart,
    fetchInsfinsSuccess,
    fetchInsfinsFailure,
    fetchInsfinByIdStart,
    fetchInsfinByIdSuccess,
    fetchInsfinByIdFailure,
} = insfinSlice.actions;
export default insfinSlice.reducer;