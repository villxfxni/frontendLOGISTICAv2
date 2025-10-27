import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../Style.css";
import { getSolicitudesResumen, aprobarSolicitud, rechazarSolicitud } from "../../Services/solicitudService.js";
import Header from "../Common/Header.jsx";


const formatDate = (dateString) => {
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
};


const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

const RequestCard = ({ request, onOpenModal, onShowDetails }) => {
  const getEstado = () => {
    if (request.aprobada === true) return "Aprobada";
    if (request.aprobada === false) return "Rechazada";
    return "Sin contestar";
  };

  const getEstadoColor = () => {
    if (request.aprobada === true) return "#28a745";
    if (request.aprobada === false) return "#dc3545";
    return "#6c757d";
  };

  return (
    <div
      className="glass-card p-3 mb-3 position-relative overflow-hidden"
      style={{
        borderRadius: "16px",
        height: "100%",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div
        className="position-absolute top-0 start-0 h-100"
        style={{
          width: "5px",
          backgroundColor: getEstadoColor(),
        }}
      ></div>

      <div className="d-flex justify-content-between align-items-start">
        <h5 className="card-title fw-bold mb-3 text-white ps-3">
          {request.comunidad}
        </h5>
        <span
          className="badge"
          style={{
            backgroundColor: getEstadoColor(),
            color: "white",
            padding: "6px 12px",
            borderRadius: "50px",
            fontSize: "0.75rem",
            fontWeight: "500",
          }}
        >
          {getEstado()}
        </span>
      </div>

      <div className="ps-3">
        <div className="mb-2 d-flex align-items-center">
          <i className="bi bi-person-fill me-2 text-white"></i>
          <p className="card-text mb-0 text-white">
            <span className="text-light opacity-75">Solicitante:</span>{" "}
            {request.nombreSolicitante} {request.apellidoSolicitante}
          </p>
        </div>
        <div className="mb-2 d-flex align-items-center">
          <i className="bi bi-person-fill me-2 text-white"></i>
          <p className="card-text mb-0 text-white">
            <span className="text-light opacity-75">Email:</span>{" "}
            {request.emailSolicitante}
          </p>
        </div>

        <div className="mb-2 d-flex align-items-center">
          <i className="bi bi-card-text me-2 text-white"></i>
          <p className="card-text mb-0 text-white">
            <span className="text-light opacity-75">CI:</span>{" "}
            {request.ciSolicitante}
          </p>
        </div>

        <div className="mb-2 d-flex align-items-center">
          <i className="bi bi-geo-alt-fill me-2 text-white"></i>
          <p className="card-text mb-0 text-white text-truncate">
            <span className="text-light opacity-75">Dirección:</span>{" "}
            {request.direccion}
          </p>
        </div>

        <div className="mb-2 d-flex align-items-center">
          <i className="bi bi-calendar-date me-2 text-white"></i>
          <p className="card-text mb-0 text-white">
            <span className="text-light opacity-75">Fecha:</span>{" "}
            {formatDate(request.fechaSolicitud)}
          </p>
        </div>

        <div className="mt-3">
          <h6 className="text-light fw-semibold">Productos solicitados:</h6>
          <p className="text-white opacity-75 text-truncate">
            {Array.isArray(request.listadoProductos)
              ? request.listadoProductos.join(", ")
              : request.listadoProductos}
          </p>
        </div>

        <div className="d-flex justify-content-between align-items-center mt-3">
          <button
            className="btn btn-link p-0 text-decoration-none text-info"
            onClick={() => onShowDetails(request)}
          >
            <i className="bi bi-info-circle me-1"></i> Detalles
          </button>

          {request.aprobada === null && (
            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-light btn-sm px-3"
                onClick={() => onOpenModal("rechazar", request)}
              >
                <i className="bi bi-x-circle me-1"></i> Rechazar
              </button>
              <button
                className="btn btn-light btn-sm px-3 text-dark"
                onClick={() => onOpenModal("aceptar", request)}
              >
                <i className="bi bi-check-circle me-1"></i> Aprobar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
const ListarSolicitudes = () => {
  const [dateFilter, setDateFilter] = useState("Recientes");
  const [estadoFilter, setEstadoFilter] = useState("Todas");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [selectedSolicitud, setSelectedSolicitud] = useState(null);
  const [motivoRechazo, setMotivoRechazo] = useState("");

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailedSolicitud, setDetailedSolicitud] = useState(null);

  const handleShowDetails = (solicitud) => {
    setDetailedSolicitud(solicitud);
    setShowDetailModal(true);
  };

  useEffect(() => {
    const fetchSolicitudesData = async () => {
      try {
        setLoading(true);
        const solicitudes = await getSolicitudesResumen();
        console.log("✅ Received items:", Array.isArray(solicitudes) ? solicitudes.length : "(not array)");
        setRequests(solicitudes);
        setError(null);
      } catch (err) {
        console.error("Error al obtener solicitudes:", err);
        
        setError(
          "Error al cargar las solicitudes. Intente nuevamente más tarde.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSolicitudesData();
  }, []);

  const handleConfirmAction = async () => {
    if (!selectedSolicitud) return;
    try {
      if (modalAction === "aceptar") {
        await aprobarSolicitud(selectedSolicitud.idSolicitud);
      } else if (modalAction === "rechazar") {
        await rechazarSolicitud(selectedSolicitud.idSolicitud, motivoRechazo);
      }

      setRequests((prev) =>
        prev.map((req) =>
          req.idSolicitud === selectedSolicitud.idSolicitud
            ? { ...req, aprobada: modalAction === "aceptar" }
            : req,
        ),
      );
    } catch (error) {
      console.error("Error al procesar la solicitud:", error);
    } finally {
      setShowModal(false);
    }
  };

  const onOpenModal = (action, solicitud) => {
    setSelectedSolicitud(solicitud);
    setModalAction(action);
    setMotivoRechazo("");
    setShowModal(true);
  };

  const filteredRequests = [...requests]
    .filter((req) => {
      if (estadoFilter === "Aprobadas") return req.aprobada === true;
      if (estadoFilter === "Rechazadas") return req.aprobada === false;
      if (estadoFilter === "Sin contestar") return req.aprobada === null;
      return true;
    })
    .sort((a, b) => {
      return dateFilter === "Recientes"
        ? new Date(b.fechaSolicitud) - new Date(a.fechaSolicitud)
        : new Date(a.fechaSolicitud) - new Date(b.fechaSolicitud);
    });

  if (error) {
    return (
      <div
        className="d-flex align-items-center justify-content-center"
        style={{ minHeight: "100vh", backgroundColor: "#e0e0d1" }}
      >
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="list-div">
      <Header />
      <div
        className={
          showModal ? "blur-background flex-grow-1 m-1" : "flex-grow-1 m-1"
        }
      >
        <div className="container-fluid h-100 d-flex justify-content-center align-items-center">
          <div
            className="w-100 w-md-75 h-100 p-2 m-1 m-md-3 rounded"
            style={{ maxWidth: "1200px", width: "100%" }}
          >
            <div className="rounded pt-3 pb-3 ms-1 ms-md-3 me-1 me-md-3">
              <h3 className="text-center mt-2 mb-0 fs-3 text-white fw-semibold">
                Listado de Solicitudes
              </h3>
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
                    className={`btn ${dateFilter === "Antiguas" ? "btn-mine" : "btn-outline-mine"}`}
                    onClick={() => setDateFilter("Antiguas")}
                  >
                    Antiguas
                  </button>
                </div>

                <div className="btn-group ms-3">
                  <button
                    type="button"
                    className={`btn ${estadoFilter === "Todas" ? "btn-mine" : "btn-outline-mine"}`}
                    onClick={() => setEstadoFilter("Todas")}
                  >
                    Todas
                  </button>
                  <button
                    type="button"
                    className={`btn ${estadoFilter === "Aprobadas" ? "btn-mine" : "btn-outline-mine"}`}
                    onClick={() => setEstadoFilter("Aprobadas")}
                  >
                    Aprobadas
                  </button>
                  <button
                    type="button"
                    className={`btn ${estadoFilter === "Rechazadas" ? "btn-mine" : "btn-outline-mine"}`}
                    onClick={() => setEstadoFilter("Rechazadas")}
                  >
                    Rechazadas
                  </button>
                  <button
                    type="button"
                    className={`btn ${estadoFilter === "Sin contestar" ? "btn-mine" : "btn-outline-mine"}`}
                    onClick={() => setEstadoFilter("Sin contestar")}
                  >
                    Sin contestar
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="d-flex justify-content-center align-items-center" style={{ height: "300px" }}>
                <div className="text-center">
                  <div className="spinner-border text-light" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                  <p className="mt-3 text-white">Cargando solicitudes...</p>
                </div>
              </div>
            ) : filteredRequests.length > 0 ? (
              <div className="row g-3 justify-content-center p-1 p-md-3">
                {filteredRequests.map((request, index) => (
                  <div key={index} className="col-12 col-md-6 col-lg-4">
                    <RequestCard
                      request={request}
                      onOpenModal={onOpenModal}
                      onShowDetails={handleShowDetails}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-5">
                <p className="text-white">
                  No hay solicitudes disponibles con los filtros seleccionados
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-mine text-light">
                <h5 className="modal-title">
                  {modalAction === "aceptar"
                    ? "Confirmar Aprobación"
                    : "Confirmar Rechazo"}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-light rounded-pill"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  ¿Estás seguro que deseas{" "}
                  {modalAction === "aceptar" ? "aprobar" : "rechazar"} la
                  solicitud?
                </p>
                {modalAction === "rechazar" && (
                  <div className="form-group">
                    <label htmlFor="motivoRechazo">Motivo del rechazo:</label>

                    <div className="d-flex flex-wrap gap-2 my-2">
                      {[
                        "La solicitud presenta información incompleta o inconsistente.",
                        "El destino reportado ya fue atendido recientemente con recursos similares.",
                        "La cantidad de personas afectadas es insuficiente para justificar la asignación de recursos.",
                        "La situación reportada no califica como una emergencia según los criterios establecidos.",
                      ].map((frase, index) => (
                        <button
                          key={index}
                          type="button"
                          className="btn btn-sm btn-outline-secondary w-100"
                          onClick={() => setMotivoRechazo(frase)}
                        >
                          {frase}
                        </button>
                      ))}
                    </div>

                    <div className="position-relative">
                      <textarea
                        id="motivoRechazo"
                        className="form-control pe-5"
                        value={motivoRechazo}
                        onChange={(e) => setMotivoRechazo(e.target.value)}
                        rows="3"
                        required
                      />
                      {motivoRechazo && (
                        <button
                          type="button"
                          className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2"
                          title="Limpiar"
                          onClick={() => setMotivoRechazo("")}
                        >
                          ✖
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary rounded-pill"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-outline-dark rounded-pill"
                  onClick={handleConfirmAction}
                  disabled={modalAction === "rechazar" && !motivoRechazo}
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDetailModal && detailedSolicitud && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content bg-light">
              <div className="modal-header bg-mine">
                <h5 className="modal-title fw-semibold text-white">
                  Información de la Solicitud
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white rounded-pill"
                  onClick={() => setShowDetailModal(false)}
                ></button>
              </div>
                <div className="modal-body bg-dark-subtle ">
                    <div className="row mb-1 ">
                        <div className="col-4 fw-semibold">Nombre Completo:</div>
                        <div className="col-8">
                            {detailedSolicitud.nombreSolicitante}{" "}
                            {detailedSolicitud.apellidoSolicitante}
                        </div>
                    </div>
                    <div className="ms-2 me-2 mb-2 pb-2 border-bottom border-light-subtle"></div>
                    <div className="row mb-1 ">
                        <div className="col-4 fw-semibold">Email:</div>
                        <div className="col-8">{detailedSolicitud.emailSolicitante}</div>
                    </div>
                    <div className="ms-2 me-2 mb-2 pb-2 border-bottom border-light-subtle"></div>
                    <div className="row mb-1 ">
                        <div className="col-4 fw-semibold">CI Usuario:</div>
                        <div className="col-8">{detailedSolicitud.ciSolicitante}</div>
                    </div>
                    <div className="ms-2 me-2 mb-2 pb-2 border-bottom border-light-subtle"></div>

                    <div className="row mb-1">
                        <div className="col-4 fw-semibold">Comunidad:</div>
                        <div className="col-8">{detailedSolicitud.comunidad}</div>
                    </div>
                    <div className="ms-2 me-2 mb-2 pb-2 border-bottom border-light-subtle"></div>

                    <div className="row mb-1">
                        <div className="col-4 fw-semibold">Fecha Solicitud:</div>
                        <div className="col-8">
                            {formatDateTime(detailedSolicitud.fechaSolicitud)}
                        </div>
                    </div>
                    <div className="ms-2 me-2 mb-2 pb-2 border-bottom border-light-subtle"></div>

                    {detailedSolicitud.fechaInicioIncendio && (
                        <>
                            <div className="row mb-1">
                                <div className="col-4 fw-semibold">Fecha Inicio:</div>
                                <div className="col-8">
                                    {formatDate(detailedSolicitud.fechaInicioIncendio)}
                                </div>
                            </div>
                            <div className="ms-2 me-2 mb-2 pb-2 border-bottom border-light-subtle"></div>
                        </>
                    )}

                    <div className="row mb-1">
                        <div className="col-4 fw-semibold">Celular:</div>
                        <div className="col-8">
                            {detailedSolicitud.telefonoSolicitante}
                        </div>
                    </div>
                    <div className="ms-2 me-2 mb-2 pb-2 border-bottom border-light-subtle"></div>

                    <div className="row mb-1">
                        <div className="col-4 fw-semibold">Cantidad Personas:</div>
                        <div className="col-8">
                            {detailedSolicitud.cantidadPersonas}
                        </div>
                    </div>
                    <div className="ms-2 me-2 mb-2 pb-2 border-bottom border-light-subtle"></div>

                    <div className="row mb-1">
                        <div className="col-4 fw-semibold">Productos:</div>
                        <div className="col-8">
                            {Array.isArray(detailedSolicitud.listadoProductos)
                                ? detailedSolicitud.listadoProductos.join(", ")
                                : detailedSolicitud.listadoProductos}
                        </div>
                    </div>
                    <div className="ms-2 me-2 mb-2 pb-2 border-bottom border-light-subtle"></div>

                    <div className="row mb-1">
                        <div className="col-4 fw-semibold">Dirección:</div>
                        <div className="col-8">{detailedSolicitud.direccion}</div>
                    </div>
                    <div className="ms-2 me-2 mb-2 pb-2 border-bottom border-light-subtle"></div>

                    <div className="row mb-1">
                        <div className="col-4 fw-semibold">Provincia:</div>
                        <div className="col-8">{detailedSolicitud.provincia}</div>
                    </div>
                    <div className="ms-2 me-2 mb-2 pb-2 border-bottom border-light-subtle"></div>

                    <div className="row mb-1">
                        <div className="col-4 fw-semibold">Estado:</div>
                        <div className="col-8">
                            {detailedSolicitud.aprobada === true ? (
                                <span className="badge bg-success">Aprobada</span>
                            ) : detailedSolicitud.aprobada === false ? (
                                <span className="badge bg-danger">Rechazada</span>
                            ) : (
                                <span className="badge bg-secondary">Sin contestar</span>
                            )}
                        </div>
                    </div>
                    {detailedSolicitud.aprobada !== null && (
                        <>
                            <div className="ms-2 me-2 mb-2 pb-2 border-bottom border-light-subtle"></div>
                            <div className="row mb-1">
                                <div className="col-4 fw-semibold">Motivo:</div>
                                <div className="col-8" style={{textAlign: "justify"}}>
                                    {detailedSolicitud.justificacion}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListarSolicitudes;
