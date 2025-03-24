import {useState,useEffect} from "react";
import axios from "axios";

export const useTypeEvent=()=>{
    const [typeEvent,setTypeEvent]=useState([]);
    const [loading,setLoading]=useState(true);
    const [error,setError]=useState(null);

    const fetchTypeEvent=async ()=>{
        try {
            const response=await axios.get("http://localhost:8083/factoring/contrat/type-event",{
                withCredentials:true
            });
            if(response.status!==200){
                throw new Error("Une erreur s'est produite");
            }
            const extractedData = response.data._embedded.typeEvents?.map((typeEvent) => {
                const selfLink = typeEvent._links?.self?.href;
                const id = selfLink ? selfLink.split("/").pop() : null; // Extract ID from URL

                return {
                    ...typeEvent,
                    id: id, // Extracted ID
                };
            });
            setTypeEvent(extractedData || []);
            setLoading(false);

        }catch (e) {
            setError(e.message);
            setLoading(false);
        }

    }

    useEffect(() => {
        fetchTypeEvent();
    }, []);
    return {typeEvent,loading,error};

};