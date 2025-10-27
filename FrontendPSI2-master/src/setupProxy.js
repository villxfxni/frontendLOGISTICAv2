const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function(app) {
  app.use(
    "/api/catalogo",
    createProxyMiddleware({
      target: "https://backenddonaciones.onrender.com",
      changeOrigin: true,
      secure: true,
    })
  ),
  app.use(
    "/solicitudes-sin-responder",
    createProxyMiddleware({
       target: "http://192.168.0.18:8082",
       // target: "http://das-back.local",
        changeOrigin: true,
        secure: false,
    })
    ),
    app.use(
    "/solicitudes/resumen",
    createProxyMiddleware({
       target: "http://192.168.0.18:8082",
       // target: "http://das-back.local",
        changeOrigin: true,
        secure: false,
    })
    );
};
