
// Dirección base de Spring Boot
const API_BASE ='http://localhost:8082';

//const API_BASE ='http://192.168.0.18:8082';
//const API_BASE ='http://das-back.local';

// Endpoints base
const API_HTTP_BASE  = `${API_BASE}/api`;   // http://192.168.0.18:8082/api
const AUTH_HTTP_BASE = `${API_BASE}/auth`;  // http://192.168.0.18:8082/auth

// WebSocket base
const WS_PATH = import.meta.env.VITE_WS_BASE || '/api/ws';
const WS_URL  = `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}${WS_PATH}`;

export { API_HTTP_BASE, AUTH_HTTP_BASE, WS_PATH, WS_URL,API_BASE };
