import { useAuthStore } from '@/features/auth/store/authStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Users, Microscope, Building2, Activity, AlertTriangle } from 'lucide-react';
import { MOCK_ADMIN_USERS, MOCK_LOGS, MOCK_MONTHLY_STATS } from '@/services/mockData';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function AdminDashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const farmers = MOCK_ADMIN_USERS.filter(u => u.role === 'farmer').length;
  const suppliers = MOCK_ADMIN_USERS.filter(u => u.role === 'supplier').length;
  const recentLogs = MOCK_LOGS.slice(0, 5);

  const stats = [
    { label: 'Utilisateurs totaux', value: MOCK_ADMIN_USERS.length, icon: Users, color: 'bg-blue-50 text-blue-600', trend: '+12% ce mois' },
    { label: 'Agriculteurs', value: farmers, icon: Activity, color: 'bg-green-50 text-green-600', trend: '+8% ce mois' },
    { label: 'Fournisseurs', value: suppliers, icon: Building2, color: 'bg-amber-50 text-amber-600', trend: '+2 nouveaux' },
    { label: 'Diagnostics IA (total)', value: '854', icon: Microscope, color: 'bg-purple-50 text-purple-600', trend: '+150 ce mois' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Tableau de bord Administrateur
          </h1>
          <p className="text-sm text-gray-500 mt-1">Vue d'ensemble de la plateforme AgriRisk AI</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, trend }) => (
          <Card key={label} padding="md">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-gray-500 font-medium">{label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                <p className="text-xs text-gray-500 mt-1">{trend}</p>
              </div>
              <div className={`p-2 rounded-xl ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Graphique Croissance */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Activité de la plateforme</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_MONTHLY_STATS} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorDiag" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorMsg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7c6e' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7c6e' }} dx={-10} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="diagnostics" name="Diagnostics" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorDiag)" />
                  <Area type="monotone" dataKey="ai_messages" name="Messages IA" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorMsg)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Derniers Journaux */}
        <div>
          <Card padding="none" className="h-full flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Activité récente</h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin/journaux')}>
                Voir tout
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
              {recentLogs.map(log => (
                <div key={log.id} className="p-4 hover:bg-gray-50 flex gap-3">
                  <div className={`mt-0.5 shrink-0 p-1.5 rounded-full ${
                    log.severity === 'danger' ? 'bg-red-100 text-red-600' :
                    log.severity === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{log.action}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{log.user}</p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {new Date(log.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
