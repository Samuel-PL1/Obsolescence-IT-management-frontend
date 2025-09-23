import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Key, Save } from 'lucide-react';

export function Settings() {
  const [apiSettings, setApiSettings] = useState({ endoflife_api_key: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApiSettings();
  }, []);

  const fetchApiSettings = async () => {
    setLoading(true);
    try {
      // En production, cet appel serait fait vers l'API Flask
      // Pour la démo, on utilise des valeurs par défaut
      setApiSettings({ endoflife_api_key: 'test_api_key' });
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres API:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      // En production, cet appel serait fait vers l'API Flask
      alert('Paramètres API sauvegardés avec succès !');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des paramètres API:', error);
      alert('Erreur lors de la sauvegarde des paramètres.');
    }
  };

  if (loading) {
    return <div>Chargement des paramètres...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Key className="w-5 h-5 mr-2" />
            Clés d'API
          </CardTitle>
          <CardDescription>
            Gérez les clés d'API pour les services externes comme endoflife.date.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <Label htmlFor="endoflife-api-key">Clé d'API End of Life</Label>
              <Input
                id="endoflife-api-key"
                type="password"
                value={apiSettings.endoflife_api_key}
                onChange={(e) => setApiSettings({ ...apiSettings, endoflife_api_key: e.target.value })}
                placeholder="Votre clé d'API"
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit">
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
