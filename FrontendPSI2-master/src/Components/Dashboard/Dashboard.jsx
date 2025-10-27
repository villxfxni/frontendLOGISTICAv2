import React, { useState, useEffect } from 'react';
import Header from '../Common/Header.jsx';
import Metricas from '../Metricas/Metricas.jsx';
import GaleriaDonaciones from '../Metricas/GaleriaDonaciones.jsx';
import MetricasPublicas from '../Metricas/MetricasPublicas.jsx';
import { getToken } from '../../Services/authService.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../Style.css';


const Dashboard = () => {
    const [activeView, setActiveView] = useState('selection');
    
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    
    useEffect(() => {
        const token = getToken();
        setIsAuthenticated(!!token);
    }, []);

    
    const handleShowMetrics = () => {
        if (isAuthenticated) {
            setActiveView('metrics');
        } else {
            setActiveView('metrics-public');
        }
    };

    
    const handleShowGallery = () => {
        setActiveView('gallery');
    };

    
    const handleBackToSelection = () => {
        setActiveView('selection');
    };

    
    const renderSelectionView = () => (
        <div className="list-div">
            <Header />
            
            <div className="container-fluid flex-grow-1 d-flex align-items-center justify-content-center py-5">
                <div className="row w-100 justify-content-center">
                    <div className="col-12">
                        <div className="row justify-content-center g-4">
                            <div className="col-12 col-md-6 col-lg-5">
                                <div 
                                    className="glass-card h-100 p-4 position-relative cursor-pointer"
                                    style={{
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease-in-out',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        minHeight: '300px',
                                        borderRadius:'20px'

                                    }}
                                    onClick={handleShowMetrics}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-8px)';
                                        e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.3)';
                                        e.currentTarget.style.borderColor = 'rgba(255, 193, 7, 0.3)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(1, 3, 26, 0.51)';
                                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                    }}
                                >
                                    <div className="text-center mb-4">
                                        <div 
                                            className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                                            style={{
                                                width: '80px',
                                                height: '80px',
                                                background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.2) 0%, rgba(255, 193, 7, 0.1) 100%)',
                                                border: '2px solid rgba(255, 193, 7, 0.3)'
                                            }}
                                        >
                                            <i className="bi bi-graph-up-arrow text-warning" style={{ fontSize: '2rem' }}></i>
                                        </div>
                                    </div>

                                    <div className="text-center">
                                        <h3 className="h4 fw-bold text-white mb-3">
                                            Visualización de Métricas
                                        </h3>
                                        <p className="text-light opacity-75 mb-4">
                                            {isAuthenticated 
                                                ? 'Accede a métricas detalladas, análisis estadísticos completos y herramientas de administración del sistema.'
                                                : 'Consulta las estadísticas generales públicas del sistema de donaciones.'
                                            }
                                        </p>
                                        
                                        <div className="text-start mb-4">
                                            <div className="d-flex align-items-center mb-2">
                                                <i className="bi bi-check-circle-fill text-success me-2"></i>
                                                <small className="text-light opacity-75">
                                                    {isAuthenticated ? 'Métricas interactivas' : 'Estadísticas generales'}
                                                </small>
                                            </div>
                                            <div className="d-flex align-items-center mb-2">
                                                <i className="bi bi-check-circle-fill text-success me-2"></i>
                                                <small className="text-light opacity-75">
                                                    {isAuthenticated ? 'Reportes exportables' : 'Gráficos informativos'}
                                                </small>
                                            </div>
                                            <div className="d-flex align-items-center mb-2">
                                                <i className="bi bi-check-circle-fill text-success me-2"></i>
                                                <small className="text-light opacity-75">
                                                    {isAuthenticated ? 'Filtros personalizados' : 'Resumen de actividad'}
                                                </small>
                                            </div>
                                            <div className="d-flex align-items-center">
                                                <i className="bi bi-check-circle-fill text-success me-2"></i>
                                                <small className="text-light opacity-75">
                                                    {isAuthenticated ? 'Panel de control' : 'Acceso público'}
                                                </small>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-center">
                                        <div className="d-inline-flex align-items-center text-warning fw-medium">
                                            <span className="me-2">Ver Métricas</span>
                                            <i className="bi bi-arrow-right"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-12 col-md-6 col-lg-5">
                                <div 
                                    className="glass-card h-100 p-4 position-relative cursor-pointer"
                                    style={{
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease-in-out',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        minHeight: '300px',
                                        borderRadius:'20px'
                                    }}
                                    onClick={handleShowGallery}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-8px)';
                                        e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.3)';
                                        e.currentTarget.style.borderColor = 'rgba(13, 202, 240, 0.3)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(1, 3, 26, 0.51)';
                                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                    }}
                                >
                                    <div className="text-center mb-4">
                                        <div 
                                            className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                                            style={{
                                                width: '80px',
                                                height: '80px',
                                                background: 'linear-gradient(135deg, rgba(13, 202, 240, 0.2) 0%, rgba(13, 202, 240, 0.1) 100%)',
                                                border: '2px solid rgba(13, 202, 240, 0.3)'
                                            }}
                                        >
                                            <i className="bi bi-images text-info" style={{ fontSize: '2rem' }}></i>
                                        </div>
                                    </div>

                                    <div className="text-center">
                                        <h3 className="h4 fw-bold text-white mb-3">
                                            Galería de Donaciones
                                        </h3>
                                        <p className="text-light opacity-75 mb-4">
                                            Explora la galería visual de donaciones entregadas y 
                                            celebra el impacto positivo de la comunidad.
                                        </p>
                                        
                                        <div className="text-start mb-4">
                                            <div className="d-flex align-items-center mb-2">
                                                <i className="bi bi-check-circle-fill text-success me-2"></i>
                                                <small className="text-light opacity-75">Imágenes de donaciones</small>
                                            </div>
                                            <div className="d-flex align-items-center mb-2">
                                                <i className="bi bi-check-circle-fill text-success me-2"></i>
                                                <small className="text-light opacity-75">Información de donantes</small>
                                            </div>
                                            <div className="d-flex align-items-center mb-2">
                                                <i className="bi bi-check-circle-fill text-success me-2"></i>
                                                <small className="text-light opacity-75">Fechas de entrega</small>
                                            </div>
                                            <div className="d-flex align-items-center">
                                                <i className="bi bi-check-circle-fill text-success me-2"></i>
                                                <small className="text-light opacity-75">Filtros por fecha</small>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-center">
                                        <div className="d-inline-flex align-items-center text-info fw-medium">
                                            <span className="me-2">Ver Galería</span>
                                            <i className="bi bi-arrow-right"></i>
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

    
    const renderMetricsView = () => (
        <div style={{ position: 'relative' }}>
            <div style={{
                position: 'fixed',
                top: '90px',
                left: '20px',
                zIndex: 1000
            }}>
                <button
                    className="btn p-2"
                    onClick={handleBackToSelection}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'white',
                        fontSize: '24px',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                        e.target.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = 'transparent';
                        e.target.style.transform = 'scale(1)';
                    }}
                    aria-label="Volver al Dashboard"
                >
                    <i className="bi bi-arrow-left"></i>
                </button>
            </div>
            <Metricas />
        </div>
    );

    
    const renderPublicMetricsView = () => (
        <div style={{ position: 'relative' }}>
            <div style={{
                position: 'fixed',
                top: '90px',
                left: '20px',
                zIndex: 1000
            }}>
                <button
                    className="btn p-2"
                    onClick={handleBackToSelection}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'white',
                        fontSize: '24px',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                        e.target.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = 'transparent';
                        e.target.style.transform = 'scale(1)';
                    }}
                    aria-label="Volver al Dashboard"
                >
                    <i className="bi bi-arrow-left"></i>
                </button>
            </div>
            <MetricasPublicas />
        </div>
    );

    
    const renderGalleryView = () => (
        <div style={{ position: 'relative' }}>
            <div style={{
                position: 'fixed',
                top: '90px',
                left: '20px',
                zIndex: 1000
            }}>
                <button
                    className="btn p-2"
                    onClick={handleBackToSelection}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'white',
                        fontSize: '24px',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                        e.target.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = 'transparent';
                        e.target.style.transform = 'scale(1)';
                    }}
                    aria-label="Volver al Dashboard"
                >
                    <i className="bi bi-arrow-left"></i>
                </button>
            </div>
            <GaleriaDonaciones />
        </div>
    );

    
    switch (activeView) {
        case 'metrics':
            return renderMetricsView();
        case 'metrics-public':
            return renderPublicMetricsView();
        case 'gallery':
            return renderGalleryView();
        case 'selection':
        default:
            return renderSelectionView();
    }
};

export default Dashboard; 