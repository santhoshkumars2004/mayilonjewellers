import React, { useState } from 'react';
import { db } from '../db/db';
import { useShop } from '../context/ShopContext';
import { useCollection } from '../hooks/useCollection';
import { Card, Button, PageHeader } from '../components/common/UI';
import { Search, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const Billing = () => {
    const { formatCurrency, formatDate, settings } = useShop();
    const [searchTerm, setSearchTerm] = useState('');

    const allSales = useCollection('sales', 'date', 'desc');

    const filteredSales = allSales?.filter(s =>
        s.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.customer.phone.includes(searchTerm)
    );

    const generatePDF = (sale) => {
        const doc = new jsPDF();

        const shopName = settings?.find(s => s.key === 'shopName')?.value || 'Jewelry Shop';
        const address = settings?.find(s => s.key === 'address')?.value || '';

        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text(shopName, 105, 25, { align: 'center' });
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(address, 105, 32, { align: 'center' });

        doc.setDrawColor(245, 158, 11);
        doc.setLineWidth(0.5);
        doc.line(20, 38, 190, 38);

        doc.setFontSize(11);
        doc.text(`Invoice: ${sale.invoiceNo}`, 20, 48);
        doc.text(`Date: ${new Date(sale.date).toLocaleDateString()}`, 140, 48);
        doc.text(`Customer: ${sale.customer.name}`, 20, 56);
        doc.text(`Phone: ${sale.customer.phone || 'N/A'}`, 140, 56);

        const tableBody = sale.items.map((item, index) => [
            index + 1,
            `${item.category} ${item.description || ''}`.trim(),
            `${item.metalType} ${item.purity}`,
            item.grossWt || '-',
            item.netWt || '-',
            item.rate,
            item.makingCharges || 0,
            item.amount.toFixed(2)
        ]);

        doc.autoTable({
            startY: 65,
            head: [['#', 'Description', 'Metal', 'G.Wt', 'N.Wt', 'Rate', 'MC', 'Amount']],
            body: tableBody,
            theme: 'grid',
            headStyles: { fillColor: [245, 158, 11] },
            styles: { fontSize: 9 },
        });

        const finalY = doc.lastAutoTable.finalY + 10;
        doc.text(`Subtotal: ₹${sale.subTotal.toFixed(2)}`, 140, finalY);
        doc.text(`GST: ₹${sale.taxAmount.toFixed(2)}`, 140, finalY + 7);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`Total: ₹${sale.finalAmount.toFixed(2)}`, 140, finalY + 16);

        doc.save(`${sale.invoiceNo}.pdf`);
    };

    return (
        <div className="page-container" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <PageHeader title="Billing" subtitle="Search & print invoices" />

            <div style={{ position: 'relative', marginBottom: '16px' }}>
                <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                <input
                    placeholder="Search customer, phone, invoice..."
                    style={{ paddingLeft: '42px', width: '100%' }}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            <Card>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {filteredSales?.map(sale => (
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
                                gap: '12px',
                            }}
                        >
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '2px' }}>{sale.customer.name}</p>
                                <p style={{ fontSize: '0.7rem', color: '#6B7280' }}>{sale.invoiceNo}</p>
                                <p style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>{formatDate(sale.date)}</p>
                            </div>
                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                <p style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '4px' }}>{formatCurrency(sale.finalAmount)}</p>
                                <Button variant="secondary" size="sm" onClick={() => generatePDF(sale)} style={{ padding: '6px 10px', fontSize: '0.75rem' }}>
                                    <Download size={14} /> PDF
                                </Button>
                            </div>
                        </div>
                    ))}
                    {(!filteredSales || filteredSales.length === 0) && (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF' }}>
                            {searchTerm ? 'No matching invoices' : 'No invoices found'}
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default Billing;
