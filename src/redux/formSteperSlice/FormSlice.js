import {createSlice} from "@reduxjs/toolkit";


const intialState = {
    step:0,
    formData:{},
    loading:false,
    error:null,
};

const formSlice=createSlice({
    name:"form",
    initialState:intialState,
    reducers:{
        nextStep:(state)=>{
            state.step+=1;
        },
        previousStep:(state)=>{
            state.step-=1;
        },
        setFormData:(state,action)=>{
            state.formData={...state.formData,...action.payload};
        },
        resetForm:(state)=>{
            state.step=0;
            state.formData={};
        },
        setLoading:(state,action)=>{
            state.loading=action.payload;
        },
        setError:(state,action)=>{
            state.error=action.payload;
        },
    }
});

export const {nextStep,previousStep,setFormData,resetForm,setLoading,setError}=formSlice.actions;
export default formSlice.reducer;

