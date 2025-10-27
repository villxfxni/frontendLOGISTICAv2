import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { toggleUserActiveStatus } from "../../Services/adminService.js";

const UserCard = ({ user, onToggleStatus, isLoading }) => {
    const handleToggleStatus = async () => {
        await onToggleStatus(user.idUsuario);
    };

    return (
        <div className="col-12 col-md-6 col-lg-4 mb-3">
            <div className="glass-card p-3 h-100 position-relative"
                 style={{
                     borderRadius: "8px",
                     transition: "transform 0.2s ease, box-shadow 0.2s ease"
                 }}>
                
                <div className="position-absolute top-0 start-0 h-100"
                     style={{
                         width: "4px",
                         backgroundColor: user.active ? "#28a745" : "#6c757d",
                         borderRadius: "50px 0 0 50px"
                     }}></div>

                <div className="ps-3">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                        <h6 className="text-white fw-bold mb-0">
                            {user.nombre} {user.apellido}
                        </h6>
                        <span className={`badge ${user.active ? 'bg-success' : 'bg-secondary'}`}
                              style={{
                                  padding: "4px 8px",
                                  borderRadius: "50px",
                                  fontSize: "0.7rem"
                              }}>
                            {user.active ? 'Activo' : 'Inactivo'}
                        </span>
                    </div>

                    <div className="mb-2 d-flex flex-row ">
                        <small className="text-light opacity-75 me-2">CI:</small>
                        <p className="text-white mb-1 small">{user.ci}</p>
                    </div>

                    {user.telefono && (
                        <div className="mb-2 d-flex flex-row ">
                            <small className="text-light opacity-75 me-2">Teléfono:</small>
                            <p className="text-white mb-1 small">{user.telefono}</p>
                        </div>
                    )}

                    {user.correoElectronico && (
                        <div className="mb-3 d-flex flex-row ">
                            <small className="text-light opacity-75 me-2">Email:</small>
                            <p className="text-white mb-0 small text-truncate" title={user.correoElectronico}>
                                {user.correoElectronico}
                            </p>
                        </div>
                    )}

                    <div className="d-flex justify-content-end">
                        <button
                            className={`btn btn-sm px-3 ${
                                user.active 
                                    ? 'btn-outline-light' 
                                    : 'btn-light'
                            }`}
                            onClick={handleToggleStatus}
                            disabled={isLoading}
                            style={{
                                transition: "all 0.2s ease",
                                fontSize:'12px'
                            }}
                        >
                            {isLoading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                    Procesando...
                                </>
                            ) : (
                                <>
                                    {user.active ? 'Desactivar' : 'Activar'}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ActiveManager = ({ users, onUserUpdated }) => {
    const [loadingUsers, setLoadingUsers] = useState(new Set());
    
    const [searchTerm, setSearchTerm] = useState('');

    
    const handleToggleUserStatus = async (userId) => {
        try {
            
            setLoadingUsers(prev => new Set([...prev, userId]));
            
            
            await toggleUserActiveStatus(userId);
            
            
            onUserUpdated();
            
        } catch (error) {
            console.error("Error toggling user status:", error);
            alert("Error al cambiar el estado del usuario. Intente nuevamente.");
        } finally {
            
            setLoadingUsers(prev => {
                const newSet = new Set(prev);
                newSet.delete(userId);
                return newSet;
            });
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredUsers = users.filter(user => {
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
            <div className="row mb-4 mt-0">
                <div className="col-12">
                    <div className="glass-panel p-3" style={{borderRadius: '12px'}}>
                        <div className="d-flex align-items-center gap-3">
                            <div className="d-flex align-items-center">
                                <i className="bi bi-search me-2" style={{color: 'rgb(102, 147, 194)', fontSize: '1.2rem'}}></i>
                                <p className="text-white fw-bold mb-0" style={{fontSize:'medium'}} >Buscar Usuarios</p>
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
                <div className="col-6 col-md-3">
                    <div className="text-center p-2 rounded" style={{backgroundColor: 'rgba(255, 255, 255, 0.1)'}}>
                        <h5 className="text-white fw-bold mb-1">{filteredUsers.length}</h5>
                        <small className="text-light opacity-75">
                            {searchTerm ? 'Resultados Encontrados' : 'Total Usuarios'}
                        </small>
                    </div>
                </div>
                <div className="col-6 col-md-3">
                    <div className="text-center p-2 rounded" style={{backgroundColor: 'rgba(40, 167, 69, 0.2)'}}>
                        <h5 className="text-success fw-bold mb-1">
                            {filteredUsers.filter(u => u.active).length}
                        </h5>
                        <small className="text-light opacity-75">Activos</small>
                    </div>
                </div>
                <div className="col-6 col-md-3">
                    <div className="text-center p-2 rounded" style={{backgroundColor: 'rgba(108, 117, 125, 0.2)'}}>
                        <h5 className="text-secondary fw-bold mb-1">
                            {filteredUsers.filter(u => !u.active).length}
                        </h5>
                        <small className="text-light opacity-75">Inactivos</small>
                    </div>
                </div>
                <div className="col-6 col-md-3">
                    <div className="text-center p-2 rounded" style={{backgroundColor: 'rgba(25, 73, 115, 0.3)'}}>
                        <h5 className="fw-bold mb-1" style={{color: 'rgb(102, 147, 194)'}}>
                            {loadingUsers.size}
                        </h5>
                        <small className="text-light opacity-75">Procesando</small>
                    </div>
                </div>
            </div>
            {sortedUsers.length > 0 ? (
                <div className="row">
                    {sortedUsers.map(user => (
                        <UserCard
                            key={user.idUsuario}
                            user={user}
                            onToggleStatus={handleToggleUserStatus}
                            isLoading={loadingUsers.has(user.idUsuario)}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-5">
                    <i className="bi bi-search text-light opacity-50" style={{fontSize: '3rem'}}></i>
                    <p className="text-light opacity-75 mt-3 mb-0">
                        {searchTerm ? 'No se encontraron usuarios que coincidan con la búsqueda' : 'No hay usuarios disponibles'}
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
        </div>
    );
};

export default ActiveManager;