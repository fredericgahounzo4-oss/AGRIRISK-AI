import { MOCK_SUPPLIER_REVENUE } from '@/services/mockData';
import { Card } from '@/components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Package, Users, DollarSign } from 'lucide-react';

export function StatisticsPage() {
  const kpi = [
    { label: 'Chiffre d\'affaires', value: '2.3M FCFA', trend: '+15%', isPositive: true, icon: DollarSign },
    { label: 'Commandes totales', value: '155', trend: '+8%', isPositive: true, icon: Package },
    { label: 'Nouveaux clients', value: '42', trend: '+12%', isPositive: true, icon: Users },
    { label: 'Taux de conversion', value: '18%', trend: '-2%', isPositive: false, icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Statistiques et revenus</h1>
        <p className="text-sm text-gray-500 mt-1">Analysez vos performances de vente</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpi.map((stat, i) => (
          <Card key={i} padding="md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <p className={`text-xs font-medium mt-1 ${stat.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.trend} vs mois précédent
                </p>
              </div>
              <div className="p-2 bg-gray-50 rounded-xl text-gray-400">
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-bold text-gray-900 mb-6">Évolution des revenus</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_SUPPLIER_REVENUE} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7c6e' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7c6e' }} dx={-10} tickFormatter={(val) => `${val / 1000}k`} />
                <Tooltip 
                  cursor={{ fill: '#f7f9f7' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [`${value.toLocaleString()} FCFA`, 'Revenus']}
                />
                <Bar dataKey="revenue" fill="#1a5c2a" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-bold text-gray-900 mb-6">Volume de commandes</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MOCK_SUPPLIER_REVENUE} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7c6e' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7c6e' }} dx={-10} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [value, 'Commandes']}
                />
                <Line type="monotone" dataKey="orders" stroke="#22c55e" strokeWidth={3} dot={{ r: 4, fill: '#22c55e', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
