import {createSlice} from "@reduxjs/toolkit";
import axios from "axios";


const initialState={
    inLettrages: [],
    currentInLettrage:null,
    loading:false,
    error:null,
}
const factureSlice=createSlice({
    name:'inLettrage',
    initialState,
    reducers: {


        addInLettrageStart: (state) => {
            state.loading = true;
        },
        addInLettrageSuccess: (state, action) => {
            state.loading = false;
            // state.inLettrages.push(JSON.parse(action.payload));
        },
        addInLettrageFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        fetchInLettragesStart: (state) => {
            state.loading = true;
        },
        fetchInLettragesSuccess: (state, action) => {
            state.loading = false;
            state.inLettrages = action.payload;
        },
        fetchInLettragesFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        }
    }
})

export const addInLettrage= (inLettrageData)=>async (dispatch)=>{
    dispatch(addInLettrageStart());
    try{
        console.log("inLettrageData",inLettrageData);
        const response=await axios.post("http://localhost:8083/factoring/contrat/api/lettrage/add-lettrage",inLettrageData,{
            withCredentials:true
        });
        if (response.status !== 200) {
            throw new Error('error dans l\'ajout du lettrage');
        }
        dispatch(addInLettrageSuccess(response.data));
    }catch (error){
        dispatch(addInLettrageFailure(error.message));
    }
}
export const addInLettragesByDocRemiseId=(docRemiseId)=>async (dispatch)=>{
    dispatch(fetchInLettragesStart());
    try{
        const response=await axios.get(`http://localhost:8083/factoring/contrat/api/lettrage/get-lettrages-doc-remise/${docRemiseId}`,{
            withCredentials:true
        });
        if (response.status !== 200) {
            throw new Error('error dans le lettrage par doc remise id');
        }
        const filteredData = (response.data || []).filter(
            (item) => item.inTraite != null
        );

        dispatch(fetchInLettragesSuccess(filteredData));
    }catch (error){
        dispatch(fetchInLettragesFailure(error.message));
    }
}

export const {
    addInLettrageStart,
    addInLettrageSuccess,
    addInLettrageFailure,
    fetchInLettragesStart,
    fetchInLettragesSuccess,
    fetchInLettragesFailure
}=factureSlice.actions;
export default factureSlice.reducer;