import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
    personneMorales: [],
    errorPM: null,
    loadingPM: false,
};

const pmSlice = createSlice({
    name: "personneMorale",
    initialState,
    reducers: {
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
    },
});

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
        navigate("/");
    } catch (e) {
        console.log(e)
        dispatch(addPMFailure(e.message));
    }
};

export const { addPMStart, addMPSuccess, addPMFailure } = pmSlice.actions;
export default pmSlice.reducer;
