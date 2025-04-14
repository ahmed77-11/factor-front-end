// src/utils/fileService.js
import axios from "axios";

export const uploadFile = async (file) => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axios.post('http://localhost:8083/factoring/contrat/api/files/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        console.error("Upload failed:", error);
        throw error;
    }
};