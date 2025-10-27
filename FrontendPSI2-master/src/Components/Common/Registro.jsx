import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Link, useNavigate} from 'react-router-dom';
import {registerUser} from "../../Services/authService.js";
import Header from "./Header.jsx";
import PasswordField from "./PasswordField.jsx";


function Registro() {
    const navigate = useNavigate();

    const initialValues = {
        nombre: '',
        apellido: '',
        correoElectronico: '',
        ci: '',
        telefono: '',
        contrasena: ''
    };

    const validationSchema = Yup.object({
        nombre: Yup.string()
            .required('El nombre es obligatorio')
        ,
        apellido: Yup.string()
            .required('El apellido es obligatorio'),
        ci: Yup.string()
            .required('El C.I. es obligatorio'),
        correoElectronico: Yup.string()
            .required('El correo electrónico es obligatorio')
            .email('Verifica el formato de correo electronico')
        ,
        telefono: Yup.number()
            .required('El numero de celular es obligatorio')
            .max(79999999, 'Ingrese un numero de celular válido')
            .min(60000000, 'Ingrese un numero de celular válido'),
        contrasena: Yup.string()
            .min(12, 'Minimo 12 caracteres')
            .required('La contraseña es obligatoria')
            .matches(/[A-Z]/, 'Debe contener al menos una letra mayúscula')
            .matches(/[a-z]/, 'Debe contener al menos una letra minúscula')
            .matches(/\d/, 'Debe contener al menos un número')
            .matches(/[@$!%*?&#_^~\-+=]/, 'Debe contener al menos un carácter especial (@$!%*?&#_^~-=+)')
    });
    const handleSubmit = async (values, { setSubmitting, setErrors }) => {
        console.log('Form values:', values);

        try {
            await registerUser(values);
            navigate('/login');
        } catch (error) {
            console.error('Error al registrar:', error);
            setErrors({ general: error.response?.data?.message || 'Error en el registro' });
        }
        setSubmitting(false);
    };

    return (
        <div className="big-div">
            <Header/>
            <div
                className="container-fluid d-flex flex-column align-items-center flex-grow-0 h-100 justify-content-center mt-5">
                <div className="row p-4 m-3 shadow rounded flex-grow-1 w-auto text-light" style={{ background:'rgba(1,1,1,0.22)',  maxWidth: '500px',width: '100%'}}>
                        <h3 className="text-center fw-semibold fs-3 mb-2 pb-0" style={{color: '#fdfdfd'}}>Crear una Cuenta</h3>
                        <Formik
                            initialValues={initialValues}
                            validationSchema={validationSchema}
                            onSubmit={handleSubmit}
                        >
                            {({isSubmitting}) => (
                                <Form>
                                    <div className="mt-1 row g-3 ">
                                        <div className="col-md-6">
                                            <label htmlFor="nombre" className="form-label">Nombre:</label>
                                        </div>
                                        <div className="col-md-6">
                                            <label htmlFor="apellido" className="form-label">Apellidos:</label>
                                        </div>
                                    </div>
                                    <div className="mb-2 row g-3 ">
                                        <div className="col-md-6">
                                            <Field type="text" name="nombre" className="form-control  ps-4"
                                                   placeholder=""/>
                                        </div>
                                        <div className="col-md-6">
                                            <Field type="text" name="apellido"
                                                   className="form-control  ps-4"
                                                   placeholder=""/>
                                        </div>
                                    </div>
                                    <div className="mb-3 mt-0 row" style={{fontSize: 'smaller'}}>
                                        <div className="col-md-6">
                                            <ErrorMessage name="nombre" component="div"
                                                          className="text-light opacity-50"/>
                                        </div>
                                        <div className="col-md-6">
                                            <ErrorMessage name="apellido" component="div"
                                                          className="text-light opacity-50"/>
                                        </div>
                                    </div>
                                    <div className="mb-3 mt-2">
                                        <label htmlFor="ci" className="form-label">Carnet de Identidad (C.I.):</label>
                                        <Field type="number" name="ci"
                                               className="form-control  ps-4"
                                               placeholder="Ej. 1234567"/>
                                        <ErrorMessage name="ci" component="div" className="text-light opacity-50"
                                                      style={{fontSize: 'smaller'}}/>
                                    </div>
                                    <div className="mb-3 mt-1">
                                        <label htmlFor="email" className="form-label">Correo Electrónico:</label>
                                        <Field type="email" name="correoElectronico"
                                               className="form-control  ps-4"
                                               placeholder="Ej. nombre@email.com"/>
                                        <ErrorMessage name="correoElectronico" component="div"
                                                      className="text-light opacity-50"
                                                      style={{fontSize: 'smaller'}}/>
                                    </div>
                                    <div className="mb-3 mt-1">
                                        <label htmlFor="telefono" className="form-label">Número de Celular:</label>
                                        <Field type="number" name="telefono"
                                               className="form-control  ps-4"
                                               placeholder="Ej. 77312305"/>
                                        <ErrorMessage name="telefono" component="div"
                                                      className="text-light opacity-50"
                                                      style={{fontSize: 'smaller'}}/>
                                    </div>
                                    <PasswordField
                                        name="contrasena"
                                        label="Contraseña:"
                                        placeholder="Contraseña"
                                        disabled={isSubmitting}
                                        className="form-control ps-4 pe-5"
                                        errorClassName="text-light opacity-50"
                                    />
                                    <div className="mb-4 mt-2 visually-hidden" id="passConf">
                                    <label htmlFor="passwordConf" className="form-label">Confirmar
                                            Contraseña</label>
                                        <Field type="password" name="passwordConf"
                                               className="form-control  ps-4"
                                               placeholder=""/>
                                        <ErrorMessage name="passwordConf" component="div"
                                                      className="text-light opacity-50"
                                                      style={{fontSize: 'smaller'}}/>
                                    </div>
                                    <button type="submit" className="btn mt-2 w-100 fw-semibold rounded-pill btn-warning"
                                            style={{ color: 'black'}}
                                            disabled={isSubmitting}>
                                        {isSubmitting ? 'Registrando...' : 'Registrarse'}
                                    </button>
                                    <p className="mt-3 mb-3 text-center ms-5 me-5"
                                       style={{color: 'grey', fontSize: 'smaller'}}>
                                        ¿Ya tienes una cuenta? <Link to="/login"
                                                                     style={{color: '#ffd833'}}>Ingresar</Link>.
                                    </p>
                                </Form>
                            )}
                        </Formik>
                    </div>
                </div>
            </div>
            );
            }

            export default Registro;