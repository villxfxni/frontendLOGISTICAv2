import React, {useState} from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Link, useNavigate} from 'react-router-dom';
import {registerUser, fetchUserByCI, setNewPassword} from "../../Services/authService.js";
import Header from "./Header.jsx";
import PasswordField from "./PasswordField.jsx";
import "../Style.css";

function BuscarCI() {
    const navigate = useNavigate();
    const [isMember, setIsMember] = useState(null);
    const [userData, setUserData] = useState(null);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [loading, setLoading] = useState(false);

    
    const ciValidationSchema = Yup.object({
        ci: Yup.string()
            .required('El C.I. es obligatorio'),
    });

    
    const passwordValidationSchema = Yup.object({
        contrasena: Yup.string()
            .min(6, 'La contraseña debe tener al menos 6 caracteres')
            .required('La contraseña es obligatoria')
    });

    
    const handleCISubmit = async (values, { setSubmitting, setErrors }) => {
        setLoading(true);
        try {
            console.log('Buscando usuario con CI:', values.ci);
            const user = await fetchUserByCI(values.ci);
            console.log('Usuario encontrado:', user);
            
            
            if (user.active === true) {
                console.log('Usuario ya tiene cuenta activa, redirigiendo al login');
                navigate('/login', { 
                    state: { 
                        message: 'Este usuario ya tiene una cuenta activa. Por favor, inicia sesión con tu contraseña.',
                        ci: user.ci 
                    } 
                });
                return;
            }
            
            
            setUserData(user);
            setShowPasswordForm(true);
        } catch (error) {
            console.error('Error al buscar usuario:', error);
            setErrors({ ci: 'No se encontró un usuario con este C.I. en nuestra base de datos' });
        } finally {
            setLoading(false);
            setSubmitting(false);
        }
    };

    
    const handlePasswordSubmit = async (values, { setSubmitting, setErrors }) => {
        setLoading(true);
        try {
            console.log('Estableciendo nueva contraseña para CI:', userData.ci);
            await setNewPassword(userData.ci, values.contrasena);
            console.log('Contraseña establecida exitosamente');
            
            
            navigate('/login', { 
                state: { 
                    message: 'Contraseña establecida exitosamente. Ya puedes iniciar sesión.',
                    ci: userData.ci 
                } 
            });
        } catch (error) {
            console.error('Error al establecer contraseña:', error);
            setErrors({ contrasena: 'Error al establecer la contraseña. Intenta nuevamente.' });
        } finally {
            setLoading(false);
            setSubmitting(false);
        }
    };

    return (
        <div className="big-div">
            <Header/>
            <div className="container-fluid d-flex flex-column align-items-center flex-grow-0 h-100 justify-content-center mt-5">
                <div className="row p-4 m-3 shadow rounded flex-grow-1 w-auto text-light"
                     style={{background: 'rgba(1,1,1,0.22)', maxWidth: '500px', width: '100%'}}>
                    
                    {!showPasswordForm ? (
                        <>
                            <h3 className="text-center fw-semibold fs-3 mb-2 pb-0" style={{color: '#fdfdfd'}}>
                                Crear una Cuenta
                            </h3>
                            <p className="text-center">¿Ya eres un miembro de Alas Chiquitanas?</p>

                            <div className="d-flex flex-row gap-3 mb-3">
                                <button
                                    type="button"
                                    className="btn w-100 fw-semibold rounded-pill btn-outline-light"
                                    onClick={() => navigate('/registrate')}
                                    disabled={loading}
                                >
                                    No
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setIsMember(true)}
                                    className={`btn w-100 fw-semibold rounded-pill ${
                                        isMember === true ? 'btn-light text-dark' : 'btn-outline-light'
                                    }`}
                                    disabled={loading}
                                >
                                    Sí
                                </button>
                            </div>

                            {isMember && (
                                <Formik
                                    initialValues={{ ci: '' }}
                                    validationSchema={ciValidationSchema}
                                    onSubmit={handleCISubmit}
                                >
                                    {({isSubmitting}) => (
                                        <Form>
                                            <div className="mb-3">
                                                <label htmlFor="ci" className="form-label">
                                                    Carnet de Identidad (C.I.):
                                                </label>
                                                <Field
                                                    type="number"
                                                    name="ci"
                                                    className="form-control ps-4"
                                                    placeholder="Ej. 1234567"
                                                    disabled={loading}
                                                />
                                                <ErrorMessage
                                                    name="ci"
                                                    component="div"
                                                    className="text-danger mt-1"
                                                    style={{fontSize: 'smaller'}}
                                                />
                                            </div>

                                            <button
                                                type="submit"
                                                className="btn w-100 fw-semibold rounded-pill btn-warning"
                                                style={{color: 'black'}}
                                                disabled={isSubmitting || loading}
                                            >
                                                {isSubmitting || loading ? 'Buscando...' : 'Buscar'}
                                            </button>
                                        </Form>
                                    )}
                                </Formik>
                            )}
                        </>
                    ) : (
                        
                        <>
                            <h3 className="text-center fw-semibold fs-3 mb-2 pb-0" style={{color: '#fdfdfd'}}>
                                ¡Usuario Encontrado!
                            </h3>
                            
                            
                            <div className="bg-dark bg-opacity-25 p-3 rounded mb-3">
                                <p className="mb-1"><strong>Nombre:</strong> {userData?.nombre} {userData?.apellido}</p>
                                <p className="mb-1"><strong>C.I.:</strong> {userData?.ci}</p>
                                <p className="mb-0"><strong>Email:</strong> {userData?.correoElectronico}</p>
                            </div>

                            <p className="text-center mb-3">
                                Establece una contraseña para acceder a tu cuenta:
                            </p>

                            <Formik
                                initialValues={{ contrasena: '' }}
                                validationSchema={passwordValidationSchema}
                                onSubmit={handlePasswordSubmit}
                            >
                                {({isSubmitting}) => (
                                    <Form>
                                        <PasswordField
                                            name="contrasena"
                                            label="Nueva Contraseña:"
                                            placeholder="Mínimo 6 caracteres"
                                            disabled={loading}
                                            className="form-control ps-4 pe-5"
                                        />

                                        <div className="d-flex gap-2">
                                            <button
                                                type="button"
                                                className="btn w-50 fw-semibold rounded-pill btn-outline-light"
                                                onClick={() => {
                                                    setShowPasswordForm(false);
                                                    setUserData(null);
                                                    setIsMember(null);
                                                }}
                                                disabled={isSubmitting || loading}
                                            >
                                                Volver
                                            </button>
                                            
                                            <button
                                                type="submit"
                                                className="btn w-50 fw-semibold rounded-pill btn-warning"
                                                style={{color: 'black'}}
                                                disabled={isSubmitting || loading}
                                            >
                                                {isSubmitting || loading ? 'Guardando...' : 'Establecer Contraseña'}
                                            </button>
                                        </div>
                                    </Form>
                                )}
                            </Formik>
                        </>
                    )}

                    <p className="mt-3 mb-3 text-center"
                       style={{color: 'grey', fontSize: 'smaller'}}>
                        ¿Ya tienes una cuenta?{' '}
                        <Link to="/login" style={{color: '#ffd833'}}>
                            Ingresar
                        </Link>.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default BuscarCI;
