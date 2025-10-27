import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const markerIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    shadowSize: [41, 41]
});

const LocationMarker = ({ onLocationChange }) => {
    const [position, setPosition] = useState(null);
    const [accuracy, setAccuracy] = useState(null);
    const [address, setAddress] = useState("");
    const accuracyCircleRef = useRef(null);
    
    const map = useMapEvents({
        locationfound(e) {
            setPosition(e.latlng);
            setAccuracy(e.accuracy);
            onLocationChange(e.latlng);
            
            const zoomLevel = getZoomLevelBasedOnAccuracy(e.accuracy);
            map.flyTo(e.latlng, zoomLevel);
            
            fetchAddress(e.latlng.lat, e.latlng.lng);
            
            if (accuracyCircleRef.current) {
                accuracyCircleRef.current.remove();
            }
            
            accuracyCircleRef.current = L.circle(e.latlng, {
                radius: e.accuracy,
                color: "#4285F4",
                fillColor: "#4285F4",
                fillOpacity: 0.15,
                weight: 1
            }).addTo(map);
        },
        click(e) {
            setPosition(e.latlng);
            onLocationChange(e.latlng);
            
            if (accuracyCircleRef.current) {
                accuracyCircleRef.current.remove();
                accuracyCircleRef.current = null;
            }
            
            fetchAddress(e.latlng.lat, e.latlng.lng);
        },
    });
    
    const getZoomLevelBasedOnAccuracy = (accuracyInMeters) => {
        if (accuracyInMeters < 10) return 18;
        if (accuracyInMeters < 50) return 17;
        if (accuracyInMeters < 100) return 16;
        if (accuracyInMeters < 500) return 15;
        if (accuracyInMeters < 1000) return 14;
        return 13;
    };
    
    const fetchAddress = async (lat, lng) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&zoom=18&accept-language=es`
            );
            const data = await response.json();
            if (data && data.display_name) {
                setAddress(data.display_name);
            }
        } catch (error) {
            console.error("Error fetching address:", error);
        }
    };
    
    useEffect(() => {
        const options = {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        };
        map.locate(options);
    }, [map]);
    
    return position === null ? null : (
        <Marker
            position={position}
            icon={markerIcon}
            draggable={true}
            eventHandlers={{
                dragend: (e) => {
                    const newPos = e.target.getLatLng();
                    setPosition(newPos);
                    onLocationChange(newPos);

                    if (accuracyCircleRef.current) {
                        accuracyCircleRef.current.remove();
                        accuracyCircleRef.current = null;
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
                            {accuracy && <span> '(Precisión: ±{accuracy.toFixed(0)}m)'</span>}
                        </small>
                    </div>
                </Popup>
            )}
        </Marker>
    );
};

const MapSelector = ({ onLocationChange }) => {
    
    return (
        <MapContainer 
            center={[-17.7833, -63.1821]} 
            zoom={13} 
            style={{ height:"300px", width:"100%", borderRadius: "8px" }}
            attributionControl={false}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
            />
            <LocationMarker onLocationChange={onLocationChange} />
        </MapContainer>
    );
};

export default MapSelector;