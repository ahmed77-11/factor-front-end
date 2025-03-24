import {useState,useEffect} from "react";
import axios from "axios";

export const useDevise=()=>{
    const [devises,setDevises]=useState([]);
    const [loading,setLoading]=useState(true);
    const [error,setError]=useState(null);

    const fetchDevise=async ()=>{
        try {
            const response=await axios.get("http://localhost:8083/factoring/contrat/devise",{
                withCredentials:true
            });
            if(response.status!==200){
                throw new Error("Une erreur s'est produite");
            }
            const extractedData = response.data._embedded.devises?.map((devise) => {
                const selfLink = devise._links?.self?.href;
                const id = selfLink ? selfLink.split("/").pop() : null; // Extract ID from URL

                return {
                    ...devise,
                    id: id, // Extracted ID
                };
            });
            setDevises(extractedData || []);
            setLoading(false);

        }catch (e) {
            setError(e.message);
            setLoading(false);
        }

    }

    useEffect(() => {
        fetchDevise();
    }, []);
    return {devises,loading,error};

};