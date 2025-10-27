import React, { useState } from 'react';
import { Field, ErrorMessage } from 'formik';
import { BsEye, BsEyeSlash } from 'react-icons/bs';

const PasswordField = ({ 
    name, 
    label, 
    placeholder = "Contraseña", 
    disabled = false,
    className = "form-control ps-4 pe-5",
    errorClassName = "text-danger mt-1"
}) => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="mb-3">
            <label htmlFor={name} className="form-label">
                {label}
            </label>
            <div className="position-relative">
                <Field
                    type={showPassword ? "text" : "password"}
                    name={name}
                    className={className}
                    placeholder={placeholder}
                    disabled={disabled}
                />
                <button
                    type="button"
                    className="btn btn-link position-absolute top-50 end-0 translate-middle-y pe-3 text-muted border-0"
                    onClick={togglePasswordVisibility}
                    disabled={disabled}
                    style={{
                        background: 'none',
                        zIndex: 10,
                        padding: '0.375rem 0.75rem'
                    }}
                    title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                    {showPassword ? <BsEyeSlash size={18} /> : <BsEye size={18} />}
                </button>
            </div>
            <ErrorMessage
                name={name}
                component="div"
                className={errorClassName}
                style={{fontSize: 'smaller'}}
            />
        </div>
    );
};

export default PasswordField; 