import {useState} from "react";
import axios from "axios";



export const useContratDoc = () => {
    const [docContrat, setDocContrat] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetchDocContrat=async (id)=>{
        setLoading(true);
        try {
            const response=await axios.get("http://localhost:8083/factoring/contrat/api/doc-contrat/"+id,{
                withCredentials:true
            })
            if (response.status !== 200) {
                throw new Error("Une erreur s'est produite");
            }
             setDocContrat(()=>(response.data));

        }catch (e){
            setError(e.message);
        }finally {
            setLoading(false);
        }
    }
    return {docContrat,loading,error,fetchDocContrat};
}