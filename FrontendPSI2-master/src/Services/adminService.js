import axios from "axios";
import { getAuthConfig } from "../Components/Common/authHeaders";
import { API_HTTP_BASE } from "../config/apiBase.js";


export const fetchNonAdminUsers = async () => {
  try {
    const response = await axios.get(`${API_HTTP_BASE}/noAdmin`, getAuthConfig());
    return response.data;
  } catch (error) {
    console.error("Error fetching non-admin users:", error);
    throw error;
  }
};

export const toggleUserActiveStatus = async (userId) => {
  try {
    const response = await axios.post(
      `${API_HTTP_BASE}/active/${userId}`,
      {},
      getAuthConfig()
    );
    return response.data;
  } catch (error) {
    console.error("Error toggling user active status:", error);
    throw error;
  }
};

export const promoteUserToAdmin = async (userId) => {
  try {
    const response = await axios.post(
      `${API_HTTP_BASE}/admin/${userId}`,
      {},
      getAuthConfig()
    );
    return response.data;
  } catch (error) {
    console.error("Error promoting user to admin:", error);
    throw error;
  }
};
