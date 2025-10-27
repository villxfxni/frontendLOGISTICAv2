import React, { useEffect, useState } from 'react';
import { ListTests } from '../Services/TestService';

function ListarTestsComponent() {
    const [tests, setTests] = useState([]);

    useEffect(() => {
        ListTests().then(res => {
            setTests(res.data);
        }).catch(err => {
            console.error("Error al cargar tests:", err);
        });
    }, []);

    return (
        <div className="container">
            <h2 className="text-center">Lista de Tests</h2>
            <table className="table table-bordered">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Descripción</th>
                </tr>
                </thead>
                <tbody>
                {tests.map(test => (
                    <tr key={test.id}>
                        <td>{test.id}</td>
                        <td>{test.name}</td>
                        <td>{test.descripcion}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

export default ListarTestsComponent;
