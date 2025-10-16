import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
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
  // Cleanup function to prevent PDF generation from interfering with navigation
  useEffect(() => {
    const cleanupPDFArtifacts = () => {
      // Remove any orphaned canvas elements from html2canvas
      const orphanedCanvas = document.querySelectorAll('canvas[data-html2canvas-ignore], canvas[style*="position: absolute"]');
      orphanedCanvas.forEach(canvas => {
        if (canvas.parentNode) {
          canvas.parentNode.removeChild(canvas);
        }
      });
      
      // Remove any temporary PDF generation elements
      const tempElements = document.querySelectorAll('[data-pdf-generator], [style*="top: -9999px"]');
      tempElements.forEach(el => {
        if (el.parentNode && el.id !== 'root') {
          el.parentNode.removeChild(el);
        }
      });
      
      // Clear any pending jsPDF operations
      if (window.jsPDF && window.jsPDF.API) {
        delete window.jsPDF.API.currentDoc;
      }
    };

    // Run cleanup on route changes
    const handleRouteChange = () => {
      setTimeout(cleanupPDFArtifacts, 100);
    };

    // Listen for route changes
    window.addEventListener('popstate', handleRouteChange);
    
    // Initial cleanup
    cleanupPDFArtifacts();

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      cleanupPDFArtifacts();
    };
  }, []);

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
