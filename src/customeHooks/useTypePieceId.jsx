import {useState,useEffect} from "react";
import axios from "axios";

export const useTypePieceId=()=>{
    const [typePieceId,setTypePieceId]=useState([]);
    const [loading,setLoading]=useState(true);
    const [error,setError]=useState(null);

    const fetchTypePieceId=async ()=>{
        try {
            const response=await axios.get("http://localhost:8081/factoring/api/type-piece-id/all",{
                withCredentials:true
            });
            if(response.status!==200){
                throw new Error("Une erreur s'est produite");
            }
            setTypePieceId(response.data);
            setLoading(false);

        }catch (e) {
            setError(e.message);
            setLoading(false);
        }

    }

    useEffect(() => {
        fetchTypePieceId();
    }, []);
    return {typePieceId,loading,error};

};