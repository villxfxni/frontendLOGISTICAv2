import axios from "axios";
import { getAuthConfig } from "../Components/Common/authHeaders";
import { API_BASE } from "../config/apiBase.js";

const API_DONACIONES = `${API_BASE}/donaciones`;

export const fetchDonations = async () => {
  try {
    const response = await axios.get(`${API_DONACIONES}`, getAuthConfig());
    console.log("Donations API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching donations:", error);
    return [];
  }
};

export const actualizarEstadoDonacion = async (
  idDonacion,
  ciUsuario,
  estado,
  imagenBase64,
  latitud,
  longitud
) => {
  console.log("Actualizando estado de donación:", {
    idDonacion,
    ciUsuario,
    estado,
    imagenBase64,
    latitud,
    longitud,
  });

  try {
    const response = await axios.post(
      `${API_DONACIONES}/actualizar/${idDonacion}`,
      {
        ciUsuario,
        estado,
        imagen: imagenBase64,
        latitud,
        longitud,
      },
      getAuthConfig()
    );

    console.log("Respuesta de actualización:", response.data);
    return response.data;
  } catch (error) {
    if (error.response?.data?.error) {
      const mensaje = error.response.data.error;
      console.warn("Mensaje del servidor:", mensaje);
      alert(mensaje);
      throw new Error(mensaje);
    } else {
      console.error("Error inesperado:", error);
      throw new Error("Ocurrió un error inesperado al actualizar la donación.");
    }
  }
};

export const cambiarDestinoDonacion = async (idDonacion, destinoDto) => {
  console.log("Cambiando destino de donación:", { idDonacion, ...destinoDto });

  try {
    const response = await axios.post(
      `${API_DONACIONES}/cambiar-destino/${idDonacion}`,
      destinoDto,
      getAuthConfig()
    );

    console.log("Respuesta de cambio de destino:", response.data);
    return response.data;
  } catch (error) {
    if (error.response?.data?.error) {
      const mensaje = error.response.data.error;
      console.warn("Mensaje del servidor:", mensaje);
      alert(mensaje);
      throw new Error(mensaje);
    } else {
      console.error("Error inesperado:", error);
      throw new Error("Ocurrió un error inesperado al cambiar el destino de la donación.");
    }
  }
};
