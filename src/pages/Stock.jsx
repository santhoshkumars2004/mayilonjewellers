import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { useShop } from '../context/ShopContext';
import { Card, Button, StatCard, PageHeader, Badge } from '../components/common/UI';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Package, Plus } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

const Stock = () => {
    const { formatCurrency, settings } = useShop();
    const stock = useLiveQuery(() => db.stock.toArray(), []);

    const goldStock = stock?.filter(s => s.metalType === 'Gold') || [];
    const silverStock = stock?.filter(s => s.metalType === 'Silver') || [];

    const totalGoldWeight = goldStock.reduce((acc, s) => acc + (parseFloat(s.weight) || 0), 0);
    const totalSilverWeight = silverStock.reduce((acc, s) => acc + (parseFloat(s.weight) || 0), 0);

    const goldRate = parseFloat(settings?.find(s => s.key === 'goldRate22k')?.value || 0);
    const silverRate = parseFloat(settings?.find(s => s.key === 'silverRate')?.value || 0);

    const goldValue = totalGoldWeight * goldRate;
    const silverValue = totalSilverWeight * silverRate;

    const chartData = {
        labels: ['Gold', 'Silver'],
        datasets: [{
            data: [goldValue || 1, silverValue || 1],
            backgroundColor: ['#F59E0B', '#9CA3AF'],
            borderWidth: 0,
        }],
    };

    return (
        <div className="page-container" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <PageHeader
                title="Inventory"
                subtitle="Track your stock"
            />

            {/* Stats - 2x2 Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '20px' }}>
                <StatCard title="Gold Stock" value={`${totalGoldWeight.toFixed(2)} g`} icon={Package} color="gold" />
                <StatCard title="Gold Value" value={formatCurrency(goldValue)} icon={Package} color="gold" />
                <StatCard title="Silver Stock" value={`${totalSilverWeight.toFixed(2)} g`} icon={Package} color="gray" />
                <StatCard title="Silver Value" value={formatCurrency(silverValue)} icon={Package} color="gray" />
            </div>

            {/* Chart */}
            <Card style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ flex: '0 0 120px', height: '120px' }}>
                        <Pie data={chartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                    </div>
                    <div style={{ flex: 1, minWidth: '150px' }}>
                        <p style={{ fontSize: '0.8rem', color: '#6B7280', marginBottom: '4px' }}>Total Value</p>
                        <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{formatCurrency(goldValue + silverValue)}</p>
                        <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '0.8rem' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#F59E0B' }}></span> Gold
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#9CA3AF' }}></span> Silver
                            </span>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Stock List - Mobile Friendly Cards */}
            <Card title="Stock Items">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {stock?.map((item) => {
                        const rate = item.metalType === 'Gold' ? goldRate : silverRate;
                        const val = (item.weight || 0) * rate;
                        return (
                            <div
                                key={item.id}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '12px',
                                    background: '#F9FAFB',
                                    borderRadius: '8px',
                                    border: '1px solid #E5E7EB',
                                }}
                            >
                                <div>
                                    <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '2px' }}>{item.category}</p>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <Badge variant={item.metalType === 'Gold' ? 'warning' : 'success'}>{item.metalType}</Badge>
                                        <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>{item.purity}</span>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>{(item.weight || 0).toFixed(3)} g</p>
                                    <p style={{ fontSize: '0.75rem', color: '#6B7280' }}>{formatCurrency(val)}</p>
                                </div>
                            </div>
                        );
                    })}
                    {(!stock || stock.length === 0) && (
                        <div style={{ textAlign: 'center', padding: '32px', color: '#9CA3AF' }}>
                            No stock items yet
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default Stock;
