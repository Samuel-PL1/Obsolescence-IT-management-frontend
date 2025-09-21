import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Save, 
  ArrowLeft, 
  Plus, 
  X,
  Monitor,
  AlertCircle
} from 'lucide-react'

export function EquipmentForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const [formData, setFormData] = useState({
    name: '',
    equipment_type: 'PC',
    location: '',
    ip_address: '',
    os_name: '',
    os_version: '',
    acquisition_date: '',
    warranty_end_date: '',
    status: 'Active',
    applications: []
  })

  const [newApplication, setNewApplication] = useState({ name: '', version: '' })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isEdit) {
      fetchEquipment()
    }
  }, [id, isEdit])

  const fetchEquipment = async () => {
    try {
      // Simulation de données pour la démonstration
      // En production, cet appel serait fait vers l'API Flask
      const mockData = {
        id: 1,
        name: 'PC-001',
        equipment_type: 'PC',
        location: 'Siège Paris - Bureau 101',
        ip_address: '192.168.1.10',
        os_name: 'Windows',
        os_version: '10 Pro',
        acquisition_date: '2021-03-15',
        warranty_end_date: '2024-03-15',
        status: 'Active',
        applications: [
          { name: 'Microsoft Office', version: '2019' },
          { name: 'Chrome', version: '118.0' }
        ]
      }
      
      setFormData(mockData)
    } catch (error) {
      console.error('Erreur lors du chargement de l\'équipement:', error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const addApplication = () => {
    if (newApplication.name && newApplication.version) {
      setFormData(prev => ({
        ...prev,
        applications: [...prev.applications, { ...newApplication }]
      }))
      setNewApplication({ name: '', version: '' })
    }
  }

  const removeApplication = (index) => {
    setFormData(prev => ({
      ...prev,
      applications: prev.applications.filter((_, i) => i !== index)
    }))
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis'
    }

    if (!formData.equipment_type) {
      newErrors.equipment_type = 'Le type d\'équipement est requis'
    }

    if (!formData.location.trim()) {
      newErrors.location = 'La localisation est requise'
    }

    if (formData.ip_address && !/^(\d{1,3}\.){3}\d{1,3}$/.test(formData.ip_address)) {
      newErrors.ip_address = 'Format d\'adresse IP invalide'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      // En production, cet appel serait fait vers l'API Flask
      console.log('Données à sauvegarder:', formData)
      
      // Simulation d'un délai d'API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      navigate('/equipment')
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={() => navigate('/equipment')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? 'Modifier l\'équipement' : 'Nouvel équipement'}
          </h1>
          <p className="text-gray-600">
            {isEdit ? 'Modifiez les informations de l\'équipement' : 'Ajoutez un nouvel équipement au parc informatique'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Monitor className="w-5 h-5 mr-2" />
              Informations générales
            </CardTitle>
            <CardDescription>
              Informations de base sur l'équipement
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nom de l'équipement *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="PC-001, SRV-001..."
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-red-600 mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="equipment_type">Type d'équipement *</Label>
                <select
                  id="equipment_type"
                  name="equipment_type"
                  value={formData.equipment_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="PC">PC</option>
                  <option value="Serveur">Serveur</option>
                  <option value="Imprimante">Imprimante</option>
                  <option value="Switch">Switch</option>
                  <option value="Routeur">Routeur</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>

              <div>
                <Label htmlFor="location">Localisation *</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Siège Paris - Bureau 101"
                  className={errors.location ? 'border-red-500' : ''}
                />
                {errors.location && (
                  <p className="text-sm text-red-600 mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.location}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="ip_address">Adresse IP</Label>
                <Input
                  id="ip_address"
                  name="ip_address"
                  value={formData.ip_address}
                  onChange={handleInputChange}
                  placeholder="192.168.1.10"
                  className={errors.ip_address ? 'border-red-500' : ''}
                />
                {errors.ip_address && (
                  <p className="text-sm text-red-600 mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.ip_address}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="status">Statut</Label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Active">Actif</option>
                  <option value="Obsolete">Obsolète</option>
                  <option value="In Stock">En stock</option>
                  <option value="Maintenance">En maintenance</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Information */}
        <Card>
          <CardHeader>
            <CardTitle>Système d'exploitation</CardTitle>
            <CardDescription>
              Informations sur le système d'exploitation installé
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="os_name">Nom du système</Label>
                <Input
                  id="os_name"
                  name="os_name"
                  value={formData.os_name}
                  onChange={handleInputChange}
                  placeholder="Windows, Ubuntu, macOS..."
                />
              </div>

              <div>
                <Label htmlFor="os_version">Version</Label>
                <Input
                  id="os_version"
                  name="os_version"
                  value={formData.os_version}
                  onChange={handleInputChange}
                  placeholder="10 Pro, 20.04 LTS, 13.0..."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dates */}
        <Card>
          <CardHeader>
            <CardTitle>Dates importantes</CardTitle>
            <CardDescription>
              Dates d'acquisition et de fin de garantie
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="acquisition_date">Date d'acquisition</Label>
                <Input
                  id="acquisition_date"
                  name="acquisition_date"
                  type="date"
                  value={formData.acquisition_date}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Label htmlFor="warranty_end_date">Fin de garantie</Label>
                <Input
                  id="warranty_end_date"
                  name="warranty_end_date"
                  type="date"
                  value={formData.warranty_end_date}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Applications */}
        <Card>
          <CardHeader>
            <CardTitle>Applications installées</CardTitle>
            <CardDescription>
              Liste des applications et logiciels installés sur cet équipement
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add new application */}
            <div className="flex gap-2">
              <Input
                placeholder="Nom de l'application"
                value={newApplication.name}
                onChange={(e) => setNewApplication(prev => ({ ...prev, name: e.target.value }))}
              />
              <Input
                placeholder="Version"
                value={newApplication.version}
                onChange={(e) => setNewApplication(prev => ({ ...prev, version: e.target.value }))}
                className="w-32"
              />
              <Button type="button" onClick={addApplication} variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Applications list */}
            {formData.applications.length > 0 && (
              <div className="space-y-2">
                <Label>Applications ajoutées:</Label>
                <div className="flex flex-wrap gap-2">
                  {formData.applications.map((app, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {app.name} {app.version}
                      <button
                        type="button"
                        onClick={() => removeApplication(index)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit buttons */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => navigate('/equipment')}>
            Annuler
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Sauvegarde...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isEdit ? 'Mettre à jour' : 'Créer'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

