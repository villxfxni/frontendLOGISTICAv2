import axios from 'axios';
import { API_BASE } from '../config/apiBase.js';
const API_URL = `${API_BASE}/metricas`;
const DONACIONES_DONANTES_URL = `${API_BASE}/donaciones/donantes`;

export const getMetricas = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};


export const getDonacionesConDonantes = async () => {
    const response = await axios.get(DONACIONES_DONANTES_URL);
    return response.data;
};