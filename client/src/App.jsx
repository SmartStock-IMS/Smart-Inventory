import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthContextProvider } from "./context/auth/AuthContext.jsx";
import Login from "./pages/auth/Login.jsx";
import Unauthorized from "./pages/auth/Unauthorized.jsx";
import MainRoutes from "./routes/MainRoutes";
import DashboardRoutes from "./routes/DashboardRoutes";
import ProtectedRoutes from "./routes/ProtectedRoutes.jsx";

function App() {
  return (
    <AuthContextProvider>
      <Router>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Routes (Sales-Reps) */}
          <Route element={<ProtectedRoutes allowedRoles={["001", "002"]} />}>
            <Route path="/*" element={<MainRoutes />} />
          </Route>

          {/* Protected Routes (Accountant and Admin) */}
          <Route element={<ProtectedRoutes allowedRoles={["002"]} />}>
            <Route path="/*" element={<MainRoutes />} />
            <Route path="/dashboard/*" element={<DashboardRoutes />} />
          </Route>
        </Routes>
      </Router>
    </AuthContextProvider>
  );
}

export default App;
