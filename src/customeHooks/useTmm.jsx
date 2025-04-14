import {useState,useEffect} from "react";
import axios from "axios";

export const useTmm=()=>{
    const [tmms,setTmms]=useState([]);
    const [loading,setLoading]=useState(true);
    const [error,setError]=useState(null);

    const fetchTmm=async ()=>{
        try {
            const response=await axios.get("http://localhost:8083/factoring/contrat/tmm",{
                withCredentials:true
            });
            if(response.status!==200){
                throw new Error("Une erreur s'est produite");
            }
            const extractedData = response.data._embedded.tmms?.map((tmm) => {
                const selfLink = tmm._links?.self?.href;
                const id = selfLink ? selfLink.split("/").pop() : null; // Extract ID from URL

                return {
                    ...tmm,
                    id: id, // Extracted ID
                };
            });
            setTmms(extractedData || []);
            setLoading(false);

        }catch (e) {
            setError(e.message);
            setLoading(false);
        }

    }
    const fetchTmmById = async (id) => {
        try {
            const response = await axios.get(`http://localhost:8083/factoring/contrat/tmm/${id}`, {
                withCredentials: true
            });

            if (response.status !== 200) {
                throw new Error("Une erreur s'est produite");
            }

            return response.data;
        } catch (e) {
            setError(e.message);
            return null;
        }
    };

    useEffect(() => {
        fetchTmm();
    }, []);
    return {tmms,loading,error,fetchTmmById };

};