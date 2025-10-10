import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthContextProvider } from "./context/auth/AuthContext.jsx";
import Login from "./pages/auth/Login.jsx";
import Unauthorized from "./pages/auth/Unauthorized.jsx";
import ProtectedRoutes from "./routes/ProtectedRoutes.jsx";
import RoleBasedRedirect from "./components/auth/RoleBasedRedirect.jsx";
import SalesRepRoutes from "./routes/SalesRepRoutes.jsx";
import InventoryManagerRoutes from "./routes/InventoryManagerRoutes.jsx";
import AdmiAdministratorRoutes from "./routes/AdministratorRoutes.jsx";
import ResourceManagerRoutes from "./routes/ResourceManagerRoutes.jsx";

function App() {
  return (
    <AuthContextProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Routes - Order matters! More specific routes first */}
          <Route element={<ProtectedRoutes allowedRoles={['inventory_manager']} />}>
            <Route path="/inventorymanager/*" element={<InventoryManagerRoutes />} />
          </Route>
          
          <Route element={<ProtectedRoutes allowedRoles={['admin']} />}>
            <Route path="/administrator/*" element={<AdmiAdministratorRoutes />} />
          </Route>
          
          <Route element={<ProtectedRoutes allowedRoles={['resource_manager']} />}>
            <Route path="/resourcemanager/*" element={<ResourceManagerRoutes />} />
          </Route>

          {/* Sales Rep Routes - At root level, must be last to avoid conflicts */}
          <Route element={<ProtectedRoutes allowedRoles={['sales_staff', 'sales_rep']} />}>
            <Route path="*" element={<SalesRepRoutes />} />
          </Route>
        </Routes>
      </Router>
    </AuthContextProvider>
  );
}

export default App;
