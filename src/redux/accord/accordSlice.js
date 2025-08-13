import {createSlice} from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
    accords: [],
    currentAccord: null,
    loadingAccord: false,
    errorAccord: null,
}

const accordSlice=createSlice({
    name: "accord",
    initialState,
    reducers:{
        // Fetch all accords
        fetchAccordsStart: (state) => {
            state.loadingAccord = true;
            state.errorAccord = null;
        },
        fetchAccordsSuccess: (state, action) => {
            state.loadingAccord = false;
            state.accords = action.payload;
        },
        fetchAccordsFailure: (state, action) => {
            state.loadingAccord = false;
            state.errorAccord = action.payload;
        },

        // Fetch single accord by ID
        fetchAccordByIdStart: (state) => {
            state.loadingAccord = true;
            state.errorAccord = null;
        },
        fetchAccordByIdSuccess: (state, action) => {
            state.loadingAccord = false;
            state.currentAccord = action.payload;
        },
        fetchAccordByIdFailure: (state, action) => {
            state.loadingAccord = false;
            state.errorAccord = action.payload;
        },

        // Create new accord
        createAccordStart: (state) => {
            state.loadingAccord = true;
            state.errorAccord = null;
        },
        createAccordSuccess: (state, action) => {
            state.loadingAccord = false;
            state.accords.push(action.payload);
        },
        createAccordFailure: (state, action) => {
            state.loadingAccord = false;
            state.errorAccord = action.payload;
        },

        // Update existing accord
        updateAccordStart: (state) => {
            state.loadingAccord = true;
            state.errorAccord = null;
        },
        updateAccordSuccess: (state, action) => {
            state.loadingAccord = false;
            const index = state.accords.findIndex(accord => accord.id === action.payload.id);
            if (index !== -1) {
                state.accords[index] = action.payload; // Update the existing accord
            }
        },
        updateAccordFailure: (state, action) => {
            state.loadingAccord = false;
            state.errorAccord = action.payload;
        },
    }
})

export const addAccord=(data,navigate)=> async (dispatch) => {
    dispatch(createAccordStart());
    try {
        const res=await axios.post('http://localhost:8081/factoring/api/accord/create-accord', data,{
            withCredentials:true
        });
        if(res.status!== 200){
            throw new Error("error on ajout d'accord a la enquete");
        }
        dispatch(createAccordSuccess(res.data));
        navigate("/list-accords");
    } catch (error) {
        console.log(error)
        dispatch(createAccordFailure(error.response.data));
    }
}
export const fetchAllAccords = () => async (dispatch) => {
    dispatch(fetchAccordsStart());
    try {
        const response = await axios.get('http://localhost:8081/factoring/api/accord/all-accords', {
            withCredentials: true
        });
        if (response.status !== 200) {
            throw new Error("Failed to fetch accords");
        }
        dispatch(fetchAccordsSuccess(response.data));
    } catch (error) {
        console.error(error);
        dispatch(fetchAccordsFailure(error.response.data));
    }
}

export const fetchAccordById=(id)=> async (dispatch) => {
    dispatch(fetchAccordByIdStart());
    try {
        const response = await axios.get(`http://localhost:8081/factoring/api/accord/get-accord/${id}`, {
            withCredentials: true
        });
        if (response.status !== 200) {
            throw new Error("Failed to fetch accord by ID");
        }
        dispatch(fetchAccordByIdSuccess(response.data));
    } catch (error) {
        console.error(error);
        dispatch(fetchAccordByIdFailure(error.response.data));
    }
}

export const updateAccord=(id,data,navigate)=> async (dispatch) => {
    dispatch(updateAccordStart());
    try {
        const response = await axios.post(`http://localhost:8081/factoring/api/accord/update-accord/${id}`, data, {
            withCredentials: true
        });
        if (response.status !== 200) {
            throw new Error("Failed to update accord");
        }
        dispatch(updateAccordSuccess(response.data));
        navigate("/list-accords");
    } catch (error) {
        console.error(error);
        dispatch(updateAccordFailure(error.response.data));
    }
}

export const deleteAccord=(id)=> async (dispatch) => {
    dispatch(fetchAccordByIdStart());
    try {
        const response = await axios.delete(`http://localhost:8081/factoring/api/accord/delete-accord/${id}`, {
            withCredentials: true
        });
        if (response.status !== 200) {
            throw new Error("Failed to delete accord");
        }
        dispatch(fetchAccordByIdSuccess(response.data));
    } catch (error) {
        console.error(error);
        dispatch(fetchAccordByIdFailure(error.response.data));
    }
}

export const {
    fetchAccordsStart,
    fetchAccordsSuccess,
    fetchAccordsFailure,
    fetchAccordByIdStart,
    fetchAccordByIdSuccess,
    fetchAccordByIdFailure,
    createAccordStart,
    createAccordSuccess,
    createAccordFailure,
    updateAccordStart,
    updateAccordSuccess,
    updateAccordFailure
} = accordSlice.actions;

export default accordSlice.reducer;