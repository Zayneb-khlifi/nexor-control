// src/layouts/MainLayout.tsx
import { type ReactNode, useContext, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import NotificationBell from "../components/notifications/NotificationBell";
import { 
  LayoutDashboard, 
  Package, 
  Bot, 
  ShoppingCart, 
  Warehouse, 
  LogOut, 
  Menu, 
  User,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Bell,
  Settings,
  HelpCircle,
  Sun,
  Moon,
  Activity,
  BarChart3, 
  Users,
  Home,
  Gift,
  Heart,
  MapPin
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

interface MainLayoutProps {
  children: ReactNode;
}

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
  userOnly?: boolean;
}

// Composant Menu Utilisateur réutilisable
const UserMenuComponent = ({ user, darkMode, setDarkMode, onLogout, onClose, position = "bottom" }: any) => {
  const navigate = useNavigate();
  
  const handleAction = (action: string) => {
    onClose();
    switch(action) {
      case "profile":
        navigate("/profile");
        break;
      case "settings":
        toast("⚙️ Page des paramètres en cours de développement", { icon: "⚙️" });
        break;
      case "help":
        toast("📚 Centre d'aide - Documentation disponible", { icon: "📚" });
        break;
      case "darkmode":
        setDarkMode(!darkMode);
        toast.success(darkMode ? "☀️ Mode clair activé" : "🌙 Mode sombre activé");
        break;
      case "logout":
        onLogout();
        break;
      default:
        break;
    }
  };

  const positionClasses = position === "bottom" 
    ? "absolute bottom-full right-0 mb-2" 
    : "absolute top-full right-0 mt-2";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{ duration: 0.2 }}
      className={`${positionClasses} w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden`}
    >
      <div className="relative p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <span className="text-lg font-bold">
              {user?.nom ? user.nom.charAt(0).toUpperCase() : "U"}
            </span>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm truncate">{user?.nom || user?.email}</p>
            <p className="text-xs opacity-80">
              {user?.role === "SUPERADMIN" ? "Super Administrateur" : 
               user?.role === "ADMIN" ? "Administrateur" : "Client"}
            </p>
          </div>
        </div>
      </div>
      
      <div className="p-2">
        <button onClick={() => handleAction("profile")} className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 group">
          <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:bg-blue-200 transition">
            <User className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium">Mon profil</p>
            <p className="text-xs text-gray-400">Vos informations personnelles</p>
          </div>
        </button>
        
        <button onClick={() => handleAction("settings")} className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 group">
          <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center group-hover:bg-gray-200 transition">
            <Settings className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium">Paramètres</p>
            <p className="text-xs text-gray-400">Configurer l'application</p>
          </div>
        </button>
        
        <button onClick={() => handleAction("help")} className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 group">
          <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center group-hover:bg-purple-200 transition">
            <HelpCircle className="w-4 h-4 text-purple-600" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium">Aide & Support</p>
            <p className="text-xs text-gray-400">Documentation</p>
          </div>
        </button>
        
        <button onClick={() => handleAction("darkmode")} className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 group">
          <div className="w-8 h-8 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center group-hover:bg-yellow-200 transition">
            {darkMode ? <Sun className="w-4 h-4 text-yellow-600" /> : <Moon className="w-4 h-4 text-gray-600" />}
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium">{darkMode ? "Mode clair" : "Mode sombre"}</p>
            <p className="text-xs text-gray-400">Changer le thème</p>
          </div>
        </button>
        
        <div className="border-t border-gray-100 dark:border-gray-700 my-2"></div>
        
        <button onClick={() => handleAction("logout")} className="w-full flex items-center gap-3 px-3 py-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200 group">
          <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center group-hover:bg-red-200 transition">
            <LogOut className="w-4 h-4 text-red-600" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium">Déconnexion</p>
            <p className="text-xs text-red-400">Quitter l'application</p>
          </div>
        </button>
      </div>
    </motion.div>
  );
};

function MainLayout({ children }: MainLayoutProps) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userMenuOpenSidebar, setUserMenuOpenSidebar] = useState(false);
  const [userMenuOpenNavbar, setUserMenuOpenNavbar] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPERADMIN";
  const isSuperAdmin = user?.role === "SUPERADMIN";
  const isRegularUser = user?.role === "USER";

  // Style différent selon le rôle
  const sidebarGradient = isRegularUser 
    ? "bg-gradient-to-br from-emerald-900 to-teal-800" 
    : "bg-gradient-to-br from-gray-900 to-gray-800";

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(false);
      }
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Navigation items selon le rôle
  const navItems: NavItem[] = [
    { name: "Dashboard", path: "/", icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: "Commandes", path: "/commandes", icon: <ShoppingCart className="w-5 h-5" /> },
    { name: "Robots", path: "/robots", icon: <Bot className="w-5 h-5" />, adminOnly: true },
    { name: "Produits", path: "/produits", icon: <Package className="w-5 h-5" /> },
    { name: "Stock", path: "/stock", icon: <Warehouse className="w-5 h-5" />, adminOnly: true },
    { name: "Supervision", path: "/supervision", icon: <Activity className="w-5 h-5" />, adminOnly: true },
    { name: "Logs", path: "/logs", icon: <Activity className="w-5 h-5" />, adminOnly: true },
    { name: "Stats", path: "/stats", icon: <BarChart3 className="w-5 h-5" />, adminOnly: true },
    { name: "Utilisateurs", path: "/users", icon: <Users className="w-5 h-5" />, adminOnly: true },
    { name: "Tracking", path: "/tracking", icon: <MapPin className="w-5 h-5" />, adminOnly: true },
  ];

  // Filtrer les éléments selon le rôle
  const visibleNavItems = navItems.filter(item => {
    if (item.adminOnly && !isAdmin && !isSuperAdmin) return false;
    return true;
  });

  // Message de bienvenue personnalisé pour USER
  const welcomeMessage = isRegularUser 
    ? "Bienvenue sur votre espace client" 
    : "Tableau de bord";

  const handleLogout = () => {
    logout();
    toast.success("👋 Déconnexion réussie !");
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Toaster position="top-right" />
      
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar avec gradient différent selon rôle */}
      <motion.aside
        initial={false}
        animate={{
          width: sidebarCollapsed && !isMobile ? 80 : 280,
          transition: { duration: 0.3, type: "spring", damping: 20 }
        }}
        className={`fixed lg:relative inset-y-0 left-0 z-30 ${sidebarGradient} text-white shadow-2xl ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className={`p-6 border-b border-white/10 flex items-center justify-between ${sidebarCollapsed && !isMobile ? "px-4" : ""}`}>
            {(!sidebarCollapsed || isMobile) && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-wide">NEXOR</h1>
                  <p className="text-xs text-white/70">{isRegularUser ? "Espace Client" : "Robot Fleet"}</p>
                </div>
              </motion.div>
            )}
            {!isMobile && (
              <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-1 rounded-lg hover:bg-white/10 transition">
                {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            )}
          </div>

          {/* Message de bienvenue pour USER */}
          {isRegularUser && (!sidebarCollapsed || isMobile) && (
            <div className="mx-4 mt-4 p-3 bg-white/10 rounded-xl text-center">
              <Heart className="w-8 h-8 mx-auto mb-2 text-pink-400" />
              <p className="text-sm font-medium">Bienvenue,</p>
              <p className="text-xs text-white/70">{user?.nom || user?.email}</p>
              <p className="text-xs text-white/50 mt-1">Client fidèle</p>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {visibleNavItems.map((item, index) => (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive(item.path)
                      ? isRegularUser 
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg"
                        : "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  } ${sidebarCollapsed && !isMobile ? "justify-center" : ""}`}
                  title={sidebarCollapsed && !isMobile ? item.name : undefined}
                >
                  {item.icon}
                  {(!sidebarCollapsed || isMobile) && <span className="font-medium">{item.name}</span>}
                </Link>
              </motion.div>
            ))}
          </nav>

          {/* Menu utilisateur dans la sidebar */}
          <div className="p-4 border-t border-white/10">
            <div className="relative">
              <button
                onClick={() => setUserMenuOpenSidebar(!userMenuOpenSidebar)}
                className={`flex items-center gap-3 w-full p-2 rounded-xl hover:bg-white/10 transition ${sidebarCollapsed && !isMobile ? "justify-center" : ""}`}
              >
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white text-sm font-medium">
                    {user?.nom ? user.nom.charAt(0).toUpperCase() : "U"}
                  </span>
                </div>
                {(!sidebarCollapsed || isMobile) && (
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium truncate">{user?.nom || user?.email}</p>
                    <p className="text-xs text-white/60">
                      {user?.role === "SUPERADMIN" ? "Super Admin" : user?.role === "ADMIN" ? "Admin" : "Client"}
                    </p>
                  </div>
                )}
                {(!sidebarCollapsed || isMobile) && <ChevronDown className={`w-4 h-4 text-white/60 transition-transform duration-200 ${userMenuOpenSidebar ? "rotate-180" : ""}`} />}
              </button>

              <AnimatePresence>
                {userMenuOpenSidebar && (
                  <UserMenuComponent
                    user={user}
                    darkMode={darkMode}
                    setDarkMode={setDarkMode}
                    onLogout={handleLogout}
                    onClose={() => setUserMenuOpenSidebar(false)}
                    position="bottom"
                  />
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10 transition-colors duration-300">
          <div className="flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 dark:text-gray-300" />
              </button>
              <div className="hidden lg:block">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white">
                  {welcomeMessage}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <button 
                onClick={() => toast("🔔 Vous avez 3 nouvelles notifications", { icon: "🔔" })}
                className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                <NotificationBell />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setUserMenuOpenNavbar(!userMenuOpenNavbar)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 group"
                >
                  <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-white text-sm font-medium">
                      {user?.nom ? user.nom.charAt(0).toUpperCase() : "U"}
                    </span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 hidden sm:block ${userMenuOpenNavbar ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {userMenuOpenNavbar && (
                    <UserMenuComponent
                      user={user}
                      darkMode={darkMode}
                      setDarkMode={setDarkMode}
                      onLogout={handleLogout}
                      onClose={() => setUserMenuOpenNavbar(false)}
                      position="top"
                    />
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

export default MainLayout;