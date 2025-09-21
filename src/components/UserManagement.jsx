import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Shield,
  User,
  Mail,
  Calendar,
  Settings
} from 'lucide-react'
import { normalizeText } from '@/lib/utils'

export function UserManagement() {
  const [users, setUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [loading, setLoading] = useState(true)
  const [showAddUser, setShowAddUser] = useState(false)
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    role: 'user',
    password: ''
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      // Simulation de données pour la démonstration
      // En production, cet appel serait fait vers l'API Flask
      const mockData = [
        {
          id: 1,
          username: 'admin',
          email: 'admin@company.com',
          role: 'administrator',
          created_at: '2023-01-15T10:00:00Z',
          last_login: '2024-09-04T08:30:00Z',
          status: 'active'
        },
        {
          id: 2,
          username: 'jdupont',
          email: 'j.dupont@company.com',
          role: 'manager',
          created_at: '2023-03-20T14:30:00Z',
          last_login: '2024-09-03T16:45:00Z',
          status: 'active'
        },
        {
          id: 3,
          username: 'mmartin',
          email: 'm.martin@company.com',
          role: 'user',
          created_at: '2023-06-10T09:15:00Z',
          last_login: '2024-09-02T11:20:00Z',
          status: 'active'
        },
        {
          id: 4,
          username: 'pbernard',
          email: 'p.bernard@company.com',
          role: 'user',
          created_at: '2023-08-05T16:00:00Z',
          last_login: '2024-08-30T14:10:00Z',
          status: 'inactive'
        },
        {
          id: 5,
          username: 'sdurand',
          email: 's.durand@company.com',
          role: 'technician',
          created_at: '2023-11-12T11:45:00Z',
          last_login: '2024-09-04T07:55:00Z',
          status: 'active'
        }
      ]
      
      const sortedUsers = [...mockData].sort((a, b) =>
        a.username.localeCompare(b.username, 'fr', { sensitivity: 'base' })
      )

      setUsers(sortedUsers)
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = useMemo(() => {
    const normalizedSearch = normalizeText(searchTerm)

    return users.filter(user => {
      const matchesSearch = !normalizedSearch || [user.username, user.email]
        .some(field => normalizeText(field).includes(normalizedSearch))

      if (!matchesSearch) {
        return false
      }

      if (filterRole === 'all') {
        return true
      }

      return user.role === filterRole
    })
  }, [users, searchTerm, filterRole])

  const getRoleBadge = (role) => {
    switch (role) {
      case 'administrator':
        return <Badge className="bg-red-100 text-red-800"><Shield className="w-3 h-3 mr-1" />Administrateur</Badge>
      case 'manager':
        return <Badge className="bg-blue-100 text-blue-800"><Settings className="w-3 h-3 mr-1" />Manager</Badge>
      case 'technician':
        return <Badge className="bg-green-100 text-green-800"><Settings className="w-3 h-3 mr-1" />Technicien</Badge>
      case 'user':
        return <Badge className="bg-gray-100 text-gray-800"><User className="w-3 h-3 mr-1" />Utilisateur</Badge>
      default:
        return <Badge variant="secondary">{role}</Badge>
    }
  }

  const getStatusBadge = (status) => {
    return status === 'active' ? (
      <Badge className="bg-green-100 text-green-800">Actif</Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-800">Inactif</Badge>
    )
  }

  const handleAddUser = async (e) => {
    e.preventDefault()
    try {
      // En production, cet appel serait fait vers l'API Flask
      const newUserData = {
        ...newUser,
        id: users.length + 1,
        created_at: new Date().toISOString(),
        last_login: null,
        status: 'active'
      }
      
      setUsers([...users, newUserData])
      setNewUser({ username: '', email: '', role: 'user', password: '' })
      setShowAddUser(false)
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'utilisateur:', error)
    }
  }

  const handleDeleteUser = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        // En production, cet appel serait fait vers l'API Flask
        setUsers(users.filter(user => user.id !== id))
      } catch (error) {
        console.error('Erreur lors de la suppression:', error)
      }
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Jamais'
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
        </div>
        <div className="grid grid-cols-1 gap-6">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
          <p className="text-gray-600">Administration des comptes utilisateurs</p>
        </div>
        <Button onClick={() => setShowAddUser(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvel utilisateur
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Utilisateurs</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Actifs</p>
                <p className="text-2xl font-bold text-green-600">
                  {users.filter(user => user.status === 'active').length}
                </p>
              </div>
              <User className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Administrateurs</p>
                <p className="text-2xl font-bold text-red-600">
                  {users.filter(user => user.role === 'administrator').length}
                </p>
              </div>
              <Shield className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inactifs</p>
                <p className="text-2xl font-bold text-gray-600">
                  {users.filter(user => user.status === 'inactive').length}
                </p>
              </div>
              <User className="w-8 h-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add User Form */}
      {showAddUser && (
        <Card>
          <CardHeader>
            <CardTitle>Ajouter un nouvel utilisateur</CardTitle>
            <CardDescription>
              Créer un nouveau compte utilisateur pour l'application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom d'utilisateur
                  </label>
                  <Input
                    value={newUser.username}
                    onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                    placeholder="jdupont"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    placeholder="j.dupont@company.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rôle
                  </label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="user">Utilisateur</option>
                    <option value="technician">Technicien</option>
                    <option value="manager">Manager</option>
                    <option value="administrator">Administrateur</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mot de passe
                  </label>
                  <Input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowAddUser(false)}>
                  Annuler
                </Button>
                <Button type="submit">
                  Créer l'utilisateur
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Rechercher par nom d'utilisateur ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les rôles</option>
              <option value="administrator">Administrateur</option>
              <option value="manager">Manager</option>
              <option value="technician">Technicien</option>
              <option value="user">Utilisateur</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="space-y-4">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{user.username}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Mail className="w-4 h-4" />
                      <span>{user.email}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="flex items-center space-x-2 mb-1">
                      {getRoleBadge(user.role)}
                      {getStatusBadge(user.status)}
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="w-3 h-3 mr-1" />
                      Dernière connexion: {formatDate(user.last_login)}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 hover:text-red-700"
                      disabled={user.role === 'administrator'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Créé le:</span>
                    <span className="ml-2">{formatDate(user.created_at)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Statut:</span>
                    <span className="ml-2 capitalize">{user.status}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Permissions:</span>
                    <span className="ml-2 capitalize">{user.role}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun utilisateur trouvé</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterRole !== 'all'
                ? 'Aucun utilisateur ne correspond à vos critères de recherche.'
                : 'Aucun utilisateur n\'est encore enregistré.'}
            </p>
            <Button onClick={() => setShowAddUser(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un utilisateur
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

