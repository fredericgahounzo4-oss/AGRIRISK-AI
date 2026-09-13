import { MOCK_MONTHLY_STATS, MOCK_DIAGNOSTIC_TYPES, MOCK_RISK_DISTRIBUTION } from '@/services/mockData';
import { Card } from '@/components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export function AdminStatisticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Statistiques globales</h1>
        <p className="text-sm text-gray-500 mt-1">Analyse détaillée des données de la plateforme</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-bold text-gray-900 mb-6">Acquisition Nouveaux Utilisateurs</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_MONTHLY_STATS} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={MOCK_DIAGNOSTIC_TYPES} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {MOCK_DIAGNOSTIC_TYPES.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card>
            <h2 className="text-sm font-bold text-gray-900 mb-4">Niveaux de risques détectés</h2>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={MOCK_RISK_DISTRIBUTION} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {MOCK_RISK_DISTRIBUTION.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
