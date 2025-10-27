import axios from "axios";
import { getAuthConfig } from "../Components/Common/authHeaders";
import { API_BASE } from "../config/apiBase.js";

const API_SEGUIMIENTOS = `${API_BASE}/seguimientodonaciones`;

export const fetchSeguimientos = async () => {
  try {
    const response = await axios.get(`${API_SEGUIMIENTOS}/completos`, getAuthConfig());
    return response.data;
  } catch (error) {
    console.error("Error al obtener seguimientos:", error);
    return [];
  }
};

export const donacionesEntregadas = async () => {
  try {
    const response = await axios.get(
      `${API_SEGUIMIENTOS}/contar-entregadas`,
      getAuthConfig()
    );
    console.log("Total donaciones entregadas:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error al obtener donaciones entregadas:", error);
    return 0;
  }
};
