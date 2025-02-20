import {createSlice} from "@reduxjs/toolkit";
import axios from "axios";


const initialState={
    personnePhysiques:[],
    errorPP:null,
    loadingPP:false,
};

const ppSlice=createSlice({
    name:"personnePhysique",
    initialState,
    reducers:{
        addPPStart:(state)=>{
            state.loadingPP=true;
        },
        addPPSuccess:(state)=>{
            state.loadingPP=false;
        },
        addPPFailure:(state,action)=>{
            state.loadingPP=false;
            state.errorPP=action.payload;
        },
    },
})
export const addPP=(data,navigate)=>async(dispatch)=>{
    dispatch(addPPStart());
    try{

        const response=await axios.post("http://localhost:8081/factoring/api/pp/add-pp",data,{
            withCredentials:true
        });
        if(response.status!==200){
            throw new Error("Une erreur s'est produite");
        }
        dispatch(addPPSuccess());
        navigate("/");
    }catch (e) {
        dispatch(addPPFailure(e.message));
    }
}

export const {addPPStart,addPPSuccess,addPPFailure}=ppSlice.actions;
export default ppSlice.reducer;