import { useState, useEffect } from "react";
import axios from "axios";

export const useNationalite = () => {
    const [nationalites, setNationalites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchNationalites = async () => {
        try {
            const response = await axios.get("http://localhost:8081/factoring/api/nationalite/all", {
                withCredentials: true,
            });

            if (response.status !== 200) {
                throw new Error("Une erreur s'est produite lors du chargement des nationalités.");
            }

            setNationalites(response.data);
            setLoading(false);
        } catch (e) {
            setError(e.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNationalites();
    }, []);

    return { nationalites, loading, error };
};
