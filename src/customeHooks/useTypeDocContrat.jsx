import {useState,useEffect} from "react";
import axios from "axios";


export const useTypeDocContrat=()=>{
    const [typeDocContrat,setTypeDocContrat]=useState([]);
    const [loading,setLoading]=useState(true);
    const [error,setError]=useState(null);


    const fetchTypeDoc=async ()=>{
        try{
            const response=await axios.get("http://localhost:8083/factoring/contrat/type-doc-contrat",{
                withCredentials:true
            })

            if(response.status!==200){
                throw new Error("Une erreur s'est produite");
            }

            const extractedData = response.data._embedded.typeDocContrats?.map((typeDocContrat) => {
                const selfLink = typeDocContrat._links?.self?.href;
                const id = selfLink ? selfLink.split("/").pop() : null; // Extract ID from URL

                return {
                    ...typeDocContrat,
                    id: id, // Extracted ID
                };
            });
            setTypeDocContrat(extractedData || []);
            setLoading(false);
        }catch (e){
            setError(e.message);
            setLoading(false);

        }
    }
    useEffect(()=>{
        fetchTypeDoc();
    },[]);

    return {typeDocContrat,loading,error};
}