import {useState,useEffect} from "react";
import axios from "axios";

export const useTypeCommission=()=>{
    const [typeCommission,setTypeCommission]=useState([]);
    const [loading,setLoading]=useState(true);
    const [error,setError]=useState(null);

    const fetchTypeCommission=async ()=>{
        try {
            const response=await axios.get("http://localhost:8083/factoring/contrat/type-comm",{
                withCredentials:true
            });
            if(response.status!==200){
                throw new Error("Une erreur s'est produite");
            }
            const extractedData = response.data._embedded.typeComms?.map((typeComm) => {
                const selfLink = typeComm._links?.self?.href;
                const id = selfLink ? selfLink.split("/").pop() : null; // Extract ID from URL

                return {
                    ...typeComm,
                    id: id, // Extracted ID
                };
            });
            setTypeCommission(extractedData || []);
            setLoading(false);

        }catch (e) {
            setError(e.message);
            setLoading(false);
        }

    }

    useEffect(() => {
        fetchTypeCommission();
    }, []);
    return {typeCommission,loading,error};

};