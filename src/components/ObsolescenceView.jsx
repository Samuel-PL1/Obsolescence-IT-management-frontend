import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  AlertTriangle, 
  RefreshCw, 
  Search, 
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  Download
} from 'lucide-react'
import { normalizeText } from '@/lib/utils'

export function ObsolescenceView() {
  const [obsolescenceData, setObsolescenceData] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchObsolescenceData()
  }, [])

  const fetchObsolescenceData = async () => {
    setLoading(true)
    try {
      // Simulation de données pour la démonstration
      // En production, cet appel serait fait vers l'API Flask
      const mockData = [
        {
          id: 1,
          product_name: 'Windows',
          product_type: 'os',
          version: '7',
          eol_date: '2020-01-14',
          support_end_date: '2020-01-14',
          is_obsolete: true,
          last_updated: '2024-09-04T10:30:00Z',
          affected_equipment: ['PC-002', 'PC-015', 'PC-032'],
          severity: 'critical'
        },
        {
          id: 2,
          product_name: 'Ubuntu',
          product_type: 'os',
          version: '18.04 LTS',
          eol_date: '2023-05-31',
          support_end_date: '2028-05-31',
          is_obsolete: true,
          last_updated: '2024-09-04T10:30:00Z',
          affected_equipment: ['SRV-003'],
          severity: 'high'
        },
        {
          id: 3,
          product_name: 'Java',
          product_type: 'application',
          version: '8',
          eol_date: '2030-12-31',
          support_end_date: '2025-12-31',
          is_obsolete: false,
          last_updated: '2024-09-04T10:30:00Z',
          affected_equipment: ['SRV-001', 'SRV-002', 'PC-001'],
          severity: 'medium'
        },
        {
          id: 4,
          product_name: 'Windows',
          product_type: 'os',
          version: '10',
          eol_date: '2025-10-14',
          support_end_date: '2025-10-14',
          is_obsolete: false,
          last_updated: '2024-09-04T10:30:00Z',
          affected_equipment: ['PC-001', 'PC-003', 'PC-004', 'PC-005'],
          severity: 'low'
        },
        {
          id: 5,
          product_name: 'Apache',
          product_type: 'application',
          version: '2.2',
          eol_date: '2017-07-11',
          support_end_date: '2017-07-11',
          is_obsolete: true,
          last_updated: '2024-09-04T10:30:00Z',
          affected_equipment: ['SRV-004'],
          severity: 'critical'
        }
      ]
      
      const sortedData = [...mockData].sort((a, b) =>
        a.product_name.localeCompare(b.product_name, 'fr', { sensitivity: 'base' })
      )

      setObsolescenceData(sortedData)
    } catch (error) {
      console.error('Erreur lors du chargement des données d\'obsolescence:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredData = useMemo(() => {
    const normalizedSearch = normalizeText(searchTerm)

    return obsolescenceData.filter(item => {
      const affectedEquipment = Array.isArray(item.affected_equipment)
        ? item.affected_equipment
        : []

      const matchesSearch = !normalizedSearch || [
        item.product_name,
        item.version,
        ...affectedEquipment
      ].some(field => normalizeText(field).includes(normalizedSearch))

      if (!matchesSearch) {
        return false
      }

      if (filterStatus === 'obsolete') {
        return item.is_obsolete
      }

      if (filterStatus === 'active') {
        return !item.is_obsolete
      }

      if (filterStatus === 'critical') {
        return item.severity === 'critical'
      }

      return true
    })
  }, [obsolescenceData, searchTerm, filterStatus])

  const updateAllObsolescence = async () => {
    setUpdating(true)
    try {
      // En production, cet appel serait fait vers l'API Flask
      await new Promise(resolve => setTimeout(resolve, 3000))
      await fetchObsolescenceData()
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
    } finally {
      setUpdating(false)
    }
  }

  const getSeverityBadge = (severity, isObsolete) => {
    if (isObsolete) {
      return severity === 'critical' ? (
        <Badge className="bg-red-100 text-red-800">
          <XCircle className="w-3 h-3 mr-1" />
          Critique
        </Badge>
      ) : (
        <Badge className="bg-orange-100 text-orange-800">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Obsolète
        </Badge>
      )
    }

    switch (severity) {
      case 'high':
        return <Badge className="bg-orange-100 text-orange-800"><AlertTriangle className="w-3 h-3 mr-1" />Élevé</Badge>
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Moyen</Badge>
      case 'low':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Faible</Badge>
      default:
        return <Badge variant="secondary">{severity}</Badge>
    }
  }

  const getTimeUntilEOL = (eolDate) => {
    const now = new Date()
    const eol = new Date(eolDate)
    const diffTime = eol - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      return `Expiré depuis ${Math.abs(diffDays)} jours`
    } else if (diffDays < 30) {
      return `${diffDays} jours restants`
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30)
      return `${months} mois restants`
    } else {
      const years = Math.floor(diffDays / 365)
      return `${years} an${years > 1 ? 's' : ''} restant${years > 1 ? 's' : ''}`
    }
  }

  const exportReport = () => {
    // Simulation d'export de rapport
    const csvContent = [
      ['Produit', 'Type', 'Version', 'Date EOL', 'Statut', 'Équipements affectés'],
      ...filteredData.map(item => {
        const affectedEquipment = Array.isArray(item.affected_equipment)
          ? item.affected_equipment.join(', ')
          : ''

        return [
          item.product_name,
          item.product_type === 'os' ? 'Système' : 'Application',
          item.version,
          item.eol_date,
          item.is_obsolete ? 'Obsolète' : 'Actif',
          affectedEquipment
        ]
      })
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'rapport_obsolescence.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Obsolescence</h1>
          <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
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
          <h1 className="text-3xl font-bold text-gray-900">Gestion de l'Obsolescence</h1>
          <p className="text-gray-600">Suivi des dates de fin de vie des systèmes et applications</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={exportReport} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
          <Button onClick={updateAllObsolescence} disabled={updating}>
            {updating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Mise à jour...
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

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Produits</p>
                <p className="text-2xl font-bold">{obsolescenceData.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Obsolètes</p>
                <p className="text-2xl font-bold text-red-600">
                  {obsolescenceData.filter(item => item.is_obsolete).length}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critiques</p>
                <p className="text-2xl font-bold text-orange-600">
                  {obsolescenceData.filter(item => item.severity === 'critical').length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">À jour</p>
                <p className="text-2xl font-bold text-green-600">
                  {obsolescenceData.filter(item => !item.is_obsolete && item.severity === 'low').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Rechercher par produit, version ou équipement..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="obsolete">Obsolètes</option>
              <option value="critical">Critiques</option>
              <option value="active">Actifs</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Obsolescence List */}
      <div className="space-y-4">
        {filteredData.map((item) => {
          const affectedEquipment = Array.isArray(item.affected_equipment)
            ? item.affected_equipment
            : []

          return (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex flex-col">
                      <CardTitle className="text-lg">
                        {item.product_name} {item.version}
                      </CardTitle>
                      <CardDescription>
                        {item.product_type === 'os' ? 'Système d\'exploitation' : 'Application'}
                      </CardDescription>
                    </div>
                  </div>
                  {getSeverityBadge(item.severity, item.is_obsolete)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Date de fin de vie</p>
                    <p className="text-sm">
                      {new Date(item.eol_date).toLocaleDateString('fr-FR')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {getTimeUntilEOL(item.eol_date)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Fin de support</p>
                    <p className="text-sm">
                      {item.support_end_date ?
                        new Date(item.support_end_date).toLocaleDateString('fr-FR') :
                        'Non spécifié'
                      }
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Équipements affectés ({affectedEquipment.length})
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {affectedEquipment.slice(0, 3).map((eq, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {eq}
                        </Badge>
                      ))}
                      {affectedEquipment.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{affectedEquipment.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    Dernière mise à jour: {new Date(item.last_updated).toLocaleDateString('fr-FR')}
                  </p>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Voir détails
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredData.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune donnée d'obsolescence</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterStatus !== 'all'
                ? 'Aucun élément ne correspond à vos critères de recherche.'
                : 'Aucune information d\'obsolescence disponible.'}
            </p>
            <Button onClick={updateAllObsolescence}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser les données
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

