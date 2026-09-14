import { Card } from '@/components/ui/Card';
import { Loader } from '@/components/ui/Loader';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useAdminStats, useAdminDiagnostics } from '../hooks/useAdmin';
import { useMemo } from 'react';

const RISK_COLORS: Record<string, string> = {
  Faible: '#22c55e',
  Moyen: '#f59e0b',
  Élevé: '#ef4444',
  Critique: '#991b1b',
};

const TYPE_COLORS: Record<string, string> = {
  culture: '#22c55e',
  animal: '#3b82f6',
};

export function AdminStatisticsPage() {
  const { data: stats, isLoading: statsLoading, isError: statsError } = useAdminStats();
  const { data: diagnostics = [], isLoading: diagLoading, isError: diagError } = useAdminDiagnostics();

  const diagnosticTypes = useMemo(() => {
    const counts: Record<string, number> = {};
    diagnostics.forEach((d) => { counts[d.type] = (counts[d.type] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({
      name: name === 'culture' ? 'Culture' : 'Animal',
      value,
      color: TYPE_COLORS[name] || '#9ca3af',
    }));
  }, [diagnostics]);

  const riskDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    diagnostics.forEach((d) => { counts[d.risk_level] = (counts[d.risk_level] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      color: RISK_COLORS[name] || '#9ca3af',
    }));
  }, [diagnostics]);

  const isLoading = statsLoading || diagLoading;
  const isError = statsError || diagError;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Statistiques globales</h1>
        <p className="text-sm text-gray-500 mt-1">Analyse détaillée des données de la plateforme</p>
      </div>

      {isLoading ? (
        <div className="p-10 flex justify-center"><Loader /></div>
      ) : isError || !stats ? (
        <div className="p-8 text-center text-red-600">Impossible de charger les statistiques.</div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <h2 className="text-lg font-bold text-gray-900 mb-6">Acquisition Nouveaux Utilisateurs</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.monthly_stats} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7c6e' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7c6e' }} dx={-10} />
                  <Tooltip
                    cursor={{ fill: '#f7f9f7' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="new_users" name="Nouveaux inscrits" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <h2 className="text-sm font-bold text-gray-900 mb-4">Répartition des diagnostics</h2>
              <div className="h-[200px]">
                {diagnosticTypes.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-sm text-gray-400">Aucune donnée</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={diagnosticTypes} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {diagnosticTypes.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>
            <Card>
              <h2 className="text-sm font-bold text-gray-900 mb-4">Niveaux de risques détectés</h2>
              <div className="h-[200px]">
                {riskDistribution.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-sm text-gray-400">Aucune donnée</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={riskDistribution} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {riskDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
