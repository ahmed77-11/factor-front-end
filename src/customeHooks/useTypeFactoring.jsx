import {useState,useEffect} from "react";
import axios from "axios";

export const useTypeFactoring=()=>{
    const [typeFactorings,setTypeFactorings]=useState([]);
    const [loading,setLoading]=useState(true);
    const [error,setError]=useState(null);

    const fetchTypeFactoring=async ()=>{
        try {
            const response=await axios.get("http://localhost:8083/factoring/contrat/type-factoring",{
                withCredentials:true
            });
            if(response.status!==200){
                throw new Error("Une erreur s'est produite");
            }
            const extractedData = response.data._embedded.typeFactorings?.map((typeFactoring) => {
                const selfLink = typeFactoring._links?.self?.href;
                const id = selfLink ? selfLink.split("/").pop() : null; // Extract ID from URL

                return {
                    ...typeFactoring,
                    id: id, // Extracted ID
                };
            });
            setTypeFactorings(extractedData || []);
            setLoading(false);

        }catch (e) {
            setError(e.message);
            setLoading(false);
        }

    }

    useEffect(() => {
        fetchTypeFactoring();
    }, []);
    return {typeFactorings,loading,error};

};