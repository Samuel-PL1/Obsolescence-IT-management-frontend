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
  Download,
  HardDrive,
  AppWindow
} from 'lucide-react'
import { normalizeText } from '@/lib/utils'

export function ObsolescenceView() {
  const [obsolescenceData, setObsolescenceData] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchObsolescenceData()
  }, [])

  const fetchObsolescenceData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/obsolescence/info')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setObsolescenceData(data)
    } catch (error) {
      console.error('Erreur lors du chargement des données d\'obsolescence:', error)
    } finally {
      setLoading(false)
    }
  }

  const osData = useMemo(() => 
    obsolescenceData.filter(item => item.product_type === 'os' && (!searchTerm || normalizeText(item.product_name).includes(normalizeText(searchTerm))))
  , [obsolescenceData, searchTerm])

  const appData = useMemo(() => 
    obsolescenceData.filter(item => item.product_type === 'application' && (!searchTerm || normalizeText(item.product_name).includes(normalizeText(searchTerm))))
  , [obsolescenceData, searchTerm])

  const updateAllObsolescence = async () => {
    setUpdating(true)
    try {
      const response = await fetch('/api/obsolescence/update-all', { method: 'POST' })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      await fetchObsolescenceData()
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
    } finally {
      setUpdating(false)
    }
  }

  const kpiData = useMemo(() => {
    const total = obsolescenceData.length
    const obsolete = obsolescenceData.filter(item => item.is_obsolete).length
    const critical = obsolescenceData.filter(item => item.is_obsolete && new Date(item.eol_date) < new Date()).length
    return { total, obsolete, critical, active: total - obsolete }
  }, [obsolescenceData])

  const ObsolescenceList = ({ title, data, icon: Icon }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Icon className="w-6 h-6 mr-3 text-blue-600" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Aucune donnée</p>
        ) : (
          data.map(item => <ObsolescenceItem key={item.id} item={item} />)
        )}
      </CardContent>
    </Card>
  )

  const ObsolescenceItem = ({ item }) => (
    <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-bold text-lg">{item.product_name} {item.version}</h4>
          <p className="text-sm text-gray-500">Dernière mise à jour: {new Date(item.last_updated).toLocaleDateString('fr-FR')}</p>
        </div>
        <Badge variant={item.is_obsolete ? 'destructive' : 'default'}>
          {item.is_obsolete ? 'Obsolète' : 'Actif'}
        </Badge>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="font-semibold">Date de fin de vie (EOL)</p>
          <p>{item.eol_date ? new Date(item.eol_date).toLocaleDateString('fr-FR') : 'N/A'}</p>
        </div>
        <div>
          <p className="font-semibold">Fin de support</p>
          <p>{item.support_end_date ? new Date(item.support_end_date).toLocaleDateString('fr-FR') : 'N/A'}</p>
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <a href={`https://endoflife.date/${item.product_name}`} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm">
            <ExternalLink className="w-4 h-4 mr-2" />
            Source
          </Button>
        </a>
      </div>
    </div>
  )

  if (loading) {
    return <div>Chargement...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion de l'Obsolescence</h1>
          <p className="text-gray-600">Suivi des dates de fin de vie des systèmes et applications</p>
        </div>
        <Button onClick={updateAllObsolescence} disabled={updating}>
          {updating ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Mise à jour...</> : <><RefreshCw className="w-4 h-4 mr-2" />Actualiser</>}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard title="Produits Suivis" value={kpiData.total} icon={Calendar} />
        <KpiCard title="Produits Obsolètes" value={kpiData.obsolete} icon={XCircle} color="text-red-600" />
        <KpiCard title="Alertes Critiques" value={kpiData.critical} icon={AlertTriangle} color="text-orange-600" />
        <KpiCard title="Produits Actifs" value={kpiData.active} icon={CheckCircle} color="text-green-600" />
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Rechercher par produit..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ObsolescenceList title="Systèmes d'exploitation (OS)" data={osData} icon={HardDrive} />
        <ObsolescenceList title="Applications" data={appData} icon={AppWindow} />
      </div>
    </div>
  )
}

const KpiCard = ({ title, value, icon: Icon, color = 'text-blue-600' }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className={`h-4 w-4 ${color}`} />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
)

