import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../Style.css";
import { getDonacionesConDonantes } from "../../Services/metricasService.js";
import Header from "../Common/Header.jsx";


const formatDate = (dateString) => {
    if (!dateString) return "No asignada";
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
};


const DonationCard = ({ donation }) => {
    const [isFavorite, setIsFavorite] = useState(false);

    const getDonantesCount = () => {
        return donation.donantes ? donation.donantes.length : 0;
    };

    const getGratitudeMessage = () => {
        const count = getDonantesCount();
        if (count === 0) {
            return "Esperando donantes solidarios";
        } else if (count === 1) {
            const donante = donation.donantes[0];
            return `Gracias a ${donante.nombres} ${donante.apellido_paterno} por su generoso apoyo`;
        } else if (count <= 3) {
            const nombresCompletos = donation.donantes.map(d => `${d.nombres} ${d.apellido_paterno}`).join(", ");
            return `Gracias a ${nombresCompletos} por su generoso apoyo`;
        } else {
            const primeros = donation.donantes.slice(0, 2).map(d => `${d.nombres} ${d.apellido_paterno}`).join(", ");
            return `Gracias a ${primeros} y ${count - 2} personas más por su generoso apoyo`;
        }
    };

    const handleFavoriteToggle = () => {
        setIsFavorite(!isFavorite);
    };

    return (
        <div className="glass-card overflow-hidden position-relative"
             style={{
                 borderRadius: "20px",
                 height: "100%",
                 transition: "transform 0.3s ease, box-shadow 0.3s ease",
                 border: "1px solid rgba(255, 255, 255, 0.1)",
                 boxShadow: "0 12px 40px rgba(0, 0, 0, 0.15)",
                 background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
                 backdropFilter: "blur(10px)"
             }}
             onMouseEnter={(e) => {
                 e.currentTarget.style.transform = "translateY(-5px)";
                 e.currentTarget.style.boxShadow = "0 20px 50px rgba(0, 0, 0, 0.2)";
             }}
             onMouseLeave={(e) => {
                 e.currentTarget.style.transform = "translateY(0)";
                 e.currentTarget.style.boxShadow = "0 12px 40px rgba(0, 0, 0, 0.15)";
             }}>

            <div className="position-relative" style={{ height: "250px", overflow: "hidden" }}>
                {donation.imagen ? (
                    <img 
                        src={`${donation.imagen}`} 
                        className="w-100 h-100"
                        alt="Donación entregada" 
                        style={{
                            objectFit: "cover",
                            filter: "brightness(0.9) contrast(1.1)"
                        }}
                    />
                ) : (
                    <div className="w-100 h-100 d-flex align-items-center justify-content-center"
                         style={{
                             background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
                         }}>
                        <img 
                            src="/boxbox.png" 
                            alt="Esperando entrega" 
                            style={{
                                maxWidth: "120px",
                                maxHeight: "120px",
                                opacity: "0.7"
                            }}
                        />
                    </div>
                )}
                
                <div className="position-absolute bottom-0 start-0 w-100 h-50"
                     style={{
                         background: "linear-gradient(transparent, rgba(0,0,0,0.7))"
                     }}>
                </div>
            </div>

            <div className="p-4 text-white">
                <div className="text-center mb-3">
                    <h5 className="fw-bold mb-2" style={{ fontSize: "1.2rem" }}>
                        Donación {donation.codigo}
                    </h5>
                </div>

                <div className="text-center mb-3 px-2">
                    <p className="mb-0 fst-italic text-warning" 
                       style={{ 
                           fontSize: "0.95rem", 
                           lineHeight: "1.4",
                           fontWeight: "500"
                       }}>
                        "{getGratitudeMessage()}"
                    </p>
                </div>

                <div className="mb-3">
                    <div className="d-flex align-items-center justify-content-center mb-2">
                        <i className="bi bi-people-fill me-2 text-info"></i>
                        <span className="small text-light">
                            {getDonantesCount()} {getDonantesCount() === 1 ? 'donante' : 'donantes'} registrados
                        </span>
                    </div>

                    <div className="d-flex align-items-center justify-content-center">
                        <i className="bi bi-calendar-heart me-2 text-info"></i>
                        <span className="small text-light opacity-75">
                            {donation.fechaEntrega ? 
                                `Entregada: ${formatDate(donation.fechaEntrega)}` : 
                                'Pendiente de entrega'
                            }
                        </span>
                    </div>
                </div>

                <div className="text-center">
                    <button
                        className="btn btn-link p-0"
                        onClick={handleFavoriteToggle}
                        style={{
                            fontSize: "2rem",
                            transition: "all 0.3s ease",
                            border: "none",
                            background: "none"
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = "scale(1.2)";
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = "scale(1)";
                        }}
                    >
                        <i className={`bi ${isFavorite ? 'bi-heart-fill' : 'bi-heart'}`}
                           style={{
                               color: isFavorite ? "#ff6b6b" : "#ffffff",
                               filter: isFavorite ? "drop-shadow(0 0 8px rgba(107, 129, 255, 0.6))" : "none"
                           }}>
                        </i>
                    </button>
                </div>
            </div>
        </div>
    );
};

const GaleriaDonaciones = () => {
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [dateFilter, setDateFilter] = useState("Recientes");

    useEffect(() => {
        const fetchDonationsData = async () => {
            try {
                setLoading(true);
                
                const donacionesData = await getDonacionesConDonantes();
                
                setDonations(donacionesData);
                setError(null);
                
            } catch (err) {
                console.error("Error al obtener donaciones:", err);
                setError("Error al cargar las donaciones. Intente nuevamente más tarde.");
            } finally {
                setLoading(false);
            }
        };

        fetchDonationsData();
    }, []);

    const filteredDonations = [...donations]
        .filter(donation => donation.imagen && donation.imagen.trim() !== '')
        .sort((a, b) => {
            const dateA = a.fechaEntrega ? new Date(a.fechaEntrega) : new Date(a.idDonacion * 1000000);
            const dateB = b.fechaEntrega ? new Date(b.fechaEntrega) : new Date(b.idDonacion * 1000000);
            
            return dateFilter === "Recientes"
                ? dateB - dateA
                : dateA - dateB;
        });

    if (loading) {
        return (
            <div className="list-div">
                <Header />
                <div className="flex-grow-1 m-1">
                    <div className="container-fluid h-100 d-flex justify-content-center align-items-center">
                        <div className="w-100 w-md-75 h-100 p-2 m-1 m-md-3" style={{maxWidth:'1200px', width:'100%'}}>
                            <div className="rounded pt-3 pb-3 ms-1 ms-md-3 me-1 me-md-3">
                                <h3 className="text-center mt-2 mb-4 fs-3 text-white fw-semibold">
                                    Galería de Agradecimientos
                                </h3>
                                
                                
                                <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
                                    <div className="glass-card p-5 text-center">
                                        <div className="spinner-border text-warning mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                                            <span className="visually-hidden">Cargando...</span>
                                        </div>
                                        <p className="text-white mb-0 fs-5">Cargando galería de donaciones...</p>
                                        <p className="text-light opacity-75 mt-2 mb-0 small">Por favor, espere un momento</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="list-div">
                <Header />
                <div className="flex-grow-1 m-1">
                    <div className="container-fluid h-100 d-flex justify-content-center align-items-center">
                        <div className="w-100 w-md-75 h-100 p-2 m-1 m-md-3" style={{maxWidth:'1200px', width:'100%'}}>
                            <div className="rounded pt-3 pb-3 ms-1 ms-md-3 me-1 me-md-3">
                                <h3 className="text-center mt-2 mb-4 fs-3 text-white fw-semibold">
                                    Galería de Agradecimientos
                                </h3>
                                
                                
                                <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
                                    <div className="glass-card p-5 text-center">
                                        <div className="alert alert-danger mb-0" role="alert">
                                            <i className="bi bi-exclamation-triangle me-2 fs-4"></i>
                                            <div className="mt-2">
                                                <strong>Error al cargar la galería</strong>
                                                <p className="mb-0 mt-2">{error}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="list-div">
            <Header />
            <div className="flex-grow-1 m-1">
                <div className="container-fluid h-100 d-flex justify-content-center align-items-center">
                    <div className="w-100 w-md-75 h-100 p-2 m-1 m-md-3 rounded" style={{maxWidth:'1200px', width:'100%'}}>
                        
                        <div className="rounded pt-3 pb-3 ms-1 ms-md-3 me-1 me-md-3">
                            <h3 className="text-center mt-2 mb-2 fs-3 text-white fw-semibold">
                                Galería de Agradecimientos
                            </h3>
                            <p className="text-center text-light opacity-75 mb-0 px-3">
                                Recordando a las personas generosas que hicieron posible cada donación
                            </p>
                            
                            
                            <div className="d-flex flex-wrap justify-content-center gap-2 mt-4">
                                <div className="btn-group">
                                    <button
                                        type="button"
                                        className={`btn ${dateFilter === "Recientes" ? "btn-mine" : "btn-outline-mine"}`}
                                        onClick={() => setDateFilter("Recientes")}
                                    >
                                        Recientes
                                    </button>
                                    <button
                                        type="button"
                                        className={`btn ${dateFilter === "Antiguos" ? "btn-mine" : "btn-outline-mine"}`}
                                        onClick={() => setDateFilter("Antiguos")}
                                    >
                                        Antiguos
                                    </button>
                                </div>
                            </div>
                        </div>

                        {filteredDonations.length > 0 ? (
                            <div className="row g-3 justify-content-center p-1 p-md-3">
                                {filteredDonations.map((donation) => (
                                    <div key={donation.idDonacion} className="col-12 col-md-6 col-lg-4">
                                        <DonationCard
                                            donation={donation}
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center p-5">
                                <p className="text-white">No hay donaciones con imágenes disponibles</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GaleriaDonaciones;