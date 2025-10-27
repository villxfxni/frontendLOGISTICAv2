import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { promoteUserToAdmin } from "../../Services/adminService.js";

const PromotionUserRow = ({ user, onPromoteUser, isLoading }) => {
    const handlePromoteUser = () => {
        onPromoteUser(user);
    };

    return (
        <tr className="glass-panel" style={{backgroundColor: 'rgba(1, 3, 26, 0.3)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)'}}>
            <td className="p-3">
                <div className="d-flex align-items-center">
                    <div className="rounded-circle me-3" style={{width: '10px', height: '10px', backgroundColor: 'rgb(102, 147, 194)'}}></div>
                    <div>
                        <h6 className="text-white fw-bold mb-0">{user.nombre} {user.apellido}</h6>
                        <small className="text-light opacity-75">Candidato a Administrador</small>
                    </div>
                </div>
            </td>
            <td className="p-3">
                <span className="text-white">{user.ci}</span>
            </td>
            <td className="p-3">
                <span className="text-white">
                    {user.telefono || 'No especificado'}
                </span>
            </td>
            <td className="p-3">
                <span className="text-white text-truncate" style={{maxWidth: '200px', display: 'inline-block'}} title={user.correoElectronico}>
                    {user.correoElectronico || 'No especificado'}
                </span>
            </td>
            <td className="p-3">
                <span className={`badge ${user.active ? 'bg-success' : 'bg-secondary'}`}
                      style={{
                          padding: "4px 8px",
                          borderRadius: "50px",
                          fontSize: "0.7rem"
                      }}>
                    {user.active ? 'Activo' : 'Inactivo'}
                </span>
            </td>
            <td className="p-3">
                <button
                    className="btn btn-sm px-3 text-light fw-medium"
                    onClick={handlePromoteUser}
                    disabled={isLoading}
                    style={{
                        backgroundColor: 'rgb(25, 73, 115)',
                        borderColor: 'rgb(59, 119, 157)',
                        borderRadius: "6px",
                        transition: "all 0.2s ease"
                    }}
                >
                    {isLoading ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Promoviendo...
                        </>
                    ) : (
                        <>
                            <i className="bi bi-person-badge me-1"></i>
                            Hacer Admin
                        </>
                    )}
                </button>
            </td>
        </tr>
    );
};

const ConfirmationModal = ({ show, user, onConfirm, onCancel, isLoading }) => {
    if (!show || !user) return null;

    return (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog">
                <div className="modal-content">

                    
                    <div className="modal-header bg-mine text-light">
                        <h5 className="modal-title">
                            <i className="bi bi-exclamation-triangle text-warning me-2"></i>
                            Confirmar Promoción a Administrador
                        </h5>
                        <button
                            type="button"
                            className="btn-close btn-light rounded-pill"
                            onClick={onCancel}
                            disabled={isLoading}
                        ></button>
                    </div>

                    
                    <div className="modal-body">
                        <div className="alert alert-warning" role="alert">
                            <i className="bi bi-info-circle me-2"></i>
                            <strong>¡Atención!</strong> Esta acción no se puede deshacer.
                        </div>

                        <p className="mb-3">
                            ¿Está seguro que desea promover al siguiente usuario a administrador?
                        </p>

                        <div className="p-3 mb-3 bg-light rounded shadow-sm">
                            <div className="row">
                                <div className="col-6">
                                    <small className="text-muted">Nombre:</small>
                                    <p className="mb-2 fw-medium">
                                        {user.nombre} {user.apellido}
                                    </p>
                                </div>
                                <div className="col-6">
                                    <small className="text-muted">CI:</small>
                                    <p className="mb-2 fw-medium">{user.ci}</p>
                                </div>
                                {user.telefono && (
                                    <div className="col-6">
                                        <small className="text-muted">Teléfono:</small>
                                        <p className="mb-2 fw-medium">{user.telefono}</p>
                                    </div>
                                )}
                                {user.correoElectronico && (
                                    <div className={user.telefono ? "col-6" : "col-12"}>
                                        <small className="text-muted">Email:</small>
                                        <p className="mb-0 fw-medium">{user.correoElectronico}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <p className="text-muted small mb-0">
                            El usuario obtendrá permisos completos de administrador del sistema.
                        </p>
                    </div>

                    
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-secondary rounded-pill"
                            onClick={onCancel}
                            disabled={isLoading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            className="btn btn-outline-dark rounded-pill"
                            onClick={onConfirm}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                    Promoviendo...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-check-circle me-1"></i>
                                    Confirmar Promoción
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PromotionManager = ({ users, onUserUpdated }) => {
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const handleOpenModal = (user) => {
        setSelectedUser(user);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        if (!isLoading) {
            setShowModal(false);
            setSelectedUser(null);
        }
    };

    const handleConfirmPromotion = async () => {
        if (!selectedUser) return;

        try {
            setIsLoading(true);
            
            await promoteUserToAdmin(selectedUser.idUsuario);
            
            onUserUpdated();
            
            setShowModal(false);
            setSelectedUser(null);
            
            alert(`${selectedUser.nombre} ${selectedUser.apellido} ha sido promovido a administrador exitosamente.`);
            
        } catch (error) {
            console.error("Error promoting user:", error);
            alert("Error al promover el usuario. Intente nuevamente.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const eligibleUsers = users.filter(user => !user.admin);
    
    const filteredUsers = eligibleUsers.filter(user => {
        if (!searchTerm.trim()) return true;
        
        const searchLower = searchTerm.toLowerCase();
        const fullName = `${user.nombre} ${user.apellido}`.toLowerCase();
        const ci = user.ci?.toString().toLowerCase() || '';
        const email = user.correoElectronico?.toLowerCase() || '';
        const telefono = user.telefono?.toString().toLowerCase() || '';
        
        return fullName.includes(searchLower) || 
               ci.includes(searchLower) || 
               email.includes(searchLower) ||
               telefono.includes(searchLower);
    });
    
    const sortedUsers = [...filteredUsers].sort((a, b) => {
        if (a.active !== b.active) {
            return b.active - a.active;
        }
        return `${a.nombre} ${a.apellido}`.localeCompare(`${b.nombre} ${b.apellido}`);
    });

    return (
        <div>
            
            <div className="row mb-4">
                <div className="col-12">
                    <div className="glass-panel p-3" style={{borderRadius: '12px'}}>
                        <div className="d-flex align-items-center gap-3">
                            <div className="d-flex align-items-center">
                                <i className="bi bi-search me-2" style={{color: 'rgb(102, 147, 194)', fontSize: '1.2rem'}}></i>
                                <h6 className="text-white fw-bold mb-0">Buscar Usuarios</h6>
                            </div>
                            <div className="flex-grow-1">
                                <input
                                    type="text"
                                    className="form-control bg-light"
                                    placeholder="Buscar por nombre, apellido, CI, teléfono o email..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    style={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                        border: '1px solid rgb(59, 119, 157)',
                                        borderRadius: '8px',
                                        color: 'black',
                                        padding: '4px 8px'

                                    }}
                                />
                            </div>
                            {searchTerm && (
                                <button
                                    className="btn btn-outline-light btn-sm"
                                    onClick={() => setSearchTerm('')}
                                    style={{
                                        borderColor: 'rgb(59, 119, 157)',
                                        borderRadius: '6px'
                                    }}
                                >
                                    <i className="bi bi-x"></i>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            
            <div className="row mb-4">
            <div className="col-12 col-md-4">
                    <div className="text-center p-3 rounded" style={{backgroundColor: 'rgba(25, 73, 115, 0.3)'}}>
                        <h5 className="fw-bold mb-1" style={{color: 'rgb(102, 147, 194)'}}>
                            {filteredUsers.length}
                        </h5>
                        <small className="text-light opacity-75">
                            {searchTerm ? 'Resultados Encontrados' : 'Usuarios Elegibles'}
                        </small>
                    </div>
                </div>
                <div className="col-6 col-md-4">
                    <div className="text-center p-3 rounded" style={{backgroundColor: 'rgba(40, 167, 69, 0.2)'}}>
                        <h5 className="text-success fw-bold mb-1">
                            {filteredUsers.filter(u => u.active).length}
                        </h5>
                        <small className="text-light opacity-75">Activos</small>
                    </div>
                </div>
                <div className="col-6 col-md-4">
                    <div className="text-center p-3 rounded" style={{backgroundColor: 'rgba(108, 117, 125, 0.2)'}}>
                        <h5 className="text-secondary fw-bold mb-1">
                            {filteredUsers.filter(u => !u.active).length}
                        </h5>
                        <small className="text-light opacity-75">Inactivos</small>
                    </div>
                </div>
            </div>

            
            <div className="alert alert-info mb-4"style={{fontSize:"14px"}}  role="alert">
                <i className="bi bi-info-circle me-2"></i>
                <strong>Información:</strong> Solo se muestran usuarios que no son administradores. 
                Los usuarios promovidos desaparecerán de esta lista.
            </div>

            
            {sortedUsers.length > 0 ? (
                <div className="glass-panel" style={{borderRadius: '16px', overflow: 'hidden'}}>
                    <table className="table table-dark mb-0">
                        <thead style={{backgroundColor: 'rgba(25, 73, 115, 0.3)', borderBottom: '2px solid rgb(59, 119, 157)'}}>
                            <tr>
                                <th className="p-3 fw-bold" style={{color: 'rgb(102, 147, 194)'}}>
                                    <i className="bi bi-person me-2"></i>Usuario
                                </th>
                                <th className="p-3 fw-bold" style={{color: 'rgb(102, 147, 194)'}}>
                                    <i className="bi bi-card-text me-2"></i>CI
                                </th>
                                <th className="p-3 fw-bold" style={{color: 'rgb(102, 147, 194)'}}>
                                    <i className="bi bi-telephone me-2"></i>Teléfono
                                </th>
                                <th className="p-3 fw-bold" style={{color: 'rgb(102, 147, 194)'}}>
                                    <i className="bi bi-envelope me-2"></i>Email
                                </th>
                                <th className="p-3 fw-bold" style={{color: 'rgb(102, 147, 194)'}}>
                                    <i className="bi bi-activity me-2"></i>Estado
                                </th>
                                <th className="p-3 fw-bold text-center" style={{color: 'rgb(102, 147, 194)'}}>
                                    <i className="bi bi-gear me-2"></i>Acción
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedUsers.map(user => (
                                <PromotionUserRow
                                    key={user.idUsuario}
                                    user={user}
                                    onPromoteUser={handleOpenModal}
                                    isLoading={isLoading && selectedUser?.idUsuario === user.idUsuario}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="glass-panel p-5 text-center" style={{borderRadius: '16px'}}>
                    <i className="bi bi-search text-light opacity-50" style={{fontSize: '3rem'}}></i>
                    <p className="text-light opacity-75 mt-3 mb-0">
                        {searchTerm ? 'No se encontraron usuarios que coincidan con la búsqueda' : 'No hay usuarios elegibles para promoción'}
                    </p>
                    {searchTerm && (
                        <button
                            className="btn btn-outline-light btn-sm mt-2"
                            onClick={() => setSearchTerm('')}
                        >
                            Limpiar búsqueda
                        </button>
                    )}
                </div>
            )}

            
            <ConfirmationModal
                show={showModal}
                user={selectedUser}
                onConfirm={handleConfirmPromotion}
                onCancel={handleCloseModal}
                isLoading={isLoading}
            />
        </div>
    );
};

export default PromotionManager;
