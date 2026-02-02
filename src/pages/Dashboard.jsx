import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { useShop } from '../context/ShopContext';
import { Button, Card, StatCard, PageHeader } from '../components/common/UI';
import { ShoppingCart, TrendingUp, Package, IndianRupee, Plus, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
    const { formatCurrency, settings } = useShop();

    const sales = useLiveQuery(() => db.sales.toArray(), []);
    const purchases = useLiveQuery(() => db.purchases.toArray(), []);
    const stock = useLiveQuery(() => db.stock.toArray(), []);

    const today = new Date().toISOString().split('T')[0];
    const todaySales = sales?.filter(s => s.date.startsWith(today)) || [];
    const todayRevenue = todaySales.reduce((acc, s) => acc + s.finalAmount, 0);

    const goldRate = parseFloat(settings?.find(s => s.key === 'goldRate22k')?.value || 0);
    const silverRate = parseFloat(settings?.find(s => s.key === 'silverRate')?.value || 0);

    const stockValue = stock?.reduce((acc, s) => {
        const rate = s.metalType === 'Gold' ? goldRate : silverRate;
        return acc + ((s.weight || 0) * rate);
    }, 0) || 0;

    const salesChartData = {
        labels: sales?.slice(-7).map(s => new Date(s.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })) || [],
        datasets: [{
            label: 'Sales (₹)',
            data: sales?.slice(-7).map(s => s.finalAmount) || [],
            backgroundColor: 'rgba(245, 158, 11, 0.8)',
            borderRadius: 6,
        }],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            y: { beginAtZero: true, grid: { color: '#F3F4F6' } },
            x: { grid: { display: false } },
        },
    };

    return (
        <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }} className="page-container">
            <PageHeader
                title="Dashboard"
                subtitle="Overview"
                action={
                    <Link to="/sales">
                        <Button variant="primary"><Plus size={18} /> New Sale</Button>
                    </Link>
                }
            />

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }} className="responsive-grid-2">
                <StatCard title="Today's Revenue" value={formatCurrency(todayRevenue)} icon={ShoppingCart} color="gold" />
                <StatCard title="Stock Value" value={formatCurrency(stockValue)} icon={Package} color="blue" />
                <StatCard title="Gold Rate (22K)" value={`₹${goldRate}/g`} icon={TrendingUp} color="green" />
                <StatCard title="Total Sales" value={sales?.length || 0} icon={IndianRupee} color="gray" />
            </div>

            {/* Charts and Quick Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="responsive-grid">
                <Card title="Sales Trend">
                    <div style={{ height: '220px' }}>
                        {sales?.length > 0 ? (
                            <Bar data={salesChartData} options={chartOptions} />
                        ) : (
                            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}>
                                No sales data yet
                            </div>
                        )}
                    </div>
                </Card>

                <Card title="Quick Actions">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {[
                            { to: '/sales', icon: ShoppingCart, label: 'Create Sale', primary: true },
                            { to: '/purchase', icon: TrendingUp, label: 'Record Purchase' },
                            { to: '/stock', icon: Package, label: 'View Inventory' },
                        ].map((item) => (
                            <Link key={item.to} to={item.to} style={{ textDecoration: 'none' }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '14px 16px',
                                    background: item.primary ? 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)' : '#F9FAFB',
                                    borderRadius: '10px',
                                    border: item.primary ? '1px solid #FCD34D' : '1px solid #E5E7EB',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <item.icon size={18} color={item.primary ? '#D97706' : '#6B7280'} />
                                        <span style={{ fontWeight: 500, color: item.primary ? '#92400E' : '#374151', fontSize: '0.9rem' }}>{item.label}</span>
                                    </div>
                                    <ArrowRight size={16} color={item.primary ? '#D97706' : '#9CA3AF'} />
                                </div>
                            </Link>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
