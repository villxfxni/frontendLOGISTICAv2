
export const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    
    return {
        "Content-Type": "application/json",
        "Authorization": token ? `Bearer ${token}` : ""
    };
};


export const getAuthHeadersWithContentType = (contentType = "application/json") => {
    const token = localStorage.getItem('authToken');
    
    return {
        "Content-Type": contentType,
        "Authorization": token ? `Bearer ${token}` : ""
    };
};


export const getAuthConfig = (additionalConfig = {}) => {
    return {
        headers: getAuthHeaders(),
        withCredentials: false,
        ...additionalConfig
    };
}; 