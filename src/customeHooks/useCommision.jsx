import {useEffect, useState} from "react";
import axios from "axios";

export const useCommision = () => {
    const [commisions, setCommisions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCommission=async (id)=>{
        setLoading(true);
        try {
            const response=await axios.get("http://localhost:8083/factoring/contrat/api/commision/"+id,{
                withCredentials:true
            })
            if (response.status !== 200) {
                throw new Error("Une erreur s'est produite");
            }
            setCommisions(response.data);

        }catch (e){
            setError(e.message);
        }finally {
            setLoading(false);
        }
    }

    return {commisions,loading,error,fetchCommission};

}