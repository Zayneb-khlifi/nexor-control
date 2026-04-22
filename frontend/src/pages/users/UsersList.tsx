// src/pages/users/UsersList.tsx
import { useEffect, useState } from "react";
import { getUsers, deleteUser, createUser, updateUser } from "../../services/userService";
import MainLayout from "../../layouts/MainLayout";
import { useAuth } from "../../hooks/useAuth";
import { SkeletonTable } from "../../components/common/Skeleton";

import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  UsersIcon, 
  RefreshCwIcon,
  ShieldIcon,
  UserIcon,
  CrownIcon,
  XIcon,
  CheckIcon
} from "lucide-react";
import toast from "react-hot-toast";

interface User {
  id_user: number;
  nom: string;
  email: string;
  role: "USER" | "ADMIN" | "SUPERADMIN";
  statut_compte: string;
  date_creation: string;
}

function UsersList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    mot_de_passe: "",
    role: "USER"
  });
  
  const { user: currentUser, isSuperAdmin, isAdmin } = useAuth();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error("Erreur chargement utilisateurs:", error);
      toast.error("Erreur lors du chargement des utilisateurs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: number, nom: string) => {
    if (!isSuperAdmin) {
      toast.error("Seul le Super Administrateur peut supprimer des utilisateurs");
      return;
    }
    
    if (currentUser?.id === id) {
      toast.error("Vous ne pouvez pas supprimer votre propre compte");
      return;
    }
    
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur "${nom}" ?`)) {
      try {
        await deleteUser(id);
        toast.success("Utilisateur supprimé avec succès");
        fetchUsers();
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Erreur lors de la suppression");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nom || !formData.email) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    
    try {
      if (editingUser) {
        // Modification (SUPERADMIN uniquement)
        if (!isSuperAdmin) {
          toast.error("Seul le Super Administrateur peut modifier des utilisateurs");
          return;
        }
        await updateUser(editingUser.id_user, {
          nom: formData.nom,
          email: formData.email,
          role: formData.role
        });
        toast.success("Utilisateur modifié avec succès");
      } else {
        // Création (ADMIN et SUPERADMIN)
        if (!formData.mot_de_passe) {
          toast.error("Veuillez saisir un mot de passe");
          return;
        }
        await createUser({
          nom: formData.nom,
          email: formData.email,
          mot_de_passe: formData.mot_de_passe,
          role: formData.role
        });
        toast.success("Utilisateur créé avec succès");
      }
      
      setShowModal(false);
      setEditingUser(null);
      setFormData({ nom: "", email: "", mot_de_passe: "", role: "USER" });
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur lors de l'enregistrement");
    }
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({ nom: "", email: "", mot_de_passe: "", role: "USER" });
    setShowModal(true);
  };

  const openEditModal = (user: User) => {
    if (!isSuperAdmin) {
      toast.error("Seul le Super Administrateur peut modifier des utilisateurs");
      return;
    }
    setEditingUser(user);
    setFormData({
      nom: user.nom,
      email: user.email,
      mot_de_passe: "",
      role: user.role
    });
    setShowModal(true);
  };

  const getRoleBadge = (role: string) => {
    switch(role) {
      case "SUPERADMIN":
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800"><CrownIcon className="w-3 h-3" /> Super Admin</span>;
      case "ADMIN":
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800"><ShieldIcon className="w-3 h-3" /> Admin</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800"><UserIcon className="w-3 h-3" /> Utilisateur</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    return status === "ACTIF" 
      ? <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">Actif</span>
      : <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">Désactivé</span>;
  };

  const filteredUsers = users.filter(u =>
    u.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Vérifier les permissions
  if (!isAdmin && !isSuperAdmin) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-96 text-center">
          <div className="bg-red-100 p-4 rounded-full mb-4">
            <ShieldIcon className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Accès refusé</h2>
          <p className="text-gray-600">
            Cette page est réservée aux administrateurs.
          </p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Utilisateurs</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gérez les comptes utilisateurs de la plateforme
              {!isSuperAdmin && <span className="ml-2 text-xs text-blue-500">(Mode création uniquement)</span>}
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
          >
            <PlusIcon className="w-5 h-5" />
            Nouvel utilisateur
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border-l-4 border-blue-500">
          <p className="text-gray-500 text-sm">Total utilisateurs</p>
          <p className="text-2xl font-bold">{users.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border-l-4 border-purple-500">
          <p className="text-gray-500 text-sm">Super Admins</p>
          <p className="text-2xl font-bold text-purple-600">{users.filter(u => u.role === "SUPERADMIN").length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border-l-4 border-blue-500">
          <p className="text-gray-500 text-sm">Admins</p>
          <p className="text-2xl font-bold text-blue-600">{users.filter(u => u.role === "ADMIN").length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border-l-4 border-green-500">
          <p className="text-gray-500 text-sm">Utilisateurs</p>
          <p className="text-2xl font-bold text-green-600">{users.filter(u => u.role === "USER").length}</p>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Rechercher un utilisateur..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-96 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
      </div>

      {/* Tableau des utilisateurs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="font-semibold text-gray-700 dark:text-gray-300">Liste des utilisateurs</h2>
          <button
            onClick={fetchUsers}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition"
            disabled={loading}
          >
            <RefreshCwIcon className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span className="text-sm">Rafraîchir</span>
          </button>
        </div>

        {loading ? (
         <SkeletonTable rows={5} columns={7} />
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <UsersIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Aucun utilisateur</h3>
            <p className="text-gray-500 mt-1">Aucun utilisateur ne correspond à votre recherche</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rôle</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date création</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredUsers.map((u) => (
                  <tr key={u.id_user} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{u.id_user}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{u.nom}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{u.email}</td>
                    <td className="px-6 py-4">{getRoleBadge(u.role)}</td>
                    <td className="px-6 py-4">{getStatusBadge(u.statut_compte)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(u.date_creation).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {/* Modification (SUPERADMIN uniquement) */}
                        {isSuperAdmin && (
                          <button
                            onClick={() => openEditModal(u)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Modifier"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                        )}
                        {/* Suppression (SUPERADMIN uniquement, pas son propre compte) */}
                        {isSuperAdmin && currentUser?.id !== u.id_user && (
                          <button
                            onClick={() => handleDelete(u.id_user, u.nom)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Supprimer"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Création/Modification */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingUser ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nom complet *</label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium mb-1">Mot de passe *</label>
                  <input
                    type="password"
                    value={formData.mot_de_passe}
                    onChange={(e) => setFormData({ ...formData, mot_de_passe: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium mb-1">Rôle</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!isSuperAdmin && editingUser !== null}
                >
                  <option value="USER">Utilisateur</option>
                  <option value="ADMIN">Administrateur</option>
                  {isSuperAdmin && <option value="SUPERADMIN">Super Administrateur</option>}
                </select>
                {!isSuperAdmin && editingUser && (
                  <p className="text-xs text-gray-500 mt-1">Seul le Super Admin peut modifier les rôles</p>
                )}
              </div>
              
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
                  {editingUser ? "Modifier" : "Créer"}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition">
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

export default UsersList;