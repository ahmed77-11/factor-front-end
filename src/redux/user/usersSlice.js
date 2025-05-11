import {createSlice} from "@reduxjs/toolkit";
import axios from "axios";
import {addUserFailure, addUserSuccess} from "./userSlice.js";


const initialState = {
    users: [],
    currentUser: null,
    loading: false,
    error: null,
}


const usersSlice = createSlice({
    name: "users",
    initialState,
    reducers: {
        allUsersStart: (state) => {
            state.loading = true;
        },
        allUsersSuccess: (state, action) => {
            state.loading = false;
            state.users = action.payload;

        },
        allUsersFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        userByIdStart:(state) => {
            state.loading = true;
        },
        userByIdSuccess:(state, action) => {
            state.loading = false;
            state.currentUser = action.payload;
        },
        userByIdFailure:(state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        updateUserStart: (state) => {
            state.loading = true;
        },
        updateUserSuccess: (state, action) => {
            state.loading = false;
            // Update the user in the users array
            state.users = state.users.map(user =>
                user.id === action.payload.id ? action.payload : user
            );
            state.currentUser = action.payload;
        },
        updateUserFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        deleteUserStart: (state) => {
            state.loading = true;
        },
        deleteUserSuccess: (state, action) => {
            state.loading = false;
            // Remove the deleted user from the users array
            state.users = state.users.filter(user => user.id !== action.payload);
        },
        deleteUserFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

    }
})

export const fetchAllUsers = () => async (dispatch) => {
    dispatch(allUsersStart());
    try {
        const res = await axios.get("http://localhost:8082/factoring/users/api/admin/all-users",{
            withCredentials:true
        });
        if (res.data && res.status === 200) {
            dispatch(allUsersSuccess(res.data));
        } else {
            dispatch(allUsersFailure(res.data.response.message || "An error occurred"));
        }
    } catch (error) {
        dispatch(allUsersFailure(error.message));
    }
}
export const fetchUserById = (id) => async (dispatch) => {
    dispatch(userByIdStart());
    console.log(id)
    try {
        const res = await axios.get(`http://localhost:8082/factoring/users/api/admin/user/${id}`,{
            withCredentials:true
        });
        if (res.data && res.status === 200) {
            dispatch(userByIdSuccess(res.data));
        } else {
            dispatch(userByIdFailure(res.data.response.message || "An error occurred"));
        }
    } catch (error) {
        dispatch(userByIdFailure(error.message));
    }
}

export const updateUser = (userData, navigate) => async (dispatch) => {
    dispatch(updateUserStart());
    try {
        console.log(userData)
        const res = await axios.post(
            `http://localhost:8082/factoring/users/api/admin/update-user/${userData.id}`,
            userData,
            { withCredentials: true }
        );
        if (res.data && res.status === 200) {
            dispatch(updateUserSuccess(res.data));
            navigate('/users'); // Redirect after successful update
        } else {
            dispatch(updateUserFailure(res.data.response.message || "An error occurred"));
        }
    } catch (error) {
        dispatch(updateUserFailure(error.message));
    }
};

export const deleteUser = (id) => async (dispatch) => {
    dispatch(deleteUserStart());
    try {
        const res = await axios.delete(`http://localhost:8082/factoring/users/api/admin/deleteUserById/${id}`,{
            withCredentials:true
        });
        if (res.data && res.status === 200) {
            dispatch(deleteUserSuccess(id));
        } else {
            dispatch(deleteUserFailure(res.data.response.message || "An error occurred"));
        }
    } catch (error) {
        dispatch(deleteUserFailure(error.message));
    }
}
export const {allUsersStart, allUsersSuccess, allUsersFailure,userByIdStart,userByIdSuccess,userByIdFailure,updateUserStart,updateUserSuccess,updateUserFailure,deleteUserStart,deleteUserSuccess,deleteUserFailure} = usersSlice.actions;
export default usersSlice.reducer;