import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../Style.css";
import Header from "../Common/Header.jsx";
import ActiveManager from "./ActiveManager.jsx";
import PromotionManager from "./PromotionManager.jsx";
import { fetchNonAdminUsers } from "../../Services/adminService.js";

const AdminPanel = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [activeTab, setActiveTab] = useState('status'); 

    const handleRefreshUsers = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    const handleTabChange = (tabName) => {
        setActiveTab(tabName);
    };

    useEffect(() => {
        const loadUsers = async () => {
            try {
                setLoading(true);
                setError(null);
                const usersData = await fetchNonAdminUsers();
                setUsers(usersData);
            } catch (err) {
                console.error("Error loading users:", err);
                setError("Error al cargar los usuarios. Intente nuevamente más tarde.");
            } finally {
                setLoading(false);
            }
        };

        loadUsers();
    }, [refreshTrigger]);

    return (
        <div className="list-div">
            <Header />
            
            <div className=" px-3 px-md-5 py-4">
                
                <div className="row mb-2">
                    <div className="col-12">
                        <div className="p-3 text-center">
                            <h4 className="text-white fw-bold mb-1">
                                Panel de Administración
                            </h4>
                            <p className="text-light opacity-75 mb-4" style={{fontSize:'small'}} >
                                Gestión de usuarios y permisos del sistema
                            </p>
                            
                            <div className="d-flex justify-content-center">
                                <div role="group" style={{overflow: 'hidden'}}>
                                    <button
                                        className={`
                                        py-1 me-3
                                        ${
                                            activeTab === 'status' 
                                                ? 'btn-mine' 
                                                : 'btn-outline-mine'
                                        }`}
                                        style={{whiteSpace: "nowrap", transition: 'all 0.3s ease'}}
                                        onClick={() => handleTabChange('status')}
                                
                                    >
                                        <i className="bi bi-toggle-on me-2"></i>
                                        Gestión de Estado
                                    </button>
                                    <button
                                        className={`
                                        py-1 me-3
                                        ${
                                            activeTab === 'promotion'
                                                ? 'btn-mine'
                                                : 'btn-outline-mine'
                                        }`}
                                        style={{whiteSpace: "nowrap",  transition: 'all 0.3s ease'}}
                                        onClick={() => handleTabChange('promotion')}
                                     
                                    >
                                        <i className="bi bi-person-badge me-2"></i>
                                        Promoción Admin
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                
                {loading && (
                    <div className="row">
                        <div className="col-12">
                            <div className="glass-card p-4 text-center">
                                <div className="spinner-border text-warning" role="status">
                                    <span className="visually-hidden">Cargando...</span>
                                </div>
                                <p className="text-white mt-3 mb-0">Cargando usuarios...</p>
                            </div>
                        </div>
                    </div>
                )}

                
                {error && (
                    <div className="row">
                        <div className="col-12">
                            <div className="glass-card p-4">
                                <div className="alert alert-danger mb-0" role="alert">
                                    <i className="bi bi-exclamation-triangle me-2"></i>
                                    {error}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                
                {!loading && !error && (
                    <div className="row">
                        <div className="col-12">
                            <div className="p-0" style={{borderRadius: '16px', overflow: 'hidden'}}>
                                
                                <div className="position-relative">
                                    
                                    <div 
                                        className={`tab-content ${activeTab === 'status' ? 'active' : ''}`}
                                        style={{
                                            display: activeTab === 'status' ? 'block' : 'none'
                                        }}
                                    >
                                        <div className="p-4">
                                            <div className="  d-flex align-items-center justify-content-between mb-4" style={{borderRadius:'10px'}}>
                                                <div className="d-flex align-items-center">

                                                    <div>
                                                        <h5 className="text-white fw-bold mb-1">Gestión de Estado de Usuarios</h5>
                                                        <p className="text-light opacity-75 mb-0 small">
                                                            Activar o desactivar usuarios en el sistema
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-end">
                                                    <span className="badge text-light px-3 py-2" style={{backgroundColor: 'rgb(25, 73, 115)'}}>
                                                        {users.length} Usuarios
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="bg-opacity-0">
                                                <ActiveManager
                                                    users={users}
                                                    onUserUpdated={handleRefreshUsers}
                                                />
                                            </div>

                                        </div>
                                    </div>

                                    
                                    <div 
                                        className={`tab-content ${activeTab === 'promotion' ? 'active' : ''}`}
                                        style={{
                                            display: activeTab === 'promotion' ? 'block' : 'none'
                                        }}
                                    >
                                        <div className="p-4">
                                            <div className="d-flex align-items-center justify-content-between mb-4">
                                                <div className="d-flex align-items-center">

                                                    <div>
                                                        <h5 className="text-white fw-bold mb-1">Promoción a Administrador</h5>
                                                        <p className="text-light opacity-75 mb-0 smaller">
                                                            Otorgar permisos de administrador a usuarios del sistema
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-end">
                                                    <span className="badge text-light px-3 py-2" style={{backgroundColor: 'rgb(25, 73, 115)'}}>
                                                        {users.filter(u => !u.admin).length} Elegibles
                                                    </span>
                                                </div>
                                            </div>
                                            <PromotionManager
                                                users={users} 
                                                onUserUpdated={handleRefreshUsers}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPanel; 
