import React from "react";
import { Modal } from "react-bootstrap";
import '../Style.css';
import { jsPDF } from "jspdf";

export const generateDonacionPDF = (donacion) => {
  if (!donacion) {
    alert("No hay datos para generar el PDF.");
    return;
  }

  const doc = new jsPDF("portrait", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  const accentColor = [255, 193, 7];

  const currentDate = new Date().toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const addFooter = () => {
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text("Sistema de Seguimiento de Donaciones", margin, pageHeight - 10);
      doc.text(`Generado: ${currentDate}`, pageWidth / 2, pageHeight - 10, { align: "center" });
      doc.text(`Página ${i} de ${pageCount}`, pageWidth - margin, pageHeight - 10, { align: "right" });
      doc.setDrawColor(200);
      doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
    }
  };

  let currentY = 20;

  const addSection = (title, lines) => {
    const spacePerLine = 6;
    const sectionTitleHeight = 8;
    currentY += 8;

    if (currentY + sectionTitleHeight + (lines.length * spacePerLine) > pageHeight - 20) {
      doc.addPage();
      currentY = 20;
    }
    doc.setFontSize(12);
    doc.setTextColor(25, 73, 115);
    doc.setFont(undefined, 'bold')
        .text(title, margin, currentY).setFont(undefined, 'normal');
    currentY += sectionTitleHeight;

    doc.setFontSize(10);
    doc.setTextColor(50);
    lines.forEach((line) => {
      if (currentY > pageHeight - 20) {
        doc.addPage();
        currentY = 20;
      }
      doc.text(line, margin + 5, currentY);
      currentY += spacePerLine;
    });
  };
  const safelyAddImage = (doc, imageSrc, x, y, width, height) => {
    try {
      if (imageSrc.startsWith('data:')) {
        doc.addImage(imageSrc, 'PNG', x, y, width, height, undefined, 'FAST');
        return true;
      } else {
        try {
          doc.addImage(imageSrc, 'PNG', x, y, width, height, undefined, 'FAST');
          return true;
        } catch (directError) {
          console.error(`Could not load image from ${imageSrc}:`, directError);
          doc.setDrawColor(200, 200, 100);
          doc.setFillColor(240, 240, 240);
          doc.roundedRect(x, y, width, height, 2, 2, 'FD');

          doc.setFontSize(10);
          doc.setTextColor(100, 100, 100);
          doc.text('Imagen no disponible', x + width/2, y + height/2, { align: 'center' });
          return false;
        }
      }
    } catch (error) {
      console.error('Error in safelyAddImage:', error);
      return false;
    }
  };

  
  doc.setFillColor(25, 73, 115);
  doc.rect(0, 0, pageWidth, 60, "F");
  safelyAddImage(doc, '/logoNOBG.png', pageWidth/2 - 25, 10, 50, 50);

  doc.setFontSize(24);
  doc.setTextColor(0);
  doc.text(`Reporte de Donación ${donacion.codigoDonacion}`, pageWidth / 2, 80, { align: "center" });

  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text("Sistema de Seguimiento de Donaciones", pageWidth / 2, 90, { align: "center" });

  doc.setFontSize(10);
  doc.setTextColor(0);
  doc.text(`Fecha de generación: ${currentDate}`, pageWidth / 2, 100, { align: "center" });

  doc.setDrawColor(...accentColor);
  doc.setLineWidth(1);
  doc.line(margin + 20, 110, pageWidth - margin - 20, 110);

  addFooter();
  doc.addPage();

  doc.setFontSize(18);

  doc.setTextColor(35, 35, 35);
  doc.setFont(undefined, 'bold')
      .text(`Reporte de Donación ${donacion.codigoDonacion}`, pageWidth / 2, 25, { align: "center" })
      .setFont(undefined, 'normal');

  currentY = 35;
  addSection("A. Información General de la Donación", [
    `ID: ${donacion.idDonacion}`,
    `Código: ${donacion.codigoDonacion}`,
    `Fecha de aprobación: ${donacion.fechaAprobacion || "No disponible"}`,
    `Fecha de entrega: ${donacion.fechaEntrega || "No entregada"}`,
    `Categoría: ${donacion.categoriaDonacion}`,
  ]);

  addSection("B. Datos del Encargado", [
    `CI: ${donacion.ciEncargado}`,
    `Nombre: ${donacion.nombreEncargado}`,
    `Email: ${donacion.emailEncargado}`,
    `Teléfono: ${donacion.telefonoEncargado}`,
  ]);

  addSection("C. Información de la Solicitud", [
    `ID Solicitud: ${donacion.idSolicitud}`,
    `Inicio de Incendio: ${donacion.fechaInicioIncendio}`,
    `Fecha de Solicitud: ${donacion.fechaSolicitud}`,
    `Aprobada: ${donacion.solicitudAprobada ? "Sí" : "No"}`,
    `Cantidad de Personas: ${donacion.cantidadPersonas}`,
    `Justificación: ${donacion.justificacion}`,
    `Categoría: ${donacion.categoriaSolicitud}`,
    `Productos: ${donacion.listaProductos}`,
  ]);

  addSection("D. Datos del Solicitante", [
    `CI: ${donacion.ciSolicitante}`,
    `Nombre: ${donacion.nombreSolicitante} ${donacion.apellidoSolicitante}`,
    `Email: ${donacion.emailSolicitante}`,
    `Teléfono: ${donacion.telefonoSolicitante}`,
  ]);

  addSection("E. Ubicación de Entrega", [
    `Comunidad: ${donacion.comunidadDestino}`,
    `Dirección: ${donacion.direccionDestino}`,
    `Provincia: ${donacion.provinciaDestino}`,
    `Latitud: ${donacion.latitudDestino}`,
    `Longitud: ${donacion.longitudDestino}`,
  ]);

  addSection("F. Estado Actual de la Donación", [
    `Estado: ${donacion.estadoActual || "Entregado"}`,
    `Latitud actual: ${donacion.latitudActual ?? "No Disponible"}`,
    `Longitud actual: ${donacion.longitudActual ?? "No Disponible"}`,
    `Timestamp: ${donacion.timestampActual || "No Disponible"}`,
  ]);

  addSection("G. Historial y Métricas Generales", [
    `Puntos de historial: ${donacion.totalPuntosHistorial}`,
    `Distancia recorrida: ${donacion.distanciaRecorrida} km`,
    `Tiempo total: ${donacion.tiempoTotalDias} días`,
    `Fecha de generación de reporte: ${donacion.fechaGeneracionReporte}`,
  ]);

  if (donacion.puntosHistorial?.length > 0) {
    const puntos = donacion.puntosHistorial.map((p, i) => [
      `#${i + 1}`,
      `CI Usuario: ${p.ciUsuario}`,
      `Estado: ${p.estado}`,
      `Fecha: ${new Date(p.fechaActualizacion).toLocaleString("es-BO")}`,
      `Lat: ${p.latitud}, Lon: ${p.longitud}`,
      ""
    ]).flat();

    addSection("Puntos del Historial:", puntos);
  }

  addFooter();

  doc.save(`Reporte_${donacion.codigoDonacion}_${currentDate.replace('/', '')}.pdf`);
};
const DetalleDonacionModal = ({ show, onHide, donacion }) => {
    if (!donacion) return null;

    const formatFecha = (fecha) =>
        fecha ? new Date(fecha).toLocaleString("es-BO") : "No disponible";

    return (
      <Modal show={show} onHide={onHide} size="lg" centered scrollable>
        <Modal.Header closeButton className="modal-header bg-mine">
          <Modal.Title className="fw-bold text-light ">
            Detalles de la Donación #{donacion.codigoDonacion}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body
          style={{ maxHeight: "75vh", overflowY: "auto" }}
          className="bg-dark-subtle"
        >
          
          <section className="mb-4">
            <h4 className="fw-bold ">Información General</h4>
            <p className="border-bottom border-light-subtle pb-1">
              <strong>ID Donación:</strong> {donacion.idDonacion}
            </p>
            <p className="border-bottom border-light-subtle pb-1">
              <strong>Código:</strong> {donacion.codigoDonacion}
            </p>
            <p className="border-bottom border-light-subtle pb-1">
              <strong>Fecha de Aprobación:</strong>{" "}
              {formatFecha(donacion.fechaAprobacion)}
            </p>
            <p className="border-bottom border-light-subtle pb-1">
              <strong>Fecha de Entrega:</strong>{" "}
              {formatFecha(donacion.fechaEntrega)}
            </p>
            <p className="border-bottom border-light-subtle pb-1">
              <strong>Categoría Donación:</strong> {donacion.categoriaDonacion}
            </p>
          </section>
          
          <section className="mb-4">
            <h4 className="fw-bold ">Encargado de Entrega</h4>
            <p className="border-bottom border-light-subtle pb-1">
              <strong>CI:</strong> {donacion.ciEncargado}
            </p>
            <p className="border-bottom border-light-subtle pb-1">
              <strong>Nombre:</strong> {donacion.nombreEncargado}
            </p>
            <p className="border-bottom border-light-subtle pb-1">
              <strong>Email:</strong> {donacion.emailEncargado}
            </p>
            <p className="border-bottom border-light-subtle pb-1">
              <strong>Teléfono:</strong> {donacion.telefonoEncargado}
            </p>
          </section>

          
          <section className="mb-4">
            <h4 className="fw-bold ">Datos de la Solicitud</h4>
            <p className="border-bottom border-light-subtle pb-1">
              <strong>ID Solicitud:</strong> {donacion.idSolicitud}
            </p>
            <p className="border-bottom border-light-subtle pb-1">
              <strong>Fecha Inicio Incendio:</strong>{" "}
              {formatFecha(donacion.fechaInicioIncendio)}
            </p>
            <p className="border-bottom border-light-subtle pb-1">
              <strong>Fecha de Solicitud:</strong>{" "}
              {formatFecha(donacion.fechaSolicitud)}
            </p>
            <p className="border-bottom border-light-subtle pb-1">
              <strong>Solicitud Aprobada:</strong>{" "}
              {donacion.solicitudAprobada ? "Sí" : "No"}
            </p>
            <p className="border-bottom border-light-subtle pb-1">
              <strong>Cantidad de Personas:</strong> {donacion.cantidadPersonas}
            </p>
            <p className="border-bottom border-light-subtle pb-1">
              <strong>Justificación:</strong> {donacion.justificacion}
            </p>
            <p className="border-bottom border-light-subtle pb-1">
              <strong>Categoría de Solicitud:</strong>{" "}
              {donacion.categoriaSolicitud}
            </p>
            <p className="border-bottom border-light-subtle pb-1">
              <strong>Productos:</strong> {donacion.listaProductos}
            </p>
          </section>

          
          <section className="mb-4">
            <h4 className="fw-bold ">Datos del Solicitante</h4>
            <p className="border-bottom border-light-subtle pb-1">
              <strong>CI:</strong> {donacion.ciSolicitante}
            </p>
            <p className="border-bottom border-light-subtle pb-1">
              <strong>Nombre:</strong> {donacion.nombreSolicitante}{" "}
              {donacion.apellidoSolicitante}
            </p>
            <p className="border-bottom border-light-subtle pb-1">
              <strong>Email:</strong> {donacion.emailSolicitante}
            </p>
            <p className="border-bottom border-light-subtle pb-1">
              <strong>Teléfono:</strong> {donacion.telefonoSolicitante}
            </p>
          </section>

          
          <section className="mb-4">
            <h4 className="fw-bold ">Ubicación de Entrega</h4>
            <p className="border-bottom border-light-subtle pb-1">
              <strong>Comunidad:</strong> {donacion.comunidadDestino}
            </p>
            <p className="border-bottom border-light-subtle pb-1">
              <strong>Dirección:</strong> {donacion.direccionDestino}
            </p>
            <p className="border-bottom border-light-subtle pb-1">
              <strong>Provincia:</strong> {donacion.provinciaDestino}
            </p>
            <p className="border-bottom border-light-subtle pb-1">
              <strong>Latitud:</strong> {donacion.latitudDestino}
            </p>
            <p className="border-bottom border-light-subtle pb-1">
              <strong>Longitud:</strong> {donacion.longitudDestino}
            </p>
          </section>

          
          <section className="mb-4">
            <h4 className="fw-bold ">Estado Actual</h4>
            <p className="border-bottom border-light-subtle pb-1">
              <strong>Estado:</strong> {donacion.estadoActual}
            </p>
            <p className="border-bottom border-light-subtle pb-1">
              <strong>Latitud Actual:</strong> {donacion.latitudActual}
            </p>
            <p className="border-bottom border-light-subtle pb-1">
              <strong>Longitud Actual:</strong> {donacion.longitudActual}
            </p>
            <p className="border-bottom border-light-subtle pb-1">
              <strong>Timestamp:</strong>{" "}
              {formatFecha(donacion.timestampActual)}
            </p>
          </section>

          
          <section className="mb-4">
            <h4 className="fw-bold ">Historial y Métricas</h4>
            <p className="border-bottom border-light-subtle pb-1">
              <strong>Distancia Recorrida:</strong>{" "}
              {donacion.distanciaRecorrida} km
            </p>
            <p className="border-bottom border-light-subtle pb-1">
              <strong>Días Transcurridos:</strong> {donacion.tiempoTotalDias}
            </p>
            <p className="border-bottom border-light-subtle pb-1">
              <strong>Fecha de Generación del Reporte:</strong>{" "}
              {formatFecha(donacion.fechaGeneracionReporte)}
            </p>
            <p className="border-bottom border-light-subtle pb-1">
              <strong>Total de Puntos en Historial:</strong>{" "}
              {donacion.totalPuntosHistorial}
            </p>

            {donacion.puntosHistorial?.length > 0 && (
              <div className="mt-2">
                <strong>Puntos del Historial:</strong>
                <ul className="mt-2">
                  {donacion.puntosHistorial.map((punto, index) => (
                    <li key={punto.idHistorial}>
                      <strong>#{index + 1}</strong>
                      <br />
                      CI Usuario: {punto.ciUsuario} <br /> Estado:{" "}
                      {punto.estado} <br />
                      Fecha: {formatFecha(punto.fechaActualizacion)}
                      <br />
                      Lat: {punto.latitud}, Lon: {punto.longitud}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
          <section className="mb-4">
            <h4 className="fw-bold">Almacenes Involucrados</h4>

            <p className="border-bottom border-light-subtle pb-1">
              <strong>Total de Almacenes:</strong>{" "}
              {donacion.totalAlmacenesInvolucrados || 0}
            </p>

            {donacion.almacenesInvolucrados?.length > 0 ? (
              <div className="mt-2">
                <strong>Listado de Almacenes:</strong>
                <ul className="mt-2">
                  {donacion.almacenesInvolucrados.map((almacen, index) => (
                    <li key={index}>
                      <strong>#{index + 1}</strong> <br />
                      <span className="text-secondary">
                        <strong>Nombre:</strong>{" "}
                        {almacen.nombre_almacen || "No especificado"}
                      </span>
                      <br />
                      <span className="text-secondary">
                        <strong>Ubicación:</strong>{" "}
                        {almacen.ubicacion || "Ubicación desconocida"}
                      </span>
                      <br />
                      <span className="text-secondary">
                        <strong>Coordenadas:</strong>{" "}
                        {almacen.latitud && almacen.longitud
                          ? `${almacen.latitud}, ${almacen.longitud}`
                          : "No disponibles"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-muted fst-italic mt-2">
                No hay almacenes asociados a esta donación.
              </p>
            )}
          </section>


        </Modal.Body>
        <Modal.Footer className="modal-header bg-mine">
          <button
              className="btn btn-mine-yellow btn-sm px-3 text-dark fw-bold"
              onClick={() => generateDonacionPDF(donacion)}
          >
            <i className="bi bi-download me-1"></i> Descargar
          </button>
        </Modal.Footer>
      </Modal>
    );
};

export default DetalleDonacionModal;
