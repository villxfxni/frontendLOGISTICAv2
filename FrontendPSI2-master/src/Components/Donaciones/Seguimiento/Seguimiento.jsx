import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Link, useNavigate } from "react-router-dom";
import { donacionesEntregadas, fetchSeguimientos } from "../../../Services/seguimientoService.js";
import MapaSeguimiento from "./MapaSeguimiento.jsx";
import SeguimientoWebSocketListener from "./SeguimientoWebsocketListener.jsx";
import Header from '../../Common/Header.jsx';
import "../../Style.css";


const formatDateTime = (dateString) => {
    if (!dateString) return 'No disponible';
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

const SeguimientoCard = ({ seguimiento }) => {
    const [showMap, setShowMap] = useState(false);

    const hasTrackingData = seguimiento.latitud && seguimiento.longitud &&
        seguimiento.historial && seguimiento.historial.length > 0;

    const toggleMap = () => {
        setShowMap(!showMap);
    };

    
    const getEstadoColor = () => {
        if (seguimiento.estado === "Entregado") return "#28a745";
        if (seguimiento.estado === "En camino") return "#17a2b8";
        return "#6c757d"; 
    };

    return (
        <div className="glass-card p-3 mb-4 position-relative overflow-hidden"
             style={{
                 borderRadius: "16px",
                 transition: "transform 0.3s ease, box-shadow 0.3s ease",
                 border: "1px solid rgba(255, 255, 255, 0.1)"
             }}>

            <div className="position-absolute top-0 start-0 h-100"
                 style={{
                     width: "5px",
                     backgroundColor: seguimiento.estado === "Pendiente" ? "#6c757d" : "#17a2b8",
                 }}></div>

            <div className={`row ${showMap && hasTrackingData ? 'flex-nowrap' : ''}`}>
                <div className={`${showMap && hasTrackingData ? 'col-md-7' : 'col-md-12'}`}>
                    <div className="row align-items-center">

                        <div className="col-md-3 mb-3 mb-md-0 text-center text-md-start">
                            {seguimiento.imagenEvidencia ? (
                                <img src={`${seguimiento.imagenEvidencia}`} className="img-fluid rounded" alt="Donación"
                                     style={{ width: "100%", maxWidth: "160px", height: "auto", maxHeight: "160px", objectFit: "cover" }} />
                            ) : (
                                <img src="/boxboxbox.png" className="img-fluid rounded bg-dark p-2" alt="Truck"
                                     style={{ width: "100%", maxWidth: "160px", height: "auto", maxHeight: "160px", objectFit: "contain" }} />
                            )}
                        </div>

                        <div className="col-md-9">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <h5 className="card-title fw-bold text-white ps-2">
                                    <i className="bi bi-box-seam me-2"></i>
                                    Donación #{seguimiento.codigo || seguimiento.idDonacion}
                                </h5>
                                <span className="badge rounded-pill px-3 py-2"
                                      style={{
                                          backgroundColor: seguimiento.estado === "Pendiente" ? "#6c757d" : "#17a2b8",
                                          fontSize: "0.8rem"
                                      }}>
                                  {seguimiento.estado || 'Desconocido'}
                                </span>
                            </div>

                            <div className="row ps-2">
                                <div className="col-12">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <p className="mb-2 text-white">
                                                <i className="bi bi-person me-2 text-light"></i>
                                                <span
                                                    className="text-light opacity-75">Encargado:</span> {seguimiento.ciUsuario || 'No asignado'}
                                            </p>
                                            <p className="mb-2 text-white">
                                                <i className="bi bi-geo-alt me-2 text-light"></i>
                                                <span
                                                    className="text-light opacity-75">Origen:</span> {seguimiento.origen || 'No especificado'}
                                            </p>
                                            <p className="mb-2 text-white">
                                                <i className="bi bi-geo-alt-fill me-2 text-light"></i>
                                                <span
                                                    className="text-light opacity-75">Destino:</span> {seguimiento.destino || 'No especificado'}
                                            </p>
                                            <p className="mb-2 text-white">
                                                <i className="bi bi-calendar-event me-2 text-light"></i>
                                                <span
                                                    className="text-light opacity-75">Actualización:</span> {formatDateTime(seguimiento.timestamp)}
                                            </p>
                                        </div>

                                    </div>

                                    {hasTrackingData && (
                                        <div className="text-end mt-1">
                                            <button
                                                className="btn btn-sm btn-outline-light rounded-pill"
                                                onClick={toggleMap}
                                            >
                                                <i className={`bi ${showMap ? 'bi-map' : 'bi-map-fill'} me-2`}></i>
                                                {showMap ? 'Ocultar mapa' : 'Ver ruta en mapa'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                
                {showMap && hasTrackingData && (
                    <div className="col-md-5 ps-0 pe-2">
                        <div className="map-container h-100" style={{ minHeight: "250px", borderRadius: "8px", overflow: "hidden" }}>
                            <MapaSeguimiento seguimiento={seguimiento} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const Seguimiento = () => {
    const [seguimientos, setSeguimientos] = useState([]);
    const [loading, setLoading] = useState(true);

    
    useEffect(() => {
        const cargarSeguimientos = async () => {
            setLoading(true);
            try {
                const data = await fetchSeguimientos();
                setSeguimientos(data);
            } catch (error) {
                console.error("Error al cargar seguimientos:", error);
            } finally {
                setLoading(false);
            }
        };
        cargarSeguimientos();
    }, []);



    const recargarSeguimientosDesdeWS = (nuevos) => {
        setSeguimientos(nuevos);
    };

    return (
        <div className="list-div">
            <Header />
            <SeguimientoWebSocketListener onRecargarSeguimientos={recargarSeguimientosDesdeWS} />

            <div className="flex-grow-1">
                <div className="container-fluid h-100 d-flex justify-content-center align-items-start pt-4">
                    <div className="w-100 px-3 px-md-4" style={{ maxWidth: '1200px' }}>
                        <div className=" rounded-4 p-4 mb-4">
                            <div className="row align-items-center">
                                <div className="col-md-7">
                                    <h3 className="fs-2 fw-bold text-white mb-3">Seguimiento de Donaciones</h3>
                                    <div className="d-flex flex-wrap gap-4">
                                        <div className="d-flex align-items-center">
                                              <span style={{
                                                  display: 'inline-block',
                                                  width: '15px',
                                                  height: '15px',
                                                  borderRadius: '50%',
                                                  backgroundColor: '#6c757d',
                                                  marginRight: '8px'
                                              }}></span>
                                            <span className="text-light">Pendiente</span>
                                        </div>
                                        <div className="d-flex align-items-center">
                                          <span style={{
                                              display: 'inline-block',
                                              width: '15px',
                                              height: '15px',
                                              borderRadius: '50%',
                                              backgroundColor: '#17a2b8',
                                              marginRight: '8px'
                                          }}></span>
                                            <span className="text-light">En Camino</span>
                                        </div>
                                        <div className="d-flex align-items-center">
                                          <span style={{
                                              display: 'inline-block',
                                              width: '15px',
                                              height: '15px',
                                              borderRadius: '50%',
                                              backgroundColor: '#28a745',
                                              marginRight: '8px'
                                          }}></span>
                                            <span className="text-light">Entregado</span>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                        {loading ? (
                            <div className="d-flex justify-content-center align-items-center" style={{ height: "300px" }}>
                                <div className="text-center">
                                    <div className="spinner-border text-light" role="status">
                                        <span className="visually-hidden">Cargando...</span>
                                    </div>
                                    <p className="mt-3 text-white">Cargando seguimientos...</p>
                                </div>
                            </div>
                        ) : seguimientos.length > 0 ? (
                            <div className="row">
                                {seguimientos.map((seguimiento, index) => (
                                    <div key={index} className="col-12">
                                        <SeguimientoCard seguimiento={seguimiento} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="glass-panel rounded-4 p-5 text-center" style={{ backgroundColor: 'rgba(33, 37, 41, 0.7)' }}>
                                <i className="bi bi-truck fs-1 text-light mb-3 d-block"></i>
                                <p className="fs-5 text-white mb-0">No hay donaciones en seguimiento disponibles</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Seguimiento;
