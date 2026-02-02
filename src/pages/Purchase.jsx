import React, { useState } from 'react';
import { db } from '../db/db';
import { useShop } from '../context/ShopContext';
import { Button, Input, Select, Card, PageHeader } from '../components/common/UI';
import { Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Purchase = () => {
    const navigate = useNavigate();
    const { settings, getSetting, formatCurrency } = useShop();
    const [activeTab, setActiveTab] = useState('Gold');

    const [formData, setFormData] = useState({
        supplierName: '',
        supplierContact: '',
        date: new Date().toISOString().split('T')[0],
        purity: '22K',
        category: 'Bar',
        weight: '',
        rate: '',
        taxPercentage: 3,
        invoiceNumber: '',
        notes: ''
    });

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setFormData(prev => ({
            ...prev,
            purity: tab === 'Gold' ? '22K' : '925',
            rate: getSetting(`${tab.toLowerCase()}Rate${tab === 'Gold' ? '22k' : ''}`) || ''
        }));
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const calculateTotals = () => {
        const weight = parseFloat(formData.weight) || 0;
        const rate = parseFloat(formData.rate) || 0;
        const tax = parseFloat(formData.taxPercentage) || 0;
        const amount = weight * rate;
        const taxAmount = (amount * tax) / 100;
        const total = amount + taxAmount;
        return { amount, taxAmount, total };
    };

    const { amount, taxAmount, total } = calculateTotals();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.supplierName || !formData.weight || !formData.rate) {
            alert('Please fill required fields');
            return;
        }
        try {
            const purchaseId = `${activeTab.charAt(0)}P-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 1000)}`;

            await db.purchases.add({
                purchaseId,
                type: activeTab,
                ...formData,
                weight: parseFloat(formData.weight),
                rate: parseFloat(formData.rate),
                totalAmount: total,
                taxAmount,
                timestamp: new Date().toISOString()
            });

            const existingStock = await db.stock
                .where('[metalType+purity+category]')
                .equals([activeTab, formData.purity, formData.category])
                .first();

            if (existingStock) {
                await db.stock.update(existingStock.id, {
                    weight: (parseFloat(existingStock.weight) || 0) + parseFloat(formData.weight),
                    quantity: (parseInt(existingStock.quantity) || 0) + 1
                });
            } else {
                await db.stock.add({
                    metalType: activeTab,
                    purity: formData.purity,
                    category: formData.category,
                    weight: parseFloat(formData.weight),
                    quantity: 1
                });
            }

            await db.transactions.add({
                type: 'expense',
                category: 'Purchase',
                amount: total,
                date: new Date().toISOString(),
                description: `Purchase ${activeTab} - ${formData.category}`
            });

            alert('Purchase recorded!');
            navigate('/stock');
        } catch (error) {
            console.error(error);
            alert('Error recording purchase');
        }
    };

    return (
        <div className="page-container" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <PageHeader
                title="Record Purchase"
                subtitle="Add new gold or silver purchase"
            />

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '8px', background: '#E5E7EB', padding: '4px', borderRadius: '10px', marginBottom: '20px' }}>
                <button
                    onClick={() => handleTabChange('Gold')}
                    style={{
                        flex: 1,
                        padding: '10px 16px',
                        borderRadius: '8px',
                        border: 'none',
                        fontWeight: 600,
                        cursor: 'pointer',
                        background: activeTab === 'Gold' ? 'linear-gradient(135deg, #F59E0B, #FBBF24)' : 'transparent',
                        color: activeTab === 'Gold' ? 'white' : '#6B7280',
                    }}
                >Gold</button>
                <button
                    onClick={() => handleTabChange('Silver')}
                    style={{
                        flex: 1,
                        padding: '10px 16px',
                        borderRadius: '8px',
                        border: 'none',
                        fontWeight: 600,
                        cursor: 'pointer',
                        background: activeTab === 'Silver' ? '#6B7280' : 'transparent',
                        color: activeTab === 'Silver' ? 'white' : '#6B7280',
                    }}
                >Silver</button>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Payment Summary - At Top for Mobile */}
                <Card style={{ marginBottom: '16px', background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)', border: '1px solid #FCD34D' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#92400E' }}>
                            <span>Amount:</span>
                            <span>{formatCurrency(amount)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#92400E' }}>
                            <span>GST ({formData.taxPercentage}%):</span>
                            <span>{formatCurrency(taxAmount)}</span>
                        </div>
                        <div style={{ borderTop: '1px solid #FCD34D', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.25rem', color: '#92400E' }}>
                            <span>Total:</span>
                            <span>{formatCurrency(total)}</span>
                        </div>
                    </div>
                </Card>

                <Card title="Supplier Details" style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <Input label="Supplier Name *" name="supplierName" value={formData.supplierName} onChange={handleChange} required />
                        <Input label="Contact Number" name="supplierContact" value={formData.supplierContact} onChange={handleChange} />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <Input label="Invoice No." name="invoiceNumber" value={formData.invoiceNumber} onChange={handleChange} />
                            <Input label="Date" type="date" name="date" value={formData.date} onChange={handleChange} />
                        </div>
                    </div>
                </Card>

                <Card title="Item Details" style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <Select
                                label="Category"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                options={[
                                    { label: 'Bar / Raw', value: 'Bar' },
                                    { label: 'Coin', value: 'Coin' },
                                    { label: 'Ring', value: 'Ring' },
                                    { label: 'Chain', value: 'Chain' },
                                    { label: 'Necklace', value: 'Necklace' },
                                    { label: 'Bangle', value: 'Bangle' },
                                    { label: 'Other', value: 'Other' },
                                ]}
                            />
                            <Select
                                label="Purity"
                                name="purity"
                                value={formData.purity}
                                onChange={handleChange}
                                options={activeTab === 'Gold'
                                    ? [{ label: '24K', value: '24K' }, { label: '22K', value: '22K' }, { label: '18K', value: '18K' }]
                                    : [{ label: '999', value: '999' }, { label: '925', value: '925' }]
                                }
                            />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <Input label="Weight (g) *" type="number" step="0.001" name="weight" value={formData.weight} onChange={handleChange} required />
                            <Input label="Rate ₹/g *" type="number" name="rate" value={formData.rate} onChange={handleChange} required />
                        </div>
                    </div>
                </Card>

                <Card title="Notes" style={{ marginBottom: '16px' }}>
                    <textarea
                        name="notes"
                        style={{ minHeight: '80px', resize: 'vertical', width: '100%' }}
                        value={formData.notes}
                        onChange={handleChange}
                        placeholder="Additional details..."
                    />
                </Card>

                <Button type="submit" variant="primary" style={{ width: '100%', padding: '14px' }}>
                    <Save size={18} /> Record Purchase
                </Button>
            </form>
        </div>
    );
};

export default Purchase;
