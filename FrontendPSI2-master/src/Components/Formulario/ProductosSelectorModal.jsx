import React, { useState, useEffect } from "react";
import { Modal, Button, Row, Col, ListGroup, Spinner, Pagination } from "react-bootstrap";
import '../Style.css';

export default function ProductSelectorModal({ setFieldValue, cantidadPersonas }) {
  const [show, setShow] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState({});
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  const fetchProductos = async () => {
    setLoading(true);
    try {
      //const productsResponse = await fetch("https://backenddonaciones.onrender.com/api/catalogo");
      const productsResponse = await fetch("/api/catalogo", { credentials: "same-origin" });
      if (!productsResponse.ok) {
        throw new Error('Error al obtener los productos');
      }
      const productsData = await productsResponse.json();
      setProducts(productsData);
      setError(null);
    } catch (err) {
      console.error('Error:', err);
      setError('Error al cargar los productos. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleShow = () => {
    setShow(true);
    setCurrentPage(1);
    fetchProductos();
  };

  const handleClose = () => setShow(false);

  // Recommended = cantidad de personas (no hay tope del API)
  const getRecommendedQuantity = () => {
    const personas = parseInt(cantidadPersonas);
    if (!personas || isNaN(personas) || personas <= 0) return 0;
    return personas;
  };

  const increment = (id) => {
    setSelectedProducts((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const decrement = (id) => {
    setSelectedProducts((prev) => {
      const current = prev[id] || 0;
      if (current <= 1) {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      }
      return { ...prev, [id]: current - 1 };
    });
  };

  const applyRecommendedQuantity = (productId) => {
    const recommendedQuantity = getRecommendedQuantity();
    if (recommendedQuantity > 0) {
      setSelectedProducts(prev => ({
        ...prev,
        [productId]: recommendedQuantity
      }));
    }
  };

  const getQuantityMessage = (productId) => {
    const currentQuantity = selectedProducts[productId] || 0;
    return `${currentQuantity} seleccionados`;
  };

  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(products.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  return (
    <>
      <Button
        variant="link"
        className="btn-sm align-content-end justify-content-end align-self-end rounded-pill"
        onClick={handleShow}
        disabled={!cantidadPersonas || isNaN(parseInt(cantidadPersonas)) || parseInt(cantidadPersonas) <= 0}
      >
        Ver Productos
      </Button>

      <Modal show={show} onHide={handleClose} size="lg" centered className="text-black">
        <Modal.Header className="bg-mine text-light">
          <Modal.Title className="col-6">Seleccione Los Productos:</Modal.Title>
          <Modal.Title className="col-6">Productos Seleccionados:</Modal.Title>
        </Modal.Header>

        <Modal.Body className="bg-dark-subtle">
          {loading ? (
            <div className="text-center p-4">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Cargando...</span>
              </Spinner>
              <p className="mt-2">Cargando productos...</p>
            </div>
          ) : error ? (
            <div className="alert alert-danger">
              {error}
              <Button
                variant="outline-danger"
                size="sm"
                className="ms-2"
                onClick={fetchProductos}
              >
                Reintentar
              </Button>
            </div>
          ) : (
            <Row className="px-2">
              <Col md={6}>
                <div className="mt-1">
                  <h5>
                    Disponibles {indexOfFirstProduct + 1}-{Math.min(indexOfLastProduct, products.length)} de {products.length}
                  </h5>
                  <ListGroup>
                    {currentProducts.map((product) => {
                      const recommendedQuantity = getRecommendedQuantity();
                      const currentQty = selectedProducts[product.id_articulo] || 0;

                      return (
                        <ListGroup.Item
                          key={product.id_articulo}
                          className="d-flex justify-content-between align-items-center mb-2"
                        >
                          <div>
                            <div className="d-flex flex-row align-items-center">
                              <div className="fw-semibold">{product.nombre_articulo}</div>
                            </div>

                            <div className="d-flex align-items-center">
                              {recommendedQuantity > 0 && (
                                <small className="text-muted">Sugerido: {recommendedQuantity}</small>
                              )}

                              {recommendedQuantity > 0 && (
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="ms-2 text-success text-center"
                                  onClick={() => applyRecommendedQuantity(product.id_articulo)}
                                  title={`Aplicar cantidad sugerida: ${recommendedQuantity}`}
                                  style={{ padding: "0.25rem 0.5rem", backgroundColor: "transparent" }}
                                >
                                  <p className="text-success mb-0 py-0 underline" style={{ fontSize: "small" }}>
                                    Aplicar
                                  </p>
                                </Button>
                              )}
                            </div>
                          </div>

                          <div className="d-flex flex-column align-items-end">
                            <div className="d-flex align-items-center justify-content-center mb-1">
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() => decrement(product.id_articulo)}
                                disabled={!selectedProducts[product.id_articulo]}
                              >
                                -
                              </Button>
                              <div className="mx-2" style={{ minWidth: "40px", textAlign: "center" }}>
                                <h6 className="fw-lighter mb-0">{currentQty}</h6>
                              </div>
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() => increment(product.id_articulo)}
                              >
                                +
                              </Button>
                            </div>
                            <small className="text-muted">{getQuantityMessage(product.id_articulo)}</small>
                          </div>
                        </ListGroup.Item>
                      );
                    })}
                  </ListGroup>

                  <div className="d-flex justify-content-center mt-3">
                    <Pagination className="mb-0 pagination-custom">
                      <Pagination.Prev
                        onClick={prevPage}
                        disabled={currentPage === 1}
                        className="bg-mine-light text-white border-0"
                      />

                      {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = idx + 1;
                        } else if (currentPage <= 3) {
                          pageNum = idx + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + idx;
                        } else {
                          pageNum = currentPage - 2 + idx;
                        }

                        return (
                          <Pagination.Item
                            key={pageNum}
                            active={pageNum === currentPage}
                            onClick={() => paginate(pageNum)}
                            className={pageNum === currentPage ? "bg-mine border-0" : "bg-mine-light text-white border-0"}
                          >
                            {pageNum}
                          </Pagination.Item>
                        );
                      })}

                      <Pagination.Next
                        onClick={nextPage}
                        disabled={currentPage === totalPages}
                        className="bg-mine-light text-white border-0"
                      />
                    </Pagination>
                  </div>

                  <style jsx="true">{`
                    .pagination-custom .page-item .page-link {
                      background-color: rgba(39, 83, 126, 0.7);
                      color: white;
                      border: none;
                    }
                    .pagination-custom .page-item.active .page-link {
                      background-color: rgb(39, 83, 126);
                      color: white;
                      border: none;
                    }
                    .pagination-custom .page-item .page-link:hover {
                      background-color: rgb(39, 83, 126);
                    }
                    .pagination-custom .page-item.disabled .page-link {
                      background-color: rgba(39, 83, 126, 0.4);
                      color: rgba(255, 255, 255, 0.6);
                    }
                    .selected-products-container::-webkit-scrollbar {
                      width: 8px;
                    }
                    .selected-products-container::-webkit-scrollbar-track {
                      background: #f1f1f1;
                      border-radius: 4px;
                    }
                    .selected-products-container::-webkit-scrollbar-thumb {
                      background: rgb(39, 83, 126);
                      border-radius: 4px;
                    }
                    .selected-products-container::-webkit-scrollbar-thumb:hover {
                      background: rgba(39, 83, 126, 0.8);
                    }
                  `}</style>
                </div>
              </Col>

              <Col md={6} className=" pt-2 rounded mt-1 pb-4" style={{ height: "fit-content" }}>
                <div className="d-flex justify-content-center align-items-center mt-3 mb-3">
                  <img src="/caja.svg" width="45%" height="45%" alt="Caja" className="opacity-50" />
                </div>

                <div
                  className="selected-products-container"
                  style={{
                    maxHeight: '225px',
                    overflowY: 'auto',
                    borderRadius: '4px',
                    padding: Object.keys(selectedProducts).length === 0 ? '0' : '8px'
                  }}
                >
                  {Object.keys(selectedProducts).length === 0 ? (
                    <p className="m-3">No tienes productos seleccionados.</p>
                  ) : (
                    <ListGroup>
                      {Object.entries(selectedProducts).map(([id, quantity]) => {
                        const product = products.find((p) => p.id_articulo === parseInt(id));
                        return (
                          <ListGroup.Item key={id} className="d-flex justify-content-between">
                            <div>{product?.nombre_articulo}</div>
                            <div>{quantity}</div>
                          </ListGroup.Item>
                        );
                      })}
                    </ListGroup>
                  )}
                </div>
              </Col>
            </Row>
          )}
        </Modal.Body>

        <Modal.Footer className="bg-mine">
          <Button variant="secondary" onClick={handleClose} className="rounded-pill">Cerrar</Button>
          <Button
            className="btn-success text-light rounded-pill"
            onClick={() => {
              // texto legible
              const formatted = Object.entries(selectedProducts)
                .map(([id, quantity]) => {
                  const product = products.find((p) => p.id_articulo === parseInt(id));
                  return `${product?.nombre_articulo}: ${quantity}`;
                })
                .join(", ");

              // formato API "id:qty"
              const apiFormat = Object.entries(selectedProducts).map(([id, quantity]) => `${id}:${quantity}`);

              setFieldValue("listaProductos", formatted);
              setFieldValue("listaProductosAPI", apiFormat);
              handleClose();
            }}
            disabled={Object.keys(selectedProducts).length === 0}
          >
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
