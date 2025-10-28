import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import * as turf from '@turf/turf';
import axios from 'axios';


const createCustomIcon = (color, size = [25, 41]) => {
    return L.icon({
        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
        iconSize: size,
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        shadowSize: [41, 41]
    });
};


const truckIcon = L.icon({
    iconUrl: '/camionc.png', 
    iconSize: [40, 40],
    iconAnchor: [20, 20],    
    popupAnchor: [0, -20]
});


const currentPositionIcon = createCustomIcon('red');

const historyPointIcon = createCustomIcon('blue');

const startPointIcon = createCustomIcon('green');


const calculateBearing = (startLat, startLng, destLat, destLng) => {
    const startLatRad = startLat * Math.PI / 180;
    const startLngRad = startLng * Math.PI / 180;
    const destLatRad = destLat * Math.PI / 180;
    const destLngRad = destLng * Math.PI / 180;

    const y = Math.sin(destLngRad - startLngRad) * Math.cos(destLatRad);
    const x = Math.cos(startLatRad) * Math.sin(destLatRad) -
        Math.sin(startLatRad) * Math.cos(destLatRad) * Math.cos(destLngRad - startLngRad);

    let bearing = Math.atan2(y, x) * 180 / Math.PI;
    bearing = (bearing + 360) % 360; 

    return bearing;
};


const RoutingMachine = ({ seguimiento }) => {
    const map = useMap();
    const movingMarkerRef = useRef(null);
    const routePointsRef = useRef([]);
    const animationRef = useRef(null);
    const autoStartedRef = useRef(false);
    const routeLayerRef = useRef(null);
    const [isAnimating, setIsAnimating] = useState(false);

    const startAnimation = () => {
        if (isAnimating || routePointsRef.current.length === 0) return;

        setIsAnimating(true);
        let step = 0;
        const totalSteps = routePointsRef.current.length;
        let lastTimestamp = null;

        
        const totalAnimationTime = 90000; 

        
        const timePerStep = totalAnimationTime / totalSteps;

        
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }

        let startTime = null;

        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;

            
            const elapsedTime = timestamp - startTime;

            
            const currentStep = Math.min(Math.floor(elapsedTime / timePerStep), totalSteps - 1);

            
            if (currentStep >= totalSteps - 1) {
                
                const finalPoint = routePointsRef.current[totalSteps - 1];
                if (movingMarkerRef.current && finalPoint) {
                    movingMarkerRef.current.setLatLng([finalPoint.lat, finalPoint.lng]);
                }
                setIsAnimating(false);
                return;
            }


            const currentPoint = routePointsRef.current[currentStep];
            const nextPoint = routePointsRef.current[Math.min(currentStep + 1, totalSteps - 1)];

            if (movingMarkerRef.current && currentPoint) {
                
                movingMarkerRef.current.setLatLng([currentPoint.lat, currentPoint.lng]);

                
                if (nextPoint) {
                    const bearing = calculateBearing(
                        currentPoint.lat, currentPoint.lng,
                        nextPoint.lat, nextPoint.lng
                    );

                    
                    const markerElement = movingMarkerRef.current.getElement();
                    if (markerElement) {
                        const iconElement = markerElement.querySelector('img');
                        if (iconElement) {
                            iconElement.style.transform = `rotate(${bearing - 90}deg)`;
                        }
                    }
                }
            }

            
            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);
    };

    const stopAnimation = () => {
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
            setIsAnimating(false);
        }
    };

    
    const autoStartAnimation = () => {
        if (!autoStartedRef.current && routePointsRef.current.length > 0) {
            
            autoStartedRef.current = true;

            
            setTimeout(() => {
                startAnimation();
            }, 500);
        }
    };

    
    const getRouteFromOpenRouteService = async (waypoints) => {
        try {
            
            const apiKey = '5b3ce3597851110001cf6248099d6d212bcf4f3c9a99b05ca49ae755'; 
            
            
            const coordinates = waypoints.map(wp => [wp.lng, wp.lat]);
            
            
            const response = await axios.post(
                'http://localhost:8082/proxy/ruta',
                //'http://192.168.0.18:8082/proxy/ruta',
                {
                    coordinates: coordinates,
                    preference: 'fastest',
                    format: 'geojson',
                    instructions: false
                }
            );

            

            if (response.data && response.data.features && response.data.features.length > 0) {
                
                const routeCoordinates = response.data.features[0].geometry.coordinates;
                
                
                return routeCoordinates.map(coord => ({
                    lat: coord[1],
                    lng: coord[0]
                }));
            }
            
            return [];
        } catch (error) {
            console.error('Error fetching route:', error);
            
            return waypoints;
        }
    };

    useEffect(() => {
        if (!map || !seguimiento) return;

        
        const historialPoints = seguimiento.historial.map(p => [p.latitud, p.longitud]);
        const allPoints = [...historialPoints, [seguimiento.latitud, seguimiento.longitud]];

        
        if (allPoints.length < 2) return;

        
        const waypoints = allPoints.map(point => L.latLng(point[0], point[1]));

        
        if (!movingMarkerRef.current) {
            
            movingMarkerRef.current = L.marker(waypoints[0], {
                icon: truckIcon,
                zIndexOffset: 1000, 
                rotationAngle: 0,   
                rotationOrigin: 'center center' 
            }).addTo(map);

            
            movingMarkerRef.current.bindPopup('Vehículo en tránsito');
        }

        
        const cleanup = () => {
            stopAnimation();
            if (movingMarkerRef.current) {
                map.removeLayer(movingMarkerRef.current);
                movingMarkerRef.current = null;
            }
            if (routeLayerRef.current) {
                map.removeLayer(routeLayerRef.current);
                routeLayerRef.current = null;
            }
            
            autoStartedRef.current = false;
        };


        const initRoute = async () => {
            try {
                
                const routePoints = await getRouteFromOpenRouteService(waypoints);
                
                
                routePointsRef.current = routePoints;
                
                
                if (routeLayerRef.current) {
                    map.removeLayer(routeLayerRef.current);
                }
                
                
                routeLayerRef.current = L.polyline(
                    routePoints.map(point => [point.lat, point.lng]),
                    { color: '#6FA1EC', weight: 4 }
                ).addTo(map);
                
                
                map.fitBounds(routeLayerRef.current.getBounds(), {
                    padding: [50, 50]
                });
                
                
                if (movingMarkerRef.current && routePoints.length > 0) {
                    const firstPoint = routePoints[0];
                    movingMarkerRef.current.setLatLng([firstPoint.lat, firstPoint.lng]);
                    
                    
                    if (routePoints.length > 1) {
                        const nextPoint = routePoints[1];
                        const bearing = calculateBearing(
                            firstPoint.lat, firstPoint.lng,
                            nextPoint.lat, nextPoint.lng
                        );
                        
                        
                        const markerElement = movingMarkerRef.current.getElement();
                        if (markerElement) {
                            const iconElement = markerElement.querySelector('img');
                            if (iconElement) {
                                iconElement.style.transform = `rotate(${bearing - 90}deg)`;
                            }
                        }
                    }
                }
                
                
                autoStartAnimation();
            } catch (error) {
                console.error('Error initializing route:', error);
            }
        };
        
        
        initRoute();

        
        return cleanup;
    }, [map, seguimiento]);

    return null;
};

const MapaSeguimiento = ({ seguimiento }) => {
    const [mapReady, setMapReady] = useState(false);

    
    const historialPoints = seguimiento.historial.map(p => [p.latitud, p.longitud]);
    const currentPosition = [seguimiento.latitud, seguimiento.longitud];

    
    const firstPoint = seguimiento.historial[0];
    const currentPoint = [seguimiento.latitud, seguimiento.longitud];

            
    const center = [
        (parseFloat(firstPoint.latitud) + parseFloat(seguimiento.latitud)) / 2,
        (parseFloat(firstPoint.longitud) + parseFloat(seguimiento.longitud)) / 2
    ];

    return (
        <MapContainer
            center={center}
            zoom={5}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            
            <Marker
                position={[firstPoint.latitud, firstPoint.longitud]}
                icon={startPointIcon}
            >
                <Popup>
                    Origen: {seguimiento.origen || 'No especificado'}
                </Popup>
            </Marker>

            
            <Marker
                position={currentPoint}
                icon={currentPositionIcon}
            >
                <Popup>
                    Ubicación actual
                </Popup>
            </Marker>

            
            {seguimiento.historial.slice(1).map((point, index) => (
                <Marker
                    key={index}
                    position={[point.latitud, point.longitud]}
                    icon={historyPointIcon}
                >
                    <Popup>
                        Punto de ruta: {index + 2}
                    </Popup>
                </Marker>
            ))}

            
            <RoutingMachine seguimiento={seguimiento} />
        </MapContainer>
    );
};

export default MapaSeguimiento;
