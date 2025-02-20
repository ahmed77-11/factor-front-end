import { createSlice } from '@reduxjs/toolkit';
import axios from "axios";

const initialState = {
    current: null,
    error: null,
    loading: false,
    roles: [],
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        loginStart: (state) => {
            state.loading = true;
        },
        loginSuccess: (state, action) => {
            state.loading = false;
            state.current = action.payload;
            state.error = null;
            state.roles = action.payload.roles;
        },
        loginFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        logout: (state) => {
            state.current = null;
        },
        sendResetStart: (state) => {
            state.loading = true;
        },
        sendResetSuccess: (state) => {
            state.loading = false;
        },
        sendResetFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        confirmCodeStart:(state)=>{
            state.loading=true;
        },
        confirmCodeSuccess:(state)=>{
            state.loading=false;
        },
        confirmCodeFailure:(state,action)=>{
            state.loading=false;
            state.error=action.payload;
        },
        resetPasswordStart:(state)=>{
            state.loading=true;
        },
        resetPasswordSuccess:(state)=>{
            state.loading=false;
        },
        resetPasswordFailure:(state,action)=>{
            state.loading=false;
            state.error=action.payload;
        },
        addUserStart:(state)=>{
            state.loading=true;
        },
        addUserSuccess:(state)=>{
            state.loading=false;
        },
        addUserFailure:(state,action)=>{
            state.loading=false;
            state.error=action.payload;
        },
    }
});

export const login = (email, password,navigate) => async (dispatch) => {
    dispatch(loginStart());
    try {
        // Corrected API call structure
        const res = await axios.post(
            "http://localhost:8082/factoring/users/api/auth/login",
            { email, password }, // send the email and password as the body of the request
            {
                headers: {
                    "Content-Type": "application/json",
                },
                withCredentials: true, // move this here
            }
        );

        // Ensure the response has data and status is 200
        if (res.data && res.status === 200) {
            console.log(res.data)
            dispatch(loginSuccess(res.data));
            if(res.data.forceChangePassword===true){
                navigate("/change-pass")
                return;
            }
            navigate("/")
            
        } else {
            console.log(res.data.response.message)
           dispatch(loginFailure(res.data.response.message || "An error occurred"));
        }
    } catch (error) {
        console.log(error);
        // Check if the backend provided a custom error message
        const errorMessage =
            error.response && error.response.data && error.response.data.message
                ? error.response.data.message
                : error.message;
        dispatch(loginFailure(errorMessage));
    }
}
export const sendResetToken = (email,navigate) => async (dispatch) => {
    dispatch(sendResetStart());
    try {
        const res = await axios.post(
            "http://localhost:8082/factoring/users/api/auth/reset-password-email",
            { email }, // send the email and password as the body of the request
            {
                headers: {
                    "Content-Type": "application/json",
                },
                withCredentials: true, // move this here
            }
        );
        if (res.data && res.status === 200) {
            dispatch(sendResetSuccess(res.data));
            navigate("/confirm-code", { state: { email: email } });

        } else {
            console.log(res.data.response.message)
            dispatch(sendResetFailure(res.data.response.message || "An error occurred"));
        }
    }catch (error){
        console.log(error);
        // Check if the backend provided a custom error message
        const errorMessage =
            error.response && error.response.data && error.response.data.message
                ? error.response.data.message
                : error.message;
        dispatch(sendResetFailure(errorMessage));

    }
}
export const confirmCodeReq=(email,code,navigate)=>async(dispatch)=>{
    dispatch(confirmCodeStart());
    try {
        const res = await axios.post(
            "http://localhost:8082/factoring/users/api/auth/confirm-code",
            { email,code }, // send the email and password as the body of the request
            {
                headers: {
                    "Content-Type": "application/json",
                },
                withCredentials: true, // move this here
            }
        );
        if (res.data && res.status === 200) {
            dispatch(confirmCodeSuccess(res.data));
            navigate("/reset-password");

        } else {
            console.log(res.data.response.message)
            dispatch(confirmCodeFailure(res.data.response.message || "An error occurred"));
        }
    }catch (error){
        console.log(error);
        // Check if the backend provided a custom error message
        const errorMessage =
            error.response && error.response.data && error.response.data.message
                ? error.response.data.message
                : error.message;
        dispatch(confirmCodeFailure(errorMessage));

    }
}
export const resetPasswordReq=(email,password,confirmPassword,navigate)=>async(dispatch)=> {
    dispatch(resetPasswordStart());
    try {
        const res = await axios.post(
            "http://localhost:8082/factoring/users/api/auth/reset-password",
            {email, password, confirmPassword}, // send the email and password as the body of the request
            {
                headers: {
                    "Content-Type": "application/json",
                },
                withCredentials: true, // move this here
            }
        );
        if (res.data && res.status === 200) {
            dispatch(resetPasswordSuccess(res.data));
            navigate("/login");

        } else {
            console.log(res.data.response.message)
            dispatch(resetPasswordFailure(res.data.response.message || "An error occurred"));
        }
    } catch (error) {
        console.log(error);
        // Check if the backend provided a custom error message
        const errorMessage =
            error.response && error.response.data && error.response.data.message
                ? error.response.data.message
                : error.message;
        dispatch(resetPasswordFailure(errorMessage));

    }
}
 export const resetResetPasswordFTime=(code,password,confirmPassword,navigate)=>async(dispatch)=>{
        dispatch(resetPasswordStart());
        try {
            const res = await axios.post(
                "http://localhost:8082/factoring/users/api/auth/change-password-first-time",
                { password,confirmPassword,code }, // send the email and password as the body of the request
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    withCredentials: true, // move this here
                }
            );
            if (res.data && res.status === 200) {
                dispatch(resetPasswordSuccess(res.data));
                navigate("/login");
            } else {
                console.log(res.data.response.message)
                dispatch(resetPasswordFailure(res.data.response.message || "An error occurred"));
            }
        }catch (error){
            console.log(error);
            // Check if the backend provided a custom error message
            const errorMessage =
                error.response && error.response.data && error.response.data.message
                    ? error.response.data.message
                    : error.message;
            dispatch(resetPasswordFailure(errorMessage));
        
    }
}
export const addUser = (email, cin, firstName, lastName, roles, navigate) => async (dispatch) => {
    dispatch(addUserStart());
    try {
        const res = await axios.post(
            "http://localhost:8082/factoring/users/api/admin/create_user",
            { firstName, lastName, cin, email, roles }, // data object
            {
                headers: {
                    "Content-Type": "application/json",
                },
                withCredentials: true,
            }
        );
        if (res.data && res.status === 200) {
            dispatch(addUserSuccess(res.data));
            navigate("/");
        } else {
            dispatch(addUserFailure(res.data.response.message || "An error occurred"));
        }
    } catch (error) {
        console.log(error);
        const errorMessage =
            error.response && error.response.data && error.response.data.message
                ? error.response.data.message
                : error.message;
        dispatch(addUserFailure(errorMessage));
    }
};


export const { loginStart, loginSuccess, loginFailure, logout,sendResetStart,sendResetSuccess,sendResetFailure ,confirmCodeStart,confirmCodeSuccess,confirmCodeFailure,resetPasswordStart,resetPasswordSuccess,resetPasswordFailure,addUserStart,addUserSuccess,addUserFailure} = userSlice.actions;
export default userSlice.reducer;
