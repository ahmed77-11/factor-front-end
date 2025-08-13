import {useState,useEffect} from "react";
import axios from "axios";

export const useBanque = () => {
    const [banques, setBanques] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchBanques = async () => {
        try {
            const response = await axios.get("http://localhost:8083/factoring/contrat/banque", {
                withCredentials: true
            });
            if (response.status !== 200) {
                throw new Error("Une erreur s'est produite lors du chargement des banques.");
            }
            const extractedData = response.data._embedded.banques?.map((banque) => {
                const selfLink = banque._links?.self?.href;
                const id = selfLink ? selfLink.split("/").pop() : null; // Extract ID from URL

                return {
                    ...banque,
                    id: id, // Extracted ID
                };
            });
            setBanques(extractedData || []);
            setLoading(false);
        } catch (e) {
            setError(e.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBanques();
    }, []);

    return { banques, loading, error };
}