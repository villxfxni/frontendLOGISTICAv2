import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import InicioSesion from "./Components/Common/InicioSesion.jsx";
import Registro from "./Components/Common/Registro.jsx";
import BuscarCI from "./Components/Common/BuscarCI.jsx";
import {useTokenExpirationCheck} from "./Components/Common/useTokenExpirationCheck.jsx";
import HolaMundo from "./Components/HolaMundo.jsx";
import Donaciones from "./Components/Donaciones/Donaciones.jsx";
import FormularioSolicitud from "./Components/Formulario/FormularioSolicitud.jsx";
import Seguimiento from "./Components/Donaciones/Seguimiento/Seguimiento.jsx";
import ListarSolicitudes from "./Components/Solicitudes/ListarSolicitudes.jsx";
import RutaProtegida from './Components/Common/RutaProtegida.jsx';
import RutaProtegidaAdmin from './Components/Common/RutaProtegidaAdmin.jsx';
import AdminPanel from "./Components/Adminstracion/AdminPanel.jsx";
import GaleriaDonaciones from './Components/Metricas/GaleriaDonaciones.jsx';
import Dashboard from './Components/Dashboard/Dashboard.jsx';

function TokenExpirationCheck() {
    useTokenExpirationCheck();
    return null;
}

function App() {
    return (
        <Router>
            <TokenExpirationCheck />
            <Routes>
                <Route path="/" element={<InicioSesion/>}/>
                <Route path="/login" element={<InicioSesion/>}/>
                <Route path="/registrate" element={<Registro/>}/>
                <Route path="/buscar-ci" element={<BuscarCI/>}/>
                <Route path="/gracias" element={<RutaProtegida><GaleriaDonaciones/></RutaProtegida>}/>
                <Route path="/metricas" element={<Dashboard/>}/>
                <Route path="/seguimiento" element={<RutaProtegida><Seguimiento/></RutaProtegida>} />
                <Route path="/solicitudes" element={<RutaProtegida><ListarSolicitudes/></RutaProtegida>} />
                <Route path="/solicitar" element={<FormularioSolicitud/>} />
                <Route path="/donaciones" element={<RutaProtegida><Donaciones/></RutaProtegida>} />
                <Route path="/admin" element={<RutaProtegidaAdmin><AdminPanel/></RutaProtegidaAdmin>} />
            </Routes>
        </Router>
    );
}


export default App;