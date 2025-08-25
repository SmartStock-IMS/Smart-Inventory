import { Routes, Route } from "react-router-dom";
import RMHeader from "../components/ResourceManager/RMHeader.jsx";
import RMHome from "../pages/ResourceManager/RMHome.jsx";
import Resources from "../pages/ResourceManager/Resources.jsx";
import ResourceOrders from "../pages/ResourceManager/ResourceOrders.jsx";

function ResourceManagerRoutes() {
  return (
    <div className="h-screen w-screen flex flex-col">
      <div className="h-16 flex-shrink-0">
        <RMHeader />
      </div>
      <div className="flex-1 overflow-hidden">
        <main className="w-full h-full overflow-y-auto overflow-x-hidden bg-slate-100">
          <div className="min-h-full p-2 lg:p-4">
            <Routes>
              <Route path="/" element={<RMHome />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/orders" element={<ResourceOrders />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ResourceManagerRoutes;
