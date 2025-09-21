import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ImportExcel } from './ImportExcel'
import { normalizeText } from '@/lib/utils'
import { 
  Plus,
  Search,
  Edit,
  Trash2,
  Monitor,
  Server,
  Printer,
  Wifi,
  AlertTriangle,
  CheckCircle,
  Clock,
  Upload
} from 'lucide-react'

export function EquipmentList() {
  const [equipment, setEquipment] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [loading, setLoading] = useState(true)
  const [showImport, setShowImport] = useState(false)

  useEffect(() => {
    fetchEquipment()
  }, [])

  const fetchEquipment = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/equipment`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      const sortedEquipment = [...data].sort((a, b) =>
        a.name.localeCompare(b.name, "fr", { numeric: true, sensitivity: "base" })
      )
      setEquipment(sortedEquipment)
    } catch (error) {
      console.error("Erreur lors du chargement des équipements:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredEquipment = useMemo(() => {
    const normalizedSearch = normalizeText(searchTerm)

    return equipment.filter(item => {
      const matchesSearch = !normalizedSearch || [
        item.name,
        item.location,
        item.ip_address,
        item.os_name,
        item.os_version
      ].some(field => normalizeText(field).includes(normalizedSearch))

      const matchesType = filterType === 'all' || item.equipment_type === filterType
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus

      return matchesSearch && matchesType && matchesStatus
    })
  }, [equipment, searchTerm, filterType, filterStatus])

  const getTypeIcon = (type) => {
    switch (type) {
      case 'PC': return Monitor
      case 'Serveur': return Server
      case 'Imprimante': return Printer
      case 'Switch': return Wifi
      default: return Monitor
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Actif</Badge>
      case 'Obsolete':
        return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="w-3 h-3 mr-1" />Obsolète</Badge>
      case 'In Stock':
        return <Badge className="bg-gray-100 text-gray-800"><Clock className="w-3 h-3 mr-1" />En stock</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet équipement ?')) {
      try {
        // En production, appel à l'API pour supprimer
        setEquipment(equipment.filter(item => item.id !== id))
      } catch (error) {
        console.error('Erreur lors de la suppression:', error)
      }
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Équipements</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
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
          <h1 className="text-3xl font-bold text-gray-900">Équipements</h1>
          <p className="text-gray-600">Gestion du parc informatique</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setShowImport(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Import Excel
          </Button>
          <Link to="/equipment/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nouvel équipement
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Rechercher par nom, localisation, IP..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous les types</option>
                <option value="PC">PC</option>
                <option value="Serveur">Serveur</option>
                <option value="Imprimante">Imprimante</option>
                <option value="Switch">Switch</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="Active">Actif</option>
                <option value="Obsolete">Obsolète</option>
                <option value="In Stock">En stock</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Equipment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEquipment.map((item) => {
          const TypeIcon = getTypeIcon(item.equipment_type)
          return (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TypeIcon className="w-5 h-5 text-blue-600" />
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                  </div>
                  {getStatusBadge(item.status)}
                </div>
                <CardDescription>{item.equipment_type} - {item.location}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {/* Informations de base */}
                  {item.description_alias && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Description:</span>
                      <span>{item.description_alias}</span>
                    </div>
                  )}
                  {item.brand && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Marque:</span>
                      <span>{item.brand}</span>
                    </div>
                  )}
                  {item.model_number && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Modèle:</span>
                      <span>{item.model_number}</span>
                    </div>
                  )}
                  
                  {/* Informations réseau */}
                  {item.ip_address && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">IP:</span>
                      <span className="font-mono">{item.ip_address}</span>
                    </div>
                  )}
                  {item.network_connected !== null && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Connecté au réseau:</span>
                      <span className={item.network_connected ? 'text-green-600' : 'text-red-600'}>
                        {item.network_connected ? 'Oui' : 'Non'}
                      </span>
                    </div>
                  )}
                  
                  {/* Système d'exploitation */}
                  {item.os_name && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">OS:</span>
                      <span>{item.os_name} {item.os_version}</span>
                    </div>
                  )}
                  
                  {/* Informations de sauvegarde */}
                  {item.rls_network_saved !== null && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Sauvegardé RLS:</span>
                      <span className={item.rls_network_saved ? 'text-green-600' : 'text-red-600'}>
                        {item.rls_network_saved ? 'Oui' : 'Non'}
                      </span>
                    </div>
                  )}
                  {item.to_be_backed_up !== null && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">À sauvegarder:</span>
                      <span className={item.to_be_backed_up ? 'text-orange-600' : 'text-gray-600'}>
                        {item.to_be_backed_up ? 'Oui' : 'Non'}
                      </span>
                    </div>
                  )}
                  
                  {/* Fournisseur */}
                  {item.supplier && item.supplier !== 'nan' && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Fournisseur:</span>
                      <span>{item.supplier}</span>
                    </div>
                  )}
                  
                  {/* Dates */}
                  {item.acquisition_date && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Acquisition:</span>
                      <span>{new Date(item.acquisition_date).toLocaleDateString("fr-FR")}</span>
                    </div>
                  )}
                  {item.warranty_end_date && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Fin de garantie:</span>
                      <span>{new Date(item.warranty_end_date).toLocaleDateString("fr-FR")}</span>
                    </div>
                  )}
                  {item.applications && item.applications.length > 0 && (
                    <div>
                      <span className="text-gray-500">Applications:</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {item.applications.slice(0, 2).map((app, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {app.name} {app.version}
                          </Badge>
                        ))}
                        {item.applications.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{item.applications.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end space-x-2 mt-4">
                  <Link to={`/equipment/edit/${item.id}`}>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDelete(item.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredEquipment.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <Monitor className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun équipement trouvé</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                ? 'Aucun équipement ne correspond à vos critères de recherche.'
                : 'Commencez par ajouter votre premier équipement.'}
            </p>
            <Link to="/equipment/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un équipement
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Modal d'import Excel */}
      {showImport && (
        <ImportExcel 
          onClose={() => setShowImport(false)}
          onImportSuccess={() => {
            setShowImport(false)
            fetchEquipment()
          }}
        />
      )}
    </div>
  )
}

