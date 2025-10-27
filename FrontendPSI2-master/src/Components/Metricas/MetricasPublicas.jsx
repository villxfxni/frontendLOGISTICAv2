import React, { useEffect, useState, useRef } from 'react';
import { getMetricas } from '../../Services/metricasService.js';
import '../Style.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Header from "../Common/Header.jsx";

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
import { Bar, Pie } from 'react-chartjs-2';


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


const MetricasPublicas = () => {
    const [metricas, setMetricas] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    const chartRefs = {
        monthlyChart: useRef(null),
        productsChart: useRef(null)
    };

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


    if (loading) {
        return (
            <div className="list-div">
                <Header />
                <div className="flex-grow-1 m-1">
                    <div className="container-fluid h-100 d-flex justify-content-center align-items-center">
                        <div className="w-100 w-md-75 h-100 p-2 m-1 m-md-3" style={{maxWidth:'1200px', width:'100%'}}>
                            
                            <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                                <div className="glass-card p-5 text-center">
                                    <div className="spinner-border text-warning mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                                        <span className="visually-hidden">Cargando...</span>
                                    </div>
                                    <p className="text-white mb-0 fs-5">Cargando estadísticas generales...</p>
                                    <p className="text-light opacity-75 mt-2 mb-0 small">Obteniendo resumen de actividad</p>
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
                            
                            <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                                <div className="glass-card p-5 text-center">
                                    <div className="alert alert-danger mb-0" role="alert">
                                        <i className="bi bi-exclamation-triangle me-2 fs-4"></i>
                                        <div className="mt-2">
                                            <strong>Error al cargar las estadísticas</strong>
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
    }

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

    return (
        <div className="list-div">
            <Header/>
            
            <div className="container-fluid d-flex justify-content-center">
                <div className="w-100 align-items-center justify-content-center container-fluid"
                     style={{maxWidth: "1200px"}}>
                
                    <div className="mb-4 mt-4">
                        
                        <div className="text-center mb-5">
                            <h2 className="display-5 fw-bold text-white mb-3">
                                Estadísticas Generales
                            </h2>
                            <p className="lead text-light opacity-75 mb-0">
                                Resumen público de la actividad del sistema de donaciones
                            </p>
                        </div>

                        
                        <div className="row g-4 mb-5">
                            <div className="col-md-3">
                                <div className="glass-card h-100 rounded-3">
                                    <div className="card-body text-center p-4">
                                        <h6 className="text-light mb-2">Total Solicitudes</h6>
                                        <p className="display-4 fw-bold m-0 text-light">{metricas.totalSolicitudesRecibidas}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="glass-card h-100 rounded-3">
                                    <div className="card-body text-center p-4">
                                        <h6 className="text-light mb-2">Donaciones Entregadas</h6>
                                        <p className="display-4 fw-bold m-0 text-light">{metricas.donacionesEntregadas}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="glass-card h-100 rounded-3">
                                    <div className="card-body text-center p-4">
                                        <h6 className="text-light mb-2">Tiempo Promedio Respuesta</h6>
                                        <p className="display-4 fw-bold m-0 text-light">{formatTime(metricas.tiempoPromedioRespuesta)}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="glass-card h-100 rounded-3">
                                    <div className="card-body text-center p-4">
                                        <h6 className="text-light mb-2">Tiempo Promedio Entrega</h6>
                                        <p className="display-4 fw-bold m-0 text-light">{formatTime(metricas.tiempoPromedioEntrega)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        
                        <div className="row g-4">
                            
                            <div className="col-md-8">
                                <div className="glass-panel h-100 rounded-3">
                                    <div className="card-body p-4">
                                        <h5 className="card-title mb-3 text-light">Solicitudes por Mes</h5>
                                        <div style={{ height: '350px' }} ref={chartRefs.monthlyChart}>
                                            <Bar data={solicitudesPorMesData} options={chartOptions} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            
                            <div className="col-md-4">
                                <div className="glass-panel h-100 rounded-3">
                                    <div className="card-body p-4">
                                        <h5 className="card-title mb-3 text-light">Productos Más Solicitados</h5>
                                        <div style={{ height: '350px' }} ref={chartRefs.productsChart}>
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
                                                        .slice(0, 5)
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
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default MetricasPublicas; 
