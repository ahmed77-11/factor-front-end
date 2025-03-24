import {useState,useEffect} from "react";
import axios from "axios";

export const useTypeDoc=()=>{
    const [typeDoc,setTypeDoc]=useState([]);
    const [loading,setLoading]=useState(true);
    const [error,setError]=useState(null);

    const fetchTypeDoc=async ()=>{
        try {
            const response=await axios.get("http://localhost:8083/factoring/contrat/type-doc-remise",{
                withCredentials:true
            });
            if(response.status!==200){
                throw new Error("Une erreur s'est produite");
            }
            const extractedData = response.data._embedded.typeDocRemises?.map((typeDocRemise) => {
                const selfLink = typeDocRemise._links?.self?.href;
                const id = selfLink ? selfLink.split("/").pop() : null; // Extract ID from URL

                return {
                    ...typeDocRemise,
                    id: id, // Extracted ID
                };
            });
            setTypeDoc(extractedData || []);
            setLoading(false);

        }catch (e) {
            setError(e.message);
            setLoading(false);
        }

    }

    useEffect(() => {
        fetchTypeDoc();
    }, []);
    return {typeDoc,loading,error};

};