import { Routes, Route } from "react-router-dom";
import RMHeader from "../components/ResourceManager/RMHeader.jsx";
import RMHome from "../pages/ResourceManager/RMHome.jsx";
import Resources from "../pages/ResourceManager/Resources.jsx";
import ResourceOrders from "../pages/ResourceManager/ResourceOrders.jsx";
import VehicleManagement from "../pages/ResourceManager/VehicleManagement.jsx";
import { ThemeProvider, useTheme } from "../context/theme/ThemeContext.jsx";
import { VehicleProvider } from "../context/vehicle/VehicleContext.jsx";
import Profile from "../pages/auth/Profile.jsx";

function ResourceManagerContent() {
  const { isDarkMode } = useTheme();
  
  return (
    <VehicleProvider>
      <div className="h-screen w-screen flex flex-col">
        <div className="h-16 flex-shrink-0">
          <RMHeader />
        </div>
        <div className="flex-1 overflow-hidden">
          <main className={`w-full h-full overflow-y-auto overflow-x-hidden transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-900' : 'bg-slate-100'
          }`}>
            <div className="min-h-full p-2 lg:p-4">
              <Routes>
                <Route path="/" element={<RMHome />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/resources" element={<Resources />} />
                <Route path="/orders" element={<ResourceOrders />} />
                <Route path="/vehicles" element={<VehicleManagement />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </VehicleProvider>
  );
}

function ResourceManagerRoutes() {
  return (
    <ThemeProvider>
      <ResourceManagerContent />
    </ThemeProvider>
  );
}

export default ResourceManagerRoutes;
