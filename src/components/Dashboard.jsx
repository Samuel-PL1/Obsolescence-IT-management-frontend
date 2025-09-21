import { useState, useEffect, useCallback } from 'react'
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

const toFiniteNumber = (value) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

const clamp = (value, min, max = Number.POSITIVE_INFINITY) => {
  return Math.min(Math.max(value, min), max)
}

const buildObsolescenceSegments = ({ total, obsolete, upToDate, soonObsolete }) => {
  const safeTotal = clamp(toFiniteNumber(total) ?? 0, 0)

  if (safeTotal === 0) {
    return []
  }

  const safeObsolete = clamp(toFiniteNumber(obsolete) ?? 0, 0, safeTotal)

  let computedSoon = toFiniteNumber(soonObsolete)
  if (computedSoon != null) {
    computedSoon = clamp(computedSoon, 0, safeTotal - safeObsolete)
  }

  let computedUpToDate = toFiniteNumber(upToDate)
  if (computedUpToDate != null) {
    computedUpToDate = clamp(computedUpToDate, 0, safeTotal - safeObsolete)
  }

  if (computedSoon == null && computedUpToDate == null) {
    computedUpToDate = clamp(Math.round(safeTotal * 0.6), 0, safeTotal - safeObsolete)
  }

  if (computedSoon == null) {
    computedSoon = Math.max(safeTotal - safeObsolete - (computedUpToDate ?? 0), 0)
  }

  if (computedUpToDate == null) {
    computedUpToDate = Math.max(safeTotal - safeObsolete - computedSoon, 0)
  }

  const accounted = safeObsolete + computedSoon + computedUpToDate
  if (accounted !== safeTotal) {
    const difference = safeTotal - accounted
    computedUpToDate = clamp(computedUpToDate + difference, 0, safeTotal - safeObsolete)
  }

  return [
    { name: 'À jour', value: Math.round(computedUpToDate), color: '#10b981' },
    { name: 'Bientôt obsolète', value: Math.round(computedSoon), color: '#f59e0b' },
    { name: 'Obsolète', value: Math.round(safeObsolete), color: '#ef4444' }
  ].filter(item => item.value > 0)
}

const FALLBACK_LOCATIONS = ['Siège Paris', 'Agence Lyon', 'Bureau Marseille', 'Site Lille']

const FALLBACK_DASHBOARD = {
  stats: {
    totalEquipment: 156,
    obsoleteEquipment: 23,
    activeEquipment: 133,
    criticalAlerts: 8
  },
  byType: [
    { type: 'PC', count: 89 },
    { type: 'Serveur', count: 34 },
    { type: 'Imprimante', count: 23 },
    { type: 'Switch', count: 10 }
  ],
  byLocation: [
    { location: 'Siège Paris', count: 67 },
    { location: 'Agence Lyon', count: 45 },
    { location: 'Bureau Marseille', count: 32 },
    { location: 'Site Lille', count: 12 }
  ],
  obsolescence: buildObsolescenceSegments({
    total: 156,
    obsolete: 23,
    upToDate: 85,
    soonObsolete: 48
  })
}

const sanitizeLabel = (value) => {
  if (value == null) {
    return undefined
  }

  const label = value.toString().trim()
  return label.length ? label : undefined
}

const sanitizeTypeDistribution = (distribution) => {
  if (!Array.isArray(distribution)) {
    return []
  }

  return distribution.reduce((acc, item) => {
    const label = sanitizeLabel(item?.type)
    if (!label) {
      return acc
    }

    const count = Math.max(toFiniteNumber(item.count) ?? 0, 0)
    acc.push({ type: label, count })
    return acc
  }, [])
}

const sanitizeLocationDistribution = (distribution) => {
  if (!Array.isArray(distribution)) {
    return []
  }

  return distribution.reduce((acc, item) => {
    const label = sanitizeLabel(item?.location)
    if (!label) {
      return acc
    }

    const count = Math.max(toFiniteNumber(item.count) ?? 0, 0)
    acc.push({ location: label, count })
    return acc
  }, [])
}

const sanitizeLocations = (locations) => {
  if (!Array.isArray(locations)) {
    return [...FALLBACK_LOCATIONS]
  }

  const cleaned = locations
    .map((location) => sanitizeLabel(location))
    .filter(Boolean)

  if (cleaned.length === 0) {
    return [...FALLBACK_LOCATIONS]
  }

  return [...new Set(cleaned)]
}

const cloneDistribution = (distribution) => distribution.map(item => ({ ...item }))

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

  const applyFallbackDashboard = useCallback(() => {
    setStats({ ...FALLBACK_DASHBOARD.stats })
    setEquipmentByType(cloneDistribution(FALLBACK_DASHBOARD.byType))
    setEquipmentByLocation(cloneDistribution(FALLBACK_DASHBOARD.byLocation))
    setObsolescenceData(cloneDistribution(FALLBACK_DASHBOARD.obsolescence))
  }, [])

  const applyDashboardFromApi = useCallback((data) => {
    const totalEquipment = clamp(
      toFiniteNumber(data.total_equipment) ?? FALLBACK_DASHBOARD.stats.totalEquipment,
      0
    )
    const obsoleteEquipment = clamp(
      toFiniteNumber(data.obsolete_equipment) ?? FALLBACK_DASHBOARD.stats.obsoleteEquipment,
      0,
      totalEquipment
    )
    const activeFromApi = toFiniteNumber(data.active_equipment)
    const activeEquipment = activeFromApi != null
      ? clamp(activeFromApi, 0, totalEquipment)
      : Math.max(totalEquipment - obsoleteEquipment, 0)
    const criticalFromApi = toFiniteNumber(data.critical_alerts)
    const criticalAlerts = criticalFromApi != null
      ? Math.max(Math.round(criticalFromApi), 0)
      : Math.max(Math.round(obsoleteEquipment * 0.35), 0)

    setStats({
      totalEquipment,
      obsoleteEquipment,
      activeEquipment,
      criticalAlerts
    })

    const sanitizedTypes = sanitizeTypeDistribution(data.by_type)
    setEquipmentByType(
      sanitizedTypes.length ? sanitizedTypes : cloneDistribution(FALLBACK_DASHBOARD.byType)
    )

    const sanitizedLocations = sanitizeLocationDistribution(data.by_location)
    setEquipmentByLocation(
      sanitizedLocations.length ? sanitizedLocations : cloneDistribution(FALLBACK_DASHBOARD.byLocation)
    )

    const obsolescenceSegments = buildObsolescenceSegments({
      total: totalEquipment,
      obsolete: obsoleteEquipment,
      upToDate: toFiniteNumber(data.up_to_date),
      soonObsolete: toFiniteNumber(data.soon_obsolete)
    })

    setObsolescenceData(
      obsolescenceSegments.length
        ? obsolescenceSegments
        : cloneDistribution(FALLBACK_DASHBOARD.obsolescence)
    )
  }, [])

  const fetchLocations = useCallback(async () => {
    try {
      const response = await fetch('/api/equipment/locations')
      if (!response.ok) {
        setLocations([...FALLBACK_LOCATIONS])
        return
      }

      const data = await response.json()
      setLocations(sanitizeLocations(data.locations))
    } catch (error) {
      console.error('Erreur lors du chargement des localisations:', error)
      setLocations([...FALLBACK_LOCATIONS])
    }
  }, [])

  const fetchDashboardData = useCallback(async () => {
    setLoading(true)
    try {
      const url = selectedLocation === 'all'
        ? '/api/equipment/stats'
        : `/api/equipment/stats?location=${encodeURIComponent(selectedLocation)}`

      const response = await fetch(url)
      if (!response.ok) {
        applyFallbackDashboard()
        return
      }

      const data = await response.json()
      if (!data || typeof data !== 'object') {
        applyFallbackDashboard()
        return
      }

      applyDashboardFromApi(data)
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
      applyFallbackDashboard()
    } finally {
      setLoading(false)
    }
  }, [selectedLocation, applyFallbackDashboard, applyDashboardFromApi])

  useEffect(() => {
    fetchLocations()
    fetchDashboardData()
  }, [fetchLocations, fetchDashboardData])

  const refreshData = useCallback(async () => {
    setRefreshing(true)
    try {
      await fetchDashboardData()
    } finally {
      setRefreshing(false)
    }
  }, [fetchDashboardData])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const StatCard = ({ title, value, icon, color, description }) => {
    const Icon = icon

    return (
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
  }

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

