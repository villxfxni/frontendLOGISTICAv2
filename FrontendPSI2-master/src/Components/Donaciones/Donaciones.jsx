import React, { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {Link, useNavigate } from "react-router-dom";
import '../Style.css';
import { fetchDonations, actualizarEstadoDonacion, cambiarDestinoDonacion } from "../../Services/donacionService.js";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Header from "../Common/Header.jsx";
import DetalleDonacionModal from "./DetalleDonacionModal";
import { fetchDonacionPorId } from "../../Services/donacionReporteService.js";


const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
};

const formatDateTime = (dateString) => {
    if (!dateString) return 'No disponible';
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

const defaultIcon = L.icon({
    iconUrl: '/camionc.png',
    iconSize: [35, 35],
    iconAnchor: [17, 17],
    popupAnchor: [0, -11]
});

L.Marker.prototype.options.icon = defaultIcon;


const DonationCard = ({donation, onActualizarClick, onOpenModal, onShowDetail}) => {
    const estado = donation.fechaEntrega ? "Entregado" : "En Espera";
    return (
      <div
        className="glass-card p-3 mb-3 position-relative overflow-hidden"
        style={{
          borderRadius: "16px",
          height: "100%",
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
          border: `1px solid rgba(255, 255, 255, 0.1)`,
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div
          className="position-absolute top-0 start-0 h-100"
          style={{
            width: "5px",
            backgroundColor: estado === "Entregado" ? "#000000" : "#dc3545",
          }}
        ></div>

        <div className="card-body d-flex flex-column text-start text-white">
          <div className="d-flex justify-content-between align-items-start">
            <h5 className="fw-bold mb-3 ps-3">{donation.nombre}</h5>
            <span
              className="badge"
              style={{
                backgroundColor: estado === "Entregado" ? "#000000" : "#dc3545",
                color: "white",
                padding: "6px 12px",
                borderRadius: "50px",
                fontSize: "0.75rem",
                fontWeight: "500",
              }}
            >
              {estado}
            </span>
          </div>

          <div className="ps-3">
            <div className="mb-2 d-flex align-items-center">
              <i className="bi bi-box-seam me-2 text-white"></i>
              <p className="card-text mb-0 text-white">
                <span className="text-light opacity-75">Aprobado:</span>{" "}
                {formatDate(donation.fechaAprobacion)}
              </p>
            </div>

            <div className="mb-2 d-flex align-items-center">
              <i className="bi bi-person-badge me-2 text-white"></i>
              <p className="card-text mb-0 text-white">
                <span className="text-light opacity-75">Cod. Encargado:</span>{" "}
                {donation.encargado}
              </p>
            </div>

            {donation.fechaEntrega && (
              <div className="mb-2 d-flex align-items-center">
                <i className="bi bi-calendar-check me-2 text-white"></i>
                <p className="card-text mb-0 text-white">
                  <span className="text-light opacity-75">Entregado:</span>{" "}
                  {formatDateTime(donation.fechaEntrega)}
                </p>
              </div>
            )}

            <div className="d-flex justify-content-between align-items-center mt-3">
              <button
                className="btn btn-link p-0 text-decoration-none text-info"
                onClick={() => onActualizarClick(donation)}
                data-bs-toggle="modal"
                data-bs-target="#opcionesModal"
                disabled={
                  donation.fechaEntrega ||
                  donation.estado === "Iniciando armado de paquete" ||
                  donation.estado === "Pendiente"
                }
                hidden={
                  donation.fechaEntrega ||
                  donation.estado === "Iniciando armado de paquete" ||
                  donation.estado === "Pendiente"
                }
              >
                <i className="bi bi-arrow-repeat me-1"></i> Actualizar
              </button>
              <button
                className="btn btn-link p-0 text-decoration-none text-info"
                onClick={() => onShowDetail(donation)}
              >
                <i className="bi bi-info-circle me-1"></i> Detalle
              </button>
            </div>

            <div className="mt-3">
              {donation.imagen ? (
                <img
                  src={`${donation.imagen}`}
                  className="card-img-top mt-2 img-fluid"
                  alt="Donación"
                  style={{ borderRadius: "8px" }}
                />
              ) : (
                <img
                  src="/boxbox.png"
                  className="card-img-bottom mt-2 img-fluid"
                  alt="Truck"
                  style={{
                    borderRadius: "8px",
                    maxWidth: "300px",
                    maxHeight: "200px",
                    alignSelf: "center",
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    );

};

const Donaciones = () => {
    const [filter, setFilter] = useState("Todos");
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDonation, setSelectedDonation] = useState(null);
    const [nuevoEstado, setNuevoEstado] = useState("Pendiente");
    const [imagen, setImagen] = useState(null);
    const [imagenBase64, setImagenBase64] = useState(null);
    const [imageError, setImageError] = useState("");
    const [sendError, setSendError] = useState("");
    const [userLocation, setUserLocation] = useState(null);
    const [locationError, setLocationError] = useState("");
    const [locationAccuracy, setLocationAccuracy] = useState(null);
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [selectedOption, setSelectedOption] = useState(1);
    const [modalOpen, setModalOpen] = useState(false);
    const [mapKey, setMapKey] = useState(0);
    const modalOpenTimeRef = useRef(null);
    const watchPositionId = useRef(null);
    const [showModal, setShowModal] = useState(false);
    const [donacionSeleccionada, setDonacionSeleccionada] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);

    
    const [comunidad, setComunidad] = useState("");
    const [provincia, setProvincia] = useState("");
    const [direccion, setDireccion] = useState("");

    
    const handleLocationUpdate = async (location) => {
        const { lat, lng } = location;
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&zoom=18&accept-language=es`);
            const data = await response.json();
            const address = data.address;
            
            let provinciaExtraida = '';
            if (address.state && address.state.includes('Santa Cruz')) {
                provinciaExtraida = address.county || '';
            } else {
                provinciaExtraida = address.state || '';
            }
            
            const addressComponents = [];
            if (address.building) addressComponents.push(address.building);
            if (address.house_number) addressComponents.push(`Nº ${address.house_number}`);
            if (address.road) addressComponents.push(address.road);
            if (address.neighbourhood) addressComponents.push(`Barrio ${address.neighbourhood}`);
            if (address.suburb) addressComponents.push(address.suburb);
            
            const localidad = address.city || address.town || address.village || address.hamlet || address.municipality || '';
            
            const direccionCompleta = addressComponents.join(', ');
            
            setProvincia(provinciaExtraida);
            setComunidad(localidad);
            setDireccion(direccionCompleta || data.display_name || 'Dirección no disponible');
            
        } catch (error) {
            console.error("Error al obtener información de la dirección:", error);
            setDireccion(`Coordenadas: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        }
    };

    const handleSubmitDireccion = async (e) => {
        e.preventDefault();
        setSendError("");

        if (!selectedDonation || !selectedDonation.id) {
            setSendError("No se ha seleccionado una donación válida.");
            return;
        }

        if (!userLocation) {
            setSendError("No se pudo obtener la ubicación.");
            return;
        }

        const destinoDto = {
            direccion: direccion || 'Dirección no disponible',
            provincia: provincia || 'Provincia no disponible',
            comunidad: comunidad || 'Comunidad no disponible',
            latitud: userLocation.lat,
            longitud: userLocation.lng
        };

        try {
            await cambiarDestinoDonacion(selectedDonation.id, destinoDto);
            document.getElementById("cerrarModalDireccion").click();
            
            setSuccessMessage("Dirección actualizada correctamente");
            setShowSuccessMessage(true);
            
            setTimeout(() => {
                setShowSuccessMessage(false);
            }, 3000);
            
            setLoading(true);
            try {
                const data = await fetchDonations();
                const formatted = data.map(donation => ({
                    id: donation.idDonacion,
                    nombre: donation.codigo,
                    encargado: donation.encargado?.ci,
                    imagen: donation.imagen,
                    fechaEntrega: donation.fechaEntrega,
                    fechaAprobacion: donation.fechaAprobacion,
                    estado: donation.estado
                }));
                setDonations(formatted);
            } catch (error) {
                console.error("Error al recargar donaciones:", error);
            } finally {
                setLoading(false);
            }
            
        } catch (err) {
            setSendError(err.message);
        }
    };
    useEffect(() => {
        if (selectedDonation) {
            setComunidad(selectedDonation.comunidadDestino || "");
            setProvincia(selectedDonation.provinciaDestino || "");
            setDireccion(selectedDonation.direccionDestino || "");
        }
    }, [selectedDonation]);


    const onShowDetail = async (donation) => {
        try {
            const detalle = await fetchDonacionPorId(donation.id);
            setDonacionSeleccionada(detalle);
            setShowModal(true);
        } catch (error) {
            console.error("Error al cargar detalle de donación:", error);
        }
    };
    useEffect(() => {
        const loadDonations = async () => {
            setLoading(true);
            try {
                const data = await fetchDonations();
                const formatted = data.map(donation => ({
                    id: donation.idDonacion,
                    nombre: donation.codigo,
                    encargado: donation.encargado?.ci,
                    imagen: donation.imagen,
                    fechaEntrega: donation.fechaEntrega,
                    fechaAprobacion: donation.fechaAprobacion,
                    estado: donation.estado
                }));
                setDonations(formatted);
            } catch (error) {
                console.error("Error al cargar donaciones:", error);
            } finally {
                setLoading(false);
            }
        };

        loadDonations();
    }, []);
    useEffect(() => {

        return () => {
            if (watchPositionId.current) {
                navigator.geolocation.clearWatch(watchPositionId.current);
                watchPositionId.current = null;
            }
        };
    }, []);
    /**    const getAccurateLocation = () => {
        if (!("geolocation" in navigator)) {
            setLocationError("Su navegador no soporta geolocalización.");
            return;
        }

        setIsGettingLocation(true);
        setLocationError("");

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const newLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                setUserLocation(newLocation);
                setLocationAccuracy(position.coords.accuracy);
                setLocationError("");
                setIsGettingLocation(false);

                if (watchPositionId.current) {
                    navigator.geolocation.clearWatch(watchPositionId.current);
                    watchPositionId.current = null;
                }
            },
            (error) => {
                console.error("Error obteniendo ubicación:", error);
                setLocationError("No se pudo obtener la ubicación.");
                setIsGettingLocation(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0
            }
        );
    };
*/
const DEFAULT_LOCATION = { lat: -17.72192423721716, lng: -63.17459766441773};
const getApproximateLocation = async () => {
  try {
    const res = await fetch('http://ip-api.com/json/');
    const data = await res.json();

    if (data.status === 'success' && data.lat && data.lon) {
      const newLocation = { lat: data.lat, lng: data.lon };

      const distanceFromSantaCruz = Math.abs(newLocation.lat - DEFAULT_LOCATION.lat) +
                                    Math.abs(newLocation.lng - DEFAULT_LOCATION.lng);

      if (distanceFromSantaCruz > 1) {
        console.warn("Usando ubicacion base - Santa Cruz");
        setUserLocation(DEFAULT_LOCATION);
      } else {
        setUserLocation(newLocation);
      }
    } else {
      console.warn("Ubicacion no disponible - Usando ubicacion base - Santa Cruz");
      setUserLocation(DEFAULT_LOCATION);
    }

    setLocationAccuracy(10000);
    setLocationError("");
  } catch (error) {
    console.error("Error obteniendo ubicacion aproximada:", error);
    setUserLocation(DEFAULT_LOCATION);
    setLocationAccuracy(10000);
    setLocationError("");
  }
};


    const filteredDonations = donations.filter((donation) => {
        const estado = donation.fechaEntrega ? "Entregado" : "No Entregado";
        return filter === "Todos" || estado === filter;
    });

    const handleActualizarClick = (donation) => {
        setSelectedDonation(donation);
        setNuevoEstado(donation.fechaEntrega ? "Entregado" : "Pendiente");
        setImagen(null);
        setImagenBase64(null);
        setLocationError("");
        setModalOpen(true);
        modalOpenTimeRef.current = Date.now();
        getApproximateLocation();

    };

    useEffect(() => {
        if (modalOpen && modalOpenTimeRef.current) {
            const refreshTimeout = setTimeout(() => {
                setMapKey(prev => prev + 1);
                console.log("Mapa refrescado después de mostrar modal");
            }, 800);

            return () => {
                clearTimeout(refreshTimeout);
            };
        }
    }, [modalOpen]);

    useEffect(() => {
        const handleModalClose = () => {
            setModalOpen(false);
            modalOpenTimeRef.current = null;
        };

        const modalElement = document.getElementById('estadoModal');
        if (modalElement) {
            modalElement.addEventListener('hidden.bs.modal', handleModalClose);
            return () => {
                modalElement.removeEventListener('hidden.bs.modal', handleModalClose);
            };
        }
    }, []);

    const handleSubmitEstado = async (e) => {
        e.preventDefault();

        if (nuevoEstado === "Entregado" && !imagenBase64) {
            setImageError("Debe seleccionar una imagen para continuar.");
            return;
        } else {
            setImageError("");
        }
        if (!userLocation || !userLocation.lat || !userLocation.lng) {
            setLocationError("No se pudo obtener su ubicación. No se puede actualizar el estado.");
            return;
        }

        try {
            console.log("Enviando actualización con coordenadas:", {
                lat: userLocation.lat,
                lng: userLocation.lng
            });

            const updated = await actualizarEstadoDonacion(
                selectedDonation.id,
                selectedDonation.encargado,
                nuevoEstado,
                imagenBase64,
                userLocation.lat,  
                userLocation.lng
            );

            const newImage = nuevoEstado === "Entregado" ? updated.imagen : selectedDonation.imagen;

            setDonations((prev) =>
                prev.map((d) =>
                    d.id === selectedDonation.id
                        ? {
                            ...d,
                            fechaEntrega: nuevoEstado === "Entregado" ? new Date().toISOString() : null,
                            encargado: selectedDonation.encargado,
                            imagen: newImage
                        }
                        : d
                )
            );

            document.getElementById("cerrarModal").click();
        } catch (error) {
            console.error("Error al actualizar donación:", error);
            setSendError("Error al Actualizar. Verifique su conexión e intente nuevamente.");
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImagen(file);

            const reader = new FileReader();
            reader.onloadend = () => {
                setImagenBase64(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const LocationMap = ({ location }) => {
        const [position, setPosition] = useState(location);
        const [accuracy, setAccuracy] = useState(locationAccuracy);
        const [address, setAddress] = useState("");
        const accuracyCircleRef = useRef(null);
        const mapRef = useRef(null);
        
        const oldDestination = selectedDonation?.solicitud?.destino;
        const oldPosition = oldDestination ? {
            lat: oldDestination.latitud,
            lng: oldDestination.longitud
        } : null;

        const fetchAddress = async (lat, lng) => {
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&zoom=18&accept-language=es`
                );
                const data = await response.json();
                if (data && data.display_name) {
                    setAddress(data.display_name);
                }
                await handleLocationUpdate({ lat, lng });
            } catch (error) {
                console.error("Error fetching address:", error);
            }
        };

        const getZoomLevelBasedOnAccuracy = (accuracyInMeters) => {
            if (accuracyInMeters < 10) return 17;
            if (accuracyInMeters < 50) return 16;
            if (accuracyInMeters < 100) return 15;
            if (accuracyInMeters < 500) return 14;
            if (accuracyInMeters < 1000) return 13;
            return 12;
        };

        const markerIcon = new L.Icon({
            iconUrl: "/camionc.png",
            iconSize: [35, 35],
            iconAnchor: [17, 17],
            popupAnchor: [0, -11]
        });

        const oldLocationIcon = new L.Icon({
            iconUrl: "/caja.svg",
            iconSize: [30, 30],
            iconAnchor: [15, 15],
            popupAnchor: [0, -15]
        });
        const LocationMarker = () => {
            const map = useMapEvents({
                locationfound(e) {
                    const newPos = e.latlng;
                    setPosition(newPos);
                    setAccuracy(e.accuracy);
                    setUserLocation(newPos);
                    setLocationAccuracy(e.accuracy);

                    const zoomLevel = getZoomLevelBasedOnAccuracy(e.accuracy);
                    map.flyTo(newPos, zoomLevel);
                    fetchAddress(newPos.lat, newPos.lng);

                    if (accuracyCircleRef.current) {
                        accuracyCircleRef.current.remove();
                    }

                    accuracyCircleRef.current = L.circle(newPos, {
                        radius: e.accuracy,
                        color: "#4285F4",
                        fillColor: "#4285F4",
                        fillOpacity: 0.15,
                        weight: 1
                    }).addTo(map);
                    setIsGettingLocation(false);
                },
                click(e) {
                    const newPos = e.latlng;
                    setPosition(newPos);
                    setUserLocation(newPos);
                    if (accuracyCircleRef.current) {
                        accuracyCircleRef.current.remove();
                        accuracyCircleRef.current = null;
                        setLocationAccuracy(null);
                    }

                    fetchAddress(newPos.lat, newPos.lng);
                },
            });
            useEffect(() => {
                if (position) {
                    if (accuracy && map && !accuracyCircleRef.current) {
                        accuracyCircleRef.current = L.circle(position, {
                            radius: accuracy,
                            color: "#4285F4",
                            fillColor: "#4285F4",
                            fillOpacity: 0.15,
                            weight: 1
                        }).addTo(map);

                        fetchAddress(position.lat, position.lng);
                    }
                } else if (!oldPosition) {
                    const options = {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 0
                    };
                    map.locate(options);
                } else {
                    setPosition(oldPosition);
                    setUserLocation(oldPosition);
                    fetchAddress(oldPosition.lat, oldPosition.lng);
                }
            }, []);

            return position === null ? null : (
                <Marker
                    position={position}
                    icon={markerIcon}
                    draggable={true}
                    eventHandlers={{
                        dragend: (e) => {
                            const newPos = e.target.getLatLng();
                            setPosition(newPos);
                            setUserLocation(newPos);
                            if (accuracyCircleRef.current) {
                                accuracyCircleRef.current.remove();
                                accuracyCircleRef.current = null;
                                setLocationAccuracy(null);
                            }
                            fetchAddress(newPos.lat, newPos.lng);
                        },
                    }}
                >
                    {address && (
                        <Popup>
                            <div>
                                <strong>Ubicación seleccionada:</strong>
                                <p className="mb-1">{address}</p>
                                <small className="text-muted">
                                    Lat: {position.lat.toFixed(6)}, Lng: {position.lng.toFixed(6)}
                                    {accuracy &&
                                        <span>
                                            '(Precisión: ±{accuracy.toFixed(0)}m)'
                                        </span>
                                    }
                                </small>
                            </div>
                        </Popup>
                    )}
                </Marker>
            );
        };

        if (!position && !location) return null;
        const initialPosition = position || location;
        const zoomLevel = accuracy ? getZoomLevelBasedOnAccuracy(accuracy) : 12;

        return (
            <div style={{ height: '300px', width: 'inherit', borderRadius: '8px', overflow: 'hidden' }}>
                <MapContainer
                    key={mapKey}
                    center={oldPosition ? [oldPosition.lat, oldPosition.lng] : [initialPosition.lat, initialPosition.lng]}
                    zoom={zoomLevel}
                    style={{ height: '100%', width: '100%' }}
                    dragging={true}
                    touchZoom={true}
                    doubleClickZoom={true}
                    scrollWheelZoom={true}
                    boxZoom={true}
                    keyboard={true}
                    zoomControl={true}
                    attributionControl={false}
                    ref={mapRef}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="&copy; OpenStreetMap contributors"
                    />
                    
                    {oldPosition && (
                        <Marker
                            position={[oldPosition.lat, oldPosition.lng]}
                            icon={oldLocationIcon}
                        >
                            <Popup>
                                <div>
                                    <strong>Dirección actual:</strong>
                                    <p className="mb-1">{oldDestination.direccion}</p>
                                    <p className="mb-1">{oldDestination.comunidad}, {oldDestination.provincia}</p>
                                    <small className="text-muted">
                                        Lat: {oldPosition.lat.toFixed(6)}, Lng: {oldPosition.lng.toFixed(6)}
                                    </small>
                                </div>
                            </Popup>
                        </Marker>
                    )}
                    <LocationMarker />
                </MapContainer>
                <div className="text-center mt-2 small text-muted">
                    {address && (
                        <div className="text-truncate" style={{maxWidth: '300px'}} title={address}>
                            {address}
                        </div>
                    )}
                    {accuracy && (
                        <div>Precisión: ±{accuracy.toFixed(1)} metros</div>
                    )}
                    {isGettingLocation && (
                        <div className="text-info">
                            <i className="bi bi-arrow-clockwise me-1"></i>
                            Mejorando precisión...
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (

        <div className="don-div">
            <Header/>
            
            {showSuccessMessage && (
                <div 
                    className="position-fixed top-0 start-50 translate-middle-x mt-5"
                    style={{
                        zIndex: 9999,
                        borderRadius: '10px',
                        background: 'linear-gradient(90deg, rgb(31, 32, 51), rgba(19, 21, 73, 0.93))',
                        color: 'white',
                        padding: '12px 24px',
                        border: '1px solid white',
                        fontWeight: '500'
                    }}
                >
                    <div className="d-flex align-items-center">
                        <i className="bi bi-check-circle me-2"></i>
                        {successMessage}
                    </div>
                </div>
            )}
            
            <div className="container-fluid h-100 d-flex justify-content-center align-items-center">
                <div className="w-100 w-md-75 h-100 p-2 m-1 m-md-3 rounded" style={{maxWidth: '1200px', width: '100%'}}>
                    <div className="rounded pt-3 pb-3 ms-1 ms-md-3 me-1 me-md-3">
                        <h3 className="text-center mt-2 mb-0 fs-3 text-white fw-semibold">Donaciones</h3>
                        <div className="d-flex flex-wrap justify-content-center gap-2 mt-3 mt-md-4">
                            {["Todos", "Entregado", "No Entregado"].map(category => (
                                <button
                                    key={category}
                                    className={`btn ${filter === category ? "btn-mine" : "btn-outline-mine"}`}
                                    onClick={() => setFilter(category)}
                                    style={{whiteSpace: "nowrap"}}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>

                    {loading ? (
                        <div className="d-flex justify-content-center align-items-center" style={{ height: "300px" }}>
                            <div className="text-center">
                                <div className="spinner-border text-light" role="status">
                                    <span className="visually-hidden">Cargando...</span>
                                </div>
                                <p className="mt-3 text-white">Cargando donaciones...</p>
                            </div>
                        </div>
                    ) : filteredDonations.length > 0 ? (
                        <div className="row g-4 justify-content-center p-1 p-md-3">
                            {filteredDonations.map((donation, index) => (
                                <div key={index} className="col-12 col-sm-6 col-md-4 col-lg-4">
                                    <DonationCard
                                        donation={donation}
                                        onActualizarClick={handleActualizarClick}
                                        onShowDetail={onShowDetail}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center p-5">
                            <p className="text-white">No hay donaciones disponibles</p>
                        </div>
                    )}
                </div>
            </div>
            <DetalleDonacionModal
                show={showModal}
                onHide={() => setShowModal(false)}
                donacion={donacionSeleccionada}
            />
            <div className="modal fade " id="opcionesModal" tabIndex="-1" aria-labelledby="opcionesModalLabel"
                 aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content border-0 rounded-4 shadow">
                        <div className="modal-header bg-mine text-white rounded-top-4 border-0">
                            <h5 className="modal-title fw-bold" id="opcionesModalLabel">
                                <i className="bi bi-pencil-square me-2"></i> Selecciona una acción
                            </h5>
                            <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"
                                    aria-label="Cerrar"></button>
                        </div>
                        <div className="modal-body modal-body-p bg-mine p-4">
                            <div className="row g-4 justify-content-center">
                                <div className="col-12 col-md-6 modal-body-a">
                                    <div
                                        className="glass-card h-75 p-4 position-relative text-center modal-body-a"
                                        style={{
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease-in-out',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            minHeight: '260px',
                                            borderRadius: '20px',
                                        }}
                                        data-bs-dismiss="modal"
                                        data-bs-toggle="modal"
                                        data-bs-target="#estadoModal"
                                    >
                                        <div
                                            className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3 mt-4"
                                            style={{
                                                width: '80px',
                                                height: '80px',
                                                background: 'linear-gradient(135deg, rgba(40, 167, 69, 0.2), rgba(40, 167, 69, 0.1))',
                                                border: '2px solid rgba(40, 167, 69, 0.3)'
                                            }}
                                        >
                                            <i className="bi bi-arrow-repeat text-success"
                                               style={{fontSize: '2rem'}}></i>
                                        </div>
                                        <h4 className="fw-bold text-white mb-0">Actualizar Estado</h4>
                                    </div>
                                </div>

                                <div className="col-12 col-md-6">
                                    <div
                                        className="glass-card h-100 p-4 position-relative text-center"
                                        style={{
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease-in-out',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            minHeight: '260px',
                                            borderRadius: '20px',
                                        }}
                                        data-bs-dismiss="modal"
                                        data-bs-toggle="modal"
                                        data-bs-target="#direccionModal"
                                    >
                                        <div
                                            className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3 mt-4"
                                            style={{
                                                width: '80px',
                                                height: '80px',
                                                background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.2), rgba(255, 193, 7, 0.1))',
                                                border: '2px solid rgba(255, 193, 7, 0.3)'
                                            }}
                                        >
                                            <i className="bi bi-geo-alt text-warning" style={{fontSize: '2rem'}}></i>
                                        </div>
                                        <h4 className="fw-bold text-white mb-0">Cambiar Dirección</h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="modal fade" id="direccionModal" tabIndex="-1" aria-labelledby="direccionModalLabel"
                 aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered" style={{maxWidth: '900px', width: '100%'}}>
                    <div className="modal-content rounded-3 border-0 shadow">
                        <form onSubmit={handleSubmitDireccion}>
                            <div className="modal-header bg-mine text-light rounded-top-3 border-0">
                                <h5 className="modal-title fw-semibold" id="direccionModalLabel">
                                    <i className="bi bi-arrow-repeat me-2"></i>Actualizar Direccion de Entrega
                                </h5>
                                <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"
                                        aria-label="Cerrar"></button>
                            </div>
                            <div className="modal-body bg-light py-4">
                                <div className="d-flex flex-row">
                                    <div className="mb-4 ">
                                        <label className="form-label fw-medium">CI Encargado</label>
                                        <input
                                            type="text"
                                            className="form-control rounded-3 bg-white"
                                            value={selectedDonation?.encargado || ''}
                                            readOnly
                                        />
                                    </div>
                                    <div className="d-flex flex-column">
                                        <div className="mb-3">
                                            <label className="form-label fw-medium">
                                                Comunidad 
                                                <small className="text-muted ms-1">(Se llena automáticamente)</small>
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control rounded-3 bg-white"
                                                value={comunidad}
                                                placeholder="Seleccione una ubicación en el mapa"
                                                required
                                                readOnly
                                            />
                                        </div>
                                        <div className=" mb-3">
                                            <label className="form-label fw-medium">
                                                Provincia 
                                                <small className="text-muted ms-1">(Se llena automáticamente)</small>
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control rounded-3 bg-white"
                                                value={provincia}
                                                placeholder="Seleccione una ubicación en el mapa"
                                                required
                                                readOnly
                                            />
                                        </div>
                                        <div className=" mb-3">
                                            <label className="form-label fw-medium">
                                                Dirección completa 
                                                <small className="text-muted ms-1">(Se llena automáticamente)</small>
                                            </label>
                                            <textarea
                                                className="form-control rounded-3 bg-white"
                                                value={direccion}
                                                rows="2"
                                                placeholder="Seleccione una ubicación en el mapa para auto-llenar"
                                                required
                                                readOnly
                                            />
                                        </div>
                                    </div>

                                    <div className="ps-3 pe-3  d-flex flex-column">
                                        <label className="form-label fw-medium mb-2">
                                            Nueva Ubicación para la Entrega
                                        </label>
                                        {locationError && (
                                            <div className="alert alert-danger py-2 rounded-3" role="alert">
                                                {locationError}
                                            </div>
                                        )}
                                        {!locationError && userLocation && (
                                            <div className="d-flex flex-column align-items-left">
                                                <div className="rounded-3 overflow-hidden mb-2"
                                                     style={{width: '300px', height: '300px'}}>
                                                    <LocationMap location={userLocation}/>
                                                    </div>
                                                    <div className=" small text-muted align-items-left">
                                                        Coordenadas: {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
                                                    </div>
                                                </div>
                                            )}
                                    </div>
                                </div>
                                <div className="modal-footer bg-light rounded-bottom-3 border-top border-light">
                                    <button type="button" id="cerrarModalDireccion"
                                            className="btn btn-warning rounded-3 rounded-pill"
                                            data-bs-dismiss="modal">Cancelar
                                    </button>
                                    <button type="submit" className="btn btn-outline-dark rounded-3 rounded-pill ">
                                        <i className="bi bi-check-circle me-1"></i>Actualizar Dirección
                                    </button>
                                    {sendError &&
                                        <div className="text-danger" style={{fontSize: "smaller"}}>{sendError}</div>}
                                </div>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
            <div className="modal fade" id="estadoModal" tabIndex="-1" aria-labelledby="estadoModalLabel"
                 aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered" style={{maxWidth: '900px', width: '100%'}}>
                    <div className="modal-content rounded-3 border-0 shadow">
                        <form onSubmit={handleSubmitEstado}>
                            <div className="modal-header bg-mine text-light rounded-top-3 border-0">
                                <h5 className="modal-title fw-semibold" id="estadoModalLabel">
                                    <i className="bi bi-arrow-repeat me-2"></i>Actualizar Estado
                                </h5>
                                <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"
                                        aria-label="Cerrar"></button>
                            </div>
                            <div className="modal-body bg-light py-4">
                                <div className="row g-0">

                                    <div className="col-4 pe-3
                                     ">
                                        <div className="mb-4">
                                            <label className="form-label fw-medium">CI Encargado</label>
                                            <input
                                                type="text"
                                                className="form-control rounded-3 bg-white"
                                                value={selectedDonation?.encargado || ''}
                                                readOnly
                                            />
                                        </div>

                                        <div className="mb-4">
                                            <label className="form-label fw-medium mb-2">Seleccione una opción</label>
                                            <div className="d-flex flex-column gap-2">

                                                <button
                                                    type="button"
                                                    className={`btn text-start d-flex align-items-center rounded-pill p-3 ${selectedOption === 2 ? 'btn-mine' : 'btn-outline-mine text-black'}`}
                                                    onClick={() => {
                                                        setSelectedOption(2);
                                                        setNuevoEstado("En camino");
                                                    }}
                                                >
                                                    <div className="d-flex align-items-center">
                                                        <div
                                                            className={`rounded-circle me-3 ${selectedOption === 2 ? 'bg-warning' : 'bg-light'}`}
                                                            style={{
                                                                width: '20px',
                                                                height: '20px',
                                                                border: '2px solid #212529'
                                                            }}>
                                                        </div>
                                                        <div>
                                                            <span className="fw-medium">En camino</span>
                                                        </div>
                                                    </div>
                                                </button>

                                                <button
                                                    type="button"
                                                    className={`btn rounded-pill text-start d-flex align-items-center p-3 ${selectedOption === 3 ? 'btn-mine ' : 'btn-outline-mine text-black'}`}
                                                    onClick={() => {
                                                        setSelectedOption(3);
                                                        setNuevoEstado("Entregado");
                                                    }}
                                                >
                                                    <div className="d-flex align-items-center">
                                                        <div
                                                            className={`rounded-circle me-3 ${selectedOption === 3 ? 'bg-warning' : 'bg-light'}`}
                                                            style={{
                                                                width: '20px',
                                                                height: '20px',
                                                                border: '2px solid #212529'
                                                            }}>
                                                        </div>
                                                        <div>
                                                            <span className="fw-medium">Entregado</span>
                                                        </div>
                                                    </div>
                                                </button>
                                            </div>
                                        </div>

                                    </div>


                                    <div className="col-4 ps-3 pe-3  d-flex flex-column">
                                        <label className="form-label fw-medium mb-2">Su Ubicación Actual</label>
                                        {locationError && (
                                            <div className="alert alert-danger py-2 rounded-3" role="alert">
                                                {locationError}
                                            </div>
                                        )}
                                        {!locationError && userLocation && (
                                            <div className="d-flex flex-column align-items-center">
                                                <div className="rounded-3 overflow-hidden mb-2"
                                                     style={{width: '300px', height: '300px'}}>
                                                    <LocationMap location={userLocation}/>
                                                </div>
                                                <div className="text-center small text-muted">
                                                    Coordenadas: {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
                                                </div>
                                            </div>
                                        )}
                                    </div>


                                    <div className="col-4 ps-3 pe-3 d-flex flex-column">
                                        <label className="form-label fw-medium mb-2">Imagen de Entrega</label>
                                        <div className="d-flex flex-column align-items-center">
                                            <div className="w-100 mb-3">
                                                <input
                                                    type="file"
                                                    className="form-control rounded-3"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                    required={nuevoEstado === "Entregado"}
                                                />
                                                {imageError &&
                                                    <div className="text-danger mt-1" style={{fontSize: "smaller"}}>
                                                        {imageError}
                                                    </div>
                                                }
                                            </div>
                                            {imagen ? (
                                                <div className="text-center">
                                                    <img
                                                        src={URL.createObjectURL(imagen)}
                                                        alt="Vista previa"
                                                        className="img-thumbnail rounded-3"
                                                        style={{width: "250px", height: "250px", objectFit: "cover"}}
                                                    />
                                                </div>
                                            ) : (
                                                <div
                                                    className="text-center text-muted d-flex flex-column align-items-center justify-content-center"
                                                    style={{
                                                        width: "250px",
                                                        height: "250px",
                                                        border: "2px dashed #ccc",
                                                        borderRadius: "0.5rem"
                                                    }}>
                                                    <i className="bi bi-camera fs-2 mb-2"></i>
                                                    <p className="mb-0">Seleccione una imagen</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer bg-light rounded-bottom-3 border-top border-light">
                                <button type="button" id="cerrarModal"
                                        className="btn btn-warning rounded-3 rounded-pill"
                                        data-bs-dismiss="modal">Cancelar
                                </button>
                                <button type="submit" className="btn btn-outline-dark rounded-3 rounded-pill ">
                                    <i className="bi bi-check-circle me-1"></i>Actualizar
                                </button>
                                {sendError &&
                                    <div className="text-danger" style={{fontSize: "smaller"}}>{sendError}</div>}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Donaciones;
