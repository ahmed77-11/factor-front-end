import {createSlice} from "@reduxjs/toolkit";
import axios from "axios";


const initialState={
    personnePhysiques:[],
    currentPP: null, // add a field to store a single person's data
    errorPP:null,
    loadingPP:false,
};

const ppSlice=createSlice({
    name:"personnePhysique",
    initialState,
    reducers:{
        allPPStart:(state)=>{
            state.loadingPP=true;
        },
        allPPSuccess:(state,action)=>{
            state.loadingPP=false;
            state.personnePhysiques=action.payload;
        },
        allPPFailure:(state,action)=>{
            state.loadingPP=false;
            state.errorPP=action.payload;
        },
        findPPByIdStart:(state)=>{
            state.loadingPP=true;
       },
        findPPByIdSuccess:(state,action)=>{
            state.loadingPP=false;
            state.currentPP=action.payload;

        },
        findPPByIdFailure:(state,action)=>{
            state.loadingPP=false;
            state.errorPP=action.payload;
        },
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
        updatePPStart:(state)=>{
            state.loadingPP=true;
        },
        updatePPSuccess:(state)=>{
            state.loadingPP=false;
        },
        updatePPFailure:(state,action)=>{
            state.loadingPP=false;
            state.errorPP=action.payload;
        },
        deletePPStart: (state) => {
            state.loadingPP = true;
        },
        deletePPSuccess: (state, action) => {
            state.loadingPP = false;
            state.personnePhysiques = state.personnePhysiques.filter(pp => pp.id !== action.payload);
        },
        deletePPFailure: (state, action) => {
            state.loadingPP = false;
            state.errorPP = action.payload;
        }

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
        console.log(e)
        dispatch(addPPFailure(e.response.data));
    }
}

export const getPP=()=>async (dispatch)=>{
    dispatch(allPPStart());
    try {
        const response=await axios.get("http://localhost:8081/factoring/api/pp/all",{
            withCredentials:true
        });
        if(response.status!==200){
            throw new Error("Une erreur s'est produite");
        }
        dispatch(allPPSuccess(response.data));
    }catch (e) {
        dispatch(allPPFailure(e.response.data));
    }
}
export const getPPById=(id)=>async (dispatch)=>{
    dispatch(findPPByIdStart());
    try {
        const response=await axios.get(`http://localhost:8081/factoring/api/pp/get-pp/${id}`,{
            withCredentials:true
        });
        if(response.status!==200){
            throw new Error("Une erreur s'est produite");
        }
        dispatch(findPPByIdSuccess(response.data));
    }catch (e) {
        dispatch(findPPByIdFailure(e.response.data));
    }
}
export const updatePP=(id,data,navigate)=>async(dispatch)=>{
    dispatch(updatePPStart());
    try {
        const response=await axios.post(`http://localhost:8081/factoring/api/pp/update-pp/${id}`,data,{
            withCredentials:true
        });
        if(response.status!==200){
            throw new Error("Une erreur s'est produite");
        }
        dispatch(updatePPSuccess());
        navigate("/");
    }catch (e) {
        dispatch(updatePPFailure(e.response.data));
    }
}
export const deletePP=(id,navigate)=>async (dispatch)=>{
    dispatch(deletePPStart());
    try {
        const response=await axios.delete(`http://localhost:8081/factoring/api/pp/delete-pp/${id}`,{
            withCredentials:true
        });
        if(response.status!==200){
            throw new Error("Une erreur s'est produite");
        }
        dispatch(deletePPSuccess());
        navigate("/all-pp");
    }catch (e) {
        dispatch(deletePPFailure(e.response.data));
    }
}

export const {addPPStart,addPPSuccess,addPPFailure,allPPStart,allPPSuccess,allPPFailure,findPPByIdStart,findPPByIdSuccess,findPPByIdFailure,updatePPStart,updatePPSuccess,updatePPFailure,deletePPStart,deletePPSuccess,deletePPFailure}=ppSlice.actions;
export default ppSlice.reducer;