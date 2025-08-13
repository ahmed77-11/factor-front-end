import {useState,useEffect} from "react";
import axios from "axios";

export const useAssur = () => {
    const [assurances, setAssurances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAssur= async () =>{
        try{
            const response = await axios.get("http://localhost:8081/factoring/api/assur/all", {
                withCredentials: true
            });
            if(response.status !== 200){
                throw new Error("Une erreur s'est produite lors du chargement des assurances.");
            }
            setAssurances(response.data);
            setLoading(false);

        }catch (e){
            setError(e.message);
            setLoading(false);
        }
    };

    useEffect(()=>{
        fetchAssur();
    },[]);

    return { assurances, loading, error };
}