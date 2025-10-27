import React, {useEffect, useState, useRef} from 'react';
import {Formik, Form, Field, ErrorMessage, useFormikContext, useField} from 'formik';
import * as Yup from 'yup';
import 'bootstrap/dist/css/bootstrap.min.css';
import {useNavigate} from 'react-router-dom';
import { addSolicitud } from "../../Services/solicitudService.js";

import DatePicker, {registerLocale} from 'react-datepicker';
import { es } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';
import '../Style.css';
import ProductSelectorModal from "./ProductosSelectorModal.jsx";
import MapSelector from "./MapSelector.jsx";
import Header from "../Common/Header.jsx";

/**
 * Mobile-optimized version of FormularioSolicitud
 * Maintains the same design as desktop but with mobile-responsive improvements
 */
function FormularioSolicitudMobile() {
    const navigate = useNavigate();
    const formikRef = useRef(null);

    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [ubicacion, setUbicacion] = useState({ 
        lat: null, 
        lng: null, 
        direccion: "", 
        provincia: "", 
        rawAddressData: null,
        displayName: "",
        preciseDireccion: ""
    });
    
    const [sectionStatus, setSectionStatus] = useState({
        solicitante: false,
        entrega: false,
        emergencia: false
    });
    
    const [validationErrors, setValidationErrors] = useState({
        solicitante: false,
        entrega: false,
        emergencia: false,
        productos: false
    });

    const [forceOpenSection, setForceOpenSection] = useState(null);

    const [showSolicitante, setShowSolicitante] = useState(false);
    const [showEntrega, setShowEntrega] = useState(false);
    const [showEmergencia, setShowEmergencia] = useState(false);

    const initialValues = {
        nombreSolicitante: '',
        apellidoSolicitante: '',
        ciSolicitante: '',
        telefonoSolicitante: '',
        comunidad: '',
        provincia: '',
        direccion: '',
        coordenadasLat: '',
        coordenadasLng: '',
        fechaInicioIncendio: '',
        listaProductos: '',
        listaProductosAPI: [],
        cantidadPersonas: '',
        categoria: 'Incendio'
    };

    const validationSchema = Yup.object({
        ciSolicitante: Yup.number().required('El C.I. es obligatorio'),
        nombreSolicitante: Yup.string().required('El nombre es obligatorio'),
        apellidoSolicitante: Yup.string().required('El apellido es obligatorio'),
        comunidad: Yup.string().required('La comunidad es obligatoria'),
        fechaInicioIncendio: Yup.string().required('La fecha de inicio es obligatoria'),
        listaProductos: Yup.string().required('Ingrese la lista de productos'),
        listaProductosAPI: Yup.array().min(1, 'Seleccione al menos un producto'),
        provincia: Yup.string().required('La provincia es obligatoria'),
        telefonoSolicitante: Yup.number()
            .required('El numero de celular es obligatorio')
            .max(79999999, 'Ingrese un numero de celular válido')
            .min(60000000, 'Ingrese un numero de celular válido'),
        cantidadPersonas: Yup.number().required('Ingrese la cantidad aproximada de afectados').min(0).max(5000),
        categoria: Yup.string().required('Seleccione el tipo de emergencia')
    });

    const checkSolicitanteComplete = (values) => {
        const isComplete = values.nombreSolicitante && 
                          values.apellidoSolicitante && 
                          values.ciSolicitante && 
                          values.comunidad;
        setSectionStatus(prev => ({...prev, solicitante: isComplete}));
        return isComplete;
    };

    const checkEntregaComplete = (values) => {
        const isComplete = values.direccion && 
                          values.provincia && 
                          values.telefonoSolicitante;
        setSectionStatus(prev => ({...prev, entrega: isComplete}));
        return isComplete;
    };

    const checkEmergenciaComplete = (values) => {
        const isComplete = values.fechaInicioIncendio && 
                          values.cantidadPersonas && 
                          values.categoria;
        setSectionStatus(prev => ({...prev, emergencia: isComplete}));
        return isComplete;
    };

    const checkProductosComplete = (values) => {
        const isComplete = values.listaProductosAPI && values.listaProductosAPI.length > 0;
        return isComplete;
    };

    useEffect(() => {
        if (formikRef.current) {
            const values = formikRef.current.values;
            checkSolicitanteComplete(values);
            checkEntregaComplete(values);
            checkEmergenciaComplete(values);
        }
    }, [formikRef.current?.values]);

    useEffect(() => {
        if (forceOpenSection) {
            if (forceOpenSection === 'solicitante') setShowSolicitante(true);
            if (forceOpenSection === 'entrega') setShowEntrega(true);
            if (forceOpenSection === 'emergencia') setShowEmergencia(true);
            
            setTimeout(() => setForceOpenSection(null), 500);
        }
    }, [forceOpenSection]);

    useEffect(() => {
        console.log("Mobile form initial values loaded");
    }, []);

    const handleLocationChange = async (location) => {
        const { lat, lng } = location;
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&zoom=18&accept-language=es`);
            const data = await response.json();
            const address = data.address;
            
            let provincia = '';
            if (address.state && address.state.includes('Santa Cruz')) {
                provincia = address.county || '';
            } else {
                provincia = address.state || '';
            }
            
            const addressComponents = [];
            if (address.building) addressComponents.push(address.building);
            if (address.house_number) addressComponents.push(`Nº ${address.house_number}`);
            if (address.road) addressComponents.push(address.road);
            if (address.neighbourhood) addressComponents.push(`Barrio ${address.neighbourhood}`);
            if (address.suburb) addressComponents.push(address.suburb);
            
            const locality = address.city || address.town || address.village || address.hamlet;
            if (locality) addressComponents.push(locality);
            
            const direccion = addressComponents.join(', ');
            
            setUbicacion({
                lat, 
                lng, 
                direccion, 
                provincia,
                rawAddressData: address,
                displayName: data.display_name,
                preciseDireccion: direccion
            });
            
            if (formikRef.current) {
                formikRef.current.setFieldValue('direccion', direccion);
                formikRef.current.setFieldValue('provincia', provincia);
            }
        } catch (error) {
            console.error("Error al obtener la dirección:", error);
        }
    };

    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        try {
            const solicitanteComplete = checkSolicitanteComplete(values);
            const entregaComplete = checkEntregaComplete(values);
            const emergenciaComplete = checkEmergenciaComplete(values);
            const productosComplete = checkProductosComplete(values);
            
            const errors = {
                solicitante: !solicitanteComplete,
                entrega: !entregaComplete,
                emergencia: !emergenciaComplete,
                productos: !productosComplete
            };
            
            setValidationErrors(errors);
            
            if (!solicitanteComplete) {
                setForceOpenSection('solicitante');
                setSubmitting(false);
                return;
            } else if (!entregaComplete) {
                setForceOpenSection('entrega');
                setSubmitting(false);
                return;
            } else if (!emergenciaComplete) {
                setForceOpenSection('emergencia');
                setSubmitting(false);
                return;
            } else if (!productosComplete) {
                setSubmitting(false);
                return;
            }
            
            const categoria = values.categoria || "Incendio";
            let direccionFinal = ubicacion.direccion || values.direccion;
            
            if (ubicacion.rawAddressData) {
                const rd = ubicacion.rawAddressData;
                const addressNotes = [];
                
                if (rd.amenity) addressNotes.push(`Cerca de ${rd.amenity}`);
                if (rd.shop) addressNotes.push(`${rd.shop}`);
                if (rd.tourism) addressNotes.push(`${rd.tourism}`);
                if (rd.highway) addressNotes.push(`Sobre ${rd.highway}`);
                
                if (addressNotes.length > 0) {
                    direccionFinal += ` (${addressNotes.join(', ')})`;
                }
            }
            
            const solicitud = {
                ciSolicitante: values.ciSolicitante,
                nombreSolicitante: values.nombreSolicitante,
                apellidoSolicitante: values.apellidoSolicitante,
                comunidad: values.comunidad,
                provincia: ubicacion.provincia || values.provincia,
                direccion: direccionFinal,
                latitud: ubicacion.lat?.toString() || '',
                longitud: ubicacion.lng?.toString() || '',
                fechaInicioIncendio: new Date(values.fechaInicioIncendio),
                fechaSolicitud: new Date(),
                telefonoSolicitante: values.telefonoSolicitante,
                listaProductos: values.listaProductosAPI,
                cantidadPersonas: values.cantidadPersonas,
                categoria: categoria,
            };

            await addSolicitud(solicitud);
            setShowSuccessModal(true);
            resetForm();
            
            setSectionStatus({
                solicitante: false,
                entrega: false,
                emergencia: false
            });
        } catch (error) {
            console.error("Error al enviar la solicitud:", error);
            setShowErrorModal(true);
        } finally {
            setSubmitting(false);
        }
    };

    registerLocale('es', es);

    const MobileDatePicker = ({ name }) => {
        const { setFieldValue } = useFormikContext();
        const [field, meta] = useField(name);

        useEffect(() => {
            if (!field.value) {
                setFieldValue(name, new Date());
            }
        }, []);

        return (
            <div className="mb-0 mt-3 d-flex flex-column">
                <label htmlFor={name} className="mt-1 p-0 form-label text-white mb-2">
                    Inicio de la Emergencia:
                </label>
                <DatePicker
                    selected={field.value ? new Date(field.value) : null}
                    onChange={(date) => setFieldValue(name, date)}
                    dateFormat="dd/MM/yyyy"
                    className="form-control w-100"
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    locale="es"
                    maxDate={new Date()}
                />
            </div>
        );
    };

    return (
        <div className="list-div">
            <Header/>
            <style>
                {`
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    @keyframes slideDown {
                        from { transform: translateY(-20px); opacity: 0; }
                        to { transform: translateY(0); opacity: 1; }
                    }
                    @keyframes pulse {
                        0% { transform: scale(1); }
                        50% { transform: scale(1.05); }
                        100% { transform: scale(1); }
                    }
                    @keyframes highlightError {
                        0% { box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.7); }
                        70% { box-shadow: 0 0 0 10px rgba(220, 53, 69, 0); }
                        100% { box-shadow: 0 0 0 0 rgba(220, 53, 69, 0); }
                    }
                    .transition-section {
                        transition: max-height 0.5s ease-in-out, opacity 0.5s ease-in-out;
                        overflow: hidden;
                    }
                    .transition-section.show {
                        animation: slideDown 0.5s ease-in-out;
                    }
                    
                    .form-control {
                        font-size: 16px !important;
                        padding: 12px 15px !important;
                        border-radius: 8px !important;
                    }
                    
                    .btn {
                        min-height: 48px !important;
                        font-size: 16px !important;
                        padding: 12px 20px !important;
                    }
                    
                    .btn-outline-light:hover, .btn-mine:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                        transition: all 0.3s ease;
                    }
                    
                    .form-control:focus {
                        transition: all 0.3s ease;
                        box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.25);
                        border-color: #86b7fe !important;
                    }
                    
                    .highlight-error {
                        animation: highlightError 1s ease-in-out;
                        border-color: #dc3545 !important;
                    }
                    
                    .validation-error-section {
                        background-color: rgba(220, 53, 69, 0.1);
                        border-left: 3px solid #dc3545;
                        padding: 10px;
                        margin-top: 5px;
                        margin-bottom: 10px;
                        animation: fadeIn 0.3s ease-in-out;
                    }
                    
                    @media (max-width: 767px) {
                        .form-label {
                            font-weight: 500 !important;
                            margin-bottom: 8px !important;
                            color: white !important;
                        }
                        
                        .d-flex.flex-column.flex-md-row {
                            flex-direction: column !important;
                        }
                        
                        .d-flex.flex-column.flex-md-row .form-label {
                            width: 100% !important;
                            margin-right: 0 !important;
                            margin-bottom: 8px !important;
                        }
                        
                        .gap-3 {
                            gap: 0.75rem !important;
                        }
                        
                        .btn.rounded-pill {
                            border-radius: 25px !important;
                            margin-bottom: 8px !important;
                        }
                        
                        .shadow.rounded {
                            border-radius: 15px !important;
                            margin: 1rem !important;
                            padding: 1.5rem !important;
                        }
                        
                        .container-fluid {
                            padding: 0 !important;
                        }
                    }
                    
                    @media (max-width: 767px) {
                        .btn-outline-light, .btn-success, .btn-danger {
                            padding: 15px 20px !important;
                            font-size: 14px !important;
                            font-weight: 600 !important;
                        }
                        
                        .form-control, .form-select {
                            padding: 15px !important;
                            font-size: 16px !important;
                            line-height: 1.4 !important;
                        }
                        
                        textarea.form-control {
                            resize: vertical !important;
                            min-height: 80px !important;
                        }
                    }
                `}
            </style>
            
            <div className={showSuccessModal ? "blur-background container-fluid d-flex flex-column align-items-center mb-3" : "container-fluid d-flex flex-column align-items-center mb-3"}>
                <div className="">
                    <div className="m-5 p-5 shadow rounded flex-grow-1 shadow w-auto text-light"
                         style={{background: 'rgba(15,16,21,0.63)', width: '100%', maxWidth: '1400px', margin: '0 auto', transition: 'all 0.3s ease-in-out'}}>
                        
                        <h3 className="text-center mt-3 mb-4 display-6 text-light"
                            style={{fontSize: 'xx-large', fontWeight: "bold"}}>
                            Solicitar Insumos
                        </h3>
                        
                        
                        <div className="d-flex flex-wrap justify-content-center align-items-center gap-3 mt-3 ms-3">
                            <button
                                type="button"
                                className={`btn ${sectionStatus.solicitante ? 'btn-success' : validationErrors.solicitante ? 'btn-danger' : 'btn-outline-light'} w-md-100 p-2 me-3 rounded-pill`}
                                style={{
                                    transition: "all 0.3s ease",
                                    position: "relative"
                                }}
                                onClick={() => {
                                    setShowSolicitante(!showSolicitante);
                                    setShowEmergencia(false);
                                    setShowEntrega(false);
                                }}
                            >
                                Datos del Solicitante
                                {sectionStatus.solicitante && (
                                    <span className="position-absolute top-0 end-0 translate-middle p-1 bg-success border border-light rounded-circle">
                                        <span className="visually-hidden">Completado</span>
                                    </span>
                                )}
                            </button>

                            <button
                                type="button"
                                className={`btn ${sectionStatus.entrega ? 'btn-success' : validationErrors.entrega ? 'btn-danger' : 'btn-outline-light'} w-md-100 p-2 me-3 rounded-pill`}
                                style={{
                                    transition: "all 0.3s ease",
                                    position: "relative"
                                }}
                                onClick={() => {
                                    setShowEntrega(!showEntrega);
                                    setShowSolicitante(false);
                                    setShowEmergencia(false);
                                }}
                            >
                                Datos de la Entrega
                                {sectionStatus.entrega && (
                                    <span className="position-absolute top-0 end-0 translate-middle p-1 bg-success border border-light rounded-circle rounded-pill">
                                        <span className="visually-hidden">Completado</span>
                                    </span>
                                )}
                            </button>

                            <button
                                type="button"
                                className={`btn ${sectionStatus.emergencia ? 'btn-success' : validationErrors.emergencia ? 'btn-danger' : 'btn-outline-light'} w-md-100 p-2 rounded-pill`}
                                style={{
                                    transition: "all 0.3s ease",
                                    position: "relative"
                                }}
                                onClick={() => {
                                    setShowEmergencia(!showEmergencia);
                                    setShowSolicitante(false);
                                    setShowEntrega(false);
                                }}
                            >
                                Datos de la Emergencia
                                {sectionStatus.emergencia && (
                                    <span className="position-absolute top-0 end-0 translate-middle p-1 bg-success border border-light rounded-circle rounded-pill">
                                        <span className="visually-hidden">Completado</span>
                                    </span>
                                )}
                            </button>
                        </div>

                        <Formik
                            initialValues={initialValues}
                            validationSchema={validationSchema}
                            onSubmit={handleSubmit}
                            innerRef={formikRef}
                        >
                            {({isSubmitting, setFieldValue}) => (
                                <Form style={{fontSize: 'medium'}}>
                                    <div className="row">
                                        <div className="col-md-12 pe-0 px-3">
                                            <div className="w-100">
                                                
                                                <div
                                                    className={`transition-section ${showSolicitante ? 'show' : 'hide'}`}
                                                    style={{
                                                        transition: 'all 0.5s ease-in-out',
                                                        animation: showSolicitante ? 'fadeIn 0.5s ease-in-out' : 'none'
                                                    }}
                                                >
                                                    <h3 className="mt-2 text-white" style={{fontSize: 'large'}}>
                                                        Ingresa tus Datos
                                                    </h3>
                                                    
                                                    <div className="mb-0 mt-3 d-flex flex-column flex-md-row">
                                                        <label htmlFor="nombreSolicitante" className="mt-1 me-md-3 p-0 form-label w-100">Nombre:</label>
                                                        <Field type="text" name="nombreSolicitante" className="form-control m-0" placeholder="Ingrese su nombre"/>
                                                    </div>
                                                    <div className="mb-2 mt-0" style={{fontSize: 'smaller'}}>
                                                        <ErrorMessage name="nombreSolicitante" component="div" className="text-danger"/>
                                                    </div>

                                                    <div className="mb-0 mt-3 d-flex flex-column flex-md-row">
                                                        <label htmlFor="apellidoSolicitante" className="mt-1 me-md-3 p-0 form-label w-100">Apellido:</label>
                                                        <Field type="text" name="apellidoSolicitante" className="form-control m-0" placeholder="Ingrese su apellido"/>
                                                    </div>
                                                    <div className="mb-2 mt-0" style={{fontSize: 'smaller'}}>
                                                        <ErrorMessage name="apellidoSolicitante" component="div" className="text-danger"/>
                                                    </div>

                                                    <div className="mb-0 mt-3 d-flex flex-column flex-md-row">
                                                        <label htmlFor="ciSolicitante" className="mt-1 me-md-3 p-0 form-label w-100">Carnet de Identidad (C.I.):</label>
                                                        <Field type="number" name="ciSolicitante" className="form-control m-0" placeholder="Ej. 1234567"/>
                                                    </div>
                                                    <div className="mb-2 mt-0" style={{fontSize: 'smaller'}}>
                                                        <ErrorMessage name="ciSolicitante" component="div" className="text-danger"/>
                                                    </div>

                                                    <div className="mb-0 mt-3 d-flex flex-column flex-md-row">
                                                        <label htmlFor="comunidad" className="mt-1 me-md-3 p-0 form-label w-100">Comunidad Solicitante:</label>
                                                        <Field type="text" name="comunidad" className="form-control m-0" placeholder="Ej. San Jose de Chiquitos"/>
                                                    </div>
                                                    <div className="mb-2 mt-0" style={{fontSize: 'smaller'}}>
                                                        <ErrorMessage name="comunidad" component="div" className="text-danger"/>
                                                    </div>
                                                </div>

                                                
                                                <div
                                                    className={`transition-section ${showEmergencia ? 'show' : 'hide'}`}
                                                    style={{
                                                        transition: 'all 0.5s ease-in-out',
                                                        animation: showEmergencia ? 'fadeIn 0.5s ease-in-out' : 'none'
                                                    }}
                                                >
                                                    <h3 className="mt-2 text-white" style={{fontSize: 'large'}}>
                                                        Información Sobre la Emergencia
                                                    </h3>
                                                    
                                                    <div className="mb-0 mt-3 d-flex flex-column flex-md-row">
                                                        <label htmlFor="cantidadPersonas" className="mt-1 me-md-3 p-0 form-label w-100">Cantidad de Personas:</label>
                                                        <Field type="number" name="cantidadPersonas" className="form-control m-0" placeholder="Ingrese el aproximado de personas afectadas"/>
                                                    </div>
                                                    <div className="mb-2 mt-0" style={{fontSize: 'smaller'}}>
                                                        <ErrorMessage name="cantidadPersonas" component="div" className="text-danger"/>
                                                    </div>

                                                    <MobileDatePicker name="fechaInicioIncendio"/>
                                                    <div className="mb-2 mt-0" style={{fontSize: 'smaller'}}>
                                                        <ErrorMessage name="fechaInicioIncendio" component="div" className="text-danger"/>
                                                    </div>

                                                    <div className="mb-0 mt-3 d-flex flex-column flex-md-row">
                                                        <label htmlFor="categoria" className="mt-1 me-md-3 p-0 form-label w-100">Tipo de Emergencia:</label>
                                                        <Field as="select" name="categoria" className="form-select m-0" defaultValue="Incendio">
                                                            <option value="Incendio">Incendio</option>
                                                            <option value="Inundacion">Inundación</option>
                                                            <option value="Escasez">Escasez Alimentaria</option>
                                                            <option value="Epidemia">Epidemia</option>
                                                            <option value="Otro">Otro</option>
                                                        </Field>
                                                    </div>
                                                    <div className="mb-2 mt-0" style={{fontSize: 'smaller'}}>
                                                        <ErrorMessage name="categoria" component="div" className="text-danger"/>
                                                    </div>

                                                    <div className="mb-0 mt-3">
                                                        <label htmlFor="listaProductos" className="mt-1 me-3 p-0 form-label">
                                                            Insumos Necesarios:
                                                        </label>
                                                        <ProductSelectorModal 
                                                            setFieldValue={setFieldValue}
                                                            cantidadPersonas={formikRef.current?.values.cantidadPersonas}
                                                            disabled={!formikRef.current?.values.cantidadPersonas}
                                                        />
                                                        <Field name="listaProductos">
                                                            {({field}) => (
                                                                <textarea
                                                                    {...field}
                                                                    readOnly
                                                                    rows="2"
                                                                    className={`form-control m-0 ${validationErrors.productos ? 'border-danger' : ''}`}
                                                                    placeholder="No tiene productos seleccionados"
                                                                    disabled={!formikRef.current?.values.cantidadPersonas}
                                                                />
                                                            )}
                                                        </Field>
                                                        <Field type="hidden" name="listaProductosAPI"/>
                                                    </div>
                                                </div>

                                                
                                                <div
                                                    className={`transition-section ${showEntrega ? 'show' : 'hide'}`}
                                                    style={{
                                                        transition: 'all 0.5s ease-in-out',
                                                        animation: showEntrega ? 'fadeIn 0.5s ease-in-out' : 'none'
                                                    }}
                                                >
                                                    <div className="rounded p-3 flex-column">
                                                        <h3 className="mt-2 text-white" style={{fontSize: 'large'}}>
                                                            Datos para la Entrega
                                                        </h3>

                                                        <div className="mb-0 mt-3 d-flex flex-column">
                                                            <label htmlFor="direccion" className="mt-1 p-0 form-label text-white mb-2">
                                                                Dirección:
                                                            </label>
                                                            
                                                            <div className="mb-2">
                                                                <MapSelector onLocationChange={handleLocationChange}/>
                                                            </div>

                                                            {ubicacion.direccion && (
                                                                <div className="alert alert-dark py-2 mb-2" style={{fontSize: 'small'}}>
                                                                    <p className="fw-bold mb-0">Dirección seleccionada:</p>
                                                                    <p className="mb-0">{ubicacion.direccion}</p>
                                                                </div>
                                                            )}

                                                            <Field type="hidden" name="direccion"/>
                                                            <ErrorMessage name="direccion" component="div" className="text-danger" style={{fontSize: 'smaller'}}/>
                                                        </div>

                                                        <div className="mb-0 mt-2 d-flex flex-column">
                                                            <label htmlFor="provincia" className="mt-1 p-0 form-label text-white mb-2">Provincia:</label>
                                                            <div className="form-control">
                                                                {ubicacion.provincia || 'No detectada aún - Seleccione una ubicación en el mapa'}
                                                            </div>
                                                        </div>
                                                        <Field type="hidden" name="provincia"/>
                                                        <div className="mb-2 mt-0" style={{fontSize: 'smaller'}}>
                                                            <ErrorMessage name="provincia" component="div" className="text-danger"/>
                                                        </div>

                                                        <div className="mb-0 mt-2 d-flex flex-column">
                                                            <label htmlFor="telefonoSolicitante" className="mt-1 p-0 form-label text-white mb-2">Nro de Celular:</label>
                                                            <Field type="number" name="telefonoSolicitante" className="form-control m-0 w-100" placeholder="Ej. 77312305"/>
                                                        </div>
                                                        <div className="mb-2 mt-0" style={{fontSize: 'smaller'}}>
                                                            <ErrorMessage name="telefonoSolicitante" component="div" className="text-danger"/>
                                                        </div>
                                                    </div>
                                                </div>

                                                <Field type="hidden" name="listaProductos"/>
                                                <div className="mb-2 mt-0" style={{fontSize: 'smaller'}}>
                                                    <ErrorMessage name="listaProductos" component="div" className="text-danger"/>
                                                    {validationErrors.productos && (
                                                        <div className="text-danger">Por favor, seleccione al menos un producto</div>
                                                    )}
                                                </div>
                                                
                                                <div className="mt-2 mb-3 text-center">
                                                    <p className="text-center" style={{color: 'whitesmoke', fontSize: "smaller"}}>
                                                        Al realizar esta solicitud eres responsable de recibirla en el lugar
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            <div className="d-flex justify-content-center">
                                                <button type="submit"
                                                        className="btn w-100 w-md-50 mt-1 mb-3 btn-mine-yellow p-2 rounded-pill"
                                                        style={{transition: 'all 0.3s ease', transform: isSubmitting ? 'scale(0.98)' : 'scale(1)'}}
                                                        disabled={isSubmitting}>
                                                    {isSubmitting ? 'Enviando...' : 'Enviar Solicitud'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </Form>
                            )}
                        </Formik>
                    </div>
                </div>
            </div>

            
            <div className={`modal fade ${showSuccessModal ? 'show d-block' : ''}`} 
                 style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header bg-mine text-black">
                            <h5 className="modal-title text-white">Éxito</h5>
                            <button type="button" className="btn-close" onClick={() => setShowSuccessModal(false)}></button>
                        </div>
                        <div className="modal-body">
                            <p>Solicitud enviada con éxito.</p>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-mine" onClick={() => setShowSuccessModal(false)}>
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            
            <div className={`modal fade ${showErrorModal ? 'show d-block' : ''}`} 
                 style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header bg-danger text-white">
                            <h5 className="modal-title">Error</h5>
                            <button type="button" className="btn-close" onClick={() => setShowErrorModal(false)}></button>
                        </div>
                        <div className="modal-body">
                            <p>Hubo un error al enviar la solicitud. Intenta nuevamente.</p>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-danger" onClick={() => setShowErrorModal(false)}>
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FormularioSolicitudMobile; 
