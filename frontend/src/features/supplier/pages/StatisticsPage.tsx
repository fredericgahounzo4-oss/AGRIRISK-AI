import { useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Loader } from '@/components/ui/Loader';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Package, Users, DollarSign } from 'lucide-react';
import { useProducts, useRequests } from '../hooks/useMarketplace';

const MONTH_LABELS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

function lastSixMonths(): { key: string; label: string }[] {
  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: MONTH_LABELS[d.getMonth()] });
  }
  return months;
}

export function StatisticsPage() {
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: requests = [], isLoading: requestsLoading } = useRequests();
  const isLoading = productsLoading || requestsLoading;

  const acceptedRequests = requests.filter((r) => r.status === 'accepted');

  const totalRevenue = useMemo(
    () =>
      acceptedRequests.reduce((sum, r) => {
        const product = products.find((p) => p.name === r.product);
        return sum + (product ? product.price * r.quantity : 0);
      }, 0),
    [acceptedRequests, products]
  );

  const uniqueClients = useMemo(() => new Set(requests.map((r) => r.farmer_name)).size, [requests]);

  const conversionRate = requests.length > 0
    ? Math.round((acceptedRequests.length / requests.length) * 100)
    : 0;

  const kpi = [
    { label: "Chiffre d'affaires", value: `${totalRevenue.toLocaleString('fr-FR')} FCFA`, icon: DollarSign },
    { label: 'Commandes acceptées', value: acceptedRequests.length, icon: Package },
    { label: 'Clients uniques', value: uniqueClients, icon: Users },
    { label: 'Taux de conversion', value: `${conversionRate}%`, icon: TrendingUp },
  ];

  const monthlyData = useMemo(() => {
    const months = lastSixMonths();
    const revenueByMonth: Record<string, number> = {};
    const ordersByMonth: Record<string, number> = {};

    requests.forEach((r) => {
      const d = new Date(r.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      ordersByMonth[key] = (ordersByMonth[key] || 0) + 1;
      if (r.status === 'accepted') {
        const product = products.find((p) => p.name === r.product);
        revenueByMonth[key] = (revenueByMonth[key] || 0) + (product ? product.price * r.quantity : 0);
      }
    });

    return months.map(({ key, label }) => ({
      month: label,
      revenue: revenueByMonth[key] || 0,
      orders: ordersByMonth[key] || 0,
    }));
  }, [requests, products]);

  const hasAnyData = requests.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Statistiques et revenus</h1>
        <p className="text-sm text-gray-500 mt-1">Analysez vos performances de vente</p>
      </div>

      {isLoading ? (
        <div className="p-10 flex justify-center"><Loader /></div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {kpi.map((stat, i) => (
              <Card key={i} padding="md">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-xl text-gray-400">
                    <stat.icon className="w-5 h-5" />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {!hasAnyData ? (
            <Card padding="lg" className="text-center py-12">
              <p className="text-gray-500">
                Pas encore de demandes reçues — les statistiques apparaîtront ici dès votre première vente.
              </p>
            </Card>
          ) : (
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <h2 className="text-lg font-bold text-gray-900 mb-6">Évolution des revenus</h2>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7c6e' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7c6e' }} dx={-10} tickFormatter={(val) => `${val / 1000}k`} />
                      <Tooltip
                        cursor={{ fill: '#f7f9f7' }}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value) => [`${Number(value).toLocaleString('fr-FR')} FCFA`, 'Revenus']}
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
                    <LineChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7c6e' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7c6e' }} dx={-10} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value) => [Number(value), 'Commandes']}
                      />
                      <Line type="monotone" dataKey="orders" stroke="#22c55e" strokeWidth={3} dot={{ r: 4, fill: '#22c55e', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}
