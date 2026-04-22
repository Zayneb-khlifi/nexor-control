// src/routes/AppRoutes.tsx
import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import UserDashboard from "../pages/UserDashboard";
import CommandesList from "../pages/commandes/CommandesList";
import CreateCommande from "../pages/commandes/CreateCommande";
import RobotsList from "../pages/robots/RobotsList";
import ProduitsList from "../pages/produits/ProduitsList";
import CreateProduit from "../pages/produits/CreateProduit";
import StockList from "../pages/stock/StockList";
import Supervision from "../pages/supervision/Supervision";
import Logs from "../pages/logs/Logs";
import Stats from "../pages/stats/Stats";
import Profile from "../pages/profile/Profile";
import { ProtectedRoute } from "../components/ProtectedRoute";
import UsersList from "../pages/users/UsersList";
import NotFound from "../pages/NotFound";
import ServerError from "../pages/ServerError";
import { useAuth } from "../hooks/useAuth";
import Tracking from "../pages/tracking/Tracking";
import RecommendationStats from "../pages/admin/RecommendationStats";

// Composant pour rediriger vers le bon dashboard selon le rôle
function DashboardRouter() {
  const { user } = useAuth();
  
  if (user?.role === "USER") {
    return <UserDashboard />;
  }
  return <Dashboard />;
}

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/500" element={<ServerError />} />
      <Route path="*" element={<NotFound />} />
      
      {/* Routes accessibles à tous les utilisateurs authentifiés (USER, ADMIN, SUPERADMIN) */}
      <Route element={<ProtectedRoute />}>
        {/* Dashboard avec redirection selon le rôle */}
        <Route path="/" element={<DashboardRouter />} />
        
        {/* Pages communes à tous */}
        <Route path="/commandes" element={<CommandesList />} />
        <Route path="/commandes/create" element={<CreateCommande />} />
        <Route path="/produits" element={<ProduitsList />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/tracking" element={<Tracking />} />
        
        {/* Pages réservées aux ADMIN et SUPERADMIN */}
        <Route element={<ProtectedRoute allowedRoles={["ADMIN", "SUPERADMIN"]} />}>
          <Route path="/robots" element={<RobotsList />} />
          <Route path="/produits/create" element={<CreateProduit />} />
          <Route path="/produits/edit/:id" element={<CreateProduit />} />
          <Route path="/stock" element={<StockList />} />
          <Route path="/supervision" element={<Supervision />} />
          <Route path="/logs" element={<Logs />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/users" element={<UsersList />} />
          <Route path="/recommendation-stats" element={<RecommendationStats />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;