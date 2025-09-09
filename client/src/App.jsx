import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthContextProvider } from "./context/auth/AuthContext.jsx";
import Login from "./pages/auth/Login.jsx";
import Unauthorized from "./pages/auth/Unauthorized.jsx";
import SalesRepRoutes from "./routes/SalesRepRoutes.jsx";
import InventoryManagerRoutes from "./routes/InventoryManagerRoutes.jsx";
import AdmiAdministratorRoutes from "./routes/AdministratorRoutes.jsx";
import ResourceManagerRoutes from "./routes/ResourceManagerRoutes.jsx";

function App() {
  return (
    <AuthContextProvider>
      <Router>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Main Routes - No protection for development */}
          <Route path="/*" element={<SalesRepRoutes />} />
          <Route path="/inventorymanager/*" element={<InventoryManagerRoutes />} />
          <Route path="/administrator/*" element={<AdmiAdministratorRoutes />} />
          <Route path="/resourcemanager/*" element={<ResourceManagerRoutes />} />
        </Routes>
      </Router>
    </AuthContextProvider>
  );
}

export default App;
