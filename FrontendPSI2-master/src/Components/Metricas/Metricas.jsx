import React, { useEffect, useState, useRef } from 'react';
import { getMetricas } from '../../Services/metricasService.js';
import '../Style.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Header from "../Common/Header.jsx";
import MetricasWebSocketListener from './MetricasWebsocketListener.jsx';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { generateMetricsPDF } from '../../Services/pdfGeneratorService.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const formatTime = (value) => {
    if (value < 1) {
        return '<1 día';
    } else {
        return `${parseFloat(value).toFixed(1)} días`;
    }
};

const MetricasComponent = () => {
    const [metricas, setMetricas] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [timeRange, setTimeRange] = useState('all');
    const [provinceFilter, setProvinceFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [activeTab, setActiveTab] = useState('general');

    const [visibleMetrics, setVisibleMetrics] = useState({
        general: {
            solicitudesRecibidas: true,
            donacionesEntregadas: true,
            tiempoPromedioRespuesta: true,
            tiempoPromedioEntrega: true,
            solicitudesPorMes: true,
            productosMasSolicitados: true
        },
        solicitudes: {
            sinResponder: true,
            aprobadas: true, 
            rechazadas: true,
            estadoSolicitudes: true,
            solicitudesPorProvincia: true
        },
        donaciones: {
            pendientes: true,
            entregadas: true,
            estadoDonaciones: true,
            informacion: true
        }
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await getMetricas();
                setMetricas(data);
                setError(null);
            } catch (error) {
                console.error('Error al obtener métricas:', error);
                setError('No se pudieron cargar las métricas. Intente nuevamente más tarde.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleTimeRangeChange = (range) => {
        setTimeRange(range);
        filterData(range, provinceFilter, categoryFilter);
    };

    const handleProvinceChange = (province) => {
        setProvinceFilter(province);
        filterData(timeRange, province, categoryFilter);
    };

    const handleCategoryChange = (category) => {
        setCategoryFilter(category);
        filterData(timeRange, provinceFilter, category);
    };

    const filterData = (time, province, category) => {
        if (!metricas) return;
        
        let filteredData = { ...metricas };
        
        if (time !== 'all') {
            const now = new Date();
            let startDate;
            
            switch (time) {
                case 'last7days':
                    startDate = new Date(now.setDate(now.getDate() - 7));
                    break;
                case 'last30days':
                    startDate = new Date(now.setDate(now.getDate() - 30));
                    break;
                case 'last90days':
                    startDate = new Date(now.setDate(now.getDate() - 90));
                    break;
                case 'thisYear':
                    startDate = new Date(now.getFullYear(), 0, 1);
                    break;
                default:
                    startDate = null;
            }
            
            console.log(`Filtering data from ${startDate} to now`);
            

            if (startDate && filteredData.solicitudesPorMes) {
                console.log(`Applied time filter: ${time}`);
            }
        }
        
        if (province !== 'all') {
            console.log(`Filtering data for province: ${province}`);
            
            if (filteredData.solicitudesPorProvincia) {
                const selectedProvinceData = {};
                if (filteredData.solicitudesPorProvincia[province]) {
                    selectedProvinceData[province] = filteredData.solicitudesPorProvincia[province];
                    console.log(`Showing data only for ${province}`);
                }
            }
        }
        
        if (category !== 'all') {
            console.log(`Filtering by category: ${category}`);
            
            if (category === 'solicitudes') {
                setActiveTab('solicitudes');
            } else if (category === 'donaciones') {
                setActiveTab('donaciones');
            } else if (category === 'productos') {
                setActiveTab('general');
                setVisibleMetrics(prev => ({
                    ...prev,
                    general: {
                        ...prev.general,
                        productosMasSolicitados: true,
                        solicitudesRecibidas: false,
                        donacionesEntregadas: false,
                        tiempoPromedioRespuesta: false,
                        tiempoPromedioEntrega: false,
                        solicitudesPorMes: false
                    }
                }));
            }
        }
        
        console.log('Filters applied:', { time, province, category });
        
        const filterMessage = document.getElementById('filter-message');
        if (filterMessage) {
            filterMessage.innerHTML = `<div class="mt-2 mb-3 alert alert-info">
                <i class="bi bi-funnel-fill me-2"></i>
                Filtros aplicados: ${time !== 'all' ? `Tiempo: ${time}` : ''} 
                ${province !== 'all' ? `Provincia: ${province}` : ''} 
                ${category !== 'all' ? `Categoría: ${category}` : ''}
            </div>`;
            setTimeout(() => {
                filterMessage.innerHTML = '';
            }, 3000);
        }
    };

    const toggleMetricVisibility = (tab, metric) => {
        setVisibleMetrics(prev => ({
            ...prev,
            [tab]: {
                ...prev[tab],
                [metric]: !prev[tab][metric]
            }
        }));
    };

    const prepareChartDataForPDF = () => {
        return {
            solicitudesPorMesData: {
                labels: Object.keys(metricas.solicitudesPorMes),
                datasets: [
                    {
                        label: 'Solicitudes',
                        data: Object.values(metricas.solicitudesPorMes),
                        backgroundColor: [
                            'rgb(25, 73, 115)',
                            'rgb(59, 119, 157)',
                            'rgb(102, 147, 194)',
                            'rgb(158, 196, 222)',
                            'rgb(204, 229, 245)',
                        ],
                        borderColor: 'rgba(255, 255, 255, 1)',
                        borderWidth: 1,
                    },
                ],
            },
            productosMasSolicitadosData: {
                labels: Object.keys(metricas.topProductosMasSolicitados),
                datasets: [
                    {
                        label: 'Cantidad',
                        data: Object.values(metricas.topProductosMasSolicitados),
                        backgroundColor: [
                            'rgb(25, 73, 115)',
                            'rgb(59, 119, 157)',
                            'rgb(102, 147, 194)',
                            'rgb(158, 196, 222)',
                            'rgb(204, 229, 245)',
                        ],
                        borderColor: [
                            'rgba(0, 0, 0, 0.34)',
                            'rgba(0, 0, 0, 0.34)',
                            'rgba(0, 0, 0, 0.34)',
                            'rgba(0, 0, 0, 0.34)',
                            'rgba(0, 0, 0, 0.34)',
                        ],
                        borderWidth: 1,
                    },
                ],
            },
            solicitudesStatusData: {
                labels: ['Sin Responder', 'Aprobadas', 'Rechazadas'],
                datasets: [
                    {
                        data: [
                            metricas.solicitudesSinResponder,
                            metricas.solicitudesAprobadas,
                            metricas.solicitudesRechazadas,
                        ],
                        backgroundColor: [
                            'rgb(25, 73, 115)',
                            'rgb(102, 147, 194)',
                            'rgb(158, 196, 222)',
                        ],
                        borderColor: 'rgba(0, 0, 0, 1)',
                        borderWidth: 1,
                    },
                ],
            },
            donacionesStatusData: {
                labels: ['Pendientes', 'Entregadas'],
                datasets: [
                    {
                        data: [
                            metricas.donacionesPendientes,
                            metricas.donacionesEntregadas,
                        ],
                        backgroundColor: [
                            'rgb(25, 73, 115)',
                            'rgb(102, 147, 194)',
                        ],
                        borderColor: 'rgba(0, 0, 0, 1)',
                        borderWidth: 1,
                    },
                ],
            },
            solicitudesPorProvinciaData: {
                labels: Object.keys(metricas.solicitudesPorProvincia),
                datasets: [
                    {
                        label: 'Solicitudes',
                        data: Object.values(metricas.solicitudesPorProvincia),
                        backgroundColor: [
                            'rgb(25, 73, 115)',
                            'rgb(59, 119, 157)',
                            'rgb(102, 147, 194)',
                            'rgb(158, 196, 222)',
                            'rgb(204, 229, 245)',
                        ],
                        borderColor: 'rgba(255, 255, 255, 1)',
                        borderWidth: 1,
                    },
                ],
            }
        };
    };

    const generatePDF = async () => {
        if (!metricas) {
            alert('No hay datos de métricas disponibles para generar el PDF.');
            return;
        }

        try {
            const chartData = prepareChartDataForPDF();
            
            await generateMetricsPDF(metricas, chartData);
            
        } catch (error) {
            console.error('Error al generar PDF:', error);
            alert(`Hubo un error al generar el PDF: ${error.message || 'Error desconocido'}. Por favor, intente nuevamente.`);
        }
    };

    const handleMetricasActualizadas = (nuevasMetricas) => {
        console.log("🔄 Actualizando métricas con datos del WebSocket");
        setMetricas(nuevasMetricas);
    };

    if (loading) return (
        <div className="list-div">
            <Header/>
            <div className="flex-grow-1 m-1">
                <div className="container-fluid h-100 d-flex justify-content-center align-items-center">
                    <div className="w-100 w-md-75 h-100 p-2 m-1 m-md-3" style={{maxWidth:'1500px', width:'100%'}}>
                        
                        <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                            <div className="glass-card p-5 text-center">
                                <div className="spinner-border text-warning mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                                <span className="visually-hidden">Cargando...</span>
                            </div>
                                <p className="text-white mb-0 fs-5">Cargando métricas del sistema...</p>
                                <p className="text-light opacity-75 mt-2 mb-0 small">Obteniendo datos estadísticos</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (error) return (
        <div className="list-div">
            <Header/>
            <div className="flex-grow-1 m-1">
                <div className="container-fluid h-100 d-flex justify-content-center align-items-center">
                    <div className="w-100 w-md-75 h-100 p-2 m-1 m-md-3" style={{maxWidth:'1500px', width:'100%'}}>
                        
                        <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                            <div className="glass-card p-5 text-center">
                            <div className="alert alert-danger mb-0" role="alert">
                                    <i className="bi bi-exclamation-triangle me-2 fs-4"></i>
                                    <div className="mt-2">
                                        <strong>Error al cargar las métricas</strong>
                                        <p className="mb-0 mt-2">{error}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (!metricas) return null;

    const solicitudesPorMesData = {
        labels: Object.keys(metricas.solicitudesPorMes),
        datasets: [
            {
                label: 'Solicitudes',
                data: Object.values(metricas.solicitudesPorMes),
                backgroundColor: [
                    'rgb(25, 73, 115)',
                    'rgb(59, 119, 157)',
                    'rgb(102, 147, 194)',
                    'rgb(158, 196, 222)',
                    'rgb(204, 229, 245)',
                ],
                borderColor: 'rgba(255, 255, 255, 1)',
                borderWidth: 1,
            },
        ],
    };

    const productosMasSolicitadosData = {
        labels: Object.keys(metricas.topProductosMasSolicitados),
        datasets: [
            {
                label: 'Cantidad',
                data: Object.values(metricas.topProductosMasSolicitados),
                backgroundColor: [
                    'rgb(25, 73, 115)',
                    'rgb(59, 119, 157)',
                    'rgb(102, 147, 194)',
                    'rgb(158, 196, 222)',
                    'rgb(204, 229, 245)',
                ],
                borderColor: [
                    'rgba(0, 0, 0, 0.34)',
                    'rgba(0, 0, 0, 0.34)',
                    'rgba(0, 0, 0, 0.34)',
                    'rgba(0, 0, 0, 0.34)',
                    'rgba(0, 0, 0, 0.34)',
                ],
                borderWidth: 1,
            },
        ],
    };

    const solicitudesStatusData = {
        labels: ['Sin Responder', 'Aprobadas', 'Rechazadas'],
        datasets: [
            {
                data: [
                    metricas.solicitudesSinResponder,
                    metricas.solicitudesAprobadas,
                    metricas.solicitudesRechazadas,
                ],
                backgroundColor: [
                    'rgb(25, 73, 115)',
                    'rgb(102, 147, 194)',
                    'rgb(158, 196, 222)',
                ],
                borderColor: 'rgba(0, 0, 0, 1)',
                borderWidth: 1,
            },
        ],
    };

    const donacionesStatusData = {
        labels: ['Pendientes', 'Entregadas'],
        datasets: [
            {
                data: [
                    metricas.donacionesPendientes,
                    metricas.donacionesEntregadas,
                ],
                backgroundColor: [
                    'rgb(25, 73, 115)',
                    'rgb(102, 147, 194)',
                ],
                borderColor: 'rgba(0, 0, 0, 1)',
                borderWidth: 1,
            },
        ],
    };
    
    const solicitudesPorProvinciaData = {
        labels: Object.keys(metricas.solicitudesPorProvincia),
        datasets: [
            {
                label: 'Solicitudes',
                data: Object.values(metricas.solicitudesPorProvincia),
                backgroundColor: [
                    'rgb(25, 73, 115)',
                    'rgb(59, 119, 157)',
                    'rgb(102, 147, 194)',
                    'rgb(158, 196, 222)',
                    'rgb(204, 229, 245)',

                ],
                borderColor: 'rgba(255, 255, 255, 1)',
                borderWidth: 1,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: 'white',
                    font: {
                        family: "'Segoe UI', sans-serif"
                    }
                }
            },
            title: {
                display: false,
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                titleFont: {
                    family: "'Segoe UI', sans-serif",
                    size: 14
                },
                bodyFont: {
                    family: "'Segoe UI', sans-serif",
                    size: 13
                },
                padding: 10,
                cornerRadius: 0,
                displayColors: true
            }
        },
        scales: {
            x: {
                ticks: {
                    color: 'white',
                    font: {
                        family: "'Segoe UI', sans-serif"
                    }
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                }
            },
            y: {
                ticks: {
                    color: 'white',
                    font: {
                        family: "'Segoe UI', sans-serif"
                    }
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                }
            }
        }
    };

    const pieChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: 'white',
                    padding: 10,
                    usePointStyle: true,
                    font: {
                        family: "'Segoe UI', sans-serif"
                    }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                titleFont: {
                    family: "'Segoe UI', sans-serif",
                    size: 14
                },
                bodyFont: {
                    family: "'Segoe UI', sans-serif",
                    size: 13
                },
                padding: 10,
                cornerRadius: 0,
                displayColors: true
            }
        },
    };

    const provinceOptions = ['all', ...Object.keys(metricas.solicitudesPorProvincia)];
    const timeRangeOptions = ['all', 'last7days', 'last30days', 'last90days', 'thisYear'];
    const categoryOptions = ['all', 'solicitudes', 'donaciones', 'productos'];

    return (
        <div className="list-div">
            <Header/>
            
            <div className="container-fluid d-flex justify-content-center">
                <div className="w-100 align-items-center justify-content-center container-fluid"
                     style={{maxWidth: "1500px"}}>
                
                    <div className="mb-4 mt-4">
                        <div className="d-flex justify-content-end align-items-center mb-4">
                            <div className="d-flex gap-3">
                                <button 
                                    className="btn btn-sm btn-warning text-dark fw-medium rounded-pill"
                                    onClick={generatePDF}
                                    aria-label="Descargar reporte en PDF"
                                    style={{
                                        borderRadius: '4px',
                                        border: 'none',
                                        boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                                    }}
                                >
                                    <i className="bi bi-file-earmark-pdf me-1"></i> Descargar PDF
                                </button>
                                        </div>
                                        </div>

                        
                        <MetricasWebSocketListener onActualizarMetricas={handleMetricasActualizadas} />

                        
                        <ul className="nav nav-tabs border-0 mb-4 d-flex justify-content-center">
                            <li className="nav-item">
                                <button 
                                    className={`me-3 rounded-pill nav-link ${activeTab === 'general' ? 'active border-bottom border-top border-end border-start border-2 border-warning text-light' : 'text-light opacity-75 hover-effect'} border-0 bg-transparent`}
                                    onClick={() => setActiveTab('general')}
                                    aria-label="Ver resumen general"
                                >
                                    Resumen General
                                </button>
                            </li>
                            <li className="nav-item">
                                <button 
                                    className={`me-3 rounded-pill nav-link ${activeTab === 'solicitudes' ? 'active border-bottom border-top border-end border-start border-2 border-warning text-light' : 'text-light opacity-75 hover-effect'} border-0 bg-transparent`}
                                    onClick={() => setActiveTab('solicitudes')}
                                    aria-label="Ver solicitudes"
                                >
                                    Solicitudes
                                </button>
                            </li>
                            <li className="nav-item">
                                <button 
                                    className={`me-3 rounded-pill nav-link ${activeTab === 'donaciones' ? 'active border-bottom border-top border-end border-start border-2 border-warning text-light' : 'text-light opacity-75 hover-effect'} border-0 bg-transparent`}
                                    onClick={() => setActiveTab('donaciones')}
                                    aria-label="Ver donaciones"
                                >
                                    Donaciones
                                </button>
                            </li>
                        </ul>

                        
                        <div className="row">
                            
                            <div className="col-md-3 mb-4">
                                <div className="glass-panel p-3 rounded-3 h-100">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h5 className="card-title mb-0 text-light">Métricas a Mostrar</h5>
                                        <button 
                                            className="btn btn-sm btn-outline-light rounded-pill" 
                                            onClick={() => {
                                                setVisibleMetrics({
                                                    general: {
                                                        solicitudesRecibidas: true,
                                                        donacionesEntregadas: true,
                                                        tiempoPromedioRespuesta: true,
                                                        tiempoPromedioEntrega: true,
                                                        solicitudesPorMes: true,
                                                        productosMasSolicitados: true
                                                    },
                                                    solicitudes: {
                                                        sinResponder: true,
                                                        aprobadas: true, 
                                                        rechazadas: true,
                                                        estadoSolicitudes: true,
                                                        solicitudesPorProvincia: true
                                                    },
                                                    donaciones: {
                                                        pendientes: true,
                                                        entregadas: true,
                                                        estadoDonaciones: true,
                                                        informacion: true
                                                    }
                                                });
                                            }}
                                            aria-label="Mostrar todas las métricas"
                                        >
                                            <i className="bi bi-check-all me-1"></i> Todo
                                        </button>
                                    </div>
                                    
                                    {activeTab === 'general' && (
                                        <div className="row g-2">
                                            <div className="col-12">
                                                <div className="form-check form-switch">
                                                    <input 
                                                        className="form-check-input" 
                                                        type="checkbox" 
                                                        id="showSolicitudesRecibidas" 
                                                        checked={visibleMetrics.general.solicitudesRecibidas}
                                                        onChange={() => toggleMetricVisibility('general', 'solicitudesRecibidas')}
                                                    />
                                                    <label className="form-check-label text-light" htmlFor="showSolicitudesRecibidas">
                                                        Solicitudes Recibidas
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="col-12">
                                                <div className="form-check form-switch">
                                                    <input 
                                                        className="form-check-input" 
                                                        type="checkbox" 
                                                        id="showDonacionesEntregadas" 
                                                        checked={visibleMetrics.general.donacionesEntregadas}
                                                        onChange={() => toggleMetricVisibility('general', 'donacionesEntregadas')}
                                                    />
                                                    <label className="form-check-label text-light" htmlFor="showDonacionesEntregadas">
                                                        Donaciones Entregadas
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="col-12">
                                                <div className="form-check form-switch">
                                                    <input 
                                                        className="form-check-input" 
                                                        type="checkbox" 
                                                        id="showTiempoRespuesta" 
                                                        checked={visibleMetrics.general.tiempoPromedioRespuesta}
                                                        onChange={() => toggleMetricVisibility('general', 'tiempoPromedioRespuesta')}
                                                    />
                                                    <label className="form-check-label text-light" htmlFor="showTiempoRespuesta">
                                                        Tiempo Promedio Respuesta
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="col-12">
                                                <div className="form-check form-switch">
                                                    <input 
                                                        className="form-check-input" 
                                                        type="checkbox" 
                                                        id="showTiempoEntrega" 
                                                        checked={visibleMetrics.general.tiempoPromedioEntrega}
                                                        onChange={() => toggleMetricVisibility('general', 'tiempoPromedioEntrega')}
                                                    />
                                                    <label className="form-check-label text-light" htmlFor="showTiempoEntrega">
                                                        Tiempo Promedio Entrega
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="col-12">
                                                <div className="form-check form-switch">
                                                    <input 
                                                        className="form-check-input" 
                                                        type="checkbox" 
                                                        id="showSolicitudesMes" 
                                                        checked={visibleMetrics.general.solicitudesPorMes}
                                                        onChange={() => toggleMetricVisibility('general', 'solicitudesPorMes')}
                                                    />
                                                    <label className="form-check-label text-light" htmlFor="showSolicitudesMes">
                                                        Solicitudes por Mes
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="col-12">
                                                <div className="form-check form-switch">
                                                    <input 
                                                        className="form-check-input" 
                                                        type="checkbox" 
                                                        id="showProductosMasSolicitados" 
                                                        checked={visibleMetrics.general.productosMasSolicitados}
                                                        onChange={() => toggleMetricVisibility('general', 'productosMasSolicitados')}
                                                    />
                                                    <label className="form-check-label text-light" htmlFor="showProductosMasSolicitados">
                                                        Productos Más Solicitados
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {activeTab === 'solicitudes' && (
                                        <div className="row g-2">
                                            <div className="col-12">
                                                <div className="form-check form-switch">
                                                    <input 
                                                        className="form-check-input" 
                                                        type="checkbox" 
                                                        id="showSinResponder" 
                                                        checked={visibleMetrics.solicitudes.sinResponder}
                                                        onChange={() => toggleMetricVisibility('solicitudes', 'sinResponder')}
                                                    />
                                                    <label className="form-check-label text-light" htmlFor="showSinResponder">
                                                        Solicitudes Sin Responder
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="col-12">
                                                <div className="form-check form-switch">
                                                    <input 
                                                        className="form-check-input" 
                                                        type="checkbox" 
                                                        id="showAprobadas" 
                                                        checked={visibleMetrics.solicitudes.aprobadas}
                                                        onChange={() => toggleMetricVisibility('solicitudes', 'aprobadas')}
                                                    />
                                                    <label className="form-check-label text-light" htmlFor="showAprobadas">
                                                        Solicitudes Aprobadas
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="col-12">
                                                <div className="form-check form-switch">
                                                    <input 
                                                        className="form-check-input" 
                                                        type="checkbox" 
                                                        id="showRechazadas" 
                                                        checked={visibleMetrics.solicitudes.rechazadas}
                                                        onChange={() => toggleMetricVisibility('solicitudes', 'rechazadas')}
                                                    />
                                                    <label className="form-check-label text-light" htmlFor="showRechazadas">
                                                        Solicitudes Rechazadas
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="col-12">
                                                <div className="form-check form-switch">
                                                    <input 
                                                        className="form-check-input" 
                                                        type="checkbox" 
                                                        id="showEstadoSolicitudes" 
                                                        checked={visibleMetrics.solicitudes.estadoSolicitudes}
                                                        onChange={() => toggleMetricVisibility('solicitudes', 'estadoSolicitudes')}
                                                    />
                                                    <label className="form-check-label text-light" htmlFor="showEstadoSolicitudes">
                                                        Estado de Solicitudes
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="col-12">
                                                <div className="form-check form-switch">
                                                    <input 
                                                        className="form-check-input" 
                                                        type="checkbox" 
                                                        id="showSolicitudesProvincia" 
                                                        checked={visibleMetrics.solicitudes.solicitudesPorProvincia}
                                                        onChange={() => toggleMetricVisibility('solicitudes', 'solicitudesPorProvincia')}
                                                    />
                                                    <label className="form-check-label text-light" htmlFor="showSolicitudesProvincia">
                                                        Solicitudes por Provincia
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {activeTab === 'donaciones' && (
                                        <div className="row g-2">
                                            <div className="col-12">
                                                <div className="form-check form-switch">
                                                    <input 
                                                        className="form-check-input" 
                                                        type="checkbox" 
                                                        id="showPendientes" 
                                                        checked={visibleMetrics.donaciones.pendientes}
                                                        onChange={() => toggleMetricVisibility('donaciones', 'pendientes')}
                                                    />
                                                    <label className="form-check-label text-light" htmlFor="showPendientes">
                                                        Donaciones Pendientes
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="col-12">
                                                <div className="form-check form-switch">
                                                    <input 
                                                        className="form-check-input" 
                                                        type="checkbox" 
                                                        id="showEntregadas" 
                                                        checked={visibleMetrics.donaciones.entregadas}
                                                        onChange={() => toggleMetricVisibility('donaciones', 'entregadas')}
                                                    />
                                                    <label className="form-check-label text-light" htmlFor="showEntregadas">
                                                        Donaciones Entregadas
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="col-12">
                                                <div className="form-check form-switch">
                                                    <input 
                                                        className="form-check-input" 
                                                        type="checkbox" 
                                                        id="showEstadoDonaciones" 
                                                        checked={visibleMetrics.donaciones.estadoDonaciones}
                                                        onChange={() => toggleMetricVisibility('donaciones', 'estadoDonaciones')}
                                                    />
                                                    <label className="form-check-label text-light" htmlFor="showEstadoDonaciones">
                                                        Estado de Donaciones
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="col-12">
                                                <div className="form-check form-switch">
                                                    <input 
                                                        className="form-check-input" 
                                                        type="checkbox" 
                                                        id="showInfoDonaciones" 
                                                        checked={visibleMetrics.donaciones.informacion}
                                                        onChange={() => toggleMetricVisibility('donaciones', 'informacion')}
                                                    />
                                                    <label className="form-check-label text-light" htmlFor="showInfoDonaciones">
                                                        Información de Donaciones
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            
                            <div className="col-md-9">
                        <div className="tab-content">

                            
                            {activeTab === 'general' && (
                                <div>
                                            {visibleMetrics.general.solicitudesRecibidas || 
                                             visibleMetrics.general.donacionesEntregadas || 
                                             visibleMetrics.general.tiempoPromedioRespuesta || 
                                             visibleMetrics.general.tiempoPromedioEntrega ? (
                                    <div className="row g-4 mb-4">
                                                    {visibleMetrics.general.solicitudesRecibidas && (
                                        <div className="col-md-3">
                                            <div className="glass-card h-100 rounded-3">
                                                <div className="card-body text-center p-4">
                                                    <h6 className="text-light mb-2">Total Solicitudes Atendidas</h6>
                                                    <p className="display-4 fw-bold m-0 text-light">{metricas.totalSolicitudesRecibidas}</p>
                                                </div>
                                            </div>
                                        </div>
                                                    )}
                                                    {visibleMetrics.general.donacionesEntregadas && (
                                        <div className="col-md-3">
                                            <div className="glass-card h-100 rounded-3">
                                                <div className="card-body text-center p-4">
                                                    <h6 className="text-light mb-2">Donaciones Entregadas</h6>
                                                    <p className="display-4 fw-bold m-0 text-light">{metricas.donacionesEntregadas}</p>
                                                </div>
                                            </div>
                                        </div>
                                                    )}
                                                    {visibleMetrics.general.tiempoPromedioRespuesta && (
                                        <div className="col-md-3">
                                            <div className="glass-card h-100 rounded-3">
                                                <div className="card-body text-center p-4">
                                                    <h6 className="text-light mb-2">Tiempo Promedio Respuesta</h6>
                                                    <p className="display-4 fw-bold m-0 text-light">{formatTime(metricas.tiempoPromedioRespuesta)}</p>
                                                </div>
                                            </div>
                                        </div>
                                                    )}
                                                    {visibleMetrics.general.tiempoPromedioEntrega && (
                                        <div className="col-md-3">
                                            <div className="glass-card h-100 rounded-3">
                                                <div className="card-body text-center p-4  ">
                                                    <h6 className="text-light mb-2">Tiempo Promedio Entrega</h6>
                                                    <p className="display-4 fw-bold m-0 text-light">{formatTime(metricas.tiempoPromedioEntrega)}</p>
                                                </div>
                                            </div>
                                        </div>
                                                    )}
                                    </div>
                                            ) : null}

                                    
                                            {visibleMetrics.general.solicitudesPorMes || visibleMetrics.general.productosMasSolicitados ? (
                                    <div className="row g-4">
                                                    {visibleMetrics.general.solicitudesPorMes && (
                                                        <div className={visibleMetrics.general.productosMasSolicitados ? "col-md-8" : "col-md-12"}>
                                            <div className="glass-panel h-100 rounded-3">
                                                <div className="card-body p-4">
                                                    <h5 className="card-title mb-3 text-light">Solicitudes por Mes</h5>
                                                                                                <div style={{ height: '300px' }}>
                                                <Bar data={solicitudesPorMesData} options={chartOptions} />
                                            </div>
                                                </div>
                                            </div>
                                        </div>
                                                    )}
                                                    {visibleMetrics.general.productosMasSolicitados && (
                                                        <div className={visibleMetrics.general.solicitudesPorMes ? "col-md-4" : "col-md-12"}>
                                            <div className="glass-panel h-100 rounded-3">
                                                <div className="card-body p-4">
                                                    <h5 className="card-title mb-3 text-light">Productos Más Solicitados</h5>
                                                                                                <div style={{ height: '300px' }}>
                                                <Pie data={productosMasSolicitadosData} options={pieChartOptions} />
                                            </div>
                                                                    <div className="mt-3 table-responsive">
                                                                        <table className="table table-dark table-sm table-borderless">
                                                                            <thead>
                                                                                <tr>
                                                                                    <th className="text-light">Producto</th>
                                                                                    <th className="text-end text-light">Cantidad</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {Object.entries(metricas.topProductosMasSolicitados)
                                                                                    .sort((a, b) => b[1] - a[1])
                                                                                    .map(([product, count], index) => (
                                                                                        <tr key={index}>
                                                                                            <td className="text-light">{product}</td>
                                                                                            <td className="text-end text-light">{count}</td>
                                                                                        </tr>
                                                                                    ))
                                                                                }
                                                                            </tbody>
                                                                        </table>
                                                </div>
                                    </div>
                                </div>
                                    </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="alert alert-info">
                                                    <i className="bi bi-info-circle me-2"></i>
                                                    Seleccione las métricas que desea visualizar usando las opciones arriba.
                                                </div>
                                            )}
                                </div>
                            )}

                            
                            {activeTab === 'solicitudes' && (
                                <div>
                                    
                                            {visibleMetrics.solicitudes.sinResponder || 
                                             visibleMetrics.solicitudes.aprobadas || 
                                             visibleMetrics.solicitudes.rechazadas ? (
                                    <div className="row g-4 mb-4">
                                                    {visibleMetrics.solicitudes.sinResponder && (
                                        <div className="col-md-4">
                                            <div className="glass-card h-100 rounded-3">
                                                <div className="card-body text-center p-4">
                                                    <h6 className="text-light mb-2">Solicitudes Sin Responder</h6>
                                                    <p className="display-4 fw-bold m-0 text-light">{metricas.solicitudesSinResponder}</p>
                                                </div>
                                            </div>
                                        </div>
                                                    )}
                                                    {visibleMetrics.solicitudes.aprobadas && (
                                        <div className="col-md-4">
                                            <div className="glass-card h-100 rounded-3">
                                                <div className="card-body text-center p-4">
                                                    <h6 className="text-light mb-2">Solicitudes Aprobadas</h6>
                                                    <p className="display-4 fw-bold m-0 text-light">{metricas.solicitudesAprobadas}</p>
                                                </div>
                                            </div>
                                        </div>
                                                    )}
                                                    {visibleMetrics.solicitudes.rechazadas && (
                                        <div className="col-md-4">
                                            <div className="glass-card h-100 rounded-3">
                                                <div className="card-body text-center p-4">
                                                    <h6 className="text-light mb-2">Solicitudes Rechazadas</h6>
                                                    <p className="display-4 fw-bold m-0 text-light">{metricas.solicitudesRechazadas}</p>
                                    </div>
                                </div>
                            </div>
                                                    )}
                        </div>
                                            ) : null}

                                    
                                            {visibleMetrics.solicitudes.estadoSolicitudes || visibleMetrics.solicitudes.solicitudesPorProvincia ? (
                                    <div className="row g-4">
                                                    {visibleMetrics.solicitudes.estadoSolicitudes && (
                                                        <div className={visibleMetrics.solicitudes.solicitudesPorProvincia ? "col-md-6" : "col-md-12"}>
                                            <div className="glass-panel h-100 rounded-3">
                                                <div className="card-body p-4">
                                                    <h5 className="card-title mb-3 text-light">Estado de Solicitudes</h5>
                                                                                                <div style={{ height: '300px' }}>
                                                <Pie data={solicitudesStatusData} options={pieChartOptions} />
                                            </div>
                                                </div>
                                            </div>
                                        </div>
                                                    )}
                                                    {visibleMetrics.solicitudes.solicitudesPorProvincia && (
                                                        <div className={visibleMetrics.solicitudes.estadoSolicitudes ? "col-md-6" : "col-md-12"}>
                                            <div className="glass-panel h-100 rounded-3">
                                                <div className="card-body p-4">
                                                    <h5 className="card-title mb-3 text-light ">Solicitudes por Provincia</h5>
                                                                                                <div style={{ height: '300px' }}>
                                                <Bar data={solicitudesPorProvinciaData} options={chartOptions} />
                                            </div>
                                                </div>
                                            </div>
                                        </div>
                                                    )}
                                    </div>
                                            ) : (
                                                <div className="alert alert-info">
                                                    <i className="bi bi-info-circle me-2"></i>
                                                    Seleccione las métricas que desea visualizar usando las opciones arriba.
                                                </div>
                                            )}
                                </div>
                            )}

                            
                            {activeTab === 'donaciones' && (
                                <div>
                                    
                                            {visibleMetrics.donaciones.pendientes || visibleMetrics.donaciones.entregadas ? (
                                    <div className="row g-4 mb-4">
                                                    {visibleMetrics.donaciones.pendientes && (
                                        <div className="col-md-6">
                                            <div className="glass-card h-100 rounded-3">
                                                <div className="card-body text-center p-4">
                                                    <h6 className="text-light mb-2">Donaciones Pendientes</h6>
                                                    <p className="display-4 fw-bold m-0 text-light">{metricas.donacionesPendientes}</p>
                                                </div>
                                            </div>
                                        </div>
                                                    )}
                                                    {visibleMetrics.donaciones.entregadas && (
                                        <div className="col-md-6">
                                            <div className="glass-card h-100 rounded-3">
                                                <div className="card-body text-center p-4">
                                                    <h6 className="text-light mb-2">Donaciones Entregadas</h6>
                                                    <p className="display-4 fw-bold m-0 text-light">{metricas.donacionesEntregadas}</p>
                                                </div>
                                            </div>
                                        </div>
                                                    )}
                                    </div>
                                            ) : null}

                                    
                                            {visibleMetrics.donaciones.estadoDonaciones || visibleMetrics.donaciones.informacion ? (
                                    <div className="row g-4">
                                                    {visibleMetrics.donaciones.estadoDonaciones && (
                                                        <div className={visibleMetrics.donaciones.informacion ? "col-md-6" : "col-md-12"}>
                                            <div className="glass-panel h-100 rounded-3">
                                                <div className="card-body p-4">
                                                    <h5 className="card-title mb-3 text-light">Estado de Donaciones</h5>
                                                                                                <div style={{ height: '300px' }}>
                                                <Pie data={donacionesStatusData} options={pieChartOptions} />
                                            </div>
                                                </div>
                                            </div>
                                        </div>
                                                    )}
                                                    {visibleMetrics.donaciones.informacion && (
                                                        <div className={visibleMetrics.donaciones.estadoDonaciones ? "col-md-6" : "col-md-12"}>
                                            <div className="glass-panel h-100 rounded-3">
                                                <div className="card-body p-4">
                                                    <h5 className="card-title mb-3 text-light">Información de Donaciones</h5>
                                                    <table className="table table-dark table-borderless">
                                                        <tbody>
                                                            <tr>
                                                                <td className="text-light">Tiempo Promedio de Entrega</td>
                                                                <td className="text-end text-light">{formatTime(metricas.tiempoPromedioEntrega)}</td>
                                                            </tr>
                                                            <tr>
                                                                <td className="text-light"></td>
                                                                <td className="text-end text-light">{metricas.donacionesPorProvincia} </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                    </div>
                                </div>
                                                    )}
                                    </div>
                                            ) : (
                                                <div className="alert alert-info">
                                                    <i className="bi bi-info-circle me-2"></i>
                                                    Seleccione las métricas que desea visualizar usando las opciones arriba.
                                </div>
                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MetricasComponent;
