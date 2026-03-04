import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { PageHeader, Button } from '../components/common/UI';
import { Plus } from 'lucide-react';

const Dealers = () => {
    const { formatCurrency } = useShop();

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <PageHeader
                title="Dealers"
                subtitle="Manage dealer accounts and transactions"
                action={<Button variant="primary"><Plus size={18} /> Add Dealer</Button>}
            />

            <div className="dealers-summary-bar">
                <div className="dealers-summary-item">
                    <span className="dealers-summary-label">Total Dealers</span>
                    <span className="dealers-summary-value">0</span>
                </div>
                <div className="dealers-summary-divider" />
                <div className="dealers-summary-item">
                    <span className="dealers-summary-label">Total Payable</span>
                    <span className="dealers-summary-value" style={{ color: '#dc2626' }}>{formatCurrency(0)}</span>
                </div>
                <div className="dealers-summary-divider" />
                <div className="dealers-summary-item">
                    <span className="dealers-summary-label">Gold Balance</span>
                    <span className="dealers-summary-value dealers-summary-value--gold">0.000 g</span>
                </div>
            </div>

            <div className="dealers-table-wrapper">
                <table className="dealers-table">
                    <thead>
                        <tr>
                            <th>S.No</th>
                            <th>Dealer Name</th>
                            <th>Cash Balance</th>
                            <th>Gold Balance</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: '#6b7280' }}>
                                No dealers found. Add one to get started.
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Dealers;
