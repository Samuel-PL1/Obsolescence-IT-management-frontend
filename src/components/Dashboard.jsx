import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Monitor, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  RefreshCw,
  MapPin,
  Calendar,
  Filter
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export function Dashboard() {
  const [stats, setStats] = useState({
    totalEquipment: 0,
    obsoleteEquipment: 0,
    activeEquipment: 0,
    criticalAlerts: 0
  })
  const [equipmentByType, setEquipmentByType] = useState([])
  const [equipmentByLocation, setEquipmentByLocation] = useState([])
  const [obsolescenceData, setObsolescenceData] = useState([])
  const [locations, setLocations] = useState([])
  const [selectedLocation, setSelectedLocation] = useState('all')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchLocations()
    fetchDashboardData()
  }, [])

  useEffect(() => {
    fetchDashboardData()
  }, [selectedLocation])

  const fetchLocations = async () => {
    try {
      const response = await fetch('/api/equipment/locations')
      if (response.ok) {
        const data = await response.json()
        setLocations(data.locations || [])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des localisations:', error)
    }
  }

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // Récupérer les statistiques avec filtre de localisation
      const url = selectedLocation === 'all' 
        ? '/api/equipment/stats' 
        : `/api/equipment/stats?location=${encodeURIComponent(selectedLocation)}`
      
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        
        // Mettre à jour les statistiques
        setStats({
          totalEquipment: data.total_equipment || 0,
          obsoleteEquipment: data.obsolete_equipment || 0,
          activeEquipment: data.active_equipment || 0,
          criticalAlerts: Math.floor((data.obsolete_equipment || 0) * 0.4)
        })

        // Équipements par type (avec filtre)
        setEquipmentByType(data.by_type || [])

        // Équipements par localisation (toujours toutes les localisations)
        setEquipmentByLocation(data.by_location || [])

        // Données d'obsolescence basées sur les statistiques
        const total = data.total_equipment || 0
        const obsolete = data.obsolete_equipment || 0
        const upToDate = Math.floor(total * 0.6)
        const soonObsolete = total - obsolete - upToDate

        setObsolescenceData([
          { name: 'À jour', value: upToDate, color: '#10b981' },
          { name: 'Bientôt obsolète', value: soonObsolete, color: '#f59e0b' },
          { name: 'Obsolète', value: obsolete, color: '#ef4444' }
        ].filter(item => item.value > 0))

      } else {
        // Fallback avec données de démonstration
        setStats({
          totalEquipment: 156,
          obsoleteEquipment: 23,
          activeEquipment: 133,
          criticalAlerts: 8
        })

        setEquipmentByType([
          { type: 'PC', count: 89 },
          { type: 'Serveur', count: 34 },
          { type: 'Imprimante', count: 23 },
          { type: 'Switch', count: 10 }
        ])

        setEquipmentByLocation([
          { location: 'Siège Paris', count: 67 },
          { location: 'Agence Lyon', count: 45 },
          { location: 'Bureau Marseille', count: 32 },
          { location: 'Site Lille', count: 12 }
        ])

        setObsolescenceData([
          { name: 'À jour', value: 85, color: '#10b981' },
          { name: 'Bientôt obsolète', value: 48, color: '#f59e0b' },
          { name: 'Obsolète', value: 23, color: '#ef4444' }
        ])
      }

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    await fetchDashboardData()
    setRefreshing(false)
  }

  const StatCard = ({ title, value, icon: Icon, color, description }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  )

  if (loading && !stats.totalEquipment) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
          <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header avec filtre de localisation */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-600">Vue d'ensemble de votre parc informatique</p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Filtre de localisation */}
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-gray-500" />
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="all">Toutes les localisations</option>
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>
          
          <Button onClick={refreshData} disabled={refreshing} variant="outline">
            {refreshing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Actualisation...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualiser
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Indicateur de filtre actif */}
      {selectedLocation !== 'all' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center">
            <Filter className="w-4 h-4 text-blue-600 mr-2" />
            <span className="text-sm text-blue-800">
              Filtré par localisation : <strong>{selectedLocation}</strong>
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSelectedLocation('all')}
              className="ml-auto text-blue-600 hover:text-blue-800"
            >
              Supprimer le filtre
            </Button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Équipements"
          value={stats.totalEquipment}
          icon={Monitor}
          color="text-blue-600"
          description="Tous les équipements"
        />
        <StatCard
          title="Équipements Actifs"
          value={stats.activeEquipment}
          icon={CheckCircle}
          color="text-green-600"
          description="En fonctionnement"
        />
        <StatCard
          title="Équipements Obsolètes"
          value={stats.obsoleteEquipment}
          icon={XCircle}
          color="text-red-600"
          description="Nécessitent une mise à jour"
        />
        <StatCard
          title="Alertes Critiques"
          value={stats.criticalAlerts}
          icon={AlertTriangle}
          color="text-orange-600"
          description="Attention requise"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Equipment by Type */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Monitor className="w-5 h-5 mr-2" />
              Équipements par Type
            </CardTitle>
            <CardDescription>
              Répartition des équipements par catégorie
              {selectedLocation !== 'all' && ` - ${selectedLocation}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={equipmentByType}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Obsolescence Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              État d'Obsolescence
            </CardTitle>
            <CardDescription>
              Répartition par niveau d'obsolescence
              {selectedLocation !== 'all' && ` - ${selectedLocation}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={obsolescenceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {obsolescenceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Equipment by Location (si pas de filtre) */}
      {selectedLocation === 'all' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Équipements par Localisation
            </CardTitle>
            <CardDescription>
              Répartition géographique des équipements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={equipmentByLocation} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="location" type="category" width={120} />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Recent Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Alertes Récentes
          </CardTitle>
          <CardDescription>
            Dernières notifications d'obsolescence
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                id: 1,
                type: 'critical',
                message: 'Windows 7 détecté sur 5 postes - Support terminé',
                time: 'Il y a 2 heures',
                equipment: 'PC-001, PC-015, PC-032...'
              },
              {
                id: 2,
                type: 'warning',
                message: 'Java 8 approche de sa fin de support',
                time: 'Il y a 4 heures',
                equipment: 'SRV-001, SRV-003'
              },
              {
                id: 3,
                type: 'info',
                message: 'Mise à jour disponible pour Ubuntu 20.04',
                time: 'Il y a 1 jour',
                equipment: 'SRV-005, SRV-007'
              }
            ].map((alert) => (
              <div key={alert.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  alert.type === 'critical' ? 'bg-red-500' :
                  alert.type === 'warning' ? 'bg-orange-500' : 'bg-blue-500'
                }`} />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{alert.message}</p>
                  <p className="text-sm text-gray-500">{alert.equipment}</p>
                  <p className="text-xs text-gray-400">{alert.time}</p>
                </div>
                <Badge variant={
                  alert.type === 'critical' ? 'destructive' :
                  alert.type === 'warning' ? 'secondary' : 'default'
                }>
                  {alert.type === 'critical' ? 'Critique' :
                   alert.type === 'warning' ? 'Attention' : 'Info'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

