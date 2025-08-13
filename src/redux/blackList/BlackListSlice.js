import {createSlice} from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
    blackList: [],
    currentBlackList: null,
    loadingBlackList: false,
    errorBlackList: null,
}

const blackListSlice = createSlice({
    name: "blackList",
    initialState,
    reducers: {
        // Fetch all blacklists
        fetchBlackListsStart: (state) => {
            state.loadingBlackList = true;
            state.errorBlackList = null;
        },
        fetchBlackListsSuccess: (state, action) => {
            state.loadingBlackList = false;
            state.blackList = action.payload;
        },
        fetchBlackListsFailure: (state, action) => {
            state.loadingBlackList = false;
            state.errorBlackList = action.payload;
        },

        // Fetch single blacklist by ID
        fetchBlackListByIdStart: (state) => {
            state.loadingBlackList = true;
            state.errorBlackList = null;
        },
        fetchBlackListByIdSuccess: (state, action) => {
            state.loadingBlackList = false;
            state.currentBlackList = action.payload;
        },
        fetchBlackListByIdFailure: (state, action) => {
            state.loadingBlackList = false;
            state.errorBlackList = action.payload;
        },

        // Create new blacklist
        createBlackListStart: (state) => {
            state.loadingBlackList = true;
            state.errorBlackList = null;
        },
        createBlackListSuccess: (state, action) => {
            state.loadingBlackList = false;
            state.blackList.push(action.payload);
        },
        createBlackListFailure: (state, action) => {
            state.loadingBlackList = false;
            state.errorBlackList = action.payload;
        },

        // Update existing blacklist
        updateBlackListStart: (state) => {
            state.loadingBlackList = true;
            state.errorBlackList = null;
        },
        updateBlackListSuccess: (state, action) => {
            const index = state.blackList.findIndex(bl => bl.id === action.payload.id);
            if (index !== -1) {
                state.blackList[index] = action.payload;
                state.currentBlackList = action.payload; // Update current blacklist
            }
            state.loadingBlackList = false;
        },
        updateBlackListFailure: (state, action) => {
            state.loadingBlackList = false;
            state.errorBlackList = action.payload;
        },

        // Delete blacklist
        deleteBlackListStart: (state) => {
            state.loadingBlackList = true;
            state.errorBlackList = null;
        },
        deleteBlackListSuccess: (state, action) => {
            state.loadingBlackList = false;
            state.blackList = state.blackList.filter(bl => bl.id !== action.payload);
        },
        deleteBlackListFailure: (state, action) => {
            state.loadingBlackList = false;
            state.errorBlackList = action.payload;
        },
    }
})

export const addBlackList=(data, navigate) => async (dispatch) => {
    dispatch(createBlackListStart());
    try {
        const response = await axios.post("http://localhost:8081/factoring/api/blacklist/add-to-blacklist", data,{
            withCredentials:true
        });
        if (response.status !== 200) {
            throw new Error("error on ajout dans la blacklist");
        }
        dispatch(createBlackListSuccess(response.data));
        navigate("/blacklists");
    } catch (error) {
        dispatch(createBlackListFailure(error.message));
    }
}

export const fetchBlackLists = () => async (dispatch) => {
    dispatch(fetchBlackListsStart());
    try {
        const response = await axios.get("http://localhost:8081/factoring/api/blacklist/get-blacklist", {
            withCredentials: true
        });
        if (response.status !== 200) {
            throw new Error("Erreur dans la blacklist");
        }
        dispatch(fetchBlackListsSuccess(response.data));
    } catch (error) {
        dispatch(fetchBlackListsFailure(error.message));
    }
}
export const fetchBlackListById = (id) => async (dispatch) => {
    dispatch(fetchBlackListByIdStart());
    try {
        const response = await axios.get(`http://localhost:8081/factoring/api/blacklist/get-blacklist/${id}`, {
            withCredentials: true
        });
        if (response.status !== 200) {
            throw new Error("Erreur dans la récupération de la blacklist");
        }
        dispatch(fetchBlackListByIdSuccess(response.data));
    } catch (error) {
        dispatch(fetchBlackListByIdFailure(error.message));
    }
}

export const updateBlackList = (id, data, navigate) => async (dispatch) => {
    dispatch(updateBlackListStart());
    try {
        const response = await axios.post(`http://localhost:8081/factoring/api/blacklist/update-blacklist/${id}`, data, {
            withCredentials: true
        });
        if (response.status !== 200) {
            throw new Error("Erreur dans la mise à jour de la blacklist");
        }
        dispatch(updateBlackListSuccess(response.data));
        navigate("/blacklists");
    } catch (error) {
        dispatch(updateBlackListFailure(error.message));
    }
}

export const deleteBlackList = (id) => async (dispatch) => {
    dispatch(deleteBlackListStart());
    try {
        const response = await axios.delete(`http://localhost:8081/factoring/api/blacklist/delete-blacklist/${id}`, {
            withCredentials: true
        });
        if (response.status !== 200) {
            throw new Error("Erreur dans la suppression de la blacklist");
        }
        dispatch(deleteBlackListSuccess(id));
    } catch (error) {
        dispatch(deleteBlackListFailure(error.message));
    }
}
export const {
    fetchBlackListsStart,
    fetchBlackListsSuccess,
    fetchBlackListsFailure,
    fetchBlackListByIdStart,
    fetchBlackListByIdSuccess,
    fetchBlackListByIdFailure,
    createBlackListStart,
    createBlackListSuccess,
    createBlackListFailure,
    updateBlackListStart,
    updateBlackListSuccess,
    updateBlackListFailure,
    deleteBlackListStart,
    deleteBlackListSuccess,
    deleteBlackListFailure
} = blackListSlice.actions;

export default blackListSlice.reducer;