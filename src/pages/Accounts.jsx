import React, { useState } from 'react';
import { db } from '../db/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { useShop } from '../context/ShopContext';
import { Card, Button, PageHeader, Badge } from '../components/common/UI';
import { Plus, X } from 'lucide-react';

const AddTransactionModal = ({ onClose }) => {
    const [formData, setFormData] = useState({
        type: 'expense',
        category: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        await db.transactions.add({
            ...formData,
            amount: parseFloat(formData.amount),
            date: new Date(formData.date).toISOString()
        });
        onClose();
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            zIndex: 100,
            padding: '16px',
        }}>
            <div style={{
                background: 'white',
                borderRadius: '16px 16px 0 0',
                padding: '20px',
                width: '100%',
                maxWidth: '500px',
                maxHeight: '90vh',
                overflowY: 'auto',
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Add Transaction</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><X size={22} /></button>
                </div>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500, display: 'block', marginBottom: '6px' }}>Type</label>
                        <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} style={{ width: '100%' }}>
                            <option value="expense">Expense (Cash Out)</option>
                            <option value="income">Income (Cash In)</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500, display: 'block', marginBottom: '6px' }}>Category</label>
                        <input value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} placeholder="e.g. Rent, Salary" style={{ width: '100%' }} />
                    </div>
                    <div>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500, display: 'block', marginBottom: '6px' }}>Amount (₹)</label>
                        <input type="number" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} required style={{ width: '100%' }} />
                    </div>
                    <div>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500, display: 'block', marginBottom: '6px' }}>Date</label>
                        <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} style={{ width: '100%' }} />
                    </div>
                    <div>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500, display: 'block', marginBottom: '6px' }}>Description</label>
                        <input value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} style={{ width: '100%' }} />
                    </div>
                    <Button type="submit" variant="primary" style={{ width: '100%', padding: '14px', marginTop: '8px' }}>Save Transaction</Button>
                </form>
            </div>
        </div>
    );
};

const Accounts = () => {
    const { formatCurrency, formatDateTime } = useShop();
    const [showModal, setShowModal] = useState(false);

    const transactions = useLiveQuery(() => db.transactions.orderBy('date').reverse().limit(50).toArray(), []);
    const allTransactions = useLiveQuery(() => db.transactions.toArray(), []);

    const totalIncome = allTransactions?.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) || 0;
    const totalExpense = allTransactions?.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0) || 0;
    const balance = totalIncome - totalExpense;

    return (
        <div className="page-container" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <PageHeader
                title="Accounts"
                subtitle="Cash flow tracking"
                action={<Button variant="primary" onClick={() => setShowModal(true)}><Plus size={18} /> Add</Button>}
            />

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
                <div style={{ background: '#DCFCE7', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                    <p style={{ color: '#166534', fontSize: '0.7rem', fontWeight: 500 }}>Income</p>
                    <p style={{ color: '#15803D', fontSize: '1rem', fontWeight: 700 }}>{formatCurrency(totalIncome)}</p>
                </div>
                <div style={{ background: '#FEE2E2', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                    <p style={{ color: '#991B1B', fontSize: '0.7rem', fontWeight: 500 }}>Expenses</p>
                    <p style={{ color: '#DC2626', fontSize: '1rem', fontWeight: 700 }}>{formatCurrency(totalExpense)}</p>
                </div>
                <div style={{ background: '#DBEAFE', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                    <p style={{ color: '#1E40AF', fontSize: '0.7rem', fontWeight: 500 }}>Balance</p>
                    <p style={{ color: '#2563EB', fontSize: '1rem', fontWeight: 700 }}>{formatCurrency(balance)}</p>
                </div>
            </div>

            <Card title="Transactions">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {transactions?.map(t => (
                        <div
                            key={t.id}
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
                                <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t.category}</p>
                                <p style={{ fontSize: '0.7rem', color: '#6B7280' }}>{t.description}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontWeight: 700, fontSize: '0.95rem', color: t.type === 'income' ? '#16A34A' : '#DC2626' }}>
                                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                                </p>
                                <p style={{ fontSize: '0.65rem', color: '#9CA3AF' }}>{formatDateTime(t.date)}</p>
                            </div>
                        </div>
                    ))}
                    {(!transactions || transactions.length === 0) && (
                        <div style={{ textAlign: 'center', padding: '32px', color: '#9CA3AF' }}>
                            No transactions yet
                        </div>
                    )}
                </div>
            </Card>

            {showModal && <AddTransactionModal onClose={() => setShowModal(false)} />}
        </div>
    );
};

export default Accounts;
