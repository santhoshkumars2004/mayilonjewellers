import React, { useState } from 'react';
import { db } from '../db/db';
import { useShop } from '../context/ShopContext';
import { useCollection } from '../hooks/useCollection';
import { Button, Input, Select, Card, PageHeader, Badge } from '../components/common/UI';
import { Plus, Trash, Save, X, ChevronLeft } from 'lucide-react';

const NewSaleForm = ({ onCancel, onSave, settings, formatCurrency }) => {
    const [customer, setCustomer] = useState({ name: '', phone: '', address: '' });
    const [items, setItems] = useState([
        { category: 'Ring', description: '', metalType: 'Gold', purity: '22K', grossWt: '', netWt: '', rate: '', makingCharges: 0, amount: 0 }
    ]);
    const [payment, setPayment] = useState({ method: 'Cash', status: 'Paid' });

    const goldRate = settings?.find(s => s.key === 'goldRate22k')?.value || 0;
    const silverRate = settings?.find(s => s.key === 'silverRate')?.value || 0;
    const defaultTax = settings?.find(s => s.key === 'taxRate')?.value || 3;

    const updateItem = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;

        const item = newItems[index];
        const weight = parseFloat(item.netWt) || 0;
        const rate = parseFloat(item.rate) || (item.metalType === 'Gold' ? goldRate : silverRate);
        if (!item.rate) item.rate = rate;

        const labor = parseFloat(item.makingCharges) || 0;
        item.amount = (weight * rate) + labor;

        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, { category: 'Ring', description: '', metalType: 'Gold', purity: '22K', grossWt: '', netWt: '', rate: goldRate, makingCharges: 0, amount: 0 }]);
    };

    const removeItem = (index) => {
        if (items.length > 1) setItems(items.filter((_, i) => i !== index));
    };

    const subTotal = items.reduce((acc, item) => acc + item.amount, 0);
    const taxAmount = (subTotal * defaultTax) / 100;
    const finalAmount = subTotal + taxAmount;

    const handleSubmit = async () => {
        if (!customer.name) return alert('Customer Name is required');

        try {
            const saleId = `SAL-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 1000)}`;

            await db.sales.add({
                invoiceNo: saleId,
                date: new Date().toISOString(),
                customer,
                items,
                subTotal,
                taxAmount,
                finalAmount,
                paymentStatus: payment.status,
                paymentMethod: payment.method
            });

            for (const item of items) {
                const stockItem = await db.stock
                    .where('[metalType+purity+category]')
                    .equals([item.metalType, item.purity, item.category])
                    .first();

                if (stockItem) {
                    await db.stock.update(stockItem.id, {
                        weight: Math.max(0, (parseFloat(stockItem.weight) || 0) - (parseFloat(item.grossWt) || 0))
                    });
                }
            }

            await db.transactions.add({
                type: 'income',
                category: 'Sales',
                amount: finalAmount,
                date: new Date().toISOString(),
                description: `Sale ${saleId} - ${customer.name}`
            });

            onSave();
        } catch (e) {
            console.error(e);
            alert('Error saving sale');
        }
    };

    return (
        <div className="page-container" style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <button onClick={onCancel} style={{ background: 'none', border: 'none', padding: '8px', cursor: 'pointer' }}>
                    <ChevronLeft size={24} color="#374151" />
                </button>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>New Sale</h1>
            </div>

            {/* Bill Summary Fixed at Top */}
            <Card style={{ marginBottom: '16px', background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)', border: '1px solid #FCD34D' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <p style={{ fontSize: '0.8rem', color: '#92400E' }}>Total Amount</p>
                        <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#92400E' }}>{formatCurrency(finalAmount)}</p>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#92400E' }}>
                        <p>Subtotal: {formatCurrency(subTotal)}</p>
                        <p>GST ({defaultTax}%): {formatCurrency(taxAmount)}</p>
                    </div>
                </div>
            </Card>

            <Card title="Customer" style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <Input label="Name *" value={customer.name} onChange={e => setCustomer({ ...customer, name: e.target.value })} />
                    <Input label="Phone" value={customer.phone} onChange={e => setCustomer({ ...customer, phone: e.target.value })} />
                </div>
            </Card>

            <Card title="Payment" style={{ marginBottom: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <Select label="Method" value={payment.method} onChange={e => setPayment({ ...payment, method: e.target.value })} options={[{ label: 'Cash', value: 'Cash' }, { label: 'UPI', value: 'UPI' }, { label: 'Card', value: 'Card' }]} />
                    <Select label="Status" value={payment.status} onChange={e => setPayment({ ...payment, status: e.target.value })} options={[{ label: 'Paid', value: 'Paid' }, { label: 'Pending', value: 'Pending' }]} />
                </div>
            </Card>

            <Card title="Items" style={{ marginBottom: '16px' }}>
                {items.map((item, idx) => (
                    <div key={idx} style={{
                        padding: '12px',
                        background: '#F9FAFB',
                        borderRadius: '8px',
                        marginBottom: '12px',
                        border: '1px solid #E5E7EB'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Item {idx + 1}</span>
                            {items.length > 1 && (
                                <button onClick={() => removeItem(idx)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}>
                                    <Trash size={18} />
                                </button>
                            )}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <Input label="Category" value={item.category} onChange={e => updateItem(idx, 'category', e.target.value)} />
                            <div>
                                <label style={{ fontSize: '0.875rem', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Metal</label>
                                <select value={item.metalType} onChange={e => updateItem(idx, 'metalType', e.target.value)} style={{ width: '100%' }}>
                                    <option>Gold</option><option>Silver</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.875rem', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Purity</label>
                                <select value={item.purity} onChange={e => updateItem(idx, 'purity', e.target.value)} style={{ width: '100%' }}>
                                    <option>22K</option><option>24K</option><option>18K</option><option>925</option>
                                </select>
                            </div>
                            <Input label="Gross Wt" type="number" step="0.01" value={item.grossWt} onChange={e => updateItem(idx, 'grossWt', e.target.value)} />
                            <Input label="Net Wt *" type="number" step="0.01" value={item.netWt} onChange={e => updateItem(idx, 'netWt', e.target.value)} />
                            <Input label="Rate ₹/g" type="number" value={item.rate} onChange={e => updateItem(idx, 'rate', e.target.value)} />
                            <Input label="Making ₹" type="number" value={item.makingCharges} onChange={e => updateItem(idx, 'makingCharges', e.target.value)} />
                            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                                <p style={{ fontWeight: 700, fontSize: '1rem' }}>₹{item.amount.toFixed(0)}</p>
                            </div>
                        </div>
                    </div>
                ))}
                <Button onClick={addItem} variant="secondary" style={{ width: '100%' }}><Plus size={16} /> Add Item</Button>
            </Card>

            <Button onClick={handleSubmit} variant="primary" style={{ width: '100%', padding: '14px' }}>
                <Save size={18} /> Complete Sale
            </Button>
        </div>
    );
};

const Sales = () => {
    const { formatCurrency, formatDate, settings } = useShop();
    const [isNewSale, setIsNewSale] = useState(false);
    const sales = useCollection('sales', 'date', 'desc');

    if (isNewSale) return <NewSaleForm onCancel={() => setIsNewSale(false)} onSave={() => setIsNewSale(false)} settings={settings} formatCurrency={formatCurrency} />;

    return (
        <div className="page-container" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <PageHeader
                title="Sales"
                subtitle="Manage invoices"
                action={<Button variant="primary" onClick={() => setIsNewSale(true)}><Plus size={18} /> New Sale</Button>}
            />

            <Card>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {sales?.map(sale => (
                        <div
                            key={sale.id}
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '14px',
                                background: '#F9FAFB',
                                borderRadius: '10px',
                                border: '1px solid #E5E7EB',
                            }}
                        >
                            <div>
                                <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{sale.customer.name}</p>
                                <p style={{ fontSize: '0.75rem', color: '#6B7280' }}>{sale.invoiceNo} • {formatDate(sale.date)}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontWeight: 700, fontSize: '1rem' }}>{formatCurrency(sale.finalAmount)}</p>
                                <Badge variant={sale.paymentStatus === 'Paid' ? 'success' : 'warning'}>{sale.paymentStatus}</Badge>
                            </div>
                        </div>
                    ))}
                    {(!sales || sales.length === 0) && (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF' }}>
                            No sales yet. Create your first sale!
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default Sales;
