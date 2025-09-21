import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Info,
  X
} from 'lucide-react'

export function ImportExcel({ onClose, onImportSuccess }) {
  const [file, setFile] = useState(null)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState(null)
  const [dragOver, setDragOver] = useState(false)

  const handleFileSelect = (selectedFile) => {
    if (selectedFile && (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls'))) {
      setFile(selectedFile)
      setImportResult(null)
    } else {
      alert('Veuillez sélectionner un fichier Excel (.xlsx ou .xls)')
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const droppedFile = e.dataTransfer.files[0]
    handleFileSelect(droppedFile)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setDragOver(false)
  }

  const downloadTemplate = async () => {
    try {
      const response = await fetch('/api/equipment/export-template')
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'modele_import_equipements.xlsx'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        alert('Erreur lors du téléchargement du modèle')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors du téléchargement du modèle')
    }
  }

  const importFile = async () => {
    if (!file) return

    setImporting(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/equipment/import', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()
      setImportResult(result)

      if (response.ok && result.imported_count > 0) {
        onImportSuccess && onImportSuccess()
      }
    } catch (error) {
      console.error('Erreur lors de l\'import:', error)
      setImportResult({
        error: 'Erreur de connexion lors de l\'import',
        imported_count: 0,
        errors: []
      })
    } finally {
      setImporting(false)
    }
  }

  const resetImport = () => {
    setFile(null)
    setImportResult(null)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold">Import Excel</h2>
            <p className="text-gray-600">Importer des équipements depuis un fichier Excel</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Info className="w-5 h-5 mr-2 text-blue-600" />
                Instructions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p>• <strong>Colonnes obligatoires :</strong> Salle, Nom PC</p>
                <p>• <strong>Colonnes optionnelles :</strong> Description, Système d'exploitation, Application, Version, Fournisseur</p>
                <p>• <strong>Formats supportés :</strong> .xlsx, .xls</p>
                <p>• <strong>Type d'équipement :</strong> Déterminé automatiquement selon le nom</p>
                <p>• <strong>Noms uniques :</strong> Chaque équipement doit avoir un nom unique</p>
              </div>
            </CardContent>
          </Card>

          {/* Télécharger le modèle */}
          <div className="flex justify-center">
            <Button onClick={downloadTemplate} variant="outline" className="flex items-center">
              <Download className="w-4 h-4 mr-2" />
              Télécharger le modèle Excel
            </Button>
          </div>

          {/* Zone de drop */}
          <Card>
            <CardContent className="pt-6">
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragOver 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                {file ? (
                  <div className="space-y-4">
                    <FileSpreadsheet className="w-12 h-12 text-green-600 mx-auto" />
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <div className="flex justify-center space-x-2">
                      <Button onClick={importFile} disabled={importing}>
                        {importing ? (
                          <>
                            <Upload className="w-4 h-4 mr-2 animate-pulse" />
                            Import en cours...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Importer
                          </>
                        )}
                      </Button>
                      <Button variant="outline" onClick={resetImport}>
                        Changer de fichier
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                    <div>
                      <p className="text-lg font-medium">
                        Glissez votre fichier Excel ici
                      </p>
                      <p className="text-gray-500">ou</p>
                    </div>
                    <div>
                      <Input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={(e) => handleFileSelect(e.target.files[0])}
                        className="hidden"
                        id="file-input"
                      />
                      <Button asChild variant="outline">
                        <label htmlFor="file-input" className="cursor-pointer">
                          Sélectionner un fichier
                        </label>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Résultats de l'import */}
          {importResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  {importResult.error ? (
                    <XCircle className="w-5 h-5 mr-2 text-red-600" />
                  ) : (
                    <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                  )}
                  Résultat de l'import
                </CardTitle>
              </CardHeader>
              <CardContent>
                {importResult.error ? (
                  <div className="space-y-2">
                    <div className="flex items-center text-red-600">
                      <XCircle className="w-4 h-4 mr-2" />
                      <span className="font-medium">Erreur d'import</span>
                    </div>
                    <p className="text-red-700 bg-red-50 p-3 rounded">
                      {importResult.error}
                    </p>
                    {importResult.available_columns && (
                      <div className="mt-4">
                        <p className="font-medium">Colonnes disponibles dans le fichier :</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {importResult.available_columns.map((col, index) => (
                            <Badge key={index} variant="outline">{col}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Statistiques */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-green-50 rounded">
                        <div className="text-2xl font-bold text-green-600">
                          {importResult.imported_count}
                        </div>
                        <div className="text-sm text-green-700">Importés</div>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded">
                        <div className="text-2xl font-bold text-blue-600">
                          {importResult.total_rows}
                        </div>
                        <div className="text-sm text-blue-700">Total lignes</div>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded">
                        <div className="text-2xl font-bold text-orange-600">
                          {importResult.error_count || 0}
                        </div>
                        <div className="text-sm text-orange-700">Erreurs</div>
                      </div>
                    </div>

                    {/* Message de succès */}
                    <div className="flex items-center text-green-600 bg-green-50 p-3 rounded">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      <span>{importResult.message}</span>
                    </div>

                    {/* Erreurs détaillées */}
                    {importResult.errors && importResult.errors.length > 0 && (
                      <div>
                        <div className="flex items-center text-orange-600 mb-2">
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          <span className="font-medium">
                            Erreurs rencontrées ({importResult.error_count})
                          </span>
                        </div>
                        <div className="bg-orange-50 p-3 rounded max-h-32 overflow-y-auto">
                          {importResult.errors.map((error, index) => (
                            <p key={index} className="text-sm text-orange-700">
                              • {error}
                            </p>
                          ))}
                          {importResult.error_count > 10 && (
                            <p className="text-sm text-orange-600 font-medium mt-2">
                              ... et {importResult.error_count - 10} autres erreurs
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-2 p-6 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
          {importResult && importResult.imported_count > 0 && (
            <Button onClick={() => { onClose(); window.location.reload(); }}>
              Actualiser la page
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

