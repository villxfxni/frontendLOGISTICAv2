import axios from "axios";
import { getAuthConfig } from "../Components/Common/authHeaders";
import { API_BASE } from "../config/apiBase.js";

const API_HISTORIAL = `${API_BASE}/historial`;

export const fetchDonationsReporte = async () => {
  try {
    const response = await axios.get(`${API_HISTORIAL}/reporte-completo`, getAuthConfig());
    console.log("Donations REPORTE API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching donations:", error);
    return [];
  }
};

export const fetchDonacionPorId = async (id) => {
  const url = `${API_HISTORIAL}/reporte-completo/${id}`;
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: getAuthConfig().headers,
    });

    if (!response.ok) {
      throw new Error("Error al obtener la donación");
    }

    return await response.json();
  } catch (error) {
    console.error("Error en fetchDonacionPorId:", error);
    throw error;
  }
};
