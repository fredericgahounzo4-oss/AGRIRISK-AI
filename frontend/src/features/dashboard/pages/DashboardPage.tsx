import { Microscope, MessageCircle, MapPin, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loader } from '@/components/ui/Loader';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';
import { formatDate } from '@/utils/formatDate';
import { useDiagnosticHistory } from '@/features/diagnostic/hooks/useDiagnostic';
import { useConversations } from '@/features/assistant/hooks/useAssistant';
import { useSuppliers } from '@/features/suppliers/hooks/useSuppliers';

const riskColors: Record<string, string> = {
  'Élevé':   'text-[#e53935] bg-[#ffebee]',
  'Critique':'text-[#e53935] bg-[#ffebee]',
  'Moyen':   'text-[#f59e0b] bg-[#fff8e1]',
  'Faible':  'text-[#1a5c2a] bg-[#e8f5e9]',
};

export function DashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const now = new Date().toISOString();

  const { data: diagnostics = [], isLoading: diagLoading } = useDiagnosticHistory();
  const { data: conversations = [], isLoading: convLoading } = useConversations();
  const { data: suppliers = [], isLoading: suppliersLoading } = useSuppliers();

  const isLoading = diagLoading || convLoading || suppliersLoading;

  const diseasesDetected = new Set(diagnostics.map((d) => d.disease_name)).size;
  const highRiskCount = diagnostics.filter((d) => d.risk_level === 'Élevé' || d.risk_level === 'Critique').length;
  const recentDiagnostics = diagnostics.slice(0, 3);

  const stats = [
    { label: 'Diagnostics effectués', value: diagnostics.length, icon: Microscope, color: 'bg-[#e8f5e9] text-[#1a5c2a]', trend: `${diagnostics.length === 0 ? 'Aucun pour l\'instant' : 'Total'}` },
    { label: 'Maladies détectées', value: diseasesDetected, icon: AlertTriangle, color: 'bg-[#fff3e0] text-[#f59e0b]', trend: highRiskCount > 0 ? `${highRiskCount} à risque élevé` : 'Aucune alerte' },
    { label: 'Conversations IA', value: conversations.length, icon: MessageCircle, color: 'bg-[#e3f2fd] text-[#1565c0]', trend: conversations.length === 0 ? 'Posez votre 1ère question' : 'Total' },
    { label: 'Fournisseurs disponibles', value: suppliers.length, icon: MapPin, color: 'bg-[#fce4ec] text-[#c2185b]', trend: 'Sur la plateforme' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a2e1d]">
            Bonjour, {user?.name?.split(' ')[0] ?? 'Jean'} 👋
          </h1>
          <p className="text-sm text-[#6b7c6e] mt-0.5">{formatDate(now)} — Tableau de bord</p>
        </div>
        <Button leftIcon={<Microscope className="w-4 h-4" />} onClick={() => navigate('/app/diagnostic')}>
          Nouveau diagnostic
        </Button>
      </div>

      {isLoading ? (
        <div className="p-10 flex justify-center"><Loader /></div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map(({ label, value, icon: Icon, color, trend }) => (
              <Card key={label} padding="md">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-[#6b7c6e] font-medium">{label}</p>
                    <p className="text-3xl font-bold text-[#1a2e1d] mt-1">{value}</p>
                    <p className="text-xs text-[#6b7c6e] mt-1">{trend}</p>
                  </div>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Diagnostics récents */}
            <div className="lg:col-span-2">
              <Card padding="none">
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8e4]">
                  <h2 className="font-semibold text-[#1a2e1d]">Diagnostics récents</h2>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/app/historique')}>
                    Voir tout
                  </Button>
                </div>
                {recentDiagnostics.length === 0 ? (
                  <div className="px-6 py-10 text-center">
                    <p className="text-sm text-[#6b7c6e]">Aucun diagnostic pour l'instant.</p>
                    <Button variant="ghost" size="sm" className="mt-2" onClick={() => navigate('/app/diagnostic')}>
                      Lancer votre premier diagnostic
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y divide-[#e2e8e4]">
                    {recentDiagnostics.map((d) => (
                      <div
                        key={d.id}
                        className="flex items-center gap-4 px-6 py-4 hover:bg-[#f7f9f7] cursor-pointer transition-colors"
                        onClick={() => navigate(`/app/diagnostic/resultat/${d.id}`)}
                      >
                        <div className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-semibold ${
                          d.type === 'culture' ? 'bg-[#e8f5e9] text-[#1a5c2a]' : 'bg-[#fff3e0] text-[#f59e0b]'
                        }`}>
                          {d.type === 'culture' ? '🌿' : '🐄'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#1a2e1d] truncate">{d.disease_name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Clock className="w-3 h-3 text-[#6b7c6e]" />
                            <p className="text-xs text-[#6b7c6e]">{formatDate(d.created_at)}</p>
                          </div>
                        </div>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${riskColors[d.risk_level] || riskColors['Faible']}`}>
                          {d.risk_level}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            {/* Actions rapides */}
            <div className="space-y-4">
              <h2 className="font-semibold text-[#1a2e1d]">Actions rapides</h2>
              {[
                { icon: Microscope, label: 'Lancer un diagnostic', desc: 'Culture ou animal', to: '/app/diagnostic', color: 'bg-[#1a5c2a]' },
                { icon: MessageCircle, label: 'Consulter l\'assistant', desc: 'Conseils personnalisés', to: '/app/assistant', color: 'bg-[#1565c0]' },
                { icon: MapPin, label: 'Trouver un fournisseur', desc: 'Près de chez vous', to: '/app/fournisseurs', color: 'bg-[#c2185b]' },
              ].map(({ icon: Icon, label, desc, to, color }) => (
                <Card
                  key={to}
                  padding="md"
                  className="flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(to)}
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color} text-white shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1a2e1d]">{label}</p>
                    <p className="text-xs text-[#6b7c6e]">{desc}</p>
                  </div>
                </Card>
              ))}

              {/* Conseil du jour */}
              <Card padding="md" className="bg-[#e8f5e9] border-[#4caf50]/30">
                <div className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#1a5c2a] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-[#1a5c2a]">Conseil du jour</p>
                    <p className="text-xs text-[#2d7a3e] mt-1 leading-relaxed">
                      Période propice aux maladies fongiques. Inspectez vos cultures régulièrement et favorisez une bonne circulation d'air.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
