import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Shield, Server, Database, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export function AdminSettingsPage() {
  const [autoValidate, setAutoValidate] = useState(false);
  const [confidenceThreshold, setConfidenceThreshold] = useState(75);
  const [modelVersion, setModelVersion] = useState('v2.1.0');
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const handleSave = () => {
    toast.success('Paramètres enregistrés.');
  };

  const toggleMaintenance = () => {
    setMaintenanceMode((v) => !v);
    toast.success(maintenanceMode ? 'Mode maintenance désactivé.' : 'Mode maintenance activé — la plateforme est maintenant inaccessible aux utilisateurs non-admins.');
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Paramètres système</h1>
          <p className="text-sm text-gray-500 mt-1">Configuration globale de la plateforme AgriRisk AI</p>
        </div>
        <Button leftIcon={<Save className="w-4 h-4" />} onClick={handleSave}>Enregistrer</Button>
      </div>

      <div className="space-y-6">
        <Card padding="lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Shield className="w-5 h-5" /></div>
            <h2 className="text-lg font-bold text-gray-900">Sécurité & Accès</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Validation automatique des fournisseurs</p>
                <p className="text-sm text-gray-500">Accepter automatiquement les nouvelles inscriptions fournisseurs</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={autoValidate}
                  onChange={(e) => setAutoValidate(e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#22c55e]"></div>
              </label>
            </div>
          </div>
        </Card>

        <Card padding="lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Server className="w-5 h-5" /></div>
            <h2 className="text-lg font-bold text-gray-900">Modèle IA</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Seuil de confiance minimum (%)</label>
              <input
                type="number"
                value={confidenceThreshold}
                onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#1a5c2a] focus:ring-2 focus:ring-[#1a5c2a]/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Version du modèle</label>
              <select
                value={modelVersion}
                onChange={(e) => setModelVersion(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#1a5c2a] focus:ring-2 focus:ring-[#1a5c2a]/20"
              >
                <option value="v2.1.0">v2.1.0 (Production)</option>
                <option value="v2.2.0-beta">v2.2.0-beta</option>
              </select>
            </div>
          </div>
        </Card>

        <Card padding="lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Database className="w-5 h-5" /></div>
            <h2 className="text-lg font-bold text-gray-900">Maintenance</h2>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-amber-100 bg-amber-50/50 rounded-xl">
            <div>
              <p className="font-bold text-gray-900">Mode maintenance {maintenanceMode && <span className="text-amber-700">(actif)</span>}</p>
              <p className="text-sm text-gray-600">Rend la plateforme inaccessible aux utilisateurs non-admins.</p>
            </div>
            <Button
              variant="outline"
              onClick={toggleMaintenance}
              className={maintenanceMode ? 'text-gray-700 border-gray-300 hover:bg-gray-100' : 'text-amber-700 border-amber-200 hover:bg-amber-100'}
            >
              {maintenanceMode ? 'Désactiver le mode' : 'Activer le mode'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
